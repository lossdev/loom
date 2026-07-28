namespace Loom.Web.Api;

public static class GetTagsHandler
{
    public static async Task<IResult> Handle(
        string image,
        string? tag,
        DockerConnectionService dockerService,
        CancellationToken ct)
    {
        var local = tag is not null
            ? await dockerService.InspectLocalImageAsync(image, tag, ct)
            : await dockerService.ListLocalTagsAsync(image, ct);

        return Results.Ok(new
        {
            local
        });
    }
}