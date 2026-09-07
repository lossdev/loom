namespace Loom.Web;

using System.Net.Http.Json;
using System.Text.Json.Serialization;

using Loom.Core.Models;

public class DockerHubService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<DockerHubService> _logger;

    public DockerHubService(HttpClient httpClient, ILogger<DockerHubService> logger)
    {
        this._httpClient = httpClient;
        this._logger = logger;
    }

    public async Task<IReadOnlyList<DockerHubImageResult>?> SearchAsync(string query, CancellationToken ct = default)
    {
        try
        {
            var response = await this._httpClient.GetFromJsonAsync<SearchResponse>(
                $"v2/search/repositories/?query={Uri.EscapeDataString(query)}&page_size=10", ct);

            return response?.Results
                .Select(r => new DockerHubImageResult(r.RepoName, r.ShortDescription, r.StarCount, r.IsOfficial))
                .ToList();
        }
        catch (Exception ex)
        {
            this._logger.LogWarning(ex, "Docker Hub search failed for query {Query}.", query);
            return null;
        }
    }

    public async Task<IReadOnlyList<string>?> SearchTagsAsync(string image, string query, CancellationToken ct = default)
    {
        try
        {
            var repoPath = image.Contains('/') ? image : $"library/{image}";
            var response = await this._httpClient.GetFromJsonAsync<HubTagResponse>(
                $"v2/repositories/{repoPath}/tags/?name={Uri.EscapeDataString(query)}&page_size=10", ct);

            return response?.Results.Select(r => r.Name).ToList();
        }
        catch (Exception ex)
        {
            this._logger.LogWarning(ex, "Docker Hub tag search failed for {Image}:{Query}.", image, query);
            return null;
        }
    }

    private record SearchResponse(List<SearchResult> Results);

    private record SearchResult(
        [property: JsonPropertyName("repo_name")] string RepoName,
        [property: JsonPropertyName("short_description")] string? ShortDescription,
        [property: JsonPropertyName("star_count")] int StarCount,
        [property: JsonPropertyName("is_official")] bool IsOfficial);

    private record HubTagResponse(List<HubTagResult> Results);

    private record HubTagResult([property: JsonPropertyName("name")] string Name);
}
