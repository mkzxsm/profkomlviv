using DiiaSign.Api.Data;
using DiiaSign.Api.Diia;
using DiiaSign.Api.Options;
using DiiaSign.Api.Security;
using DiiaSign.Api.Signing;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DiiaSign.Api.Endpoints;

/// <summary>Відповідь для основного бекенду.</summary>
public sealed record SigningSessionDto(
    string RequestId,
    string ExternalRef,
    string Status,
    string? FailureReason,
    string FileName,
    string SignAlgorithm,
    string Sha256,
    string Kupyna256,
    DateTime CreatedAtUtc,
    DateTime DeeplinkExpiresAtUtc,
    DateTime? CompletedAtUtc,
    SignerDto? Signer,
    string? Deeplink = null)
{
    public static SigningSessionDto From(SigningSession s, string? deeplink = null) => new(
        s.Id, s.ExternalRef, s.Status.ToString(), s.FailureReason, s.FileName, s.SignAlgorithm,
        Convert.ToBase64String(s.Sha256), Convert.ToBase64String(s.Kupyna256),
        s.CreatedAtUtc, s.DeeplinkExpiresAtUtc, s.CompletedAtUtc,
        s.Status == SigningStatus.Signed
            ? new SignerDto(s.SignerFullName, s.SignerRnokpp, s.SignerCertSerial, s.SignerCertIssuer, s.SigningTimeUtc)
            : null,
        deeplink);
}

public sealed record SignerDto(
    string? FullName, string? Rnokpp, string? CertificateSerial, string? CertificateIssuer, DateTime? SigningTimeUtc);

public static class InternalEndpoints
{
    public static void MapInternalEndpoints(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/internal/sign-requests")
            .AddEndpointFilter(new ApiKeyFilter(sp => sp.GetRequiredService<IOptions<SecurityOptions>>().Value.InternalApiKey))
            .DisableAntiforgery();

        // multipart/form-data: file (PDF), externalRef, expectedRnokpp?, fileName?, returnLink?
        api.MapPost("/", async (
            [FromForm] IFormFile file,
            [FromForm] string externalRef,
            [FromForm] string? expectedRnokpp,
            [FromForm] string? fileName,
            [FromForm] string? returnLink,
            SigningService signing,
            IOptions<SigningOptions> opts,
            CancellationToken ct) =>
        {
            if (file.Length == 0 || file.Length > opts.Value.MaxPdfBytes)
                return Problem(400, "PDF file is empty or too large.");

            byte[] pdf;
            using (var ms = new MemoryStream((int)file.Length))
            {
                await file.CopyToAsync(ms, ct);
                pdf = ms.ToArray();
            }

            try
            {
                var created = await signing.CreateAsync(new CreateSigningRequest(
                    pdf, externalRef, fileName ?? file.FileName,
                    string.IsNullOrWhiteSpace(expectedRnokpp) ? null : expectedRnokpp.Trim(),
                    returnLink), ct);
                return Results.Ok(SigningSessionDto.From(created.Session, created.Deeplink));
            }
            catch (SigningValidationException ex)
            {
                return Problem(400, ex.Message);
            }
        });

        api.MapGet("/{requestId}", async (string requestId, SigningService signing, CancellationToken ct) =>
            await signing.GetAsync(requestId, ct) is { } session
                ? Results.Ok(SigningSessionDto.From(session))
                : Results.NotFound());

        // Підпис у форматі .p7s (detached CAdES) — зберігати поруч із PDF-заявою.
        api.MapGet("/{requestId}/signature", async (string requestId, SigningService signing, CancellationToken ct) =>
            await signing.GetAsync(requestId, ct) is { Status: SigningStatus.Signed, SignatureP7s: { } p7s } session
                ? Results.File(p7s, "application/pkcs7-signature", $"{Path.GetFileNameWithoutExtension(session.FileName)}.p7s")
                : Results.NotFound());

        // ── Одноразове налаштування бранча / офера (окремий адмін-ключ) ──────
        var setup = app.MapGroup("/internal/setup")
            .AddEndpointFilter(new ApiKeyFilter(sp => sp.GetRequiredService<IOptions<SecurityOptions>>().Value.AdminApiKey));

        setup.MapGet("/branches", async (IDiiaApiClient diia, CancellationToken ct) =>
            Results.Ok(await diia.ListBranchesAsync(ct)));
        setup.MapPost("/branches", async (CreateBranchRequest body, IDiiaApiClient diia, CancellationToken ct) =>
            Results.Ok(new { branchId = await diia.CreateBranchAsync(body, ct) }));
        setup.MapGet("/branches/{branchId}/offers", async (string branchId, IDiiaApiClient diia, CancellationToken ct) =>
            Results.Ok(await diia.ListOffersAsync(branchId, ct)));
        setup.MapPost("/branches/{branchId}/offers", async (string branchId, CreateOfferRequest body, IDiiaApiClient diia, CancellationToken ct) =>
            Results.Ok(new { offerId = await diia.CreateOfferAsync(branchId, body, ct) }));
    }

    private static IResult Problem(int status, string detail) => Results.Problem(detail: detail, statusCode: status);
}
