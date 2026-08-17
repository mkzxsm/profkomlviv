namespace ProfkomBackend.Utils
{
    public class FileValidationHelper
    {
        // Дозволені MIME типи для картинок
        private static readonly HashSet<string> AllowedImageMimeTypes = new()
        {
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/svg+xml"
        };

        // Дозволені MIME типи для документів
        private static readonly HashSet<string> AllowedDocumentMimeTypes = new()
        {
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain",
            "text/csv"
        };

        // Максимальні розміри (байти)
        public const long MAX_IMAGE_SIZE = 10 * 1024 * 1024;      // 10 MB для картинок
        public const long MAX_DOCUMENT_SIZE = 50 * 1024 * 1024;   // 50 MB для документів
        public const long MAX_LOGO_SIZE = 5 * 1024 * 1024;        // 5 MB для логотипів

        /// <summary>
        /// Перевіряє розмір файлу
        /// </summary>
        /// <returns>Повертає (isValid, errorMessage)</returns>
        public static (bool isValid, string? errorMessage) ValidateFileSize(IFormFile file, long maxSize)
        {
            if (file == null)
                return (false, "Файл не надано");

            if (file.Length == 0)
                return (false, "Файл порожній");

            if (file.Length > maxSize)
            {
                var maxSizeMB = maxSize / (1024 * 1024);
                return (false, $"Розмір файлу перевищує {maxSizeMB}MB");
            }

            return (true, null);
        }

        /// <summary>
        /// Перевіряє MIME тип картинки
        /// </summary>
        public static (bool isValid, string? errorMessage) ValidateImageMimeType(IFormFile file)
        {
            if (file == null)
                return (false, "Файл не надано");

            var contentType = file.ContentType?.ToLower() ?? "";

            if (!AllowedImageMimeTypes.Contains(contentType))
            {
                var allowedTypes = string.Join(", ", AllowedImageMimeTypes);
                return (false, $"Недопустимий формат картинки. Дозволені: {allowedTypes}");
            }

            return (true, null);
        }

        /// <summary>
        /// Перевіряє MIME тип документу
        /// </summary>
        public static (bool isValid, string? errorMessage) ValidateDocumentMimeType(IFormFile file)
        {
            if (file == null)
                return (false, "Файл не надано");

            var contentType = file.ContentType?.ToLower() ?? "";

            if (!AllowedDocumentMimeTypes.Contains(contentType))
            {
                var allowedTypes = string.Join(", ", AllowedDocumentMimeTypes);
                return (false, $"Недопустимий формат документу. Дозволені: {allowedTypes}");
            }

            return (true, null);
        }

        /// <summary>
        /// Комбінована перевірка для картинок (розмір + MIME)
        /// </summary>
        public static (bool isValid, string? errorMessage) ValidateImage(IFormFile file, long maxSize = MAX_IMAGE_SIZE)
        {
            var (sizeValid, sizeError) = ValidateFileSize(file, maxSize);
            if (!sizeValid)
                return (false, sizeError);

            return ValidateImageMimeType(file);
        }

        /// <summary>
        /// Комбінована перевірка для документів (розмір + MIME)
        /// </summary>
        public static (bool isValid, string? errorMessage) ValidateDocument(IFormFile file, long maxSize = MAX_DOCUMENT_SIZE)
        {
            var (sizeValid, sizeError) = ValidateFileSize(file, maxSize);
            if (!sizeValid)
                return (false, sizeError);

            return ValidateDocumentMimeType(file);
        }
    }
}
