namespace Loom.Web;

using Loom.Web.Api;

using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;

using Serilog;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Host.UseSerilog((context, config) =>
        {
            config.ReadFrom.Configuration(context.Configuration);
        }, writeToProviders: true);

        // Serilog owns console output; clear the default providers so writeToProviders
        // only forwards to OpenTelemetry instead of also duplicating into the default console logger.
        builder.Logging.ClearProviders();
        builder.Logging.AddOpenTelemetry(logging =>
        {
            logging.IncludeFormattedMessage = true;
            logging.IncludeScopes = true;
        });

        builder.Services.AddOpenTelemetry()
            .WithTracing(tracing => tracing
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation())
            .WithMetrics(metrics => metrics
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddRuntimeInstrumentation());

        if (!string.IsNullOrWhiteSpace(builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]))
        {
            builder.Services.AddOpenTelemetry().UseOtlpExporter();
        }

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSingleton<DockerConnectionService>();
        builder.Services.AddHostedService<DockerHealthCheckBackgroundService>();
        builder.Services.AddHttpClient<DockerHubService>(client =>
        {
            client.BaseAddress = new Uri("https://hub.docker.com/");
            client.Timeout = TimeSpan.FromSeconds(5);
        });

        var app = builder.Build();
        
        // Kick off the check but don't await it — app boots regardless of Docker's presence
        _ = app.Services.GetRequiredService<DockerConnectionService>().EnsureConnectedAsync();

        app.UseDefaultFiles();
        app.UseStaticFiles();
        app.UseRouting();

        app.MapGroup("/api").MapLoomApi();
        app.MapGroup("/localDocker").MapLocalDockerApi();
        app.MapFallbackToFile("index.html");

        app.Run();
    }
}