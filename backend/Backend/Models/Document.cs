using System;
using System.ComponentModel.DataAnnotations;
using ProfkomBackend.Utils;

namespace ProfkomBackend.Models
{
    public class Document
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(FieldLimits.Title)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public string FilePath { get; set; } = string.Empty;

        public long FileSize { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}