using Microsoft.EntityFrameworkCore;

namespace DiiaSign.Api.Data;

public enum SigningStatus
{
    /// <summary>Діплінк видано, користувач ще не відкрив його в Дії.</summary>
    Pending,
    /// <summary>Користувач відкрив діплінк у Дії.</summary>
    Processing,
    /// <summary>Підпис отримано і успішно перевірено.</summary>
    Signed,
    /// <summary>Підпис отримано, але він не пройшов перевірку (або підписав не той, хто мав).</summary>
    Rejected,
    /// <summary>Користувач відмовився від підписання в Дії.</summary>
    Refused,
    /// <summary>Діплінк не використано / минув час на підписання.</summary>
    Expired
}

public sealed class SigningSession
{
    /// <summary>requestId (UUID v4), який ми передали в Дію; приходить у X-Document-Request-Trace-Id.</summary>
    public required string Id { get; init; }

    /// <summary>Ідентифікатор заяви в основному бекенді.</summary>
    public required string ExternalRef { get; init; }

    public required string FileName { get; init; }
    public required string SignAlgorithm { get; init; }

    /// <summary>Хеш, надісланий у Дію (SHA-256 для ECDSA, Купина-256 для ДСТУ).</summary>
    public required byte[] SignedDigest { get; init; }

    public required byte[] Sha256 { get; init; }
    public required byte[] Kupyna256 { get; init; }

    /// <summary>РНОКПП з форми заяви; якщо задано — підписант повинен збігатися.</summary>
    public string? ExpectedRnokpp { get; init; }

    /// <summary>OTP — остання частина діплінка, для запиту статусу.</summary>
    public string? Otp { get; set; }

    public SigningStatus Status { get; set; }
    public string? FailureReason { get; set; }

    public DateTime CreatedAtUtc { get; init; }
    public DateTime DeeplinkExpiresAtUtc { get; init; }
    public DateTime CallbackDeadlineUtc { get; init; }
    public DateTime? CompletedAtUtc { get; set; }
    public DateTime? LastStatusCheckUtc { get; set; }

    // ── Результат підписання ─────────────────────────────────────────────────
    public byte[]? SignatureP7s { get; set; }
    public DateTime? SigningTimeUtc { get; set; }
    public string? SignerFullName { get; set; }
    public string? SignerRnokpp { get; set; }
    public string? SignerCertSerial { get; set; }
    public string? SignerCertIssuer { get; set; }

    public bool IsTerminal => Status is SigningStatus.Signed or SigningStatus.Rejected
        or SigningStatus.Refused or SigningStatus.Expired;
}

public sealed class SignDbContext(DbContextOptions<SignDbContext> options) : DbContext(options)
{
    public DbSet<SigningSession> Sessions => Set<SigningSession>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        var s = b.Entity<SigningSession>();
        s.ToTable("signing_sessions");
        s.HasKey(x => x.Id);
        s.Property(x => x.Id).HasMaxLength(36);
        s.Property(x => x.ExternalRef).HasMaxLength(100);
        s.Property(x => x.FileName).HasMaxLength(100);
        s.Property(x => x.SignAlgorithm).HasMaxLength(32);
        s.Property(x => x.ExpectedRnokpp).HasMaxLength(10);
        s.Property(x => x.Otp).HasMaxLength(64);
        s.Property(x => x.Status).HasConversion<string>().HasMaxLength(16);
        s.Property(x => x.FailureReason).HasMaxLength(64);
        s.Property(x => x.SignerFullName).HasMaxLength(300);
        s.Property(x => x.SignerRnokpp).HasMaxLength(10);
        s.Property(x => x.SignerCertSerial).HasMaxLength(100);
        s.Property(x => x.SignerCertIssuer).HasMaxLength(1000);
        s.HasIndex(x => x.ExternalRef);
        s.HasIndex(x => x.CreatedAtUtc);
        s.Ignore(x => x.IsTerminal);
    }
}
