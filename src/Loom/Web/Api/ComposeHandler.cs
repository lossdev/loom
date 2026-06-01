namespace Loom.Web.Api;

using Loom.Core.Models;
using Loom.Core.Serialization;

public static class ComposeHandler
{
    public static IResult Handle(Compose compose)
    {
        string composeFile = ComposeSerializer.Serialize(compose);
        return Results.Text(composeFile, "application/yaml");
    }
}