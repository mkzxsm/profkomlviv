using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ProfkomBackend.Data;
using ProfkomBackend.Models;
using ProfkomBackend.Utils;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.RateLimiting;

namespace ProfkomBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _cfg;

        public AdminController(AppDbContext db, IConfiguration cfg)
        {
            _db = db;
            _cfg = cfg;
        }

        // 🔑 Логін
        [HttpPost("login")]
        [EnableRateLimiting("LoginPolicy")]
        public async Task<IActionResult> Login(AuthRequest req)
        {
            var admin = await _db.Admins.FirstOrDefaultAsync(a => a.Username == req.Username);
            if (admin == null) return Unauthorized(new { message = "Invalid username or password" });

            if (!BCrypt.Net.BCrypt.Verify(req.Password, admin.PasswordHash))
                return Unauthorized(new { message = "Invalid username or password" });

            var jwtKey = _cfg["JwtSettings:SecretKey"]
                ?? throw new InvalidOperationException("JwtSettings:SecretKey is not configured.");
            var key = Encoding.UTF8.GetBytes(jwtKey);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, admin.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, admin.Username),
                new Claim(ClaimTypes.Name, admin.Username),
                new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()),
                new Claim(ClaimTypes.Role, admin.Role ?? "admin")
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims, "jwt"),
                Expires = DateTime.UtcNow.AddHours(12),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwt = tokenHandler.WriteToken(token);

            return Ok(new
            {
                token = jwt,
                expires = tokenDescriptor.Expires,
                userId = admin.Id,
                username = admin.Username,
                role = admin.Role
            });
        }

        // 📋 Список адміністраторів
        [Authorize(Roles = "admin")]
        [HttpGet("list")]
        public async Task<IActionResult> List()
        {
            var admins = await _db.Admins.Select(a => new
            {
                a.Id,
                a.Username,
                a.Role
            }).ToListAsync();

            return Ok(admins);
        }

        // ➕ Створення нового адміна
        [Authorize(Roles = "admin")]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] AdminCreateRequest req)
        {
            if (string.IsNullOrEmpty(req.Username) || string.IsNullOrEmpty(req.Password))
                return BadRequest(new { message = "Логін і пароль обов'язкові" });

            if (!IsValidUsername(req.Username))
                return BadRequest(new { message = "Логін може містити лише літери, цифри та підкреслення (3–50 символів)" });

            if (!IsValidPassword(req.Password))
                return BadRequest(new { message = "Пароль не відповідає вимогам безпеки" });

            if (await _db.Admins.AnyAsync(a => a.Username == req.Username))
                return Conflict(new { message = "Адміністратор з таким логіном вже існує" });

            var admin = new Admin
            {
                Username = req.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                Role = "admin"
            };

            _db.Admins.Add(admin);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(List), new { id = admin.Id }, new { message = "Адміністратора створено", admin.Id, admin.Username, admin.Role });
        }

        // ✏️ Редагування адміна (пароль можна змінювати тільки собі)
        [Authorize(Roles = "admin")]
        [HttpPut("edit/{id}")]
        public async Task<IActionResult> Edit(int id, [FromBody] AdminEditRequest req)
        {
            var admin = await _db.Admins.FindAsync(id);
            if (admin == null) return NotFound(new { message = "Адміністратор не знайдений" });

            // Якщо поле Password присутнє в тілі запиту (навіть порожнє) — валідуємо
            if (req.Password != null)
            {
                if (req.Password == string.Empty)
                    return BadRequest(new { message = "Пароль не може бути порожнім" });

                if (!TryGetCurrentAdminId(out var currentAdminId) || currentAdminId != id)
                    return Forbid();

                if (!IsValidPassword(req.Password))
                    return BadRequest(new { message = "Пароль не відповідає вимогам безпеки" });

                admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);
            }

            admin.Role = "admin";

            await _db.SaveChangesAsync();

            return Ok(new { message = "Адміністратора оновлено", admin.Id, admin.Username, admin.Role });
        }

        // 🔒 Зміна пароля собі
        [Authorize(Roles = "admin")]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
        {
            if (string.IsNullOrEmpty(req.CurrentPassword) || string.IsNullOrEmpty(req.NewPassword))
                return BadRequest(new { message = "Поточний і новий пароль обов'язкові" });

            if (!TryGetCurrentAdminId(out var currentAdminId))
                return Unauthorized(new { message = "Не вдалося визначити поточного адміністратора" });

            var admin = await _db.Admins.FindAsync(currentAdminId);
            if (admin == null) return NotFound(new { message = "Адміністратор не знайдений" });

            if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, admin.PasswordHash))
                return BadRequest(new { message = "Невірний поточний пароль" });

            if (!IsValidPassword(req.NewPassword))
                return BadRequest(new { message = "Пароль не відповідає вимогам безпеки" });

            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Пароль змінено" });
        }

        // 🗑️ Видалення адміна
        [Authorize(Roles = "admin")]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var admin = await _db.Admins.FindAsync(id);
            if (admin == null) return NotFound(new { message = "Адміністратор не знайдений" });

            _db.Admins.Remove(admin);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // === Хелпери ===
        private bool TryGetCurrentAdminId(out int adminId)
        {
            adminId = 0;
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(adminIdClaim, out adminId);
        }

        private static bool IsValidPassword(string password)
        {
            if (string.IsNullOrEmpty(password)) return false;
            // Обмеження довжини: мін 8, макс 128 символів
            if (password.Length < 8 || password.Length > 128) return false;
            // Делегуємо перевірку ін'єкцій центральному валідатору
            if (InputValidator.ValidateTextField(password, "Пароль", maxLength: 128) != null)
                return false;
            // Вимоги до надійності: хоч одна велика, цифра, спецсимвол
            var regex = new Regex(@"^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$");
            return regex.IsMatch(password);
        }

        private static bool IsValidUsername(string username)
        {
            if (string.IsNullOrEmpty(username)) return false;
            if (username.Length < 3 || username.Length > 50) return false;
            var regex = new Regex(@"^[a-zA-Z0-9_]+$");
            return regex.IsMatch(username);
        }

        private static string Base64UrlEncode(byte[] input)
        {
            return Convert.ToBase64String(input)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }

        private static string CreateSignature(string data, byte[] key)
        {
            using var hmac = new System.Security.Cryptography.HMACSHA256(key);
            var signatureBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return Base64UrlEncode(signatureBytes);
        }
    }

    // DTO для створення
    public class AdminCreateRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Role { get; set; }
    }

    // DTO для редагування
    public class AdminEditRequest
    {
        public string? Password { get; set; }
        public string? Role { get; set; }
    }

    // DTO для зміни пароля собі
    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
