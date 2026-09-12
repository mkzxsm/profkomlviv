using System.ComponentModel.DataAnnotations;
using ProfkomBackend.Utils;

namespace ProfkomBackend.Models
{
    public class AuthRequest
    {
        [Required]
        [MaxLength(FieldLimits.AdminUsername)]
        [RegularExpression(FieldLimits.EmailPattern, ErrorMessage = FieldLimits.EmailFormatMessage)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(FieldLimits.Password)]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public DateTime Expires { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}