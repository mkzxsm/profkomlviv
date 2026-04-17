using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ProfkomBackend.Data;
using ProfkomBackend.Models;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

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

        // ✅ GET: api/team - доступно всім
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Team>>> GetAll()
        {
            return await _db.Team.ToListAsync();
        }

        // ✅ GET: api/team/{id} - доступно всім
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Team>> GetById(int id)
        {
            var member = await _db.Team.FindAsync(id);
            if (member == null) return NotFound();
            return member;
        }

        // 🔒 POST: api/team - тільки адмін
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Team>> Create([FromForm] TeamFormData formData)
        {
            string? imageUrl = null;

            // Обробка файлу, якщо він наданий
            if (formData.Image != null && formData.Image.Length > 0)
            {
<<<<<<< HEAD
                var uploadsDir = Path.Combine(_env.ContentRootPath, "uploads", "team");
=======
                var uploadsDir = Path.Combine(_env.ContentRootPath, "Uploads");
>>>>>>> upstream/main
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

<<<<<<< HEAD
                imageUrl = $"/uploads/team/{fileName}";
=======
                imageUrl = $"/Uploads/{fileName}";
>>>>>>> upstream/main
            }

            var member = new Team
            {
                Name = formData.Name,
                Position = formData.Position,
                Type = formData.Type,
                Email = formData.Email,
                OrderInd = formData.OrderInd,
<<<<<<< HEAD
                IsTemporary = formData.IsTemporary,
=======
                IsActive = formData.IsActive,
>>>>>>> upstream/main
                ImageUrl = imageUrl ?? formData.ImageUrl,
                IsChoosed = formData.IsChoosed,
                CreatedAt = DateTime.UtcNow
            };

            _db.Team.Add(member);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = member.Id }, member);
        }

        // 🔒 PUT: api/team/{id} - тільки адмін
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, [FromForm] TeamFormData formData)
        {
            var member = await _db.Team.FindAsync(id);
            if (member == null) return NotFound();
<<<<<<< HEAD

            string? oldImageUrl = member.ImageUrl;
            string? newImageUrl = member.ImageUrl;
=======
            if (id != member.Id) return BadRequest();

            string? imageUrl = member.ImageUrl;
>>>>>>> upstream/main

            // Обробка нового файлу, якщо наданий
            if (formData.Image != null && formData.Image.Length > 0)
            {
<<<<<<< HEAD
                var uploadsDir = Path.Combine(_env.ContentRootPath, "uploads", "team");
=======
                var uploadsDir = Path.Combine(_env.ContentRootPath, "Uploads");
>>>>>>> upstream/main
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

<<<<<<< HEAD
                newImageUrl = $"/uploads/team/{fileName}";

                //видалення старої фотки
                if (!string.IsNullOrEmpty(oldImageUrl))
                {
                    var oldFilePath = Path.Combine(_env.ContentRootPath, oldImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }
=======
                imageUrl = $"/Uploads/{fileName}";
>>>>>>> upstream/main
            }

            member.Name = formData.Name;
            member.Position = formData.Position;
            member.Type = formData.Type;
            member.Email = formData.Email;
            member.OrderInd = formData.OrderInd;
<<<<<<< HEAD
            member.IsTemporary = formData.IsTemporary;
            member.ImageUrl = newImageUrl ?? formData.ImageUrl;
            member.IsChoosed = formData.IsChoosed;
            member.UpdatedAt = DateTime.UtcNow;
=======
            member.IsActive = formData.IsActive;
            member.ImageUrl = imageUrl ?? formData.ImageUrl;
            member.IsChoosed = formData.IsChoosed;
            member.CreatedAt = DateTime.UtcNow;
>>>>>>> upstream/main

            _db.Entry(member).State = EntityState.Modified;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // 🔒 DELETE: api/team/{id} - тільки адмін
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var member = await _db.Team.FindAsync(id);
            if (member == null) return NotFound();

<<<<<<< HEAD
            //видалення фотки при видаленні запису
            if (!string.IsNullOrEmpty(member.ImageUrl))
            {
                var filePath = Path.Combine(_env.ContentRootPath, member.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

=======
>>>>>>> upstream/main
            _db.Team.Remove(member);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

    // DTO для обробки вхідних даних
    public class TeamFormData
    {
        public string Name { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public MemberType Type { get; set; }
        public string? Email { get; set; }
        public int OrderInd { get; set; }
<<<<<<< HEAD
        public bool IsTemporary { get; set; }
=======
        public bool IsActive { get; set; }
>>>>>>> upstream/main
        public string? ImageUrl { get; set; }
        public IFormFile? Image { get; set; }
        public bool IsChoosed { get; set; } = false;
    }
}