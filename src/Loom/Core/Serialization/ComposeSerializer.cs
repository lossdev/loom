namespace Loom.Core.Serialization;

using Loom.Core.Models;

using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

public static class ComposeSerializer
{
    public static string Serialize(Compose compose)
    {
        var composeFile = Map(compose);
        
        var serializer = new SerializerBuilder()
            .WithNamingConvention(CamelCaseNamingConvention.Instance)
            .ConfigureDefaultValuesHandling(DefaultValuesHandling.OmitNull)
            // YAML 1.1 resolves HOST:CONTAINER as a base-60 integer whenever the
            // container port is under 60, so a bare 2222:22 loads as a number rather
            // than a port mapping. Quoting keeps such entries strings for the 1.1
            // parsers still in circulation (PyYAML, Psych, go-yaml v2).
            .WithQuotingNecessaryStrings(quoteYaml1_1Strings: true)
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
                    Attachable = n.Attachable ?? null,
                    External = n.External ?? null,
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
            Image = container.Tag is { Length: > 0 } ? $"{container.Image}:{container.Tag}" : container.Image,
            Ports = container.Ports?.Count > 0
                ? container.Ports.Select(ExpandPort).ToList()
                : null,
            Environment = container.Env?.Count > 0 ? container.Env : null,
            Networks = networks,
            Command = container.Command?.Count > 0 ? container.Command : null,
            Entrypoint = container.Entrypoint?.Count > 0 ? container.Entrypoint : null,
            Labels = container.Labels?.Count > 0 ? container.Labels : null,
            Annotations = container.Annotations?.Count > 0 ? container.Annotations : null,
        };
    }

    // A bare port is shorthand for publishing on the identical host port; anything
    // already carrying a host binding (host:container, ip:host:container) is passed
    // through untouched.
    private static string ExpandPort(string port) =>
        port.Contains(':') ? port : $"{port}:{port}";
}