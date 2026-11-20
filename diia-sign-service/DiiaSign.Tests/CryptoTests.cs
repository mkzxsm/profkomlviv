using System.Security.Cryptography;
using DiiaSign.Api.Crypto;
using DiiaSign.Api.Options;
using Microsoft.Extensions.Logging.Abstractions;

namespace DiiaSign.Tests;

public class HashingTests
{
    [Fact]
    public void Kupyna256_matches_DSTU_7564_reference_vector()
    {
        // ДСТУ 7564:2014, приклад для Купина-256: повідомлення 00 01 … 3F (512 біт).
        var message = Enumerable.Range(0, 64).Select(i => (byte)i).ToArray();
        var hash = Hashing.Kupyna256(message);
        Assert.Equal("08F4EE6F1BE6903B324C4E27990CB24EF69DD58DBE84813EE0A52F6631239875", Convert.ToHexString(hash));
        Assert.Equal(44, Convert.ToBase64String(hash).Length);
    }
}

public class EcdsaVerifierTests
{
    private static readonly byte[] Pdf = "%PDF-1.7 test statement"u8.ToArray();
    private readonly TestPki _pki = new();

    private EcdsaCmsSignatureVerifier CreateVerifier(TestPki? trusted = null)
    {
        var t = trusted ?? _pki;
        var store = new TrustedCaStore([t.Root, t.Ca], NullLogger<TrustedCaStore>.Instance);
        return new EcdsaCmsSignatureVerifier(store,
            Microsoft.Extensions.Options.Options.Create(new VerificationOptions { CaCertificatesPath = "x", MaxClockSkewMinutes = 5 }),
            TimeProvider.System, NullLogger<EcdsaCmsSignatureVerifier>.Instance);
    }

    private static DateTime RequestCreated => DateTime.UtcNow.AddMinutes(-1);

    [Fact]
    public void Valid_signature_is_accepted_and_identity_extracted()
    {
        var cms = _pki.SignDetached(Pdf, _pki.IssueSigner("3012345678"));

        var result = CreateVerifier().Verify(cms, SHA256.HashData(Pdf), RequestCreated);

        Assert.True(result.IsValid, result.Failure.ToString());
        Assert.Equal("3012345678", result.Signer!.Rnokpp);
        Assert.Equal("Shevchenko Taras", result.Signer.FullName);
        Assert.NotNull(result.SigningTimeUtc);
    }

    [Fact]
    public void Signature_over_another_document_is_rejected()
    {
        var cms = _pki.SignDetached("%PDF-1.7 other"u8.ToArray(), _pki.IssueSigner());

        var result = CreateVerifier().Verify(cms, SHA256.HashData(Pdf), RequestCreated);

        Assert.Equal(VerificationFailure.InvalidSignature, result.Failure);
    }

    [Fact]
    public void Signer_from_untrusted_CA_is_rejected()
    {
        var rogue = new TestPki("Rogue");
        var cms = rogue.SignDetached(Pdf, rogue.IssueSigner());

        var result = CreateVerifier().Verify(cms, SHA256.HashData(Pdf), RequestCreated);

        Assert.Equal(VerificationFailure.UntrustedCertificateChain, result.Failure);
    }

    [Fact]
    public void Expired_certificate_is_rejected()
    {
        var signer = _pki.IssueSigner(notBefore: DateTime.UtcNow.AddYears(-2), notAfter: DateTime.UtcNow.AddDays(-1));
        var cms = _pki.SignDetached(Pdf, signer);

        var result = CreateVerifier().Verify(cms, SHA256.HashData(Pdf), RequestCreated);

        Assert.Equal(VerificationFailure.CertificateNotValidAtSigningTime, result.Failure);
    }

    [Fact]
    public void Signature_made_before_request_was_created_is_rejected()
    {
        var cms = _pki.SignDetached(Pdf, _pki.IssueSigner());

        var result = CreateVerifier().Verify(cms, SHA256.HashData(Pdf), DateTime.UtcNow.AddMinutes(30));

        Assert.Equal(VerificationFailure.SigningTimeOutOfRange, result.Failure);
    }

    [Fact]
    public void Garbage_is_rejected_as_malformed()
    {
        var result = CreateVerifier().Verify([1, 2, 3, 4], SHA256.HashData(Pdf), RequestCreated);

        Assert.Equal(VerificationFailure.MalformedSignature, result.Failure);
    }
}
