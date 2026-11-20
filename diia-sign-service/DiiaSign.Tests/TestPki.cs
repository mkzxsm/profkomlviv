using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Cms;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto.Operators;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.X509;
using X509Certificate = Org.BouncyCastle.X509.X509Certificate;

namespace DiiaSign.Tests;

/// <summary>Тестова ECDSA-ієрархія, схожа на Дію: ЦЗО (root) → КНЕДП (intermediate) → підписант.</summary>
internal sealed class TestPki
{
    private static readonly SecureRandom Random = new();
    private static long _serial = 1000;

    public AsymmetricCipherKeyPair RootKey { get; } = NewKey();
    public X509Certificate Root { get; }
    public AsymmetricCipherKeyPair CaKey { get; } = NewKey();
    public X509Certificate Ca { get; }

    public TestPki(string name = "Test")
    {
        var now = DateTime.UtcNow;
        Root = Issue($"CN={name} Root ECDSA,O=Test,C=UA", RootKey.Public, $"CN={name} Root ECDSA,O=Test,C=UA",
            RootKey.Private, now.AddYears(-1), now.AddYears(5), isCa: true);
        Ca = Issue($"CN={name} KNEDP ECDSA,O=Test,C=UA", CaKey.Public, Root.SubjectDN.ToString(),
            RootKey.Private, now.AddYears(-1), now.AddYears(5), isCa: true);
    }

    public (X509Certificate Cert, AsymmetricCipherKeyPair Key) IssueSigner(
        string rnokpp = "1234567890", DateTime? notBefore = null, DateTime? notAfter = null)
    {
        var key = NewKey();
        var now = DateTime.UtcNow;
        var cert = Issue(
            $"CN=Shevchenko Taras,SURNAME=Shevchenko,GIVENNAME=Taras,SERIALNUMBER=TINUA-{rnokpp},C=UA",
            key.Public, Ca.SubjectDN.ToString(), CaKey.Private,
            notBefore ?? now.AddDays(-1), notAfter ?? now.AddYears(1), isCa: false);
        return (cert, key);
    }

    /// <summary>Detached CMS (як повертає Дія для hashedFilesSigning) над вмістом документа.</summary>
    public byte[] SignDetached(byte[] document, (X509Certificate Cert, AsymmetricCipherKeyPair Key) signer,
        bool includeChain = true)
    {
        var gen = new CmsSignedDataGenerator();
        gen.AddSignerInfoGenerator(new SignerInfoGeneratorBuilder()
            .Build(new Asn1SignatureFactory("SHA256WITHECDSA", signer.Key.Private), signer.Cert));
        var certs = new List<X509Certificate> { signer.Cert };
        if (includeChain) certs.Add(Ca);
        gen.AddCertificates(CollectionUtilities.CreateStore(certs));
        return gen.Generate(new CmsProcessableByteArray(document), encapsulate: false).GetEncoded();
    }

    public void WriteTrustStore(string directory)
    {
        Directory.CreateDirectory(directory);
        File.WriteAllBytes(Path.Combine(directory, "root.cer"), Root.GetEncoded());
        File.WriteAllBytes(Path.Combine(directory, "ca.cer"), Ca.GetEncoded());
    }

    private static AsymmetricCipherKeyPair NewKey()
    {
        var gen = new ECKeyPairGenerator();
        gen.Init(new ECKeyGenerationParameters(
            Org.BouncyCastle.Asn1.Sec.SecObjectIdentifiers.SecP256r1, Random));
        return gen.GenerateKeyPair();
    }

    private static X509Certificate Issue(string subject, AsymmetricKeyParameter publicKey, string issuer,
        AsymmetricKeyParameter issuerKey, DateTime notBefore, DateTime notAfter, bool isCa)
    {
        var gen = new X509V3CertificateGenerator();
        gen.SetSerialNumber(BigInteger.ValueOf(Interlocked.Increment(ref _serial)));
        gen.SetSubjectDN(new X509Name(subject));
        gen.SetIssuerDN(new X509Name(issuer));
        gen.SetNotBefore(notBefore);
        gen.SetNotAfter(notAfter);
        gen.SetPublicKey(publicKey);
        gen.AddExtension(X509Extensions.BasicConstraints, true, isCa ? new BasicConstraints(0) : new BasicConstraints(false));
        gen.AddExtension(X509Extensions.KeyUsage, true, isCa
            ? new KeyUsage(KeyUsage.KeyCertSign | KeyUsage.CrlSign)
            : new KeyUsage(KeyUsage.NonRepudiation | KeyUsage.DigitalSignature));
        return gen.Generate(new Asn1SignatureFactory("SHA256WITHECDSA", issuerKey));
    }
}
