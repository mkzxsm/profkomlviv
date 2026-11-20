using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace ProfkomBackend.Services.DiiaSign
{
    /// <summary>
    /// Точка входу в підписання через Дія.Підпис для решти коду бекенду.
    /// Типове використання (з коду генерації заяв):
    /// <code>
    /// var start = await diiaSign.StartAsync(pdfBytes, $"application-{app.Id}", app.Rnokpp, "Заява про вступ.pdf", ct);
    /// // зберегти start.RequestId і start.Kupyna256 у заяві, повернути фронтенду start.Deeplink і start.RequestId
    /// </code>
    /// Далі фронтенд опитує GET /api/diia-sign/{requestId}/status, а коли статус стане Signed,
    /// буде викликано <see cref="IDiiaSignCompletionHandler"/>.
    /// </summary>
    public interface IDiiaSignClient
    {
        /// <param name="pdf">Готова PDF-заява.</param>
        /// <param name="externalRef">Ваш ідентифікатор заяви, [A-Za-z0-9_.:-]{1,100}. Повернеться в completion handler.</param>
        /// <param name="expectedRnokpp">РНОКПП із форми: якщо підпише інша людина, буде Rejected/SignerMismatch.</param>
        /// <param name="fileName">Назва файлу, яку користувач побачить у Дії.</param>
        Task<DiiaSignStartResult> StartAsync(byte[] pdf, string externalRef, string? expectedRnokpp,
            string? fileName, CancellationToken ct = default);

        /// <returns>null, якщо такого запиту немає (або він уже видалений за терміном зберігання).</returns>
        Task<DiiaSignStatusResult?> GetStatusAsync(string requestId, CancellationToken ct = default);

        /// <summary>Detached CAdES-підпис (.p7s) — зберігати поруч із PDF. null, якщо ще не підписано.</summary>
        Task<byte[]?> DownloadSignatureAsync(string requestId, CancellationToken ct = default);
    }

    public partial class DiiaSignClient : IDiiaSignClient
    {
        public const string ApiKeyHeader = "X-Api-Key";

        private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

        private readonly HttpClient _http;
        private readonly ILogger<DiiaSignClient> _logger;

        public DiiaSignClient(HttpClient http, ILogger<DiiaSignClient> logger)
        {
            _http = http;
            _logger = logger;
        }

        public async Task<DiiaSignStartResult> StartAsync(byte[] pdf, string externalRef, string? expectedRnokpp,
            string? fileName, CancellationToken ct = default)
        {
            if (pdf is null || pdf.Length == 0)
                throw new DiiaSignValidationException("PDF порожній.");
            if (string.IsNullOrWhiteSpace(externalRef) || !ExternalRefPattern().IsMatch(externalRef))
                throw new DiiaSignValidationException("externalRef має містити 1-100 символів [A-Za-z0-9_.:-].");
            if (expectedRnokpp is not null && !RnokppPattern().IsMatch(expectedRnokpp))
                throw new DiiaSignValidationException("РНОКПП має складатися з 10 цифр.");

            using var form = new MultipartFormDataContent();
            var file = new ByteArrayContent(pdf);
            file.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
            form.Add(file, "file", "statement.pdf");
            form.Add(new StringContent(externalRef), "externalRef");
            if (expectedRnokpp is not null) form.Add(new StringContent(expectedRnokpp), "expectedRnokpp");
            if (!string.IsNullOrWhiteSpace(fileName)) form.Add(new StringContent(fileName), "fileName");

            using var response = await SendAsync(() => _http.PostAsync("internal/sign-requests", form, ct), "Start");

            if (response.StatusCode == HttpStatusCode.BadRequest)
            {
                var detail = await ReadProblemDetailAsync(response, ct);
                throw new DiiaSignValidationException(detail ?? "Сервіс підпису відхилив запит.");
            }
            await EnsureSuccessAsync(response, "Start");

            var body = await response.Content.ReadFromJsonAsync<StartDto>(Json, ct);
            if (body?.RequestId is null || body.Deeplink is null)
                throw new DiiaSignUnavailableException("Сервіс підпису повернув некоректну відповідь.");

            _logger.LogInformation("Diia signing started: {RequestId} for {ExternalRef}", body.RequestId, externalRef);
            return new DiiaSignStartResult(body.RequestId, body.Deeplink, body.DeeplinkExpiresAtUtc,
                body.Kupyna256 ?? string.Empty, body.Sha256 ?? string.Empty);
        }

        public async Task<DiiaSignStatusResult?> GetStatusAsync(string requestId, CancellationToken ct = default)
        {
            if (!IsRequestId(requestId)) return null;

            using var response = await SendAsync(() => _http.GetAsync($"internal/sign-requests/{requestId}", ct), "GetStatus");
            if (response.StatusCode == HttpStatusCode.NotFound) return null;
            await EnsureSuccessAsync(response, "GetStatus");

            var body = await response.Content.ReadFromJsonAsync<StatusDto>(Json, ct);
            if (body?.RequestId is null || !Enum.TryParse<DiiaSignStatus>(body.Status, out var status))
                throw new DiiaSignUnavailableException("Сервіс підпису повернув некоректну відповідь.");

            return new DiiaSignStatusResult(body.RequestId, body.ExternalRef ?? string.Empty, status,
                body.FailureReason, status == DiiaSignStatus.Signed ? body.Signer : null);
        }

        public async Task<byte[]?> DownloadSignatureAsync(string requestId, CancellationToken ct = default)
        {
            if (!IsRequestId(requestId)) return null;

            using var response = await SendAsync(
                () => _http.GetAsync($"internal/sign-requests/{requestId}/signature", ct), "DownloadSignature");
            if (response.StatusCode == HttpStatusCode.NotFound) return null;
            await EnsureSuccessAsync(response, "DownloadSignature");
            return await response.Content.ReadAsByteArrayAsync(ct);
        }

        public static bool IsRequestId(string? value) =>
            value is { Length: 36 } && Guid.TryParseExact(value, "D", out _);

        private async Task<HttpResponseMessage> SendAsync(Func<Task<HttpResponseMessage>> send, string operation)
        {
            try
            {
                return await send();
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                _logger.LogError(ex, "diia-sign-service is unreachable ({Operation})", operation);
                throw new DiiaSignUnavailableException("Сервіс підпису недоступний.", ex);
            }
        }

        private async Task EnsureSuccessAsync(HttpResponseMessage response, string operation)
        {
            if (response.IsSuccessStatusCode) return;

            // 401 — неправильний DiiaSign:ApiKey; 502 — недоступна Дія.
            _logger.LogError("diia-sign-service {Operation} failed: HTTP {Status}", operation, (int)response.StatusCode);
            throw new DiiaSignUnavailableException(response.StatusCode == HttpStatusCode.Unauthorized
                ? "Неправильний ключ доступу до сервісу підпису."
                : "Сервіс підпису тимчасово недоступний.");
        }

        private static async Task<string?> ReadProblemDetailAsync(HttpResponseMessage response, CancellationToken ct)
        {
            try
            {
                using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(ct));
                return doc.RootElement.TryGetProperty("detail", out var d) ? d.GetString() : null;
            }
            catch (JsonException)
            {
                return null;
            }
        }

        private sealed record StartDto(string? RequestId, string? Deeplink, DateTime DeeplinkExpiresAtUtc,
            string? Kupyna256, string? Sha256);

        private sealed record StatusDto(string? RequestId, string? ExternalRef, string? Status,
            string? FailureReason, DiiaSigner? Signer);

        [GeneratedRegex(@"^[A-Za-z0-9_.:\-]{1,100}$")]
        private static partial Regex ExternalRefPattern();

        [GeneratedRegex(@"^\d{10}$")]
        private static partial Regex RnokppPattern();
    }
}
