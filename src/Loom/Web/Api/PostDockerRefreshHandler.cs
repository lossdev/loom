namespace Loom.Web.Api;

using Loom.Core.Models;

public static class PostDockerRefreshHandler
{
    public static async Task<IResult> Handle(DockerConnectionService dockerService, CancellationToken ct)
    {
        await dockerService.EnsureConnectedAsync(ct);
        var state = dockerService.State;
        return Results.Ok(new
        {
            connected = state.Status == DockerConnectionStatus.Connected,
            status = state.Status.ToString(),
            version = state.Version,
            reason = state.Reason
        });
    }
}