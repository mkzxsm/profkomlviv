using System;
using System.ComponentModel.DataAnnotations;
using ProfkomBackend.Utils;

namespace ProfkomBackend.Models
{
    public class Faculty
    {
        public int Id { get; set; }
        [MaxLength(FieldLimits.StructureName)]
        public string Name { get; set; } = string.Empty;

        // 🔹 Тут буде зв’язок з Team
        public int? HeadId { get; set; }
        public Team? Head { get; set; }

        [MaxLength(FieldLimits.Address)]
        public string? Address { get; set; }
        [MaxLength(FieldLimits.Room)]
        public string? Room { get; set; }
        [MaxLength(FieldLimits.Schedule)]
        public string? Schedule { get; set; }
        public string? Summary { get; set; }
        [MaxLength(FieldLimits.Url)]
        public string? Instagram_Link { get; set; }
        [MaxLength(FieldLimits.Url)]
        public string? Telegram_Link { get; set; }
        public bool IsActive { get; set; }
        public bool IsCollege { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
