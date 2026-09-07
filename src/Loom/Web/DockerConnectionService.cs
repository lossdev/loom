namespace Loom.Web;

using Loom.Core.Models;

using Docker.DotNet;
using Docker.DotNet.Models;

public class DockerConnectionService
{
    private readonly IConfiguration _config;
    private readonly ILogger<DockerConnectionService> _logger;
    private readonly bool _disabled;
    private DockerClient? _client;
    private readonly SemaphoreSlim _lock = new(initialCount: 1, maxCount: 1);

    public DockerConnectionState State { get; private set; }

    public DockerConnectionService(ILogger<DockerConnectionService> logger, IConfiguration config)
    {
        this._logger = logger;
        this._config = config;
        this._disabled = config.GetValue<bool>("LOOM_LOCAL_DOCKER_DISABLED");

        this.State = this._disabled
            ? new(DockerConnectionStatus.Disabled, Reason: "Local Docker integration disabled by configuration.")
            : new(DockerConnectionStatus.NotFound);
    }
    
    public async Task EnsureConnectedAsync(CancellationToken ct = default)
    {
        if (this._disabled) return;

        // Prevent overlapping checks from the timer and a manual refresh firing at once
        if (!await this._lock.WaitAsync(0, ct)) return;

        try
        {
            // Try the existing client first, if we have one
            if (this._client is not null)
            {
                var (ok, version) = await PingAsync(this._client, ct);
                if (ok)
                {
                    this.State = new(DockerConnectionStatus.Connected, Version: version);
                    this._logger.LogInformation("[HEALTHY] Docker daemon health check successful.");
                    return;
                }
            }

            // Existing client is dead or missing — try building a fresh one
            var socketPath = ResolveDockerSocket();
            if (socketPath is null)
            {
                this._client = null;
                this.State = new(DockerConnectionStatus.NotFound, Reason: "No Docker socket found on this system.");
                this._logger.LogWarning("Docker daemon unreachable.");
                return;
            }

            var candidate = new DockerClientConfiguration(new Uri(socketPath)).CreateClient();
            var (candidateOk, candidateVersion) = await PingAsync(candidate, ct);
            if (candidateOk)
            {
                this._client = candidate;
                this.State = new(DockerConnectionStatus.Connected, Version: candidateVersion);
                this._logger.LogInformation("Successfully connected to the Docker daemon (version: {CandidateVersion}).", candidateVersion);
                return;
            }

            // Fresh client also failed
            _client = null;
            this.State = new(DockerConnectionStatus.Error, Reason: "Docker daemon unreachable.");
            this._logger.LogError("Could not connect to the Docker daemon.");
        }
        finally
        {
            this._lock.Release();
        }
    }
    
    /// <summary>
    /// Checks for an exact image:tag match on the local daemon.
    /// Returns null if Docker isn't connected.
    /// </summary>
    public async Task<LocalImageResult?> InspectLocalImageAsync(string image, string tag, CancellationToken ct = default)
    {
        if (this.State.Status != DockerConnectionStatus.Connected || this._client is null)
            return null;

        try
        {
            var inspect = await this._client.Images.InspectImageAsync($"{image}:{tag}", ct);
            var builtLocally = inspect.RepoDigests is null || inspect.RepoDigests.Count == 0;

            return new LocalImageResult(
                Exists: true,
                Tag: tag,
                Created: inspect.Created,
                BuiltLocally: builtLocally,
                AvailableTags: null);
        }
        catch (DockerImageNotFoundException)
        {
            return new LocalImageResult(
                Exists: false,
                Tag: tag,
                Created: null,
                BuiltLocally: null,
                AvailableTags: null);
        }
    }
    
    /// <summary>
    /// Lists all local tags matching the given image name.
    /// Returns null if Docker isn't connected.
    /// </summary>
    public async Task<LocalImageResult?> ListLocalTagsAsync(string image, CancellationToken ct = default)
    {
        if (this.State.Status != DockerConnectionStatus.Connected || this._client is null)
            return null;

        var images = await this._client.Images.ListImagesAsync(new ImagesListParameters
        {
            Filters = new Dictionary<string, IDictionary<string, bool>>
            {
                ["dangling"] = new Dictionary<string, bool> { ["false"] = true },
                ["reference"] = new Dictionary<string, bool> { [$"{image}:*"] = true }
            }
        }, ct);

        var tags = images
            .SelectMany(i => i.RepoTags ?? [])
            .Where(t => t != "<none>:<none>")
            .ToList();

        return new LocalImageResult(
            Exists: tags.Count > 0,
            Tag: null,
            Created: null,
            BuiltLocally: null,
            AvailableTags: tags);
    }
    
    /// <summary>
    /// Searches locally-pulled images for repo names containing the given substring.
    /// Returns null if Docker isn't connected.
    /// </summary>
    public async Task<IReadOnlyList<string>?> SearchLocalImagesAsync(string query, CancellationToken ct = default)
    {
        if (this.State.Status != DockerConnectionStatus.Connected || this._client is null)
            return null;

        var images = await this._client.Images.ListImagesAsync(new ImagesListParameters
        {
            Filters = new Dictionary<string, IDictionary<string, bool>>
            {
                ["dangling"] = new Dictionary<string, bool> { ["false"] = true },
                ["reference"] = new Dictionary<string, bool> { [$"*{query}*"] = true }
            }
        }, ct);

        return images
            .SelectMany(i => i.RepoTags ?? [])
            .Where(t => t != "<none>:<none>")
            .Select(t => t[..t.LastIndexOf(':')])
            .Distinct()
            .ToList();
    }

    private void SetState(DockerConnectionState newState, DockerConnectionStatus previousStatus)
    {
        this.State = newState;

        if (newState.Status != previousStatus)
        {
            this._logger.LogInformation(
                "Docker connection status changed: {PreviousStatus} -> {NewStatus} ({Reason})",
                previousStatus, newState.Status, newState.Reason ?? newState.Version ?? "n/a");
        }
    }

    private static async Task<(bool Success, string? Version)>PingAsync(DockerClient client, CancellationToken ct)
    {
        try
        {
            var result = await client.System.GetVersionAsync(ct);
            return (true, result.Version);
        }
        catch
        {
            return (false, null);
        }
    }

    private static string? ResolveDockerSocket()
    {
        if (OperatingSystem.IsWindows())
            return "npipe://./pipe/docker_engine";

        if (File.Exists("/var/run/docker.sock"))
            return "unix:///var/run/docker.sock";

        var userSocket = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
            ".docker", "run", "docker.sock");

        return File.Exists(userSocket) ? $"unix://{userSocket}" : null;
    }
}