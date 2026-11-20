using System.Text.RegularExpressions;
using DiiaSign.Api.Options;
using Microsoft.Extensions.Options;
using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cms;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Cms;
using Org.BouncyCastle.X509;
using Attribute = Org.BouncyCastle.Asn1.Cms.Attribute;

namespace DiiaSign.Api.Crypto;

/// <summary>
/// Повна перевірка ECDSA-підпису Дія.Підпис (signAlgo = "ECDSA"):
/// 1) рівно один підписувач, SHA-256 + ECDSA;
/// 2) messageDigest у підписі == наш SHA-256 документа (підпис саме нашого файлу);
/// 3) криптографічна перевірка підпису ключем із сертифіката;
/// 4) signingTime у вікні [створення запиту; зараз];
/// 5) сертифікат чинний на момент підпису, keyUsage = digitalSignature / nonRepudiation, не CA;
/// 6) ланцюжок до довіреного кореневого ЦСК з CACertificates.p7b.
/// </summary>
public sealed partial class EcdsaCmsSignatureVerifier(
    TrustedCaStore trustedCas,
    IOptions<VerificationOptions> options,
    TimeProvider time,
    ILogger<EcdsaCmsSignatureVerifier> logger) : ISignatureVerifier
{
    // ДРФО (РНОКПП) в атрибутах суб'єкта українських кваліфікованих сертифікатів.
    private const string DrfoAttributeOid = "1.2.804.2.1.1.1.11.1.4.1.1";

    private static readonly HashSet<string> EcdsaSignatureOids =
    [
        X9ObjectIdentifiers.ECDsaWithSha256.Id,
        X9ObjectIdentifiers.IdECPublicKey.Id // деякі реалізації ставлять OID ключа замість OID алгоритму
    ];

    public SignatureVerificationResult Verify(byte[] cms, byte[] expectedDigest, DateTime requestCreatedUtc)
    {
        CmsSignedData signedData;
        SignerInformation signer;
        try
        {
            // Зв'язуємо підпис із нашим хешем: BC перевірить messageDigest саме проти expectedDigest.
            signedData = new CmsSignedData(
                new Dictionary<string, byte[]> { [NistObjectIdentifiers.IdSha256.Id] = expectedDigest }, cms);

            var signers = signedData.GetSignerInfos().GetSigners();
            if (signers.Count != 1)
            {
                logger.LogWarning("Signature contains {Count} signers, expected exactly 1", signers.Count);
                return SignatureVerificationResult.Fail(VerificationFailure.MalformedSignature);
            }
            signer = signers.First();
        }
        catch (Exception ex)
        {
            logger.LogWarning("Failed to parse CMS signature: {Reason}", ex.Message);
            return SignatureVerificationResult.Fail(VerificationFailure.MalformedSignature);
        }

        if (signer.DigestAlgOid != NistObjectIdentifiers.IdSha256.Id ||
            !EcdsaSignatureOids.Contains(signer.EncryptionAlgOid))
        {
            logger.LogWarning("Unsupported signature algorithm: digest={Digest}, signature={Signature}",
                signer.DigestAlgOid, signer.EncryptionAlgOid);
            return SignatureVerificationResult.Fail(VerificationFailure.UnsupportedAlgorithm);
        }

        // Без підписаних атрибутів messageDigest не перевіряється — такий підпис не приймаємо.
        if (signer.SignedAttributes?[CmsAttributes.MessageDigest] is null)
            return SignatureVerificationResult.Fail(VerificationFailure.MalformedSignature);

        var cmsCerts = signedData.GetCertificates().EnumerateMatches(null).ToList();
        var signerCerts = signedData.GetCertificates().EnumerateMatches(signer.SignerID).ToList();
        if (signerCerts.Count != 1)
            return SignatureVerificationResult.Fail(VerificationFailure.SignerCertificateMissing);
        var cert = signerCerts[0];

        bool cryptoOk;
        try
        {
            cryptoOk = signer.Verify(cert);
        }
        catch (Exception ex) when (ex is Org.BouncyCastle.Security.Certificates.CertificateExpiredException
                                       or Org.BouncyCastle.Security.Certificates.CertificateNotYetValidException)
        {
            // BC сам перевіряє чинність сертифіката на момент signingTime.
            return SignatureVerificationResult.Fail(VerificationFailure.CertificateNotValidAtSigningTime, ExtractIdentity(cert));
        }
        catch (Exception ex)
        {
            // Серед іншого сюди потрапляє "message-digest attribute value does not match calculated value".
            logger.LogWarning("CMS signature verification failed: {Reason}", ex.Message);
            cryptoOk = false;
        }
        if (!cryptoOk)
            return SignatureVerificationResult.Fail(VerificationFailure.InvalidSignature);

        var identity = ExtractIdentity(cert);
        var now = time.GetUtcNow().UtcDateTime;
        var skew = TimeSpan.FromMinutes(options.Value.MaxClockSkewMinutes);

        var signingTime = ReadSigningTime(signer);
        if (signingTime is { } st && (st < requestCreatedUtc - skew || st > now + skew))
        {
            logger.LogWarning("Signing time {SigningTime:u} is outside of [{From:u}; {To:u}]",
                st, requestCreatedUtc - skew, now + skew);
            return SignatureVerificationResult.Fail(VerificationFailure.SigningTimeOutOfRange, identity);
        }
        var validationTime = signingTime ?? now;

        if (!cert.IsValid(validationTime))
            return SignatureVerificationResult.Fail(VerificationFailure.CertificateNotValidAtSigningTime, identity);

        var keyUsage = cert.GetKeyUsage(); // [0] digitalSignature, [1] nonRepudiation
        if (cert.GetBasicConstraints() >= 0 || keyUsage is null || !(keyUsage[0] || keyUsage[1]))
            return SignatureVerificationResult.Fail(VerificationFailure.CertificateKeyUsageInvalid, identity);

        if (!trustedCas.TryValidateChain(cert, cmsCerts, validationTime))
            return SignatureVerificationResult.Fail(VerificationFailure.UntrustedCertificateChain, identity);

        if (string.IsNullOrWhiteSpace(identity.Rnokpp) && string.IsNullOrWhiteSpace(identity.FullName))
            return SignatureVerificationResult.Fail(VerificationFailure.SignerIdentityMissing, identity);

        return new SignatureVerificationResult(VerificationFailure.None, identity, signingTime);
    }

    private static DateTime? ReadSigningTime(SignerInformation signer)
    {
        Attribute? attr = signer.SignedAttributes?[CmsAttributes.SigningTime];
        if (attr is null || attr.AttrValues.Count == 0)
            return null;
        return Org.BouncyCastle.Asn1.Cms.Time.GetInstance(attr.AttrValues[0]).ToDateTime().ToUniversalTime();
    }

    internal static SignerIdentity ExtractIdentity(X509Certificate cert)
    {
        var subject = cert.SubjectDN;
        string? First(DerObjectIdentifier oid) => subject.GetValueList(oid).FirstOrDefault(v => !string.IsNullOrWhiteSpace(v));

        var fullName = First(X509Name.CN);
        if (string.IsNullOrWhiteSpace(fullName))
        {
            var combined = $"{First(X509Name.Surname)} {First(X509Name.GivenName)}".Trim();
            fullName = combined.Length > 0 ? combined : null;
        }

        // У сертифікатах Дії serialNumber суб'єкта має вигляд "TINUA-1234567890".
        var rnokpp = ExtractTenDigits(First(X509Name.SerialNumber)) ?? ReadDrfoAttribute(cert);

        return new SignerIdentity(
            fullName?.Trim(),
            rnokpp,
            cert.SerialNumber.ToString(16).ToUpperInvariant(),
            cert.IssuerDN.ToString(),
            cert.NotBefore.ToUniversalTime(),
            cert.NotAfter.ToUniversalTime());
    }

    private static string? ReadDrfoAttribute(X509Certificate cert)
    {
        try
        {
            var ext = cert.GetExtensionValue(X509Extensions.SubjectDirectoryAttributes);
            if (ext is null) return null;
            var sda = SubjectDirectoryAttributes.GetInstance(Asn1Object.FromByteArray(ext.GetOctets()));
            foreach (AttributeX509 attr in sda.Attributes)
            {
                if (attr.AttrType.Id == DrfoAttributeOid && attr.AttrValues.Count > 0 &&
                    attr.AttrValues[0] is IAsn1String s)
                    return ExtractTenDigits(s.GetString());
            }
        }
        catch
        {
            // атрибут необов'язковий
        }
        return null;
    }

    private static string? ExtractTenDigits(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var match = TenDigits().Match(value);
        return match.Success ? match.Value : null;
    }

    [GeneratedRegex(@"(?<!\d)\d{10}(?!\d)")]
    private static partial Regex TenDigits();
}
