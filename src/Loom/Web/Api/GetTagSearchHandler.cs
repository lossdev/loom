namespace Loom.Web.Api;

using Loom.Core.Models;

public static class GetTagSearchHandler
{
    public static async Task<IResult> Handle(
        string image,
        string? query,
        DockerConnectionService dockerService,
        DockerHubService dockerHubService,
        CancellationToken ct)
    {
        var q = query ?? "";

        var localTask = dockerService.ListLocalTagsAsync(image, ct);
        var hubTask = dockerHubService.SearchTagsAsync(image, q, ct);
        await Task.WhenAll(localTask, hubTask);

        var local = localTask.Result?.AvailableTags?
            .Select(t => t[(t.LastIndexOf(':') + 1)..])
            .Where(t => t.Contains(q, StringComparison.OrdinalIgnoreCase))
            .ToList();
        var hub = hubTask.Result;
        var localNames = local?.ToHashSet() ?? [];

        var results = new List<TagSearchResult>();

        if (local is not null)
        {
            results.AddRange(local.Select(name => new TagSearchResult(name, IsLocal: true)));
        }

        if (hub is not null)
        {
            results.AddRange(hub
                .Where(name => !localNames.Contains(name))
                .Select(name => new TagSearchResult(name, IsLocal: false)));
        }

        return Results.Ok(new { results });
    }
}
