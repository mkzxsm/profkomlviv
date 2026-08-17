using System.Text.Json;
using Microsoft.Data.SqlClient;
using MySqlConnector;

namespace ProfkomBackend.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Помилка на маршруті {Path}", context.Request.Path);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            // Визначити тип помилки
            int statusCode = StatusCodes.Status500InternalServerError;
            string message = "Внутрішня помилка сервера";
            string? details = exception.Message;

            // 503 Service Unavailable - для помилок БД
            if (exception is MySqlException || 
                exception is SqlException ||
                exception?.InnerException is MySqlException ||
                exception?.InnerException is SqlException ||
                (exception?.Message.Contains("timeout", StringComparison.OrdinalIgnoreCase) ?? false) ||
                (exception?.Message.Contains("database", StringComparison.OrdinalIgnoreCase) ?? false) ||
                (exception?.Message.Contains("connection", StringComparison.OrdinalIgnoreCase) ?? false))
            {
                statusCode = StatusCodes.Status503ServiceUnavailable;
                message = "Сервіс тимчасово недоступний. База даних не відповідає.";
            }

            var response = new ErrorResponse(
                statusCode: statusCode,
                message: message,
                details: details,
                path: context.Request.Path.ToString()
            );

            context.Response.StatusCode = statusCode;

            return context.Response.WriteAsJsonAsync(response);
        }
    }
}
