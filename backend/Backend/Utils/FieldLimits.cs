using System.Text.RegularExpressions;

namespace ProfkomBackend.Utils
{
    public static class FieldLimits
    {
        public const int PersonName = 100;
        public const int Position = 100;
        public const int AdminUsername = 100;
        public const int Password = 100;
        public const int Room = 100;
        public const int Schedule = 100;
        public const int StructureName = 150;
        public const int Email = 150;
        public const int Title = 200;
        public const int Address = 200;
        public const int Url = 255;

        /// <summary>local@domain.tld — дозволяє lnu.edu.ua, gmail.com, yahoo.com тощо.</summary>
        public const string EmailPattern = @"^[^\s@]+@[^\s@]+\.[^\s@]+$";
        public const string EmailFormatMessage = "Введіть email у форматі name@domain.com";

        public static bool IsValidEmail(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return false;
            return Regex.IsMatch(value.Trim(), EmailPattern);
        }
    }
}
