using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ProfkomBackend.Data;
using ProfkomBackend.Models;
using ProfkomBackend.Utils;

namespace ProfkomBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UnitController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;

        public UnitController(AppDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        // ✅ GET: api/unit - доступно всім
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Unit>>> GetAll()
        {
            return await _db.Unit.ToListAsync();
        }

        // ✅ GET: api/unit/{id} - доступно всім
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Unit>> GetById(int id)
        {
            var unit = await _db.Unit.FindAsync(id);
            if (unit == null) return NotFound();
            return unit;
        }

        // 🔒 POST: api/unit - тільки адмін
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Unit>> Create([FromForm] UnitFormData formData)
        {
            // === Валідація вхідних даних ===
            if (string.IsNullOrWhiteSpace(formData.Name))
                return BadRequest(new { message = "Назва блоку обов'язкова" });

            var nameErr = InputValidator.ValidateTextField(formData.Name, "Назва", maxLength: 300);
            if (nameErr != null) return BadRequest(new { message = nameErr });

            if (!string.IsNullOrEmpty(formData.Content))
            {
                var contentErr = InputValidator.ValidateTextField(formData.Content, "Зміст", maxLength: 50000);
                if (contentErr != null) return BadRequest(new { message = contentErr });
            }
            if (!string.IsNullOrEmpty(formData.ImageUrl))
            {
                var imgErr = InputValidator.ValidateTextField(formData.ImageUrl, "ImageUrl", maxLength: 500);
                if (imgErr != null) return BadRequest(new { message = imgErr });
            }

            string? imageUrl = null;

            // Обробка файлу, якщо він наданий
            if (formData.Image != null && formData.Image.Length > 0)
            {
                // Перевірка розміру (413 Payload Too Large)
                var (sizeValid, sizeError) = FileValidationHelper.ValidateFileSize(formData.Image, FileValidationHelper.MAX_IMAGE_SIZE);
                if (!sizeValid)
                {
                    return StatusCode(StatusCodes.Status413PayloadTooLarge, new { message = sizeError });
                }

                // Перевірка MIME типу (415 Unsupported Media Type)
                var (mimeValid, mimeError) = FileValidationHelper.ValidateImageMimeType(formData.Image);
                if (!mimeValid)
                {
                    return StatusCode(StatusCodes.Status415UnsupportedMediaType, new { message = mimeError });
                }

                var uploadsDir = Path.Combine(_env.ContentRootPath, "Uploads");
                if (!Directory.Exists(uploadsDir))
                {
                    Directory.CreateDirectory(uploadsDir);
                }

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(formData.Image.FileName)}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await formData.Image.CopyToAsync(stream);
                }

                imageUrl = $"/Uploads/{fileName}";
            }

            var unit = new Unit
            {
                Name = formData.Name,
                Content = formData.Content,
                OrderInd = formData.OrderInd,
                IsActive = formData.IsActive,
                ImageUrl = imageUrl ?? formData.ImageUrl,
                CreatedAt = DateTime.UtcNow
            };

            _db.Unit.Add(unit);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = unit.Id }, unit);
        }

        // 🔒 PUT: api/unit/{id} - тільки адмін
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, [FromForm] UnitFormData formData)
        {
            // === Валідація вхідних даних ===
            if (string.IsNullOrWhiteSpace(formData.Name))
                return BadRequest(new { message = "Назва блоку обов'язкова" });

            var nameErr2 = InputValidator.ValidateTextField(formData.Name, "Назва", maxLength: 300);
            if (nameErr2 != null) return BadRequest(new { message = nameErr2 });

            if (!string.IsNullOrEmpty(formData.Content))
            {
                var contentErr2 = InputValidator.ValidateTextField(formData.Content, "Зміст", maxLength: 50000);
                if (contentErr2 != null) return BadRequest(new { message = contentErr2 });
            }
            if (!string.IsNullOrEmpty(formData.ImageUrl))
            {
                var imgErr2 = InputValidator.ValidateTextField(formData.ImageUrl, "ImageUrl", maxLength: 500);
                if (imgErr2 != null) return BadRequest(new { message = imgErr2 });
            }

            var unit = await _db.Unit.FindAsync(id);
            if (unit == null) return NotFound(new { message = "Блок не знайдений" });
            if (id != unit.Id) return UnprocessableEntity(new { message = "ID в URL не відповідає ID об'єкту" });

            string? imageUrl = unit.ImageUrl;

            // Обробка нового файлу, якщо наданий
            if (formData.Image != null && formData.Image.Length > 0)
            {
                // Перевірка розміру (413 Payload Too Large)
                var (sizeValid, sizeError) = FileValidationHelper.ValidateFileSize(formData.Image, FileValidationHelper.MAX_IMAGE_SIZE);
                if (!sizeValid)
                {
                    return StatusCode(StatusCodes.Status413PayloadTooLarge, new { message = sizeError });
                }

                // Перевірка MIME типу (415 Unsupported Media Type)
                var (mimeValid, mimeError) = FileValidationHelper.ValidateImageMimeType(formData.Image);
                if (!mimeValid)
                {
                    return StatusCode(StatusCodes.Status415UnsupportedMediaType, new { message = mimeError });
                }

                var uploadsDir = Path.Combine(_env.ContentRootPath, "Uploads");
                if (!Directory.Exists(uploadsDir))
                {
                    Directory.CreateDirectory(uploadsDir);
                }

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(formData.Image.FileName)}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await formData.Image.CopyToAsync(stream);
                }

                imageUrl = $"/Uploads/{fileName}";
            }

            unit.Name = formData.Name;
            unit.Content = formData.Content;
            unit.OrderInd = formData.OrderInd;
            unit.IsActive = formData.IsActive;
            unit.ImageUrl = imageUrl ?? formData.ImageUrl;
            unit.UpdatedAt = DateTime.UtcNow;

            _db.Entry(unit).State = EntityState.Modified;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // 🔒 DELETE: api/unit/{id} - тільки адмін
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var unit = await _db.Unit.FindAsync(id);
            if (unit == null) return NotFound();

            _db.Unit.Remove(unit);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

    // DTO для обробки вхідних даних
    public class UnitFormData
    {
        public string Name { get; set; } = string.Empty;
        public string? Content { get; set; }
        public int OrderInd { get; set; }
        public bool IsActive { get; set; }
        public string? ImageUrl { get; set; }
        public IFormFile? Image { get; set; }
    }
}