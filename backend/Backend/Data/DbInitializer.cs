using BCrypt.Net;
using ProfkomBackend.Models;

namespace ProfkomBackend.Data
{
    public static class DbInitializer
    {
        public static void Seed(AppDbContext db)
        {
            if (db.Admins.Any()) return;

            var adminsToAdd = new List<Admin>
            {
                new Admin
                {
                    Username = "yurii.mazur@lnu.edu.ua",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("@Melnyk12"),
                    Role = "admin"
                }
            };

            db.Admins.AddRange(adminsToAdd);
            db.SaveChanges();
        }
    }
}
