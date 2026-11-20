using DiiaSign.Api.Options;
using Microsoft.Extensions.Options;
using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Pkix;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.X509;
using Org.BouncyCastle.X509.Store;

namespace DiiaSign.Api.Crypto;

/// <summary>
/// Довірені сертифікати ЦСК (CACertificates.p7b від ІІТ / окремі .cer/.pem).
/// Для ECDSA-перевірки беремо лише сертифікати з EC-ключами; самопідписані — якорі довіри.
/// </summary>
public sealed class TrustedCaStore
{
    private readonly HashSet<TrustAnchor> _anchors;
    private readonly List<X509Certificate> _intermediates;
    private readonly ILogger<TrustedCaStore> _logger;

    public int AnchorCount => _anchors.Count;
    public int IntermediateCount => _intermediates.Count;

    public TrustedCaStore(IOptions<VerificationOptions> options, ILogger<TrustedCaStore> logger)
        : this(LoadCertificates(options.Value.CaCertificatesPath), logger)
    {
    }

    internal TrustedCaStore(IEnumerable<X509Certificate> certificates, ILogger<TrustedCaStore> logger)
    {
        _logger = logger;
        _anchors = [];
        _intermediates = [];

        foreach (var cert in certificates)
        {
            if (cert.SubjectPublicKeyInfo.Algorithm.Algorithm.Id != X9ObjectIdentifiers.IdECPublicKey.Id)
                continue; // ДСТУ 4145-ключі тут не потрібні (і BouncyCastle їх не перевіряє в PKIX)
            if (cert.GetBasicConstraints() < 0)
                continue; // не CA

            if (IsSelfSigned(cert))
                _anchors.Add(new TrustAnchor(cert, null));
            else
                _intermediates.Add(cert);
        }

        if (_anchors.Count == 0)
            throw new InvalidOperationException(
                "No trusted ECDSA root CA certificates loaded. Check Verification:CaCertificatesPath.");

        _logger.LogInformation("Loaded {Anchors} ECDSA root CA(s) and {Intermediates} intermediate CA(s)",
            _anchors.Count, _intermediates.Count);
    }

    /// <summary>Будує ланцюжок від сертифіката підписанта до довіреного кореня на момент <paramref name="atUtc"/>.</summary>
    public bool TryValidateChain(X509Certificate leaf, IEnumerable<X509Certificate> extraCerts, DateTime atUtc)
    {
        try
        {
            var selector = new X509CertStoreSelector { Certificate = leaf };
            var parameters = new PkixBuilderParameters(_anchors, selector)
            {
                // Відкликання (OCSP/CRL) не перевіряється — див. README, розділ «Обмеження».
                IsRevocationEnabled = false,
                Date = atUtc
            };

            var pool = new List<X509Certificate>(_intermediates) { leaf };
            pool.AddRange(extraCerts.Where(c => c.GetBasicConstraints() >= 0)); // лише CA-сертифікати з підпису
            parameters.AddStoreCert(CollectionUtilities.CreateStore(pool));

            new PkixCertPathBuilder().Build(parameters);
            return true;
        }
        catch (Exception ex) when (ex is PkixCertPathBuilderException or PkixCertPathValidatorException)
        {
            _logger.LogWarning("Signer certificate chain validation failed: {Reason}", ex.Message);
            return false;
        }
    }

    private static bool IsSelfSigned(X509Certificate cert)
    {
        if (!cert.SubjectDN.Equivalent(cert.IssuerDN))
            return false;
        try
        {
            cert.Verify(cert.GetPublicKey());
            return true;
        }
        catch
        {
            return false;
        }
    }

    internal static List<X509Certificate> LoadCertificates(string path)
    {
        if (string.IsNullOrWhiteSpace(path))
            throw new InvalidOperationException("Verification:CaCertificatesPath is not configured.");

        IEnumerable<string> files = Directory.Exists(path)
            ? Directory.EnumerateFiles(path).Where(f =>
                Path.GetExtension(f).ToLowerInvariant() is ".p7b" or ".cer" or ".crt" or ".pem" or ".der")
            : File.Exists(path)
                ? [path]
                : throw new FileNotFoundException(
                    $"CA certificates not found at '{path}'. Run scripts/fetch-ca-certs.sh.", path);

        var parser = new X509CertificateParser();
        var result = new List<X509Certificate>();
        foreach (var file in files)
            result.AddRange(parser.ReadCertificates(File.ReadAllBytes(file)));
        return result;
    }
}
