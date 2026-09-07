namespace Loom.Core.Models;

public record ImageSearchResult(
    string Name,
    bool IsLocal,
    bool IsOfficial,
    string? Description,
    int? Stars);
