# Build Swarlehtaire Docker Setup from Releases

Run Swarlehtaire in a Docker container using nginx. This Dockerfile downloads pre-built releases.

For building from source, use the main [Dockerfile](../../Dockerfile) in the project root.

## Quick Start

Download the [Dockerfile](./Dockerfile) to your local machine.
In the same directory, build and run the Docker container:

```bash
docker build -t swarlehtaire .
docker run -d -p 8080:80 swarlehtaire
```

Then open [http://localhost:8080](http://localhost:8080).

## Customization

Override the version at build time:

```bash
docker build --build-arg SWARLEHTAIRE_VERSION=0.2.0 -t swarlehtaire .
```

Change the port to your liking:

```bash
docker run -d -p 9090:80 swarlehtaire
```
