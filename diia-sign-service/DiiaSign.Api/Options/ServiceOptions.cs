using System.ComponentModel.DataAnnotations;

namespace DiiaSign.Api.Options;

public enum DiiaEnvironment
{
    Sandbox,
    Production
}

/// <summary>Алгоритм підпису, який передається в Дію (поле signAlgo).</summary>
public static class SignAlgorithms
{
    /// <summary>ECDSA P-256 + SHA-256. Перевіряється повністю всередині сервісу (BouncyCastle).</summary>
    public const string Ecdsa = "ECDSA";

    /// <summary>ДСТУ 4145 + Купина (ДСТУ 7564). Потребує бібліотеки ІІТ для перевірки.</summary>
    public const string Dstu4145Dstu7564 = "DSTU4145-DSTU7564";

    public static bool IsSupported(string? value) => value is Ecdsa or Dstu4145Dstu7564;
}

public sealed class DiiaOptions
{
    public const string SectionName = "Diia";

    public DiiaEnvironment Environment { get; set; } = DiiaEnvironment.Sandbox;

    /// <summary>https://api2s.diia.gov.ua (sandbox) або https://api2.diia.gov.ua (production).</summary>
    [Required, Url]
    public string BaseUrl { get; set; } = "https://api2s.diia.gov.ua";

    /// <summary>Acquirer-токен. Тримати лише в секретах / змінних оточення.</summary>
    [Required]
    public string AcquirerToken { get; set; } = string.Empty;

    /// <summary>Basic-токен для отримання сесійного токена. Потрібен лише в sandbox.</summary>
    public string? AuthAcquirerToken { get; set; }

    /// <summary>branch_id відділення зі scope diiaId=hashedFilesSigning.</summary>
    public string BranchId { get; set; } = string.Empty;

    /// <summary>offer_id офера на цьому відділенні.</summary>
    public string OfferId { get; set; } = string.Empty;

    public string SignAlgorithm { get; set; } = SignAlgorithms.Ecdsa;

    /// <summary>
    /// Якщо задано — returnLink у запиті на підпис дозволено лише з цим префіксом
    /// (Дія також вимагає, щоб він починався з returnLink офера).
    /// </summary>
    public string? AllowedReturnLinkPrefix { get; set; }

    [Range(5, 60)]
    public int RequestTimeoutSeconds { get; set; } = 20;
}

public sealed class SigningOptions
{
    public const string SectionName = "Signing";

    /// <summary>Діплінк живе 3 хв; callback приймаємо ще трохи довше (користувач міг натиснути «Підписати» в останню мить).</summary>
    [Range(3, 60)]
    public int CallbackWindowMinutes { get; set; } = 10;

    [Range(1024, 50 * 1024 * 1024)]
    public long MaxPdfBytes { get; set; } = 10 * 1024 * 1024;

    /// <summary>Скільки днів зберігати сесії (з ПІБ/РНОКПП підписанта) — мінімізація персональних даних.</summary>
    [Range(1, 365)]
    public int RetentionDays { get; set; } = 7;

    /// <summary>Не частіше ніж раз на N секунд питати статус у Дії для однієї сесії.</summary>
    [Range(1, 60)]
    public int StatusPollIntervalSeconds { get; set; } = 5;
}

public sealed class VerificationOptions
{
    public const string SectionName = "Verification";

    /// <summary>
    /// Шлях до CACertificates.p7b (prod) або CACertificates.Test.All.p7b (sandbox) з iit.com.ua.
    /// </summary>
    [Required]
    public string CaCertificatesPath { get; set; } = string.Empty;

    /// <summary>Допустиме розходження годинника для signingTime у підписі.</summary>
    [Range(0, 60)]
    public int MaxClockSkewMinutes { get; set; } = 5;
}

public sealed class SecurityOptions
{
    public const string SectionName = "Security";

    /// <summary>Ключ, яким основний бекенд автентифікується в /internal/*. Мінімум 32 символи.</summary>
    [Required, MinLength(32)]
    public string InternalApiKey { get; set; } = string.Empty;

    /// <summary>Ключ для /internal/setup/* (створення бранчів/оферів). Порожній — ендпоінти вимкнені.</summary>
    public string? AdminApiKey { get; set; }

    /// <summary>IP reverse-proxy (nginx), від яких довіряємо X-Forwarded-For.</summary>
    public string[] KnownProxies { get; set; } = [];

    /// <summary>Скільки callback-запитів на хвилину дозволено з однієї IP-адреси.</summary>
    [Range(1, 10_000)]
    public int CallbackPermitsPerMinute { get; set; } = 30;
}
