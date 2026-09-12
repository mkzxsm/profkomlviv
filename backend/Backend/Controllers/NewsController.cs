using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProfkomBackend.Data;
using ProfkomBackend.Models;
using ProfkomBackend.Utils;
using System.ComponentModel.DataAnnotations;

namespace ProfkomBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsController : ControllerBase
    {
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

            // Валідація Title
            if (string.IsNullOrWhiteSpace(newsDto.Title))
                return BadRequest(new { message = "Заголовок обов'язковий" });

            var titleErr = InputValidator.ValidateTextField(newsDto.Title, "Заголовок", maxLength: 500);
            if (titleErr != null) return BadRequest(new { message = titleErr });

            // Валідація Content
            if (!string.IsNullOrEmpty(newsDto.Content))
            {
                var contentErr = InputValidator.ValidateTextField(newsDto.Content, "Зміст", maxLength: 50000);
                if (contentErr != null) return BadRequest(new { message = contentErr });
            }

            var news = new News
            {
                Title = newsDto.Title,
                Content = newsDto.Content ?? string.Empty,
                IsImportant = newsDto.IsImportant,
                PublishedAt = DateTime.UtcNow
            };

            if (newsDto.Images != null && newsDto.Images.Count > 0)
            {
                var uploads = Path.Combine(_env.ContentRootPath, "uploads", "news");
                if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);

                foreach (var file in newsDto.Images)
                {
                    if (file.Length > 0)
                    {
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

                        news.Images.Add(new NewsImage
                        {
                            ImagePath = $"/uploads/news/{fileName}"
                        });
                    }
                }
            }

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

            // Валідація Title
            if (string.IsNullOrWhiteSpace(newsDto.Title))
                return BadRequest(new { message = "Заголовок обов'язковий" });

            var titleErr2 = InputValidator.ValidateTextField(newsDto.Title, "Заголовок", maxLength: 500);
            if (titleErr2 != null) return BadRequest(new { message = titleErr2 });

            // Валідація Content
            if (!string.IsNullOrEmpty(newsDto.Content))
            {
                var contentErr2 = InputValidator.ValidateTextField(newsDto.Content, "Зміст", maxLength: 50000);
                if (contentErr2 != null) return BadRequest(new { message = contentErr2 });
            }

            existingNews.Title = newsDto.Title;
            existingNews.Content = newsDto.Content ?? string.Empty;
            existingNews.IsImportant = newsDto.IsImportant;

            if (newsDto.Images != null && newsDto.Images.Count > 0)
            {
                var uploads = Path.Combine(_env.ContentRootPath, "uploads", "news");
                if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);

                foreach (var file in newsDto.Images)
                {
                    if (file.Length > 0)
                    {
                        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                        var filePath = Path.Combine(uploads, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }

                        existingNews.Images.Add(new NewsImage
                        {
                            ImagePath = $"/uploads/news/{fileName}"
                        });
                    }
                }
            }

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
                var filePath = Path.Combine(_env.ContentRootPath, img.ImagePath.TrimStart('/'));
                if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);
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

            var filePath = Path.Combine(_env.ContentRootPath, image.ImagePath.TrimStart('/'));
            if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);

            _db.NewsImages.Remove(image);
            await _db.SaveChangesAsync();
            return NoContent();
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
    }
}