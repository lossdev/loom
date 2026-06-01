namespace Loom.Web.Api;

public static class LoomApi
{
    public static RouteGroupBuilder MapLoomApi(this RouteGroupBuilder group)
    {
        group.MapPost("/compose", ComposeHandler.Handle);
        return group;
    }
}