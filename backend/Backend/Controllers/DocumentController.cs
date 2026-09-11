using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ProfkomBackend.Data;
using Microsoft.Extensions.FileProviders;
using ProfkomBackend.Models;
using ProfkomBackend.Utils;
using System.ComponentModel.DataAnnotations;
using Ganss.Xss; // 👈 Додано санітайзер

namespace ProfkomBackend.Controllers
{
    [Route("api/documents")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;

        public DocumentsController(AppDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Document>>> GetAll() => await _db.Documents.OrderByDescending(d => d.CreatedAt).ToListAsync();

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Document>> GetById(int id)
        {
            var document = await _db.Documents.FindAsync(id);
            if (document == null) return NotFound();
            return document;
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Document>> Create([FromForm] DocumentFormData formData)
        {
            if (formData.File == null || formData.File.Length == 0) return BadRequest(new { message = "Файл обов'язковий" });

            var uploadsDir = Path.Combine(_env.ContentRootPath, "uploads", "documents");
            Directory.CreateDirectory(uploadsDir);
            
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(formData.File.FileName)}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await formData.File.CopyToAsync(stream);
            }

            var sanitizer = new HtmlSanitizer(); // 👈 Ініціалізація санітайзера

            var document = new Document
            {
                Title = sanitizer.Sanitize(formData.Title),       // 👈 Захист від XSS
                Description = string.IsNullOrEmpty(formData.Description) ? null : sanitizer.Sanitize(formData.Description), // 👈 Захист від XSS
                FilePath = $"/uploads/documents/{fileName}",
                FileSize = formData.File.Length,
                CreatedAt = DateTime.UtcNow
            };

            _db.Documents.Add(document);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = document.Id }, document);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, [FromForm] DocumentFormData formData)
        {
            var document = await _db.Documents.FindAsync(id);
            if (document == null) return NotFound(new { message = "Документ не знайдено" });

            if (formData.File != null && formData.File.Length > 0)
            {
                var uploadsDir = Path.Combine(_env.ContentRootPath, "uploads", "documents");
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(formData.File.FileName)}";
                var newFilePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(newFilePath, FileMode.Create))
                {
                    await formData.File.CopyToAsync(stream);
                }
                document.FilePath = $"/uploads/documents/{fileName}";
                document.FileSize = formData.File.Length;
            }

            var sanitizer = new HtmlSanitizer(); // 👈 Ініціалізація санітайзера

            document.Title = sanitizer.Sanitize(formData.Title);
            document.Description = string.IsNullOrEmpty(formData.Description) ? null : sanitizer.Sanitize(formData.Description);
            document.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var document = await _db.Documents.FindAsync(id);
            if (document == null) return NotFound();

            if (!string.IsNullOrEmpty(document.FilePath))
            {
                var filePath = Path.Combine(_env.ContentRootPath, document.FilePath.TrimStart('/'));
                if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);
            }

            _db.Documents.Remove(document);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

    public class DocumentFormData
    {
        [Required]
        [MaxLength(FieldLimits.Title)]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public IFormFile? File { get; set; }
    }
}