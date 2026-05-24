# Dough Calculator (Docker)

This project is published as a ready-to-run Docker image.

Image:

- `ghcr.io/socawi-ai/dough:latest`

App default port:

- `3001`

## Quick Start

```bash
docker pull ghcr.io/socawi-ai/dough:latest
docker run -d --name dough -p 3001:3001 --restart unless-stopped ghcr.io/socawi-ai/dough:latest
```

Open in browser:

- `http://<your-server-ip>:3001`

## Run with Docker Compose

Use the included `docker-compose.yml`:

```bash
docker compose pull
docker compose up -d
```

Stop:

```bash
docker compose down
```

## Update to Latest Image

### Docker run setup

```bash
docker pull ghcr.io/socawi-ai/dough:latest
docker stop dough
docker rm dough
docker run -d --name dough -p 3001:3001 --restart unless-stopped ghcr.io/socawi-ai/dough:latest
```

### Docker Compose setup

```bash
docker compose pull
docker compose up -d
```

## Logs and Status

```bash
docker ps
docker logs -f dough
```
