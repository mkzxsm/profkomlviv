using DiiaSign.Api.Crypto;
using Microsoft.Extensions.Logging.Abstractions;
using Org.BouncyCastle.Asn1.X9;

namespace DiiaSign.Tests;

/// <summary>
/// Перевірка на справжніх бандлах ІІТ (якщо завантажені через scripts/fetch-ca-certs.sh):
/// BouncyCastle повинен збудувати ланцюжок від ECDSA-КНЕДП «ДІЯ» до кореня ЦЗО.
/// </summary>
public class RealCaBundleTests
{
    public static TheoryData<string> Bundles => new() { "CACertificates.p7b", "CACertificates.Test.All.p7b" };

    [Theory]
    [MemberData(nameof(Bundles))]
    public void Diia_QTSP_ECDSA_certificate_chains_to_trusted_root(string bundle)
    {
        var path = Path.Combine(FindRepoRoot(), "DiiaSign.Api", "certs", bundle);
        if (!File.Exists(path))
            return; // бандл не завантажено — пропускаємо

        var certs = TrustedCaStore.LoadCertificates(path);
        var store = new TrustedCaStore(certs, NullLogger<TrustedCaStore>.Instance);
        var now = DateTime.UtcNow;

        var diia = certs.Where(c =>
                c.SubjectPublicKeyInfo.Algorithm.Algorithm.Id == X9ObjectIdentifiers.IdECPublicKey.Id &&
                c.SubjectDN.ToString().Contains("DIIA", StringComparison.Ordinal) &&
                c.GetBasicConstraints() >= 0 && c.IsValid(now))
            .ToList();

        Assert.NotEmpty(diia);
        Assert.Contains(diia, c => store.TryValidateChain(c, [], now));
    }

    private static string FindRepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "DiiaSign.sln")))
            dir = dir.Parent;
        return dir?.FullName ?? throw new InvalidOperationException("DiiaSign.sln not found");
    }
}
