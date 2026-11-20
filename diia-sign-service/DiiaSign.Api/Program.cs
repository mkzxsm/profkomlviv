using System.Net;
using System.Threading.RateLimiting;
using DiiaSign.Api.Background;
using DiiaSign.Api.Crypto;
using DiiaSign.Api.Data;
using DiiaSign.Api.Diia;
using DiiaSign.Api.Endpoints;
using DiiaSign.Api.Options;
using DiiaSign.Api.Signing;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// URL запиту до /auth/acquirer/{token} містить секрет — логи HttpClient вимикаємо нижче Warning.
builder.Logging.AddFilter("System.Net.Http.HttpClient", LogLevel.Warning);
builder.Logging.AddFilter("Microsoft.EntityFrameworkCore.Database.Command", LogLevel.Warning);

// ── Налаштування з валідацією на старті ─────────────────────────────────────
builder.Services.AddOptions<DiiaOptions>().BindConfiguration(DiiaOptions.SectionName)
    .ValidateDataAnnotations()
    .Validate(o => SignAlgorithms.IsSupported(o.SignAlgorithm), "Diia:SignAlgorithm must be ECDSA or DSTU4145-DSTU7564.")
    .Validate(o => o.Environment != DiiaEnvironment.Production || o.BaseUrl.TrimEnd('/') == "https://api2.diia.gov.ua",
        "Diia:BaseUrl must be https://api2.diia.gov.ua in Production.")
    .Validate(o => o.Environment != DiiaEnvironment.Production || o.SignAlgorithm == SignAlgorithms.Ecdsa,
        "DSTU4145-DSTU7564 requires the IIT EUSignCP verifier, which is not integrated yet. Use ECDSA.")
    .Validate(o => string.IsNullOrEmpty(o.AllowedReturnLinkPrefix) || o.AllowedReturnLinkPrefix.StartsWith("https://"),
        "Diia:AllowedReturnLinkPrefix must start with https://")
    .ValidateOnStart();
builder.Services.AddOptions<SigningOptions>().BindConfiguration(SigningOptions.SectionName)
    .ValidateDataAnnotations().ValidateOnStart();
builder.Services.AddOptions<VerificationOptions>().BindConfiguration(VerificationOptions.SectionName)
    .ValidateDataAnnotations().ValidateOnStart();
builder.Services.AddOptions<SecurityOptions>().BindConfiguration(SecurityOptions.SectionName)
    .ValidateDataAnnotations()
    .Validate(o => string.IsNullOrEmpty(o.AdminApiKey) || (o.AdminApiKey.Length >= 32 && o.AdminApiKey != o.InternalApiKey),
        "Security:AdminApiKey must be at least 32 chars and differ from InternalApiKey.")
    .ValidateOnStart();

builder.Services.AddSingleton(TimeProvider.System);

// ── Дія API ─────────────────────────────────────────────────────────────────
builder.Services.AddHttpClient(DiiaTokenProvider.HttpClientName, (sp, client) =>
{
    var o = sp.GetRequiredService<IOptions<DiiaOptions>>().Value;
    client.BaseAddress = new Uri(o.BaseUrl.TrimEnd('/') + "/");
    client.Timeout = TimeSpan.FromSeconds(o.RequestTimeoutSeconds);
    client.DefaultRequestHeaders.Accept.ParseAdd("application/json");
}).ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
{
    SslOptions = { EnabledSslProtocols = System.Security.Authentication.SslProtocols.Tls12 | System.Security.Authentication.SslProtocols.Tls13 },
    PooledConnectionLifetime = TimeSpan.FromMinutes(5)
});
builder.Services.AddSingleton<DiiaTokenProvider>();
builder.Services.AddSingleton<IDiiaApiClient, DiiaApiClient>();

// ── Перевірка підпису ───────────────────────────────────────────────────────
var signAlgorithm = builder.Configuration[$"{DiiaOptions.SectionName}:{nameof(DiiaOptions.SignAlgorithm)}"] ?? SignAlgorithms.Ecdsa;
if (signAlgorithm == SignAlgorithms.Dstu4145Dstu7564)
{
    builder.Services.AddSingleton<ISignatureVerifier, IitNotIntegratedVerifier>();
}
else
{
    builder.Services.AddSingleton<TrustedCaStore>();
    builder.Services.AddSingleton<ISignatureVerifier, EcdsaCmsSignatureVerifier>();
}

// ── Збереження ──────────────────────────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("SignDb") ?? "Data Source=data/diia-sign.db";
builder.Services.AddDbContext<SignDbContext>(o => o.UseSqlite(connectionString));
builder.Services.AddScoped<SigningService>();
builder.Services.AddHostedService<SessionCleanupService>();

// ── Захист ──────────────────────────────────────────────────────────────────
var security = builder.Configuration.GetSection(SecurityOptions.SectionName).Get<SecurityOptions>() ?? new SecurityOptions();
builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    o.KnownNetworks.Clear();
    o.KnownProxies.Clear();
    foreach (var proxy in security.KnownProxies)
        o.KnownProxies.Add(IPAddress.Parse(proxy));
});

builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy(CallbackEndpoint.RateLimitPolicy, ctx => RateLimitPartition.GetFixedWindowLimiter(
        ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = security.CallbackPermitsPerMinute,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        }));
});

builder.WebHost.ConfigureKestrel(k =>
{
    k.AddServerHeader = false;
    k.Limits.MaxRequestBodySize = 12 * 1024 * 1024;
    k.Limits.MaxRequestHeadersTotalSize = 32 * 1024;
});

builder.Services.AddProblemDetails();

var app = builder.Build();

// ── Ініціалізація ───────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var dataDir = Path.GetDirectoryName(new Microsoft.Data.Sqlite.SqliteConnectionStringBuilder(connectionString).DataSource);
    if (!string.IsNullOrEmpty(dataDir))
        Directory.CreateDirectory(dataDir);
    scope.ServiceProvider.GetRequiredService<SignDbContext>().Database.EnsureCreated();

    // Падати одразу, якщо немає довірених ЦСК, а не на першому callback.
    _ = scope.ServiceProvider.GetRequiredService<ISignatureVerifier>();
    if (signAlgorithm != SignAlgorithms.Dstu4145Dstu7564)
        _ = scope.ServiceProvider.GetRequiredService<TrustedCaStore>();

    var diiaOpts = scope.ServiceProvider.GetRequiredService<IOptions<DiiaOptions>>().Value;
    if (string.IsNullOrWhiteSpace(diiaOpts.BranchId) || string.IsNullOrWhiteSpace(diiaOpts.OfferId))
        app.Logger.LogWarning("Diia:BranchId / Diia:OfferId are not configured — only /internal/setup/* will work.");
}

app.UseForwardedHeaders();

// Помилки Дії → 502 без подробиць (подробиці лише в логах).
app.UseExceptionHandler(errorApp => errorApp.Run(async ctx =>
{
    var ex = ctx.Features.Get<IExceptionHandlerFeature>()?.Error;
    var (status, detail) = ex is DiiaApiException
        ? (StatusCodes.Status502BadGateway, "Сервіс Дія тимчасово недоступний. Спробуйте пізніше.")
        : (StatusCodes.Status500InternalServerError, "Внутрішня помилка сервісу підписання.");
    if (ex is not DiiaApiException)
        app.Logger.LogError(ex, "Unhandled exception");
    ctx.Response.StatusCode = status;
    await Results.Problem(detail: detail, statusCode: status).ExecuteAsync(ctx);
}));

app.UseRateLimiter();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapDiiaCallback();
app.MapInternalEndpoints();

app.Run();

public partial class Program;
