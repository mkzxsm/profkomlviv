using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProfkomBackend.Data;
using ProfkomBackend.Models;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using Ganss.Xss;

namespace ProfkomBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ContactController(AppDbContext db)
        {
            _db = db;
        }

        // 📨 Отримати всі контактні повідомлення
        [Authorize(Roles = "admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var messages = await _db.ContactMessages
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();
            
            return Ok(messages);
        }

        // 📨 Отримати одне повідомлення по ID
        [Authorize(Roles = "admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var message = await _db.ContactMessages.FindAsync(id);
            if (message == null)
                return NotFound(new { message = "Повідомлення не знайдено" });

            return Ok(message);
        }

        // ✉️ Створити нове повідомлення
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] ContactMessageDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Неправильні дані форми", errors = ModelState.Values.SelectMany(v => v.Errors) });

            var contactMessage = new ContactMessage
            {
                FromName = dto.Name,
                FromEmail = dto.Email,
                Subject = dto.Subject,
                Message = dto.Message,
                SentAt = DateTime.UtcNow
            };

            _db.ContactMessages.Add(contactMessage);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = contactMessage.Id }, 
                new { message = "Повідомлення успішно отримано", id = contactMessage.Id });
        }

        // 🗑️ Видалити повідомлення
        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var message = await _db.ContactMessages.FindAsync(id);
            if (message == null)
                return NotFound(new { message = "Повідомлення не знайдено" });

            _db.ContactMessages.Remove(message);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }

    // DTO для створення контактного повідомлення
    public class ContactMessageDto
    {
        [Required(ErrorMessage = "Ім'я обов'язкове")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email обов'язковий")]
        [EmailAddress(ErrorMessage = "Неправильний формат email")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Тема обов'язкова")]
        public string Subject { get; set; } = string.Empty;

        [Required(ErrorMessage = "Текст повідомлення обов'язковий")]
        public string Message { get; set; } = string.Empty;
    }
}
