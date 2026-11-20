using System.ComponentModel.DataAnnotations;

namespace ProfkomBackend.Services.DiiaSign
{
    /// <summary>Налаштування підключення до окремого сервісу diia-sign-service.</summary>
    public class DiiaSignOptions
    {
        public const string SectionName = "DiiaSign";

        /// <summary>Внутрішня адреса сервісу, напр. http://127.0.0.1:8080 (не публікувати назовні).</summary>
        [Required, Url]
        public string BaseUrl { get; set; } = "http://127.0.0.1:8080";

        /// <summary>Той самий ключ, що й Security:InternalApiKey у diia-sign-service.</summary>
        [Required, MinLength(32)]
        public string ApiKey { get; set; } = string.Empty;

        [Range(5, 60)]
        public int TimeoutSeconds { get; set; } = 25;
    }

    public enum DiiaSignStatus
    {
        /// <summary>Діплінк видано, користувач ще не відкрив його в Дії.</summary>
        Pending,
        /// <summary>Користувач відкрив діплінк у Дії.</summary>
        Processing,
        /// <summary>Підпис отримано і перевірено.</summary>
        Signed,
        /// <summary>Підпис не пройшов перевірку (див. FailureReason).</summary>
        Rejected,
        /// <summary>Користувач скасував підписання в Дії.</summary>
        Refused,
        /// <summary>Час на підписання минув.</summary>
        Expired
    }

    /// <summary>Результат старту підписання — deeplink треба показати користувачу (QR / посилання).</summary>
    public record DiiaSignStartResult(
        string RequestId,
        string Deeplink,
        DateTime DeeplinkExpiresAtUtc,
        // Купина-256 (ДСТУ 7564) PDF, base64 — зберегти в БД для контролю цілісності (NFR-SEC-3).
        string Kupyna256,
        string Sha256);

    public record DiiaSigner(
        string? FullName,
        string? Rnokpp,
        string? CertificateSerial,
        string? CertificateIssuer,
        DateTime? SigningTimeUtc);

    public record DiiaSignStatusResult(
        string RequestId,
        string ExternalRef,
        DiiaSignStatus Status,
        string? FailureReason,
        // Заповнений лише для Signed.
        DiiaSigner? Signer)
    {
        public bool IsFinal => Status is DiiaSignStatus.Signed or DiiaSignStatus.Rejected
            or DiiaSignStatus.Refused or DiiaSignStatus.Expired;
    }

    /// <summary>Сервіс підпису або Дія недоступні — показати користувачу «спробуйте пізніше».</summary>
    public class DiiaSignUnavailableException : Exception
    {
        public DiiaSignUnavailableException(string message, Exception? inner = null) : base(message, inner) { }
    }

    /// <summary>Сервіс підпису відхилив вхідні дані (не PDF, неправильний РНОКПП тощо).</summary>
    public class DiiaSignValidationException : Exception
    {
        public DiiaSignValidationException(string message) : base(message) { }
    }

    /// <summary>Тексти для користувача (FR-DIIA-5).</summary>
    public static class DiiaSignMessages
    {
        public static string For(DiiaSignStatus status, string? failureReason) => status switch
        {
            DiiaSignStatus.Pending => "Відскануйте QR-код у застосунку Дія або відкрийте посилання на телефоні.",
            DiiaSignStatus.Processing => "Підтвердіть підписання в застосунку Дія.",
            DiiaSignStatus.Signed => "Заяву успішно підписано.",
            DiiaSignStatus.Refused => "Ви скасували підписання в застосунку Дія. Спробуйте ще раз.",
            DiiaSignStatus.Expired => "Час на підписання минув. Спробуйте ще раз.",
            DiiaSignStatus.Rejected when failureReason == "SignerMismatch" =>
                "Заяву підписано не тією особою: РНОКПП у Дії не збігається з указаним у заяві.",
            DiiaSignStatus.Rejected => "Не вдалося перевірити підпис. Спробуйте ще раз.",
            _ => "Невідомий статус підписання."
        };
    }
}
