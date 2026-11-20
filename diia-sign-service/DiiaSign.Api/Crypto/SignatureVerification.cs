namespace DiiaSign.Api.Crypto;

/// <summary>Машинно-читаний код причини відхилення підпису (без персональних даних).</summary>
public enum VerificationFailure
{
    None = 0,
    MalformedSignature,
    UnsupportedAlgorithm,
    SignerCertificateMissing,
    InvalidSignature,
    SigningTimeOutOfRange,
    CertificateNotValidAtSigningTime,
    CertificateKeyUsageInvalid,
    UntrustedCertificateChain,
    SignerIdentityMissing,
    VerifierNotAvailable
}

public sealed record SignerIdentity(
    string? FullName,
    string? Rnokpp,
    string CertificateSerial,
    string CertificateIssuer,
    DateTime CertificateNotBeforeUtc,
    DateTime CertificateNotAfterUtc);

public sealed record SignatureVerificationResult(
    VerificationFailure Failure,
    SignerIdentity? Signer = null,
    DateTime? SigningTimeUtc = null)
{
    public bool IsValid => Failure == VerificationFailure.None;

    public static SignatureVerificationResult Fail(VerificationFailure failure, SignerIdentity? signer = null) =>
        new(failure, signer);
}

public interface ISignatureVerifier
{
    /// <summary>
    /// Перевіряє detached CAdES/CMS-підпис над <paramref name="expectedDigest"/>:
    /// криптографію, прив'язку до саме нашого хеша, сертифікат і ланцюжок до довірених ЦСК.
    /// </summary>
    /// <param name="cms">DER-байти підпису (signature з encodeData, base64-декодований).</param>
    /// <param name="expectedDigest">Хеш, який ми надсилали в Дію.</param>
    /// <param name="requestCreatedUtc">Коли створено запит — підпис не може бути старшим.</param>
    SignatureVerificationResult Verify(byte[] cms, byte[] expectedDigest, DateTime requestCreatedUtc);
}

/// <summary>
/// Заглушка для DSTU4145-DSTU7564: перевірку ДСТУ-підписів з ланцюжком і OCSP потрібно робити
/// бібліотекою ІІТ (EUSignCP). Поки її не інтегровано — будь-який підпис відхиляється (fail-closed).
/// </summary>
public sealed class IitNotIntegratedVerifier(ILogger<IitNotIntegratedVerifier> logger) : ISignatureVerifier
{
    public SignatureVerificationResult Verify(byte[] cms, byte[] expectedDigest, DateTime requestCreatedUtc)
    {
        logger.LogCritical(
            "DSTU4145-DSTU7564 signature received but IIT EUSignCP verifier is not integrated; rejecting. " +
            "Implement ISignatureVerifier on top of EUSignCP or switch Diia:SignAlgorithm to ECDSA.");
        return SignatureVerificationResult.Fail(VerificationFailure.VerifierNotAvailable);
    }
}
