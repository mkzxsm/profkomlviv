using Microsoft.EntityFrameworkCore;
using ProfkomBackend.Models;

namespace ProfkomBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts) { }

        public DbSet<Admin> Admins { get; set; }
        public DbSet<News> News { get; set; }
<<<<<<< HEAD
        public DbSet<NewsImage> NewsImages { get; set; } // <--- НОВЕ ПОЛЕ
        public DbSet<Event> Events { get; set; }
        public DbSet<ContactMessage> ContactMessages { get; set; }
        public DbSet<Team> Team { get; set; }
        public DbSet<Faculty> Faculties { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Unit> Unit { get; set; }
        public DbSet<Document> Documents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Налаштування для Факультетів
            modelBuilder.Entity<Faculty>()
                .HasOne(f => f.Head)
                .WithMany()
                .HasForeignKey(f => f.HeadId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            // Налаштування для Новин (Каскадне видалення картинок)
            modelBuilder.Entity<News>()
                .HasMany(n => n.Images)
                .WithOne(i => i.News)
                .HasForeignKey(i => i.NewsId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
=======
        public DbSet<Event> Events { get; set; }
        public DbSet<ContactMessage> ContactMessages { get; set; }
        public DbSet<Team> Team { get; set; }
        public DbSet<Prof> Prof { get; set; }
        public DbSet<Department> Department { get; set; }
        public DbSet<Unit> Unit { get; set; }
    }
}
>>>>>>> upstream/main
