using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using ProfkomBackend.Services.DiiaSign;

namespace ProfkomBackend.Controllers
{
    /// <summary>
    /// Опитування статусу підписання фронтендом (раз на 2–3 с, поки isFinal = false).
    /// Персональних даних не повертає; requestId — випадковий UUID, виданий при старті підписання.
    /// </summary>
    [Route("api/diia-sign")]
    [ApiController]
    public class DiiaSignController : ControllerBase
    {
        public const string RateLimitPolicy = "DiiaSignStatusPolicy";

        private readonly DiiaSignCompletionCoordinator _coordinator;
        private readonly ILogger<DiiaSignController> _logger;

        public DiiaSignController(DiiaSignCompletionCoordinator coordinator, ILogger<DiiaSignController> logger)
        {
            _coordinator = coordinator;
            _logger = logger;
        }

        [HttpGet("{requestId}/status")]
        [AllowAnonymous]
        [EnableRateLimiting(RateLimitPolicy)]
        public async Task<IActionResult> GetStatus(string requestId, CancellationToken ct)
        {
            if (!DiiaSignClient.IsRequestId(requestId))
                return NotFound(new { message = "Запит на підписання не знайдено" });

            DiiaSignStatusResult? status;
            try
            {
                status = await _coordinator.RefreshAsync(requestId, ct);
            }
            catch (Exception ex) when (ex is DiiaSignUnavailableException or Microsoft.Extensions.Options.OptionsValidationException)
            {
                if (ex is Microsoft.Extensions.Options.OptionsValidationException)
                    _logger.LogError(ex, "DiiaSign settings are not configured");
                return StatusCode(StatusCodes.Status503ServiceUnavailable,
                    new { message = "Сервіс Дія.Підпис тимчасово недоступний. Спробуйте пізніше." });
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // Підпис отримано, але обробник заяв не зміг його зберегти — фронтенд може повторити запит.
                _logger.LogError(ex, "Failed to complete signed statement {RequestId}", requestId);
                return StatusCode(StatusCodes.Status503ServiceUnavailable,
                    new { message = "Підпис отримано, але заяву не вдалося зберегти. Оновіть сторінку за хвилину." });
            }

            if (status is null)
                return NotFound(new { message = "Запит на підписання не знайдено" });

            return Ok(new
            {
                status = status.Status.ToString(),
                isFinal = status.IsFinal,
                message = DiiaSignMessages.For(status.Status, status.FailureReason)
            });
        }
    }
}
