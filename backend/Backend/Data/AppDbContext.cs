using Microsoft.EntityFrameworkCore;
using ProfkomBackend.Models;

namespace ProfkomBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts) { }

        public DbSet<Admin> Admins { get; set; }
        public DbSet<News> News { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<ContactMessage> ContactMessages { get; set; }
        public DbSet<Team> Team { get; set; }
        public DbSet<Faculty> Faculties { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Unit> Unit { get; set; }
        public DbSet<Document> Documents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder) // Дозволяє видалити голову, не видаляючи факультет
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Faculty>()
                .HasOne(f => f.Head)
                .WithMany()
                .HasForeignKey(f => f.HeadId)
                .IsRequired(false) 
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}

