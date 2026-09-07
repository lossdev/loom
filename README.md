<p>
    <img width="85%" src="loom-readme-banner.png" alt="Logo"
 </p>

 # loom

 ## What Loom Does
 Loom lets you visually create a deployment spec, and then generate a Docker Compose or (coming soon™️) Kubernetes Helm chart given that deployment.
 Hopefully useful for people like me that use the docker-compose or Helm chart spec often enough to need to deploy things, but not often enough to actually
 remember the syntax to do so ..

 ## Usage
 Loom is a fully self-contained Aspire app, with a nodejs frontend and an ASPNET backend. I'd recommend opening `loom.slnx` in your preferred IDE (VisualStudio, Rider, etc), and then simply hit play. Or, from the command line at the top-level directory:

 ```bash
 $ dotnet run --project src/Loom/AppHost
 ```

 This will start the `UI` and `Web` projects simultaneously. This project targets .NET10, so make sure you have the [latest .NET10 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/10.0).