using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ProfkomBackend.Models
{
    public class News
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Content { get; set; }

        public bool IsImportant { get; set; } = false;

        public DateTime PublishedAt { get; set; } = DateTime.UtcNow;

        // Зв'язок: Одна новина має багато картинок
        public List<NewsImage> Images { get; set; } = new List<NewsImage>();
    }

    public class NewsImage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ImagePath { get; set; } = string.Empty; // Шлях до файлу (/uploads/...)

        public int NewsId { get; set; }

        [JsonIgnore] // Щоб не було "зациклення" при перетворенні в JSON
        public News? News { get; set; }
    }
}