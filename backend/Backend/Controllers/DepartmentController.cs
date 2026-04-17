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
<<<<<<< HEAD
    [Route("api/departments")]
=======
    [Route("api/[controller]")]
>>>>>>> upstream/main
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

<<<<<<< HEAD
=======
        // GET: api/department
>>>>>>> upstream/main
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Department>>> GetAll()
        {
<<<<<<< HEAD
            return await _db.Departments
=======
            return await _db.Department
>>>>>>> upstream/main
                .Include(d => d.Head)
                .ToListAsync();
        }

<<<<<<< HEAD
=======
        // GET: api/department/{id}
>>>>>>> upstream/main
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Department>> GetById(int id)
        {
<<<<<<< HEAD
            var department = await _db.Departments
                .Include(d => d.Head)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null) return NotFound();
            return department;
        }

=======
            var dep = await _db.Department
                .Include(d => d.Head)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (dep == null) return NotFound();
            return dep;
        }

        // POST: api/department
>>>>>>> upstream/main
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Department>> Create([FromForm] DepartmentFormData formData)
        {
            string? logoUrl = null;

            if (formData.Logo != null && formData.Logo.Length > 0)
            {
<<<<<<< HEAD
                var uploadsDir = Path.Combine(_env.ContentRootPath, "uploads", "departments");
=======
                var uploadsDir = Path.Combine(_env.ContentRootPath, "Uploads");
>>>>>>> upstream/main
                if (!Directory.Exists(uploadsDir)) Directory.CreateDirectory(uploadsDir);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(formData.Logo.FileName)}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await formData.Logo.CopyToAsync(stream);
                }

<<<<<<< HEAD
                logoUrl = $"/uploads/departments/{fileName}";
=======
                logoUrl = $"/Uploads/{fileName}";
>>>>>>> upstream/main
            }

            Team? head = null;
            if (formData.HeadId.HasValue)
            {
                head = await _db.Team.FirstOrDefaultAsync(t => t.Id == formData.HeadId && t.Type == MemberType.Viddil);
                if (head == null) return BadRequest("Head must be a Team member with Type = Viddil");
<<<<<<< HEAD
                
                head.IsChoosed = true;
                _db.Team.Update(head);
            }

            var department = new Department
=======
            }

            var dep = new Department
>>>>>>> upstream/main
            {
                Name = formData.Name,
                Description = formData.Description,
                LogoUrl = logoUrl ?? formData.LogoUrl,
                HeadId = formData.HeadId,
                Head = head,
                IsActive = formData.IsActive,
                CreatedAt = DateTime.UtcNow
            };

<<<<<<< HEAD
            _db.Departments.Add(department);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = department.Id }, department);
        }

=======
            _db.Department.Add(dep);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = dep.Id }, dep);
        }

        // PUT: api/department/{id}
>>>>>>> upstream/main
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, [FromForm] DepartmentFormData formData)
        {
<<<<<<< HEAD
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
=======
            var dep = await _db.Department.FindAsync(id);
            if (dep == null) return NotFound();

            string? logoUrl = dep.LogoUrl;

            if (formData.Logo != null && formData.Logo.Length > 0)
            {
                var uploadsDir = Path.Combine(_env.ContentRootPath, "Uploads");
>>>>>>> upstream/main
                if (!Directory.Exists(uploadsDir)) Directory.CreateDirectory(uploadsDir);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(formData.Logo.FileName)}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await formData.Logo.CopyToAsync(stream);
                }

<<<<<<< HEAD
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

=======
                logoUrl = $"/Uploads/{fileName}";
            }

            Team? head = null;
            if (formData.HeadId.HasValue)
            {
                head = await _db.Team.FirstOrDefaultAsync(t => t.Id == formData.HeadId && t.Type == MemberType.Viddil);
                if (head == null) return BadRequest("Head must be a Team member with Type = Viddil");
            }

            dep.Name = formData.Name;
            dep.Description = formData.Description;
            dep.LogoUrl = logoUrl ?? formData.LogoUrl;
            dep.HeadId = formData.HeadId;
            dep.Head = head;
            dep.IsActive = formData.IsActive;
            dep.UpdatedAt = DateTime.UtcNow;

            _db.Entry(dep).State = EntityState.Modified;
>>>>>>> upstream/main
            await _db.SaveChangesAsync();
            return NoContent();
        }

<<<<<<< HEAD
=======
        // DELETE: api/department/{id}
>>>>>>> upstream/main
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
<<<<<<< HEAD
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
=======
            var dep = await _db.Department.FindAsync(id);
            if (dep == null) return NotFound();

            _db.Department.Remove(dep);
>>>>>>> upstream/main
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

<<<<<<< HEAD
    public class DepartmentFormData
    {
        public int? HeadId { get; set; }
=======
    // DTO для обробки вхідних даних
    public class DepartmentFormData
    {
        public int? HeadId { get; set; }  // Nullable

>>>>>>> upstream/main
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public IFormFile? Logo { get; set; }
    }
}