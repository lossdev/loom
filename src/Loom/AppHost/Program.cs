namespace Loom.AppHost;

using Aspire.Hosting;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = DistributedApplication.CreateBuilder(args);
        builder.AddViteApp("ui", "../UI")
            .WithHttpEndpoint(port: 5173, env: "PORT");

        builder.Build().Run();
    }
}