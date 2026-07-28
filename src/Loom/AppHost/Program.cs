namespace Loom.AppHost;

using Aspire.Hosting;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = DistributedApplication.CreateBuilder(args);
        var web = builder.AddProject<Projects.Web>("web")
            .WithEnvironment("LOOM_LOCAL_DOCKER_DISABLED", "false")
            .WithEnvironment("LOOM_LOCAL_DOCKER_HEALTHCHECK_INTERVAL_MINUTES", "3");

        builder.AddViteApp("ui", "../UI")
            .WithHttpEndpoint(port: 5173, env: "PORT")
            .WithReference(web)
            .WaitFor(web);

        builder.Build().Run();
    }
}