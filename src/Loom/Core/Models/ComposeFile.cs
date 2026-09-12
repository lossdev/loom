namespace Loom.Core.Models;

using YamlDotNet.Serialization;

public class ComposeFile
{
    [YamlMember(Alias = "services")]
    public Dictionary<string, ServiceDefinition> Services { get; set; } = [];

    [YamlMember(Alias = "networks")]
    public Dictionary<string, NetworkDefinition>? Networks { get; set; }
}

public class ServiceDefinition
{
    [YamlMember(Alias = "image")]
    public required string Image { get; set; }

    [YamlMember(Alias = "ports")]
    public List<string>? Ports { get; set; }

    [YamlMember(Alias = "environment")]
    public Dictionary<string, string>? Environment { get; set; }

    [YamlMember(Alias = "networks")]
    public List<string>? Networks { get; set; }
    
    [YamlMember(Alias = "command")]
    public List<string>? Command { get; set; }
    
    [YamlMember(Alias = "entrypoint")]
    public List<string>? Entrypoint { get; set; }
    
    [YamlMember(Alias = "annotations")]
    public Dictionary<string, string>? Annotations { get; set; }
    
    [YamlMember(Alias = "labels")]
    public Dictionary<string, string>? Labels { get; set; }
}

public class NetworkDefinition
{
    [YamlMember(Alias = "driver")]
    public string Driver { get; set; } = NetworkDriver.Bridge;

    [YamlMember(Alias = "attachable")]
    public bool? Attachable { get; set; }
    
    [YamlMember(Alias = "external")]
    public bool? External { get; set; }
}