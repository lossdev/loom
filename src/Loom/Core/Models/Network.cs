namespace Loom.Core.Models;

public class Network
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Driver { get; set; } = NetworkDriver.Bridge;
    public bool? Attachable { get; set; } = false;
    public List<Container> Containers { get; set; } = [];
}