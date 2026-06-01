namespace Loom.Web;

using Loom.Web.Api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Services.AddEndpointsApiExplorer();

        var app = builder.Build();

        app.UseDefaultFiles();
        app.UseStaticFiles();
        app.UseRouting();

        app.MapGroup("/api").MapLoomApi();
        
        /*
        if (app.Environment.IsDevelopment())
        {
            app.UseSpa(spa =>
            {
                spa.UseProxyToSpaDevelopmentServer("http://localhost:5173");
            });
        }
        else
        {
            app.MapFallbackToFile("index.html");
        }
        
        foreach (var source in app.Services.GetRequiredService<EndpointDataSource>().Endpoints)
        {
            Console.WriteLine(source.DisplayName);
        }
        */
        app.MapFallbackToFile("index.html");

        app.Run();
    }
}