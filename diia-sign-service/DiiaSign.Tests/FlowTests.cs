using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using DiiaSign.Api.Diia;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

namespace DiiaSign.Tests;

internal sealed class FakeDiiaClient : IDiiaApiClient
{
    public string? Status { get; set; } = DiiaRequestStatus.Initialized;
    public List<(string RequestId, string FileName, string Hash)> Requests { get; } = [];

    public Task<string> CreateHashSigningRequestAsync(string requestId, string fileName, string fileHashBase64,
        string? returnLink, CancellationToken ct)
    {
        Requests.Add((requestId, fileName, fileHashBase64));
        return Task.FromResult($"https://diia.app/acquirers/branch/offer/offer-request/{Guid.NewGuid()}");
    }

    public Task<string?> GetRequestStatusAsync(string requestId, string? otp, CancellationToken ct) => Task.FromResult(Status);
    public Task<JsonNode?> ListBranchesAsync(CancellationToken ct) => Task.FromResult<JsonNode?>(null);
    public Task<string?> CreateBranchAsync(CreateBranchRequest request, CancellationToken ct) => Task.FromResult<string?>("b");
    public Task<JsonNode?> ListOffersAsync(string branchId, CancellationToken ct) => Task.FromResult<JsonNode?>(null);
    public Task<string?> CreateOfferAsync(string branchId, CreateOfferRequest request, CancellationToken ct) => Task.FromResult<string?>("o");
}

public sealed class FlowTests : IDisposable
{
    private const string ApiKey = "test-internal-api-key-0123456789abcdef";
    private static readonly byte[] Pdf = Encoding.ASCII.GetBytes("%PDF-1.7\n% test statement " + Guid.NewGuid());

    private readonly string _dir = Path.Combine(Path.GetTempPath(), "diia-sign-tests-" + Guid.NewGuid().ToString("N"));
    private readonly TestPki _pki = new();
    private readonly FakeDiiaClient _diia = new();
    private readonly WebApplicationFactory<Program> _factory;

    public FlowTests()
    {
        _pki.WriteTrustStore(Path.Combine(_dir, "certs"));
        _factory = new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
        {
            b.UseEnvironment("Testing");
            b.UseSetting("Diia:AcquirerToken", "acq");
            b.UseSetting("Diia:BranchId", "branch");
            b.UseSetting("Diia:OfferId", "offer");
            b.UseSetting("Security:InternalApiKey", ApiKey);
            b.UseSetting("Verification:CaCertificatesPath", Path.Combine(_dir, "certs"));
            b.UseSetting("ConnectionStrings:SignDb", $"Data Source={Path.Combine(_dir, "test.db")}");
            b.ConfigureTestServices(s => s.AddSingleton<IDiiaApiClient>(_diia));
        });
    }

    public void Dispose()
    {
        _factory.Dispose();
        Microsoft.Data.Sqlite.SqliteConnection.ClearAllPools();
        try { Directory.Delete(_dir, true); } catch { /* ignore */ }
    }

    private HttpClient Internal()
    {
        var c = _factory.CreateClient();
        c.DefaultRequestHeaders.Add("X-Api-Key", ApiKey);
        return c;
    }

    private async Task<JsonElement> CreateRequestAsync(string? expectedRnokpp = "1234567890", byte[]? pdf = null)
    {
        using var form = new MultipartFormDataContent();
        var file = new ByteArrayContent(pdf ?? Pdf);
        file.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
        form.Add(file, "file", "заява.pdf");
        form.Add(new StringContent("application-42"), "externalRef");
        if (expectedRnokpp is not null) form.Add(new StringContent(expectedRnokpp), "expectedRnokpp");

        var response = await Internal().PostAsync("/internal/sign-requests", form);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return await response.Content.ReadFromJsonAsync<JsonElement>();
    }

    private async Task<HttpResponseMessage> PostCallbackAsync(string requestId, byte[] signature, string contentType = "multipart/mixed")
    {
        var json = JsonSerializer.Serialize(new { signedItems = new[] { new { name = "x.pdf", signature = Convert.ToBase64String(signature) } } });
        var encodeData = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
        var boundary = Guid.NewGuid().ToString();
        var body = $"--{boundary}\r\nContent-Disposition: form-data; name=\"encodeData\"\r\n\r\n{encodeData}\r\n--{boundary}--\r\n";

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/diia/callback")
        {
            Content = new StringContent(body, Encoding.UTF8)
        };
        request.Content.Headers.ContentType = MediaTypeHeaderValue.Parse($"{contentType}; boundary={boundary}");
        request.Headers.Add("x-document-request-trace-id", requestId);
        request.Headers.Add("X-Diia-Id-Action", "hashedFilesSigning");
        return await _factory.CreateClient().SendAsync(request);
    }

    private async Task<JsonElement> GetStatusAsync(string requestId) =>
        await Internal().GetFromJsonAsync<JsonElement>($"/internal/sign-requests/{requestId}");

    [Fact]
    public async Task Internal_api_requires_api_key()
    {
        var response = await _factory.CreateClient().GetAsync($"/internal/sign-requests/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var setup = await Internal().GetAsync("/internal/setup/branches");
        Assert.Equal(HttpStatusCode.NotFound, setup.StatusCode); // AdminApiKey не задано → вимкнено
    }

    [Fact]
    public async Task Full_flow_signs_and_returns_signer()
    {
        var created = await CreateRequestAsync();
        var requestId = created.GetProperty("requestId").GetString()!;
        Assert.StartsWith("https://diia.app/", created.GetProperty("deeplink").GetString());
        Assert.Equal("zayava.pdf".Length > 0, _diia.Requests.Single().FileName.EndsWith(".pdf"));
        Assert.Equal(44, _diia.Requests.Single().Hash.Length);

        var signature = _pki.SignDetached(Pdf, _pki.IssueSigner("1234567890"));
        var callback = await PostCallbackAsync(requestId, signature, "multipart/form-data");
        Assert.Equal(HttpStatusCode.OK, callback.StatusCode);
        Assert.Equal("""{"success":true}""", await callback.Content.ReadAsStringAsync());

        var status = await GetStatusAsync(requestId);
        Assert.Equal("Signed", status.GetProperty("status").GetString());
        Assert.Equal("1234567890", status.GetProperty("signer").GetProperty("rnokpp").GetString());

        var p7s = await Internal().GetByteArrayAsync($"/internal/sign-requests/{requestId}/signature");
        Assert.Equal(signature, p7s);

        // Повтор того самого callback — ідемпотентно OK; інший підпис — конфлікт.
        Assert.Equal(HttpStatusCode.OK, (await PostCallbackAsync(requestId, signature)).StatusCode);
        var other = _pki.SignDetached(Pdf, _pki.IssueSigner("1234567890"));
        Assert.Equal(HttpStatusCode.Conflict, (await PostCallbackAsync(requestId, other)).StatusCode);
    }

    [Fact]
    public async Task Signature_by_another_person_is_rejected()
    {
        var requestId = (await CreateRequestAsync("1234567890")).GetProperty("requestId").GetString()!;

        var callback = await PostCallbackAsync(requestId, _pki.SignDetached(Pdf, _pki.IssueSigner("9999999999")));

        Assert.Equal((HttpStatusCode)422, callback.StatusCode);
        var status = await GetStatusAsync(requestId);
        Assert.Equal("Rejected", status.GetProperty("status").GetString());
        Assert.Equal("SignerMismatch", status.GetProperty("failureReason").GetString());
        Assert.Equal(JsonValueKind.Null, status.GetProperty("signer").ValueKind);
    }

    [Fact]
    public async Task Signature_from_untrusted_CA_is_rejected()
    {
        var requestId = (await CreateRequestAsync()).GetProperty("requestId").GetString()!;
        var rogue = new TestPki("Rogue");

        var callback = await PostCallbackAsync(requestId, rogue.SignDetached(Pdf, rogue.IssueSigner("1234567890")));

        Assert.Equal((HttpStatusCode)422, callback.StatusCode);
        Assert.Equal("UntrustedCertificateChain", (await GetStatusAsync(requestId)).GetProperty("failureReason").GetString());
    }

    [Fact]
    public async Task Callback_for_unknown_request_is_rejected()
    {
        var response = await PostCallbackAsync(Guid.NewGuid().ToString(), _pki.SignDetached(Pdf, _pki.IssueSigner()));
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Refusal_in_Diia_is_reported()
    {
        var requestId = (await CreateRequestAsync()).GetProperty("requestId").GetString()!;
        _diia.Status = DiiaRequestStatus.Refuse;

        var status = await GetStatusAsync(requestId);

        Assert.Equal("Refused", status.GetProperty("status").GetString());
    }

    [Fact]
    public async Task Non_pdf_is_rejected()
    {
        using var form = new MultipartFormDataContent();
        form.Add(new ByteArrayContent("MZ not a pdf"u8.ToArray()), "file", "evil.pdf");
        form.Add(new StringContent("application-1"), "externalRef");

        var response = await Internal().PostAsync("/internal/sign-requests", form);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
