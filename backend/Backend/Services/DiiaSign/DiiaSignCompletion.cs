using System.Collections.Concurrent;

namespace ProfkomBackend.Services.DiiaSign
{
    /// <summary>Підписана заява, яку треба зберегти.</summary>
    public record DiiaSignedStatement(
        string RequestId,
        // Той externalRef, що передали в IDiiaSignClient.StartAsync.
        string ExternalRef,
        DiiaSigner Signer,
        // Detached CAdES-підпис PDF (.p7s). Зберігати поруч із PDF у /storage/signed_statements/{year}/{faculty_code}/.
        byte[] SignatureP7s);

    /// <summary>
    /// РЕАЛІЗУЄ КОД ЗАЯВ: що робити, коли заяву підписано (зберегти .p7s, згенерувати номер, видати картку).
    /// Зареєструвати: builder.Services.AddScoped&lt;IDiiaSignCompletionHandler, ВашКлас&gt;();
    /// Вимоги:
    ///  • ідемпотентність — може бути викликаний повторно для того самого RequestId;
    ///  • виняток = «не збережено», виклик повториться при наступному опитуванні статусу.
    /// </summary>
    public interface IDiiaSignCompletionHandler
    {
        Task HandleSignedAsync(DiiaSignedStatement statement, CancellationToken ct);
    }

    /// <summary>Заглушка, поки обробник заяв не реалізовано: підписання завершиться помилкою збереження.</summary>
    public class NotConfiguredDiiaSignCompletionHandler : IDiiaSignCompletionHandler
    {
        private readonly ILogger<NotConfiguredDiiaSignCompletionHandler> _logger;

        public NotConfiguredDiiaSignCompletionHandler(ILogger<NotConfiguredDiiaSignCompletionHandler> logger) => _logger = logger;

        public Task HandleSignedAsync(DiiaSignedStatement statement, CancellationToken ct)
        {
            _logger.LogCritical("IDiiaSignCompletionHandler is not implemented; signed statement {RequestId} was NOT saved",
                statement.RequestId);
            throw new InvalidOperationException("IDiiaSignCompletionHandler is not implemented.");
        }
    }

    /// <summary>
    /// Гарантує, що обробник викликається один раз на процес для кожного підписаного запиту
    /// (паралельні опитування статусу чекають на той самий виклик).
    /// </summary>
    public class DiiaSignCompletionCoordinator
    {
        private readonly ConcurrentDictionary<string, Lazy<Task>> _inFlight = new();
        private readonly ConcurrentDictionary<string, DateTime> _completed = new();
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<DiiaSignCompletionCoordinator> _logger;

        public DiiaSignCompletionCoordinator(IServiceScopeFactory scopeFactory, ILogger<DiiaSignCompletionCoordinator> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        /// <summary>
        /// Якщо запит підписано — завантажує .p7s і викликає обробник. Повертає актуальний статус.
        /// Можна викликати і поза ендпоінтом статусу (напр. з адмінки), якщо користувач закрив сторінку
        /// до того, як фронтенд побачив Signed (сервіс підпису тримає результат RetentionDays, типово 7 днів).
        /// </summary>
        public async Task<DiiaSignStatusResult?> RefreshAsync(string requestId, CancellationToken ct)
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var client = scope.ServiceProvider.GetRequiredService<IDiiaSignClient>();

            var status = await client.GetStatusAsync(requestId, ct);
            if (status is not { Status: DiiaSignStatus.Signed, Signer: not null } || _completed.ContainsKey(requestId))
                return status;

            var work = _inFlight.GetOrAdd(requestId, _ => new Lazy<Task>(() => CompleteAsync(status)));
            try
            {
                await work.Value.WaitAsync(ct);
                _completed[requestId] = DateTime.UtcNow;
                PruneCompleted();
            }
            finally
            {
                _inFlight.TryRemove(requestId, out _);
            }
            return status;
        }

        private async Task CompleteAsync(DiiaSignStatusResult status)
        {
            // Не прив'язуємо до CancellationToken запиту: якщо клієнт відключився, збереження все одно має завершитись.
            await using var scope = _scopeFactory.CreateAsyncScope();
            var client = scope.ServiceProvider.GetRequiredService<IDiiaSignClient>();
            var handler = scope.ServiceProvider.GetRequiredService<IDiiaSignCompletionHandler>();

            var p7s = await client.DownloadSignatureAsync(status.RequestId, CancellationToken.None)
                      ?? throw new DiiaSignUnavailableException("Підпис ще недоступний.");
            await handler.HandleSignedAsync(
                new DiiaSignedStatement(status.RequestId, status.ExternalRef, status.Signer!, p7s), CancellationToken.None);
            _logger.LogInformation("Signed statement {RequestId} ({ExternalRef}) handed over", status.RequestId, status.ExternalRef);
        }

        private void PruneCompleted()
        {
            var cutoff = DateTime.UtcNow.AddDays(-1);
            foreach (var (key, at) in _completed)
                if (at < cutoff) _completed.TryRemove(key, out _);
        }
    }
}
