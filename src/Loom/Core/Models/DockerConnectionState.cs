namespace Loom.Core.Models;

public record DockerConnectionState(
    DockerConnectionStatus Status,
    string? Version = null,
    string? Reason = null);