using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProfkomBackend.Data;
using ProfkomBackend.Models;
using ProfkomBackend.Utils;
using Ganss.Xss;
using System.ComponentModel.DataAnnotations;

namespace ProfkomBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsController : ControllerBase
    {
        private const int NewsContentMaxLength = 50000;

        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;

        public NewsController(AppDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var news = await _db.News
                .Include(n => n.Images)
                .OrderByDescending(n => n.PublishedAt)
                .ToListAsync();
            return Ok(news);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var item = await _db.News
                .Include(n => n.Images)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (item == null) return NotFound();
            return Ok(item);
        }

        [Authorize(Roles = "admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] NewsDto newsDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var titleError = ValidateTitle(newsDto.Title);
            if (titleError != null) return BadRequest(new { message = titleError });

            var contentError = ValidateAndSanitizeContent(newsDto.Content, out var sanitizedContent);
            if (contentError != null) return BadRequest(new { message = contentError });

            var news = new News
            {
                Title = newsDto.Title.Trim(),
                Content = sanitizedContent,
                IsImportant = newsDto.IsImportant,
                PublishedAt = DateTime.UtcNow
            };

            var imagesError = await AddImagesAsync(news.Images, newsDto.Images);
            if (imagesError != null) return imagesError;

            _db.News.Add(news);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = news.Id }, news);
        }

        [Authorize(Roles = "admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] NewsDto newsDto)
        {
            var existingNews = await _db.News
                .Include(n => n.Images)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (existingNews == null) return NotFound();

            var titleError = ValidateTitle(newsDto.Title);
            if (titleError != null) return BadRequest(new { message = titleError });

            var contentError = ValidateAndSanitizeContent(newsDto.Content, out var sanitizedContent);
            if (contentError != null) return BadRequest(new { message = contentError });

            existingNews.Title = newsDto.Title.Trim();
            existingNews.Content = sanitizedContent;
            existingNews.IsImportant = newsDto.IsImportant;

            if (newsDto.RemovedImageIds != null && newsDto.RemovedImageIds.Count > 0)
            {
                var idsToRemove = newsDto.RemovedImageIds.Where(imageId => imageId > 0).ToHashSet();
                var toRemove = existingNews.Images.Where(img => idsToRemove.Contains(img.Id)).ToList();

                foreach (var img in toRemove)
                {
                    DeleteImageFile(img.ImagePath);
                    existingNews.Images.Remove(img);
                    _db.NewsImages.Remove(img);
                }
            }

            var imagesError = await AddImagesAsync(existingNews.Images, newsDto.Images);
            if (imagesError != null) return imagesError;

            await _db.SaveChangesAsync();
            return Ok(existingNews);
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var news = await _db.News
                .Include(n => n.Images)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (news == null) return NotFound();

            foreach (var img in news.Images)
            {
                DeleteImageFile(img.ImagePath);
            }

            _db.News.Remove(news);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("image/{imageId}")]
        public async Task<IActionResult> DeleteImage(int imageId)
        {
            var image = await _db.NewsImages.FindAsync(imageId);
            if (image == null) return NotFound();

            DeleteImageFile(image.ImagePath);

            _db.NewsImages.Remove(image);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        private static string? ValidateTitle(string? title)
        {
            if (string.IsNullOrWhiteSpace(title))
                return "Заголовок обов'язковий";

            return InputValidator.ValidateTextField(title, "Заголовок", maxLength: FieldLimits.Title);
        }

        private static string? ValidateAndSanitizeContent(string? content, out string sanitized)
        {
            sanitized = string.Empty;

            if (string.IsNullOrWhiteSpace(content))
                return "Зміст обов'язковий";

            if (content.Contains('\0') || content.Contains("%00"))
                return "Зміст містить недозволений символ";

            if (content.Length > NewsContentMaxLength)
                return $"Зміст не може перевищувати {NewsContentMaxLength} символів";

            var sanitizer = new HtmlSanitizer();
            sanitized = sanitizer.Sanitize(content);
            return null;
        }

        private async Task<IActionResult?> AddImagesAsync(ICollection<NewsImage> target, List<IFormFile>? files)
        {
            if (files == null || files.Count == 0) return null;

            var uploads = Path.Combine(_env.ContentRootPath, "uploads", "news");
            Directory.CreateDirectory(uploads);

            foreach (var file in files)
            {
                if (file.Length <= 0) continue;

                var (sizeValid, sizeError) = FileValidationHelper.ValidateFileSize(file, FileValidationHelper.MAX_IMAGE_SIZE);
                if (!sizeValid) return StatusCode(StatusCodes.Status413PayloadTooLarge, new { message = sizeError });

                var (mimeValid, mimeError) = FileValidationHelper.ValidateImageMimeType(file);
                if (!mimeValid) return StatusCode(StatusCodes.Status415UnsupportedMediaType, new { message = mimeError });

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(uploads, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                target.Add(new NewsImage
                {
                    ImagePath = $"/uploads/news/{fileName}"
                });
            }

            return null;
        }

        private void DeleteImageFile(string imagePath)
        {
            var filePath = Path.Combine(_env.ContentRootPath, imagePath.TrimStart('/'));
            if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);
        }
    }

    public class NewsDto
    {
        [Required]
        [MaxLength(FieldLimits.Title)]
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public List<IFormFile>? Images { get; set; }
        public bool IsImportant { get; set; }
        public List<int>? RemovedImageIds { get; set; }
    }
}
