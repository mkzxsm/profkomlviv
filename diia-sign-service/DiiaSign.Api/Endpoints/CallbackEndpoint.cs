using System.Text;
using System.Text.Json;
using DiiaSign.Api.Signing;
using Microsoft.AspNetCore.Http.Metadata;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Net.Http.Headers;

namespace DiiaSign.Api.Endpoints;

/// <summary>
/// Публічна точка доступу, на яку застосунок Дія надсилає підписаний хеш.
/// Має бути доступна з будь-якої IP через HTTPS:443 і відповідати протягом 30 с.
/// </summary>
public static class CallbackEndpoint
{
    public const string RateLimitPolicy = "diia-callback";
    public const long MaxBodyBytes = 1024 * 1024;

    public static void MapDiiaCallback(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/diia/callback", HandleAsync)
            .RequireRateLimiting(RateLimitPolicy)
            .WithMetadata(new RequestSizeLimitMetadata(MaxBodyBytes))
            .DisableAntiforgery();
    }

    private sealed class RequestSizeLimitMetadata(long limit) : IRequestSizeLimitMetadata
    {
        public long? MaxRequestBodySize => limit;
    }

    private static async Task<IResult> HandleAsync(HttpRequest request, SigningService signing, CancellationToken ct)
    {
        // Заголовки в ASP.NET Core нечутливі до регістру — покриває всі варіанти з інструкції.
        var requestId = request.Headers["X-Document-Request-Trace-Id"].ToString();
        var action = request.Headers["X-Diia-Id-Action"].ToString();

        string? encodeData;
        try
        {
            encodeData = await ReadEncodeDataAsync(request, ct);
        }
        catch (Exception ex) when (ex is InvalidDataException or IOException or FormatException or JsonException)
        {
            encodeData = null;
        }

        var outcome = await signing.HandleCallbackAsync(requestId, action, encodeData, ct);
        return outcome switch
        {
            CallbackOutcome.Accepted or CallbackOutcome.AlreadyAccepted => Results.Ok(new { success = true }),
            CallbackOutcome.UnknownRequest => Results.Json(new { success = false }, statusCode: 404),
            CallbackOutcome.Conflict => Results.Json(new { success = false }, statusCode: 409),
            CallbackOutcome.Expired => Results.Json(new { success = false }, statusCode: 410),
            CallbackOutcome.Rejected => Results.Json(new { success = false }, statusCode: 422),
            _ => Results.Json(new { success = false }, statusCode: 400)
        };
    }

    /// <summary>Дія шле multipart/mixed (sandbox) або multipart/form-data (prod) з полем encodeData.</summary>
    internal static async Task<string?> ReadEncodeDataAsync(HttpRequest request, CancellationToken ct)
    {
        if (!MediaTypeHeaderValue.TryParse(request.ContentType, out var mediaType))
            return null;

        if (mediaType.MediaType.StartsWith("multipart/", StringComparison.OrdinalIgnoreCase))
        {
            var boundary = HeaderUtilities.RemoveQuotes(mediaType.Boundary).Value;
            if (string.IsNullOrWhiteSpace(boundary) || boundary.Length > 200)
                return null;

            var reader = new MultipartReader(boundary, request.Body) { BodyLengthLimit = MaxBodyBytes };
            while (await reader.ReadNextSectionAsync(ct) is { } section)
            {
                if (section.GetContentDispositionHeader() is { } cd && cd.Name.Value == "encodeData")
                {
                    using var sr = new StreamReader(section.Body, Encoding.UTF8);
                    return await sr.ReadToEndAsync(ct);
                }
            }
            return null;
        }

        if (mediaType.MediaType.Equals("application/json", StringComparison.OrdinalIgnoreCase))
        {
            using var doc = await JsonDocument.ParseAsync(request.Body, cancellationToken: ct);
            return doc.RootElement.ValueKind == JsonValueKind.Object &&
                   doc.RootElement.TryGetProperty("encodeData", out var el) &&
                   el.ValueKind == JsonValueKind.String
                ? el.GetString()
                : null;
        }

        return null;
    }
}
