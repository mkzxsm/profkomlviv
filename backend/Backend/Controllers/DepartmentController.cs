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
    [Route("api/departments")]
    [ApiController]
    public class DepartmentController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;

        public DepartmentController(AppDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Department>>> GetAll()
        {
            return await _db.Departments
                .Include(d => d.Head)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Department>> GetById(int id)
        {
            var department = await _db.Departments
                .Include(d => d.Head)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null) return NotFound();
            return department;
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Department>> Create([FromForm] DepartmentFormData formData)
        {
            string? logoUrl = null;

            if (formData.Logo != null && formData.Logo.Length > 0)
            {
                var uploadsDir = Path.Combine(_env.ContentRootPath, "uploads", "departments");
                if (!Directory.Exists(uploadsDir)) Directory.CreateDirectory(uploadsDir);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(formData.Logo.FileName)}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await formData.Logo.CopyToAsync(stream);
                }

                logoUrl = $"/uploads/departments/{fileName}";
            }

            Team? head = null;
            if (formData.HeadId.HasValue)
            {
                head = await _db.Team.FirstOrDefaultAsync(t => t.Id == formData.HeadId && t.Type == MemberType.Viddil);
                if (head == null) return BadRequest("Head must be a Team member with Type = Viddil");
                
                head.IsChoosed = true;
                _db.Team.Update(head);
            }

            var department = new Department
            {
                Name = formData.Name,
                Description = formData.Description,
                LogoUrl = logoUrl ?? formData.LogoUrl,
                HeadId = formData.HeadId,
                Head = head,
                IsActive = formData.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _db.Departments.Add(department);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = department.Id }, department);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, [FromForm] DepartmentFormData formData)
        {
            var department = await _db.Departments
                .Include(d => d.Head)
                .FirstOrDefaultAsync(d => d.Id == id);
                
            if (department == null) return NotFound();

            string? logoUrl = department.LogoUrl;

            if (formData.Logo != null && formData.Logo.Length > 0)
            {
                if (!string.IsNullOrEmpty(department.LogoUrl))
                {
                    var oldPath = Path.Combine(_env.ContentRootPath, department.LogoUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldPath))
                    {
                        System.IO.File.Delete(oldPath);
                    }
                }

                var uploadsDir = Path.Combine(_env.ContentRootPath, "uploads", "departments");
                if (!Directory.Exists(uploadsDir)) Directory.CreateDirectory(uploadsDir);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(formData.Logo.FileName)}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await formData.Logo.CopyToAsync(stream);
                }

                logoUrl = $"/uploads/departments/{fileName}";
            }

            Team? newHead = null;
            if (formData.HeadId.HasValue)
            {
                newHead = await _db.Team.FirstOrDefaultAsync(t => t.Id == formData.HeadId && t.Type == MemberType.Viddil);
                if (newHead == null) return BadRequest("Head must be a Team member with Type = Viddil");
            }

            if (department.Head != null && department.Head.Id != formData.HeadId)
            {
                department.Head.IsChoosed = false;
                _db.Team.Update(department.Head);
            }

            if (newHead != null && newHead.Id != department.Head?.Id)
            {
                newHead.IsChoosed = true;
                _db.Team.Update(newHead);
            }

            department.Name = formData.Name;
            department.Description = formData.Description;
            department.LogoUrl = logoUrl ?? formData.LogoUrl;
            department.HeadId = formData.HeadId;
            department.Head = newHead;
            department.IsActive = formData.IsActive;
            department.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var department = await _db.Departments
                .Include(d => d.Head)
                .FirstOrDefaultAsync(d => d.Id == id);
                
            if (department == null) return NotFound();

            if (department.Head != null)
            {
                department.Head.IsChoosed = false;
            }

            if (!string.IsNullOrEmpty(department.LogoUrl))
            {
                var filePath = Path.Combine(_env.ContentRootPath, department.LogoUrl.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            _db.Departments.Remove(department);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

    public class DepartmentFormData
    {
        public int? HeadId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public IFormFile? Logo { get; set; }
    }
}