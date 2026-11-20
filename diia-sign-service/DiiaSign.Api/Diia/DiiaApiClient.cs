using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using DiiaSign.Api.Options;
using Microsoft.Extensions.Options;

namespace DiiaSign.Api.Diia;

/// <summary>Помилка API Дії. Повідомлення НЕ містить тіла відповіді (там може бути acquirer-токен).</summary>
public sealed class DiiaApiException(string operation, HttpStatusCode? statusCode, Exception? inner = null)
    : Exception($"Diia API call '{operation}' failed with status {(statusCode is null ? "n/a" : ((int)statusCode).ToString())}", inner)
{
    public string Operation { get; } = operation;
    public HttpStatusCode? StatusCode { get; } = statusCode;
}

public interface IDiiaApiClient
{
    /// <summary>Запит на підпис хеша файлу. Повертає deeplink.</summary>
    Task<string> CreateHashSigningRequestAsync(
        string requestId, string fileName, string fileHashBase64, string? returnLink, CancellationToken ct);

    /// <summary>Статус запиту (initialized / processing / done / refuse / notUsed).</summary>
    Task<string?> GetRequestStatusAsync(string requestId, string? otp, CancellationToken ct);

    Task<JsonNode?> ListBranchesAsync(CancellationToken ct);
    Task<string?> CreateBranchAsync(CreateBranchRequest request, CancellationToken ct);
    Task<JsonNode?> ListOffersAsync(string branchId, CancellationToken ct);
    Task<string?> CreateOfferAsync(string branchId, CreateOfferRequest request, CancellationToken ct);
}

/// <summary>
/// Кешує сесійний токен Дії (діє 2 год). Singleton — один токен на процес,
/// оновлюється заздалегідь і примусово після 401.
/// </summary>
public sealed class DiiaTokenProvider(
    IHttpClientFactory httpClientFactory,
    IOptions<DiiaOptions> options,
    TimeProvider time,
    ILogger<DiiaTokenProvider> logger)
{
    public const string HttpClientName = "diia";
    private static readonly TimeSpan Lifetime = TimeSpan.FromHours(2);
    private static readonly TimeSpan RefreshMargin = TimeSpan.FromMinutes(10);

    private readonly SemaphoreSlim _lock = new(1, 1);
    private string? _token;
    private DateTimeOffset _expiresAt;

    public async Task<string> GetTokenAsync(CancellationToken ct, bool forceRefresh = false)
    {
        if (!forceRefresh && _token is { } cached && time.GetUtcNow() < _expiresAt)
            return cached;

        await _lock.WaitAsync(ct);
        try
        {
            if (!forceRefresh && _token is { } t && time.GetUtcNow() < _expiresAt)
                return t;

            var opts = options.Value;
            var client = httpClientFactory.CreateClient(HttpClientName);
            using var request = new HttpRequestMessage(
                HttpMethod.Get, $"api/v1/auth/acquirer/{Uri.EscapeDataString(opts.AcquirerToken)}");
            if (!string.IsNullOrWhiteSpace(opts.AuthAcquirerToken))
                request.Headers.Authorization = new AuthenticationHeaderValue("Basic", opts.AuthAcquirerToken);

            var obtainedAt = time.GetUtcNow();
            using var response = await client.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
            {
                await DiiaApiClient.LogFailureAsync(logger, response, "GetSessionToken", opts, ct);
                throw new DiiaApiException("GetSessionToken", response.StatusCode);
            }

            var body = await response.Content.ReadFromJsonAsync<DiiaTokenResponse>(ct);
            if (string.IsNullOrWhiteSpace(body?.Token))
                throw new DiiaApiException("GetSessionToken", response.StatusCode);

            _token = body.Token;
            _expiresAt = obtainedAt + Lifetime - RefreshMargin;
            logger.LogInformation("Obtained Diia session token, valid until {ExpiresAt:u}", _expiresAt);
            return _token;
        }
        finally
        {
            _lock.Release();
        }
    }
}

public sealed class DiiaApiClient(
    IHttpClientFactory httpClientFactory,
    DiiaTokenProvider tokenProvider,
    IOptions<DiiaOptions> options,
    ILogger<DiiaApiClient> logger) : IDiiaApiClient
{
    private const int MaxLoggedBodyChars = 500;

    public async Task<string> CreateHashSigningRequestAsync(
        string requestId, string fileName, string fileHashBase64, string? returnLink, CancellationToken ct)
    {
        var opts = options.Value;
        var payload = new DiiaDynamicOfferRequest
        {
            OfferId = opts.OfferId,
            RequestId = requestId,
            ReturnLink = returnLink,
            SignAlgo = opts.SignAlgorithm,
            Data = new DiiaOfferRequestData
            {
                HashedFilesSigning = new DiiaHashedFilesSigning
                {
                    HashedFiles = [new DiiaHashedFile { FileName = fileName, FileHash = fileHashBase64 }]
                }
            }
        };

        var result = await SendAsync<DiiaDeeplinkResponse>(
            HttpMethod.Post,
            $"api/v2/acquirers/branch/{Uri.EscapeDataString(opts.BranchId)}/offer-request/dynamic",
            payload, "CreateHashSigningRequest", ct);

        if (string.IsNullOrWhiteSpace(result?.Deeplink))
            throw new DiiaApiException("CreateHashSigningRequest", HttpStatusCode.OK);
        return result.Deeplink;
    }

    public async Task<string?> GetRequestStatusAsync(string requestId, string? otp, CancellationToken ct)
    {
        var query = $"requestId={Uri.EscapeDataString(requestId)}";
        if (!string.IsNullOrWhiteSpace(otp))
            query = $"otp={Uri.EscapeDataString(otp)}&{query}";

        var result = await SendAsync<DiiaStatusResponse>(
            HttpMethod.Get, $"api/v1/acquirers/offer-request/status?{query}", null, "GetRequestStatus", ct);
        return result?.Status;
    }

    public Task<JsonNode?> ListBranchesAsync(CancellationToken ct) =>
        SendAsync<JsonNode>(HttpMethod.Get, "api/v2/acquirers/branches?skip=0&limit=100", null, "ListBranches", ct);

    public async Task<string?> CreateBranchAsync(CreateBranchRequest r, CancellationToken ct)
    {
        var payload = new Dictionary<string, object>
        {
            ["name"] = r.Name,
            ["email"] = r.Email,
            ["region"] = r.Region,
            ["district"] = r.District,
            ["location"] = r.Location,
            ["street"] = r.Street,
            ["house"] = r.House,
            ["deliveryTypes"] = new[] { "api" },
            ["offerRequestType"] = "dynamic",
            // Один scope на бранч: підписання і авторизація на одному бранчі несумісні (помилка 403).
            ["scopes"] = new Dictionary<string, string[]> { ["diiaId"] = ["hashedFilesSigning"] }
        };
        if (!string.IsNullOrWhiteSpace(r.CustomFullName)) payload["customFullName"] = r.CustomFullName;
        if (!string.IsNullOrWhiteSpace(r.CustomFullAddress)) payload["customFullAddress"] = r.CustomFullAddress;

        var result = await SendAsync<DiiaIdResponse>(HttpMethod.Post, "api/v2/acquirers/branch", payload, "CreateBranch", ct);
        return result?.Id;
    }

    public Task<JsonNode?> ListOffersAsync(string branchId, CancellationToken ct) =>
        SendAsync<JsonNode>(HttpMethod.Get,
            $"api/v1/acquirers/branch/{Uri.EscapeDataString(branchId)}/offers?skip=0&limit=100",
            null, "ListOffers", ct);

    public async Task<string?> CreateOfferAsync(string branchId, CreateOfferRequest r, CancellationToken ct)
    {
        var payload = new Dictionary<string, object>
        {
            ["name"] = r.Name,
            ["scopes"] = new Dictionary<string, string[]> { ["diiaId"] = ["hashedFilesSigning"] }
        };
        if (!string.IsNullOrWhiteSpace(r.ReturnLink)) payload["returnLink"] = r.ReturnLink;

        var result = await SendAsync<DiiaIdResponse>(HttpMethod.Post,
            $"api/v1/acquirers/branch/{Uri.EscapeDataString(branchId)}/offer", payload, "CreateOffer", ct);
        return result?.Id;
    }

    private async Task<T?> SendAsync<T>(HttpMethod method, string path, object? body, string operation, CancellationToken ct)
    {
        var client = httpClientFactory.CreateClient(DiiaTokenProvider.HttpClientName);

        for (var attempt = 1; ; attempt++)
        {
            var token = await tokenProvider.GetTokenAsync(ct, forceRefresh: attempt > 1);
            using var request = new HttpRequestMessage(method, path);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            if (body is not null)
                request.Content = JsonContent.Create(body);

            HttpResponseMessage response;
            try
            {
                response = await client.SendAsync(request, ct);
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException && !ct.IsCancellationRequested)
            {
                logger.LogWarning(ex, "Diia API {Operation} is unreachable", operation);
                throw new DiiaApiException(operation, null, ex);
            }

            using (response)
            {
                // Токен міг протухнути раніше — одна повторна спроба зі свіжим токеном.
                if (response.StatusCode == HttpStatusCode.Unauthorized && attempt == 1)
                {
                    logger.LogInformation("Diia API {Operation} returned 401, refreshing session token", operation);
                    continue;
                }

                if (!response.IsSuccessStatusCode)
                {
                    await LogFailureAsync(logger, response, operation, options.Value, ct);
                    throw new DiiaApiException(operation, response.StatusCode);
                }

                if (response.StatusCode == HttpStatusCode.NoContent)
                    return default;

                try
                {
                    return await response.Content.ReadFromJsonAsync<T>(ct);
                }
                catch (JsonException ex)
                {
                    logger.LogWarning(ex, "Diia API {Operation} returned non-JSON body", operation);
                    throw new DiiaApiException(operation, response.StatusCode, ex);
                }
            }
        }
    }

    internal static async Task LogFailureAsync(
        ILogger logger, HttpResponseMessage response, string operation, DiiaOptions opts, CancellationToken ct)
    {
        string body;
        try
        {
            body = await response.Content.ReadAsStringAsync(ct);
        }
        catch
        {
            body = "<unreadable>";
        }

        // Дія може повертати acquirer-токен у тексті помилки ("Acquirer not found by the provided token ...").
        foreach (var secret in new[] { opts.AcquirerToken, opts.AuthAcquirerToken })
        {
            if (!string.IsNullOrEmpty(secret))
                body = body.Replace(secret, "***", StringComparison.Ordinal);
        }
        if (body.Length > MaxLoggedBodyChars)
            body = body[..MaxLoggedBodyChars] + "…";

        logger.LogError("Diia API {Operation} failed: HTTP {StatusCode}, body: {Body}",
            operation, (int)response.StatusCode, body);
    }
}
