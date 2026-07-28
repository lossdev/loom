namespace Loom.Core.Models;

public record LocalImageResult(
    bool Exists,
    string? Tag,
    DateTime? Created,
    bool? BuiltLocally,
    IReadOnlyList<string>? AvailableTags);