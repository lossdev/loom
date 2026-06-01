namespace Loom.Core.Serialization;

using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;
using Loom.Core.Models;

public static class ComposeSerializer
{
    public static string Serialize(Compose compose)
    {
        var composeFile = Map(compose);
        
        var serializer = new SerializerBuilder()
            .WithNamingConvention(CamelCaseNamingConvention.Instance)
            .ConfigureDefaultValuesHandling(DefaultValuesHandling.OmitNull)
            .Build();

        return serializer.Serialize(composeFile);
    }

    private static ComposeFile Map(Compose compose)
    {
        var services = new Dictionary<string, ServiceDefinition>();

        foreach (var container in compose.Containers)
        {
            services[container.Name] = MapService(container, networks: null);
        }

        foreach (var network in compose.Networks)
        {
            foreach (var container in network.Containers)
            {
                services[container.Name] = MapService(container, [network.Name]);
            }
        }

        var networks = compose.Networks.Count > 0
            ? compose.Networks.ToDictionary(
                n => n.Name,
                n => new NetworkDefinition
                {
                    Driver = n.Driver,
                    Attachable = n.Attachable ?? null
                })
            : null;

        return new ComposeFile
        {
            Services = services,
            Networks = networks
        };
    }

    private static ServiceDefinition MapService(Container container, List<string>? networks)
    {
        return new ServiceDefinition
        {
            Image = container.Image,
            Ports = container.Ports is { Length: > 0 }
                ? container.Ports.Select(p => $"{p}:{p}").ToList()
                : null,
            Environment = container.Env?.Count > 0 ? container.Env : null,
            Networks = networks
        };
    }
}