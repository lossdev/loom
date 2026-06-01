namespace Loom.AppHost;

using Aspire.Hosting;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = DistributedApplication.CreateBuilder(args);

        var web = builder.AddProject<Projects.Web>("web");

        builder.AddViteApp("ui", "../UI")
            .WithHttpEndpoint(port: 5173, env: "PORT")
            .WithReference(web)
            .WaitFor(web);

        builder.Build().Run();
    }
}