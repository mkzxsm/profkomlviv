namespace ProfkomBackend.Utils
{
    public class ApiResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public object? Data { get; set; }
        public DateTime Timestamp { get; set; }

        public ApiResponse(bool success, string message, object? data = null)
        {
            Success = success;
            Message = message;
            Data = data;
            Timestamp = DateTime.UtcNow;
        }

        public static ApiResponse Ok(string message, object? data = null)
            => new ApiResponse(true, message, data);

        public static ApiResponse Error(string message, object? data = null)
            => new ApiResponse(false, message, data);
    }
}
