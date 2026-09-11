namespace ProfkomBackend.Utils
{
    /// <summary>
    /// Централізований валідатор текстових полів.
    /// Повертає null якщо поле валідне, або рядок з описом помилки.
    /// </summary>
    public static class InputValidator
    {
        // Заборонені HTML-теги / атрибути що виконують скрипти
        private static readonly string[] HtmlPatterns =
        [
            "<script", "</script>", "<img", "<svg", "<iframe", "<object",
            "<embed", "<link", "<meta", "<form", "javascript:", "vbscript:",
            "onload=", "onerror=", "onclick=", "onmouseover=", "onfocus=",
            "onblur=", "onsubmit=", "onchange=", "data:text/html"
        ];

        // SQL-injection ключові слова / оператори
        private static readonly string[] SqlPatterns =
        [
            "' or ", "' or'", "\"or \"", " or 1=1", " or '1'='1", "' and ",
            "admin'--", "admin' --", "'--", "' --", "; drop table", "; drop ",
            "drop table", "insert into", "delete from", "update set",
            "union select", "union all", "exec(", "execute(",
            "xp_cmdshell", "' sleep(", "' waitfor delay",
            "benchmark(", "or sleep(", "'; select"
        ];

        // Path traversal
        private static readonly string[] PathPatterns =
        [
            "../", "..\\", "..%2f", "..%5c",
            "....//", "....\\\\", "%2e%2e%2f", "%2e%2e/"
        ];

        // Template / JNDI / EL injection
        private static readonly string[] TemplatePatterns =
        [
            "${", "#{", "<%=", "%>", "${jndi:", "${7*", "${ne:", "${whoami",
            "#{7*", "{{", "}}"
        ];

        // Command injection
        private static readonly string[] CommandPatterns =
        [
            "; ls ", "; ls-", ";ls ", "| ls", "&& ls", "|| ls",
            "; whoami", "; cat ", "; rm ", "; wget ", "; curl ",
            "`whoami`", "$(whoami)"
        ];

        // HTTP header injection (CRLF)
        private static readonly string[] HeaderInjectionPatterns =
        [
            "\r\n", "\r", "%0d%0a", "%0d", "%0a",
            "set-cookie:", "location:", "content-type:"
        ];

        /// <summary>
        /// Validates a text field for all known injection patterns.
        /// </summary>
        /// <param name="value">The value to validate.</param>
        /// <param name="fieldName">Human-readable field name for the error message.</param>
        /// <param name="maxLength">Maximum allowed length.</param>
        /// <returns>null if valid; error message string if invalid.</returns>
        public static string? ValidateTextField(string value, string fieldName, int maxLength = 1000)
        {
            if (string.IsNullOrEmpty(value))
                return null; // Empty/null is handled by Required checks elsewhere

            // 1. Null byte
            if (value.Contains('\0'))
                return $"{fieldName} містить недозволений символ (null byte)";

            // 2. Max length / buffer overflow
            if (value.Length > maxLength)
                return $"{fieldName} не може перевищувати {maxLength} символів";

            var lower = value.ToLowerInvariant();

            // 3. HTML / XSS
            foreach (var pattern in HtmlPatterns)
                if (lower.Contains(pattern.ToLowerInvariant()))
                    return $"{fieldName} містить недозволений HTML-вміст";

            // Also catch bare < > that could wrap tags not in our list
            if (value.Contains('<') || value.Contains('>'))
                return $"{fieldName} містить недозволені символи '<' або '>'";

            // 4. SQL injection
            foreach (var pattern in SqlPatterns)
                if (lower.Contains(pattern.ToLowerInvariant()))
                    return $"{fieldName} містить недозволені символи (SQL injection)";

            // 5. Path traversal
            foreach (var pattern in PathPatterns)
                if (lower.Contains(pattern.ToLowerInvariant()))
                    return $"{fieldName} містить недозволений шлях";

            // 6. Template / JNDI / EL injection
            foreach (var pattern in TemplatePatterns)
                if (lower.Contains(pattern.ToLowerInvariant()))
                    return $"{fieldName} містить недозволені вирази (template/JNDI injection)";

            // 7. Command injection
            foreach (var pattern in CommandPatterns)
                if (lower.Contains(pattern.ToLowerInvariant()))
                    return $"{fieldName} містить недозволені символи (command injection)";

            // 8. HTTP header injection (CRLF)
            foreach (var pattern in HeaderInjectionPatterns)
                if (lower.Contains(pattern.ToLowerInvariant()))
                    return $"{fieldName} містить недозволені символи (header injection)";

            return null; // Valid
        }
    }
}

