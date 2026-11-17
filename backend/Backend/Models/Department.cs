using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ProfkomBackend.Utils;

namespace ProfkomBackend.Models
{
    public class Department
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(FieldLimits.StructureName)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? LogoUrl { get; set; }

        // 🔑 Зовнішній ключ на Team (голова відділу), nullable
        public int? HeadId { get; set; }

        public Team? Head { get; set; }

        public bool IsActive { get; set; } = true;

        public string? Instagram_Link { get; set; }
        [MaxLength(FieldLimits.Url)]
        public string? Telegram_Link { get; set; }
        public string? TikTok_Link { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}