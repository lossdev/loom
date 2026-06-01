namespace Loom.Core.Models;

public class Container
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Image { get; set; }
    public int[]? Ports { get; set; }
    public Dictionary<string, string>? Env { get; set; }
    public Dictionary<string, string>? Annotations { get; set; }
    public Dictionary<string, string>? Labels { get; set; }
}