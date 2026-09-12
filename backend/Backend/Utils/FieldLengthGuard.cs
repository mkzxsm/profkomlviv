using Microsoft.EntityFrameworkCore;
using ProfkomBackend.Data;

namespace ProfkomBackend.Utils
{
    public static class FieldLengthGuard
    {
        public static void ThrowIfExistingDataExceedsLimits(AppDbContext db)
        {
            var violations = new List<string>();

            void Check(string label, int currentMax, int limit)
            {
                Console.WriteLine($"[FieldLimits] {label}: max existing = {currentMax}, limit = {limit}");
                if (currentMax > limit) violations.Add($"{label} ({currentMax}>{limit})");
            }

            Check("News.Title", db.News.Max(x => (int?)x.Title.Length) ?? 0, FieldLimits.Title);
            Check("Documents.Title", db.Documents.Max(x => (int?)x.Title.Length) ?? 0, FieldLimits.Title);
            Check("Team.Name", db.Team.Max(x => (int?)x.Name.Length) ?? 0, FieldLimits.PersonName);
            Check("Team.Position", db.Team.Max(x => (int?)x.Position.Length) ?? 0, FieldLimits.Position);
            Check("Team.Email", db.Team.Max(x => (int?)(x.Email != null ? x.Email.Length : 0)) ?? 0, FieldLimits.Email);
            Check("Departments.Name", db.Departments.Max(x => (int?)x.Name.Length) ?? 0, FieldLimits.StructureName);
            Check("Faculties.Name", db.Faculties.Max(x => (int?)x.Name.Length) ?? 0, FieldLimits.StructureName);
            Check("Faculties.Address", db.Faculties.Max(x => (int?)(x.Address != null ? x.Address.Length : 0)) ?? 0, FieldLimits.Address);
            Check("Faculties.Room", db.Faculties.Max(x => (int?)(x.Room != null ? x.Room.Length : 0)) ?? 0, FieldLimits.Room);
            Check("Faculties.Schedule", db.Faculties.Max(x => (int?)(x.Schedule != null ? x.Schedule.Length : 0)) ?? 0, FieldLimits.Schedule);
            Check("Faculties.Telegram_Link", db.Faculties.Max(x => (int?)(x.Telegram_Link != null ? x.Telegram_Link.Length : 0)) ?? 0, FieldLimits.Url);
            Check("Faculties.Instagram_Link", db.Faculties.Max(x => (int?)(x.Instagram_Link != null ? x.Instagram_Link.Length : 0)) ?? 0, FieldLimits.Url);

            if (violations.Count > 0)
            {
                throw new InvalidOperationException(
                    "Existing data exceeds new string limits and will not be truncated: " +
                    string.Join(", ", violations));
            }
        }
    }
}
