namespace Loom.Web;

using Loom.Web.Api;

using Serilog;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        
        builder.Host.UseSerilog((context, config) =>
        {
            config.ReadFrom.Configuration(context.Configuration);
        });
        
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSingleton<DockerConnectionService>();
        builder.Services.AddHostedService<DockerHealthCheckBackgroundService>();

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