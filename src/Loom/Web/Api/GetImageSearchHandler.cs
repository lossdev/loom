namespace Loom.Web.Api;

using Loom.Core.Models;

public static class GetImageSearchHandler
{
    public static async Task<IResult> Handle(
        string query,
        DockerConnectionService dockerService,
        DockerHubService dockerHubService,
        CancellationToken ct)
    {
        var localTask = dockerService.SearchLocalImagesAsync(query, ct);
        var hubTask = dockerHubService.SearchAsync(query, ct);
        await Task.WhenAll(localTask, hubTask);

        var local = localTask.Result;
        var hub = hubTask.Result;
        var localNames = local?.ToHashSet() ?? [];

        var results = new List<ImageSearchResult>();

        if (local is not null)
        {
            results.AddRange(local.Select(name =>
                new ImageSearchResult(name, IsLocal: true, IsOfficial: false, Description: null, Stars: null)));
        }

        if (hub is not null)
        {
            results.AddRange(hub
                .Where(r => !localNames.Contains(r.Name))
                .Select(r => new ImageSearchResult(r.Name, IsLocal: false, r.IsOfficial, r.Description, r.Stars)));
        }

        return Results.Ok(new { results });
    }
}
