using Microsoft.AspNetCore.Authorization;
<<<<<<< HEAD
=======
using Microsoft.AspNetCore.Hosting;
>>>>>>> upstream/main
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProfkomBackend.Data;
using ProfkomBackend.Models;
using System.ComponentModel.DataAnnotations;
<<<<<<< HEAD
=======
using System.IO;
using System.Threading.Tasks;
>>>>>>> upstream/main

namespace ProfkomBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsController : ControllerBase
    {
<<<<<<< HEAD
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;
=======
        private readonly AppDbContext _db; private readonly IWebHostEnvironment _env;
>>>>>>> upstream/main

        public NewsController(AppDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        [HttpGet]
<<<<<<< HEAD
        public async Task<IActionResult> GetAll()
        {
            // .Include(n => n.Images) обов'язково, щоб отримати масив картинок
            var news = await _db.News
                .Include(n => n.Images)
                .OrderByDescending(n => n.PublishedAt)
                .ToListAsync();
            return Ok(news);
        }
=======
        public async Task<IActionResult> GetAll() => Ok(await _db.News.OrderByDescending(n => n.PublishedAt).ToListAsync());
>>>>>>> upstream/main

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
<<<<<<< HEAD
            var item = await _db.News
                .Include(n => n.Images)
                .FirstOrDefaultAsync(n => n.Id == id);

=======
            var item = await _db.News.FindAsync(id);
>>>>>>> upstream/main
            if (item == null) return NotFound();
            return Ok(item);
        }

        [Authorize(Roles = "admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] NewsDto newsDto)
        {
<<<<<<< HEAD
            if (!ModelState.IsValid) return BadRequest(ModelState);
=======
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
>>>>>>> upstream/main

            var news = new News
            {
                Title = newsDto.Title,
                Content = newsDto.Content,
                IsImportant = newsDto.IsImportant,
                PublishedAt = DateTime.UtcNow
            };

<<<<<<< HEAD
            // Логіка збереження кількох картинок
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

                        news.Images.Add(new NewsImage
                        {
                            ImagePath = $"/uploads/news/{fileName}"
                        });
                    }
                }
=======
            if (newsDto.Image != null && newsDto.Image.Length > 0)
            {
                var uploads = Path.Combine(_env.ContentRootPath, "Uploads");
                if (!Directory.Exists(uploads))
                {
                    Directory.CreateDirectory(uploads);
                }

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(newsDto.Image.FileName)}";
                var filePath = Path.Combine(uploads, fileName);
                using (var stream = System.IO.File.Create(filePath))
                {
                    await newsDto.Image.CopyToAsync(stream);
                }
                news.ImageUrl = $"/Uploads/{fileName}"; // �������� �������� ���� � ��
>>>>>>> upstream/main
            }

            _db.News.Add(news);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = news.Id }, news);
        }

        [Authorize(Roles = "admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] NewsDto newsDto)
        {
<<<<<<< HEAD
            var existingNews = await _db.News
                .Include(n => n.Images)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (existingNews == null) return NotFound();
=======
            if (id != newsDto.Id)
            {
                return BadRequest("ID � URL �� ������� ID � �����");
            }

            var existingNews = await _db.News.FindAsync(id);
            if (existingNews == null)
            {
                return NotFound();
            }
>>>>>>> upstream/main

            existingNews.Title = newsDto.Title;
            existingNews.Content = newsDto.Content;
            existingNews.IsImportant = newsDto.IsImportant;

<<<<<<< HEAD
            // Додаємо нові картинки до існуючих (старі не видаляються, поки їх явно не видалити)
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
=======
            if (newsDto.Image != null && newsDto.Image.Length > 0)
            {
                var uploads = Path.Combine(_env.ContentRootPath, "Uploads");
                if (!Directory.Exists(uploads))
                {
                    Directory.CreateDirectory(uploads);
                }

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(newsDto.Image.FileName)}";
                var filePath = Path.Combine(uploads, fileName);
                using (var stream = System.IO.File.Create(filePath))
                {
                    await newsDto.Image.CopyToAsync(stream);
                }
                existingNews.ImageUrl = $"/Uploads/{fileName}"; // ��������� ���� � ��
            }

            _db.Entry(existingNews).State = EntityState.Modified;
            await _db.SaveChangesAsync();
            return NoContent();
>>>>>>> upstream/main
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
<<<<<<< HEAD
            var news = await _db.News
                .Include(n => n.Images)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (news == null) return NotFound();

            // Видаляємо фізичні файли з сервера
            foreach (var img in news.Images)
            {
                var filePath = Path.Combine(_env.ContentRootPath, img.ImagePath.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
=======
            var news = await _db.News.FindAsync(id);
            if (news == null)
            {
                return NotFound();
>>>>>>> upstream/main
            }

            _db.News.Remove(news);
            await _db.SaveChangesAsync();
            return NoContent();
        }
<<<<<<< HEAD

        // Окремий метод для видалення конкретної картинки (наприклад, адмін хоче видалити одне фото з новини)
        [Authorize(Roles = "admin")]
        [HttpDelete("image/{imageId}")]
        public async Task<IActionResult> DeleteImage(int imageId)
        {
            var image = await _db.NewsImages.FindAsync(imageId);
            if (image == null) return NotFound();

            var filePath = Path.Combine(_env.ContentRootPath, image.ImagePath.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            _db.NewsImages.Remove(image);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

    // Оновлений DTO для прийому списку файлів
    public class NewsDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }

        // Тут тепер List, а не один файл
        public List<IFormFile>? Images { get; set; }

        public bool IsImportant { get; set; }
    }
=======
    }

    public class NewsDto
    {
        public int Id { get; set; }
        [Required]
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public IFormFile? Image { get; set; }
        public bool IsImportant { get; set; }
    }

>>>>>>> upstream/main
}