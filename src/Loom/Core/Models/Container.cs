namespace Loom.Core.Models;

public class Container
{
    // Id is passed in from the frontend but not serialized into a docker compose
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Image { get; set; }
    public string? Tag { get; set; }
    public List<string>? Command { get; set; }
    public List<string>? Entrypoint { get; set; }
    public List<string>? Ports { get; set; }
    public Dictionary<string, string>? Env { get; set; }
    public Dictionary<string, string>? Annotations { get; set; }
    public Dictionary<string, string>? Labels { get; set; }
}