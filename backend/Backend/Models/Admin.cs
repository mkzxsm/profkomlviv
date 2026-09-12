using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using ProfkomBackend.Utils;

namespace ProfkomBackend.Models
{
    public class Admin
    {
        [Key]
        public int Id { get; set; }
        [Required, MaxLength(FieldLimits.AdminUsername)]
        [RegularExpression(FieldLimits.EmailPattern, ErrorMessage = FieldLimits.EmailFormatMessage)]
        public string Username { get; set; } = string.Empty;
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "admin";
    }
}
