namespace Loom.Core.Models;

public record DockerHubImageResult(
    string Name,
    string? Description,
    int Stars,
    bool IsOfficial);
