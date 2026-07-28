namespace Loom.Web;

public class DockerHealthCheckBackgroundService(
    DockerConnectionService dockerService,
    IConfiguration config) : BackgroundService
{
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(
        config.GetValue<int?>("LOOM_LOCAL_DOCKER_HEALTHCHECK_INTERVAL_MINUTES") ?? 3);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await dockerService.EnsureConnectedAsync(stoppingToken);

        using var timer = new PeriodicTimer(_interval);
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await dockerService.EnsureConnectedAsync(stoppingToken);
        }
    }
}