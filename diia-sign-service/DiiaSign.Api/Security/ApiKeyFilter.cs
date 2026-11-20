using System.Security.Cryptography;
using System.Text;

namespace DiiaSign.Api.Security;

/// <summary>Перевірка заголовка X-Api-Key для сервіс-до-сервісу викликів (порівняння за сталий час).</summary>
public sealed class ApiKeyFilter(Func<IServiceProvider, string?> keySelector) : IEndpointFilter
{
    public const string HeaderName = "X-Api-Key";

    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var http = context.HttpContext;
        var expected = keySelector(http.RequestServices);

        // Ключ не налаштовано → ендпоінт вимкнено.
        if (string.IsNullOrEmpty(expected))
            return Results.NotFound();

        var provided = http.Request.Headers[HeaderName].ToString();
        if (!KeysEqual(expected, provided))
        {
            http.RequestServices.GetRequiredService<ILogger<ApiKeyFilter>>()
                .LogWarning("Rejected request to {Path}: invalid API key", http.Request.Path);
            return Results.Unauthorized();
        }

        return await next(context);
    }

    private static bool KeysEqual(string expected, string provided)
    {
        // Хешуємо, щоб порівняння не залежало від довжини.
        var a = SHA256.HashData(Encoding.UTF8.GetBytes(expected));
        var b = SHA256.HashData(Encoding.UTF8.GetBytes(provided));
        return CryptographicOperations.FixedTimeEquals(a, b) && provided.Length > 0;
    }
}
