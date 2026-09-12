using Microsoft.EntityFrameworkCore;
using ProfkomBackend.Models;
using ProfkomBackend.Utils;

namespace ProfkomBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts) { }

        public DbSet<Admin> Admins { get; set; }
        public DbSet<News> News { get; set; }
        public DbSet<NewsImage> NewsImages { get; set; } // <--- НОВЕ ПОЛЕ
        public DbSet<ContactMessage> ContactMessages { get; set; }
        public DbSet<Team> Team { get; set; }
        public DbSet<Faculty> Faculties { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Document> Documents { get; set; }

        public override int SaveChanges()
        {
            NormalizeInvalidDateTimes();
            return base.SaveChanges();
        }

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            NormalizeInvalidDateTimes();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            NormalizeInvalidDateTimes();
            return base.SaveChangesAsync(cancellationToken);
        }

        public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
        {
            NormalizeInvalidDateTimes();
            return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }

        private const int MySqlDatetimeMinYear = 1000;

        private void NormalizeInvalidDateTimes()
        {
            var replacement = DateTime.UtcNow;

            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.State is not (EntityState.Added or EntityState.Modified))
                    continue;

                foreach (var property in entry.Properties)
                {
                    var clrType = property.Metadata.ClrType;
                    if (clrType != typeof(DateTime) && clrType != typeof(DateTime?))
                        continue;

                    if (property.CurrentValue is DateTime dt && dt.Year < MySqlDatetimeMinYear)
                    {
                        property.CurrentValue = replacement;
                    }
                }
            }
        }

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
            // Ліміти коротких рядків (назви, пошти, адреси, URL)
            modelBuilder.Entity<News>().Property(n => n.Title).HasMaxLength(FieldLimits.Title);
            modelBuilder.Entity<Document>().Property(d => d.Title).HasMaxLength(FieldLimits.Title);
            modelBuilder.Entity<Team>().Property(t => t.Name).HasMaxLength(FieldLimits.PersonName);
            modelBuilder.Entity<Team>().Property(t => t.Position).HasMaxLength(FieldLimits.Position);
            modelBuilder.Entity<Team>().Property(t => t.Email).HasMaxLength(FieldLimits.Email);
            modelBuilder.Entity<Department>().Property(d => d.Name).HasMaxLength(FieldLimits.StructureName);
            modelBuilder.Entity<Faculty>().Property(f => f.Name).HasMaxLength(FieldLimits.StructureName);
            modelBuilder.Entity<Faculty>().Property(f => f.Address).HasMaxLength(FieldLimits.Address);
            modelBuilder.Entity<Faculty>().Property(f => f.Room).HasMaxLength(FieldLimits.Room);
            modelBuilder.Entity<Faculty>().Property(f => f.Schedule).HasMaxLength(FieldLimits.Schedule);
            modelBuilder.Entity<Faculty>().Property(f => f.Instagram_Link).HasMaxLength(FieldLimits.Url);
            modelBuilder.Entity<Faculty>().Property(f => f.Telegram_Link).HasMaxLength(FieldLimits.Url);
            modelBuilder.Entity<Admin>().Property(a => a.Username).HasMaxLength(FieldLimits.AdminUsername);
        }
    }
}