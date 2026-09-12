namespace Loom.Core.Models;

public class Network
{
    // Id is passed in from the frontend but not serialized into a docker compose
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Driver { get; set; } = NetworkDriver.Bridge;
    public bool? Attachable { get; set; } = false;
    public bool? External { get; set; } = false;
    public List<Container> Containers { get; set; } = [];
}