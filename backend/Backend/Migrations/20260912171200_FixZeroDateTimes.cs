using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class FixZeroDateTimes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Allow reading/writing 0000-00-00 so cleanup can run under strict sql_mode.
            migrationBuilder.Sql(@"
SET SESSION sql_mode = REPLACE(REPLACE(@@SESSION.sql_mode, 'NO_ZERO_DATE', ''), 'NO_ZERO_IN_DATE', '');

UPDATE `Team`
SET `CreatedAt` = UTC_TIMESTAMP(6)
WHERE CAST(`CreatedAt` AS CHAR) LIKE '0000-%' OR YEAR(`CreatedAt`) < 1000;

UPDATE `Team`
SET `UpdatedAt` = `CreatedAt`
WHERE CAST(`UpdatedAt` AS CHAR) LIKE '0000-%' OR YEAR(`UpdatedAt`) < 1000;

UPDATE `Faculties`
SET `CreatedAt` = UTC_TIMESTAMP(6)
WHERE CAST(`CreatedAt` AS CHAR) LIKE '0000-%' OR YEAR(`CreatedAt`) < 1000;

UPDATE `Faculties`
SET `UpdatedAt` = `CreatedAt`
WHERE `UpdatedAt` IS NOT NULL
  AND (CAST(`UpdatedAt` AS CHAR) LIKE '0000-%' OR YEAR(`UpdatedAt`) < 1000);

UPDATE `Departments`
SET `CreatedAt` = UTC_TIMESTAMP(6)
WHERE CAST(`CreatedAt` AS CHAR) LIKE '0000-%' OR YEAR(`CreatedAt`) < 1000;

UPDATE `Departments`
SET `UpdatedAt` = `CreatedAt`
WHERE `UpdatedAt` IS NOT NULL
  AND (CAST(`UpdatedAt` AS CHAR) LIKE '0000-%' OR YEAR(`UpdatedAt`) < 1000);

UPDATE `Documents`
SET `CreatedAt` = UTC_TIMESTAMP(6)
WHERE CAST(`CreatedAt` AS CHAR) LIKE '0000-%' OR YEAR(`CreatedAt`) < 1000;

UPDATE `Documents`
SET `UpdatedAt` = `CreatedAt`
WHERE `UpdatedAt` IS NOT NULL
  AND (CAST(`UpdatedAt` AS CHAR) LIKE '0000-%' OR YEAR(`UpdatedAt`) < 1000);

UPDATE `News`
SET `PublishedAt` = UTC_TIMESTAMP(6)
WHERE CAST(`PublishedAt` AS CHAR) LIKE '0000-%' OR YEAR(`PublishedAt`) < 1000;

UPDATE `ContactMessages`
SET `SentAt` = UTC_TIMESTAMP(6)
WHERE CAST(`SentAt` AS CHAR) LIKE '0000-%' OR YEAR(`SentAt`) < 1000;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
