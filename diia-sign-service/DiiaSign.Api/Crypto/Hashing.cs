using System.Security.Cryptography;
using Org.BouncyCastle.Crypto.Digests;

namespace DiiaSign.Api.Crypto;

public sealed record DocumentHashes(byte[] Sha256, byte[] Kupyna256)
{
    public string Sha256Base64 => Convert.ToBase64String(Sha256);
    public string Kupyna256Base64 => Convert.ToBase64String(Kupyna256);
}

public static class Hashing
{
    public static DocumentHashes Compute(ReadOnlySpan<byte> data) => new(SHA256.HashData(data), Kupyna256(data));

    /// <summary>ДСТУ 7564:2014 «Купина», 256 біт (32 байти, base64 — 44 символи).</summary>
    public static byte[] Kupyna256(ReadOnlySpan<byte> data)
    {
        var digest = new Dstu7564Digest(256);
        digest.BlockUpdate(data);
        var output = new byte[digest.GetDigestSize()];
        digest.DoFinal(output, 0);
        return output;
    }
}
