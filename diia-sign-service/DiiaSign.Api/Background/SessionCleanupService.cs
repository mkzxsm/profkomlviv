using DiiaSign.Api.Data;
using DiiaSign.Api.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DiiaSign.Api.Background;

/// <summary>
/// Видаляє старі сесії разом із ПІБ/РНОКПП підписанта (ЗУ «Про захист персональних даних»).
/// Основний бекенд повинен забрати результат (статус + .p7s) до спливання RetentionDays.
/// </summary>
public sealed class SessionCleanupService(
    IServiceScopeFactory scopeFactory,
    IOptions<SigningOptions> options,
    TimeProvider time,
    ILogger<SessionCleanupService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(1), time);
        do
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<SignDbContext>();
                var cutoff = time.GetUtcNow().UtcDateTime.AddDays(-options.Value.RetentionDays);
                var deleted = await db.Sessions.Where(s => s.CreatedAtUtc < cutoff).ExecuteDeleteAsync(stoppingToken);
                if (deleted > 0)
                    logger.LogInformation("Deleted {Count} expired signing session(s)", deleted);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Signing session cleanup failed");
            }
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
