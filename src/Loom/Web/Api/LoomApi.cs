namespace Loom.Web.Api;

public static class LoomApi
{
    public static RouteGroupBuilder MapLoomApi(this RouteGroupBuilder group)
    {
        group.MapPost("/compose", GetComposeHandler.Handle);
        group.MapGet("/lookup/tags", GetTagsHandler.Handle);
        return group;
    }
}