using System.Text.Json.Serialization;

namespace DiiaSign.Api.Diia;

// ── DTO для API Дії (назви полів регістрозалежні — задаємо явно) ──────────────

internal sealed record DiiaTokenResponse([property: JsonPropertyName("token")] string? Token);

internal sealed record DiiaDeeplinkResponse([property: JsonPropertyName("deeplink")] string? Deeplink);

internal sealed record DiiaStatusResponse([property: JsonPropertyName("status")] string? Status);

internal sealed record DiiaIdResponse([property: JsonPropertyName("_id")] string? Id);

internal sealed class DiiaHashedFile
{
    [JsonPropertyName("fileName")] public required string FileName { get; init; }
    [JsonPropertyName("fileHash")] public required string FileHash { get; init; }
}

internal sealed class DiiaHashedFilesSigning
{
    [JsonPropertyName("hashedFiles")] public required IReadOnlyList<DiiaHashedFile> HashedFiles { get; init; }
}

internal sealed class DiiaOfferRequestData
{
    [JsonPropertyName("hashedFilesSigning")] public required DiiaHashedFilesSigning HashedFilesSigning { get; init; }
}

internal sealed class DiiaDynamicOfferRequest
{
    [JsonPropertyName("offerId")] public required string OfferId { get; init; }

    // Порожній рядок Дія відхиляє ("Return link should be provided") — тому null і не серіалізуємо.
    [JsonPropertyName("returnLink"), JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? ReturnLink { get; init; }

    [JsonPropertyName("requestId")] public required string RequestId { get; init; }
    [JsonPropertyName("signAlgo")] public required string SignAlgo { get; init; }
    [JsonPropertyName("data")] public required DiiaOfferRequestData Data { get; init; }
}

/// <summary>Вміст encodeData з callback після base64-декодування.</summary>
internal sealed class DiiaCallbackPayload
{
    [JsonPropertyName("signedItems")] public List<DiiaSignedItem>? SignedItems { get; init; }
}

internal sealed class DiiaSignedItem
{
    [JsonPropertyName("name")] public string? Name { get; init; }
    [JsonPropertyName("signature")] public string? Signature { get; init; }
}

// ── Налаштування бранчів / оферів (адмінські setup-ендпоінти) ─────────────────

public sealed class CreateBranchRequest
{
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Region { get; init; }
    public required string District { get; init; }
    public required string Location { get; init; }
    public required string Street { get; init; }
    public required string House { get; init; }
    public string? CustomFullName { get; init; }
    public string? CustomFullAddress { get; init; }
}

public sealed class CreateOfferRequest
{
    public required string Name { get; init; }
    public string? ReturnLink { get; init; }
}

/// <summary>Статуси, які повертає GET /api/v1/acquirers/offer-request/status.</summary>
public static class DiiaRequestStatus
{
    public const string Initialized = "initialized";
    public const string Processing = "processing";
    public const string Done = "done";
    public const string Refuse = "refuse";
    public const string NotUsed = "notUsed";
}
