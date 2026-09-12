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
    public class TeamController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;

        public TeamController(AppDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Team>>> GetAll() => await _db.Team.ToListAsync();

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Team>> GetById(int id)
        {
            var member = await _db.Team.FindAsync(id);
            if (member == null) return NotFound();
            return member;
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Team>> Create([FromForm] TeamFormData formData)
        {
            // === Валідація вхідних даних ===
            if (string.IsNullOrWhiteSpace(formData.Name))
                return BadRequest(new { message = "Ім'я обов'язкове" });

            var nameErr = InputValidator.ValidateTextField(formData.Name, "Ім'я", maxLength: 200);
            if (nameErr != null) return BadRequest(new { message = nameErr });

            if (string.IsNullOrWhiteSpace(formData.Position))
                return BadRequest(new { message = "Посада обов'язкова" });

            var posErr = InputValidator.ValidateTextField(formData.Position, "Посада", maxLength: 300);
            if (posErr != null) return BadRequest(new { message = posErr });

            if (!string.IsNullOrEmpty(formData.Email))
            {
                var emailErr = InputValidator.ValidateTextField(formData.Email, "Email", maxLength: 200);
                if (emailErr != null) return BadRequest(new { message = emailErr });
            }
            if (!string.IsNullOrEmpty(formData.ImageUrl))
            {
                var imgErr = InputValidator.ValidateTextField(formData.ImageUrl, "ImageUrl", maxLength: 500);
                if (imgErr != null) return BadRequest(new { message = imgErr });
            }

            string? imageUrl = null;

            if (formData.Image != null && formData.Image.Length > 0)
            {
                var (sizeValid, sizeError) = FileValidationHelper.ValidateFileSize(formData.Image, FileValidationHelper.MAX_IMAGE_SIZE);
                if (!sizeValid) return StatusCode(StatusCodes.Status413PayloadTooLarge, new { message = sizeError });

                var (mimeValid, mimeError) = FileValidationHelper.ValidateImageMimeType(formData.Image);
                if (!mimeValid) return StatusCode(StatusCodes.Status415UnsupportedMediaType, new { message = mimeError });

                var uploadsDir = Path.Combine(_env.ContentRootPath, "uploads", "team");
                if (!Directory.Exists(uploadsDir)) Directory.CreateDirectory(uploadsDir);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(formData.Image.FileName)}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await formData.Image.CopyToAsync(stream);
                }

                imageUrl = $"/uploads/team/{fileName}";
            }

            var member = new Team
            {
                Name = formData.Name,
                Position = formData.Position,
                Type = formData.Type,
                Email = string.IsNullOrEmpty(formData.Email) ? null : formData.Email,
                OrderInd = formData.OrderInd,
                IsTemporary = formData.IsTemporary,
                ImageUrl = imageUrl ?? formData.ImageUrl,
                IsChoosed = formData.IsChoosed,
                CreatedAt = DateTime.UtcNow
            };

            _db.Team.Add(member);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = member.Id }, member);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, [FromForm] TeamFormData formData)
        {
            // === Валідація вхідних даних ===
            if (string.IsNullOrWhiteSpace(formData.Name))
                return BadRequest(new { message = "Ім'я обов'язкове" });

            var nameErr2 = InputValidator.ValidateTextField(formData.Name, "Ім'я", maxLength: 200);
            if (nameErr2 != null) return BadRequest(new { message = nameErr2 });

            if (string.IsNullOrWhiteSpace(formData.Position))
                return BadRequest(new { message = "Посада обов'язкова" });

            var posErr2 = InputValidator.ValidateTextField(formData.Position, "Посада", maxLength: 300);
            if (posErr2 != null) return BadRequest(new { message = posErr2 });

            if (!string.IsNullOrEmpty(formData.Email))
            {
                var emailErr2 = InputValidator.ValidateTextField(formData.Email, "Email", maxLength: 200);
                if (emailErr2 != null) return BadRequest(new { message = emailErr2 });
            }
            if (!string.IsNullOrEmpty(formData.ImageUrl))
            {
                var imgErr2 = InputValidator.ValidateTextField(formData.ImageUrl, "ImageUrl", maxLength: 500);
                if (imgErr2 != null) return BadRequest(new { message = imgErr2 });
            }

            var member = await _db.Team.FindAsync(id);
            if (member == null) return NotFound(new { message = "Член команди не знайдений" });

            string? oldImageUrl = member.ImageUrl;
            string? newImageUrl = member.ImageUrl;

            if (formData.Image != null && formData.Image.Length > 0)
            {
                var uploadsDir = Path.Combine(_env.ContentRootPath, "uploads", "team");
                if (!Directory.Exists(uploadsDir)) Directory.CreateDirectory(uploadsDir);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(formData.Image.FileName)}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await formData.Image.CopyToAsync(stream);
                }

                newImageUrl = $"/uploads/team/{fileName}";

                if (!string.IsNullOrEmpty(oldImageUrl))
                {
                    var oldFilePath = Path.Combine(_env.ContentRootPath, oldImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath)) System.IO.File.Delete(oldFilePath);
                }
            }

            member.Name = formData.Name;
            member.Position = formData.Position;
            member.Type = formData.Type;
            member.Email = string.IsNullOrEmpty(formData.Email) ? null : formData.Email;
            member.OrderInd = formData.OrderInd;
            member.IsTemporary = formData.IsTemporary;
            member.ImageUrl = newImageUrl ?? formData.ImageUrl;
            member.IsChoosed = formData.IsChoosed;
            member.UpdatedAt = DateTime.UtcNow;

            _db.Entry(member).State = EntityState.Modified;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var member = await _db.Team.FindAsync(id);
            if (member == null) return NotFound();

            if (!string.IsNullOrEmpty(member.ImageUrl))
            {
                var filePath = Path.Combine(_env.ContentRootPath, member.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);
            }

            _db.Team.Remove(member);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

    public class TeamFormData
    {
        public string Name { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public MemberType Type { get; set; }
        public string? Email { get; set; }
        public int OrderInd { get; set; }
        public bool IsTemporary { get; set; }
        public string? ImageUrl { get; set; }
        public IFormFile? Image { get; set; }
        public bool IsChoosed { get; set; } = false;
    }
}