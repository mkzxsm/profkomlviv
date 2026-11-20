using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using DiiaSign.Api.Crypto;
using DiiaSign.Api.Data;
using DiiaSign.Api.Diia;
using DiiaSign.Api.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DiiaSign.Api.Signing;

public sealed record CreateSigningRequest(
    byte[] Pdf,
    string ExternalRef,
    string? FileName,
    string? ExpectedRnokpp,
    string? ReturnLink);

public sealed record CreatedSigningRequest(SigningSession Session, string Deeplink);

public enum CallbackOutcome
{
    /// <summary>Підпис перевірено і збережено → 200 {"success": true}.</summary>
    Accepted,
    /// <summary>Повтор того самого вже прийнятого підпису → 200 {"success": true}.</summary>
    AlreadyAccepted,
    BadRequest,
    UnknownRequest,
    /// <summary>Сесія вже завершена іншим результатом.</summary>
    Conflict,
    Expired,
    /// <summary>Підпис не пройшов перевірку.</summary>
    Rejected
}

public sealed class SigningValidationException(string message) : Exception(message);

public sealed partial class SigningService(
    SignDbContext db,
    IDiiaApiClient diia,
    ISignatureVerifier verifier,
    IOptions<DiiaOptions> diiaOptions,
    IOptions<SigningOptions> signingOptions,
    TimeProvider time,
    ILogger<SigningService> logger)
{
    private static readonly TimeSpan DeeplinkLifetime = TimeSpan.FromMinutes(3);
    private const int MaxSignatureBase64Chars = 512 * 1024;
    private const string ExpectedAction = "hashedFilesSigning";

    // ── 1. Створення запиту на підпис ────────────────────────────────────────

    public async Task<CreatedSigningRequest> CreateAsync(CreateSigningRequest input, CancellationToken ct)
    {
        var opts = signingOptions.Value;
        var dOpts = diiaOptions.Value;

        if (input.Pdf.Length == 0 || input.Pdf.Length > opts.MaxPdfBytes)
            throw new SigningValidationException($"PDF must be between 1 byte and {opts.MaxPdfBytes} bytes.");
        if (!input.Pdf.AsSpan().StartsWith("%PDF-"u8))
            throw new SigningValidationException("File is not a PDF document.");
        if (string.IsNullOrWhiteSpace(input.ExternalRef) || !ExternalRefPattern().IsMatch(input.ExternalRef))
            throw new SigningValidationException("externalRef must be 1-100 chars of [A-Za-z0-9_.:-].");
        if (input.ExpectedRnokpp is not null && !RnokppPattern().IsMatch(input.ExpectedRnokpp))
            throw new SigningValidationException("expectedRnokpp must be exactly 10 digits.");

        var returnLink = ValidateReturnLink(input.ReturnLink, dOpts);
        var fileName = SanitizeFileName(input.FileName);

        var hashes = Hashing.Compute(input.Pdf);
        var digest = dOpts.SignAlgorithm == SignAlgorithms.Dstu4145Dstu7564 ? hashes.Kupyna256 : hashes.Sha256;
        var requestId = Guid.NewGuid().ToString("D");
        var now = time.GetUtcNow().UtcDateTime;

        var deeplink = await diia.CreateHashSigningRequestAsync(
            requestId, fileName, Convert.ToBase64String(digest), returnLink, ct);

        var session = new SigningSession
        {
            Id = requestId,
            ExternalRef = input.ExternalRef,
            FileName = fileName,
            SignAlgorithm = dOpts.SignAlgorithm,
            SignedDigest = digest,
            Sha256 = hashes.Sha256,
            Kupyna256 = hashes.Kupyna256,
            ExpectedRnokpp = input.ExpectedRnokpp,
            Otp = ExtractOtp(deeplink),
            Status = SigningStatus.Pending,
            CreatedAtUtc = now,
            DeeplinkExpiresAtUtc = now + DeeplinkLifetime,
            CallbackDeadlineUtc = now + TimeSpan.FromMinutes(opts.CallbackWindowMinutes)
        };
        db.Sessions.Add(session);
        await db.SaveChangesAsync(ct);

        logger.LogInformation("Created signing request {RequestId} for {ExternalRef} ({Algorithm})",
            requestId, input.ExternalRef, dOpts.SignAlgorithm);
        return new CreatedSigningRequest(session, deeplink);
    }

    // ── 2. Отримання статусу (з підтягуванням статусу з Дії) ────────────────

    public async Task<SigningSession?> GetAsync(string requestId, CancellationToken ct)
    {
        if (!IsValidRequestId(requestId))
            return null;

        var session = await db.Sessions.AsNoTracking().FirstOrDefaultAsync(s => s.Id == requestId, ct);
        if (session is null || session.IsTerminal)
            return session;

        var now = time.GetUtcNow().UtcDateTime;
        if (now > session.CallbackDeadlineUtc)
        {
            await TryTransitionAsync(requestId, SigningStatus.Expired, "CallbackNotReceived", ct);
            return await ReloadAsync(requestId, ct);
        }

        var pollInterval = TimeSpan.FromSeconds(signingOptions.Value.StatusPollIntervalSeconds);
        if (session.LastStatusCheckUtc is { } last && now - last < pollInterval)
            return session;

        string? diiaStatus;
        try
        {
            diiaStatus = await diia.GetRequestStatusAsync(requestId, session.Otp, ct);
        }
        catch (DiiaApiException)
        {
            return session; // graceful degradation: повертаємо локальний статус
        }

        await db.Sessions.Where(s => s.Id == requestId)
            .ExecuteUpdateAsync(set => set.SetProperty(s => s.LastStatusCheckUtc, now), ct);

        switch (diiaStatus)
        {
            case DiiaRequestStatus.Processing when session.Status == SigningStatus.Pending:
                await TryTransitionAsync(requestId, SigningStatus.Processing, null, ct);
                break;
            case DiiaRequestStatus.Refuse:
                await TryTransitionAsync(requestId, SigningStatus.Refused, "RefusedInDiia", ct);
                break;
            case DiiaRequestStatus.NotUsed:
                await TryTransitionAsync(requestId, SigningStatus.Expired, "DeeplinkNotUsed", ct);
                break;
            // "done" від Дії НЕ означає Signed: Signed ставимо лише після власної перевірки callback.
        }

        return await ReloadAsync(requestId, ct);
    }

    // ── 3. Callback від застосунку Дія ──────────────────────────────────────

    public async Task<CallbackOutcome> HandleCallbackAsync(
        string? requestId, string? action, string? encodeData, CancellationToken ct)
    {
        if (!IsValidRequestId(requestId))
        {
            logger.LogWarning("Callback rejected: missing or malformed X-Document-Request-Trace-Id");
            return CallbackOutcome.BadRequest;
        }
        if (!string.Equals(action, ExpectedAction, StringComparison.OrdinalIgnoreCase))
        {
            logger.LogWarning("Callback {RequestId} rejected: unexpected X-Diia-Id-Action", requestId);
            return CallbackOutcome.BadRequest;
        }

        // Перевіряємо, що запит санкціонували ми (FAQ інструкції, п.4.2).
        var session = await db.Sessions.AsNoTracking().FirstOrDefaultAsync(s => s.Id == requestId, ct);
        if (session is null)
        {
            logger.LogWarning("Callback for unknown request {RequestId}", requestId);
            return CallbackOutcome.UnknownRequest;
        }

        if (!TryDecodeSignature(encodeData, out var signature))
        {
            logger.LogWarning("Callback {RequestId} rejected: malformed encodeData", requestId);
            return CallbackOutcome.BadRequest;
        }

        if (session.IsTerminal)
            return ResolveRepeat(session, signature);

        var now = time.GetUtcNow().UtcDateTime;
        if (now > session.CallbackDeadlineUtc)
        {
            await TryTransitionAsync(requestId, SigningStatus.Expired, "CallbackTooLate", ct);
            return CallbackOutcome.Expired;
        }

        if (session.SignAlgorithm != diiaOptions.Value.SignAlgorithm)
        {
            await TryTransitionAsync(requestId, SigningStatus.Rejected, "AlgorithmConfigurationChanged", ct);
            return CallbackOutcome.Rejected;
        }

        var result = verifier.Verify(signature, session.SignedDigest, session.CreatedAtUtc);
        if (!result.IsValid)
        {
            logger.LogWarning("Callback {RequestId}: signature rejected ({Reason})", requestId, result.Failure);
            await TryTransitionAsync(requestId, SigningStatus.Rejected, result.Failure.ToString(), ct);
            return CallbackOutcome.Rejected;
        }

        var signer = result.Signer!;
        if (session.ExpectedRnokpp is not null && !FixedTimeEquals(session.ExpectedRnokpp, signer.Rnokpp))
        {
            logger.LogWarning("Callback {RequestId}: signer RNOKPP does not match the application", requestId);
            await TryTransitionAsync(requestId, SigningStatus.Rejected, "SignerMismatch", ct);
            return CallbackOutcome.Rejected;
        }

        var updated = await db.Sessions
            .Where(s => s.Id == requestId &&
                        (s.Status == SigningStatus.Pending || s.Status == SigningStatus.Processing))
            .ExecuteUpdateAsync(set => set
                .SetProperty(s => s.Status, SigningStatus.Signed)
                .SetProperty(s => s.FailureReason, (string?)null)
                .SetProperty(s => s.CompletedAtUtc, now)
                .SetProperty(s => s.SignatureP7s, signature)
                .SetProperty(s => s.SigningTimeUtc, result.SigningTimeUtc)
                .SetProperty(s => s.SignerFullName, signer.FullName)
                .SetProperty(s => s.SignerRnokpp, signer.Rnokpp)
                .SetProperty(s => s.SignerCertSerial, signer.CertificateSerial)
                .SetProperty(s => s.SignerCertIssuer, signer.CertificateIssuer), ct);

        if (updated == 0)
        {
            // Паралельний callback встиг першим.
            var current = await ReloadAsync(requestId, ct);
            return current is null ? CallbackOutcome.UnknownRequest : ResolveRepeat(current, signature);
        }

        logger.LogInformation("Callback {RequestId}: signature verified and stored", requestId);
        return CallbackOutcome.Accepted;
    }

    // ── Допоміжне ───────────────────────────────────────────────────────────

    private static CallbackOutcome ResolveRepeat(SigningSession session, byte[] signature) =>
        session.Status == SigningStatus.Signed && session.SignatureP7s is { } stored &&
        CryptographicOperations.FixedTimeEquals(stored, signature)
            ? CallbackOutcome.AlreadyAccepted
            : CallbackOutcome.Conflict;

    private async Task TryTransitionAsync(string requestId, SigningStatus status, string? reason, CancellationToken ct)
    {
        var now = time.GetUtcNow().UtcDateTime;
        var terminal = status is not (SigningStatus.Pending or SigningStatus.Processing);
        await db.Sessions
            .Where(s => s.Id == requestId &&
                        (s.Status == SigningStatus.Pending || s.Status == SigningStatus.Processing))
            .ExecuteUpdateAsync(set => set
                .SetProperty(s => s.Status, status)
                .SetProperty(s => s.FailureReason, reason)
                .SetProperty(s => s.CompletedAtUtc, s => terminal ? now : s.CompletedAtUtc), ct);
    }

    private Task<SigningSession?> ReloadAsync(string requestId, CancellationToken ct) =>
        db.Sessions.AsNoTracking().FirstOrDefaultAsync(s => s.Id == requestId, ct);

    private bool TryDecodeSignature(string? encodeData, out byte[] signature)
    {
        signature = [];
        if (string.IsNullOrWhiteSpace(encodeData) || encodeData.Length > MaxSignatureBase64Chars * 2)
            return false;
        try
        {
            var json = Convert.FromBase64String(encodeData.Trim());
            var payload = JsonSerializer.Deserialize<DiiaCallbackPayload>(json);
            // Ми завжди надсилаємо рівно один файл — і чекаємо рівно один підпис.
            if (payload?.SignedItems is not [{ Signature: { } sig }] || sig.Length > MaxSignatureBase64Chars)
                return false;
            signature = Convert.FromBase64String(sig);
            return signature.Length > 0;
        }
        catch (Exception ex) when (ex is FormatException or JsonException)
        {
            logger.LogDebug(ex, "Failed to decode encodeData");
            return false;
        }
    }

    private static string? ValidateReturnLink(string? returnLink, DiiaOptions opts)
    {
        if (string.IsNullOrWhiteSpace(returnLink))
            return null;
        if (string.IsNullOrWhiteSpace(opts.AllowedReturnLinkPrefix) ||
            !Uri.TryCreate(returnLink, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps ||
            !returnLink.StartsWith(opts.AllowedReturnLinkPrefix, StringComparison.Ordinal))
            throw new SigningValidationException("returnLink is not allowed.");
        return returnLink;
    }

    internal static string SanitizeFileName(string? fileName)
    {
        var name = Path.GetFileNameWithoutExtension(fileName ?? string.Empty);
        name = UnsafeFileNameChars().Replace(name, "_").Trim(' ', '.', '_');
        if (name.Length == 0) name = "zayava";
        if (name.Length > 80) name = name[..80];
        return name + ".pdf";
    }

    internal static string? ExtractOtp(string deeplink)
    {
        if (!Uri.TryCreate(deeplink, UriKind.Absolute, out var uri)) return null;
        var last = uri.AbsolutePath.TrimEnd('/').Split('/').LastOrDefault();
        return string.IsNullOrWhiteSpace(last) || last.Length > 64 ? null : last;
    }

    private static bool IsValidRequestId([System.Diagnostics.CodeAnalysis.NotNullWhen(true)] string? requestId) =>
        requestId is { Length: 36 } && Guid.TryParseExact(requestId, "D", out _);

    private static bool FixedTimeEquals(string expected, string? actual) =>
        actual is not null && CryptographicOperations.FixedTimeEquals(
            Encoding.ASCII.GetBytes(expected), Encoding.ASCII.GetBytes(actual));

    [GeneratedRegex(@"^[A-Za-z0-9_.:\-]{1,100}$")]
    private static partial Regex ExternalRefPattern();

    [GeneratedRegex(@"^\d{10}$")]
    private static partial Regex RnokppPattern();

    [GeneratedRegex(@"[^\p{L}\p{Nd} _.\-]")]
    private static partial Regex UnsafeFileNameChars();
}
