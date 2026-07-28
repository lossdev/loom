namespace Loom.Web.Api;

public static class LocalDockerApi
{
    public static RouteGroupBuilder MapLocalDockerApi(this RouteGroupBuilder group)
    {
        group.MapGet("/status", GetDockerStatusHandler.Handle);
        group.MapPost("/refresh", PostDockerRefreshHandler.Handle);
        return group;
    }
}