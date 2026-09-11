using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel;
using ProfkomBackend.Utils;

namespace ProfkomBackend.Models
{
    public enum MemberType
    {
        Aparat,
        Profburo,
        Viddil
    }

    public class Team
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(FieldLimits.PersonName)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(FieldLimits.Position)]
        public string Position { get; set; } = string.Empty;

        [Required]
        public MemberType Type { get; set; }

        [NotMapped]
        public string TypeName => MemberTypeNames.Get(Type);

        public string? ImageUrl { get; set; }
        [MaxLength(FieldLimits.Email)]
        [RegularExpression(FieldLimits.EmailPattern, ErrorMessage = FieldLimits.EmailFormatMessage)]
        public string? Email { get; set; }

        [Required]
        public int OrderInd { get; set; }           // number у фронті

        [Required]
        public bool IsTemporary { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // created_at

        public DateTime UpdatedAt { get; set; }

        public bool IsChoosed { get; set; } = false;
    }
}
