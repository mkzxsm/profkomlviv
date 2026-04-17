using BCrypt.Net;
using ProfkomBackend.Models;

namespace ProfkomBackend.Data
{
    public static class DbInitializer
    {
        public static void Seed(AppDbContext db)
        {
<<<<<<< HEAD
            var adminsToAdd = new List<Admin>
            {
                new Admin
                {
                    Username = "admin@gmail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("@Admin123"),
                    Role = "admin"
                },
                new Admin
                {
                    Username = "Duma@profkom.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("@Duma2004"),
                    Role = "admin"
                },
                new Admin
                {
                    Username = "Oleksandra.ssf@profkom.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("!Slyvka2006"),
                    Role = "admin"
                },
                new Admin
                {
                    Username = "sofia@profkom.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("!Tereshkevych1"),
                    Role = "admin"
                },
                new Admin
                {
                    Username = "Nelia@profkom.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("@Ofredr14"),
                    Role = "admin"
                },
                new Admin
                {
                    Username = "marusia@profkom.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("@InmovToLove12"),
                    Role = "admin"
                },
                new Admin
                {
                    Username = "bohuslav@profkom.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("!Ateist1488"),
                    Role = "admin"
                },
                new Admin
                {
                    Username = "Diana@profkom.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("!Ekonomist19"),
                    Role = "admin"
                }
            };

            foreach (var admin in adminsToAdd)
            {
                if (!db.Admins.Any(a => a.Username == admin.Username))
                {
                    db.Admins.Add(admin);
                }
            }

            db.SaveChanges();
=======
            if (!db.Admins.Any()) //додаємо адміна якщо таблиця пуста
            {
                var hash = BCrypt.Net.BCrypt.HashPassword("@Admin123");
                db.Admins.Add(new Admin
                {
                    Username = "admin@gmail.com",
                    PasswordHash = hash,
                    Role = "admin"
                });
                db.SaveChanges();
            }
>>>>>>> upstream/main
        }
    }
}
