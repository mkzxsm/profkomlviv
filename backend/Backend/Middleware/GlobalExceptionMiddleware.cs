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

            // 503 лише для реальної недоступності БД, не для помилок конвертації дат
            if (IsDatabaseUnavailable(exception))
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

        private static bool IsDatabaseUnavailable(Exception exception)
        {
            if (IsDateConversionError(exception))
                return false;

            for (var ex = exception; ex != null; ex = ex.InnerException!)
            {
                if (ex is TimeoutException)
                    return true;

                if (ex is SqlException)
                    return true;

                if (ex is MySqlException mysqlEx)
                {
                    if (IsUnavailableMysqlNumber(mysqlEx.Number))
                        return true;

                    if (LooksLikeConnectivityFailure(mysqlEx.Message))
                        return true;
                }

                if (LooksLikeConnectivityFailure(ex.Message))
                    return true;
            }

            return false;
        }

        private static bool IsDateConversionError(Exception exception)
        {
            for (var ex = exception; ex != null; ex = ex.InnerException!)
            {
                if (ex is MySqlConversionException or InvalidCastException)
                    return true;
            }

            return false;
        }

        private static bool IsUnavailableMysqlNumber(int number) =>
            number is 1040 or 1042 or 1043 or 1053 or 1077 or 1203 or 1226
                or 2002 or 2003 or 2006 or 2013 or 2026 or 2055;

        private static bool LooksLikeConnectivityFailure(string? message)
        {
            if (string.IsNullOrEmpty(message))
                return false;

            return message.Contains("timeout", StringComparison.OrdinalIgnoreCase)
                || message.Contains("unable to connect", StringComparison.OrdinalIgnoreCase)
                || message.Contains("connection refused", StringComparison.OrdinalIgnoreCase)
                || message.Contains("failed to connect", StringComparison.OrdinalIgnoreCase)
                || message.Contains("server has gone away", StringComparison.OrdinalIgnoreCase)
                || message.Contains("lost connection", StringComparison.OrdinalIgnoreCase);
        }
    }
}
