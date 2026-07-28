namespace Loom.Web.Api;

using Loom.Core.Models;

public static class GetDockerStatusHandler
{
    public static IResult Handle(DockerConnectionService dockerService)
    {
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