# Dough Calculator (Docker)

Current version: **1.2**

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

## Updates

### 1.2

- Add proofing and baking timers per recipe, with a countdown, progress bar,
  an audible alarm, and vibration on supported devices. The screen is kept
  awake automatically while a timer runs, on top of the manual toggle.
- Add short, editable step-by-step instructions (in Swedish) per recipe,
  shown as a formatted list above the timers.
- Redesign the UI: dark mode (follows system preference), a two-column
  responsive layout, refreshed typography/spacing, and the recipe-editing
  fields tucked into a collapsible panel so the calculator, instructions,
  and timers are front and center.
- Pizza recipes no longer show or use milk/butter percentages, since
  they're not part of a pizza dough — enforced both in the UI and by the
  API's recipe validation.

### 1.1

- Add a "keep screen on" toggle (Screen Wake Lock API) so the display doesn't
  sleep mid-recipe on phones and tablets. Supported in Chrome/Edge, Android
  Firefox, and Safari 16.4+; requires a secure context (HTTPS, or
  `localhost`), so it will not work over plain HTTP on a LAN address.
- Show the app version in the UI header.

### 0.5.0

- Package the app as a Docker image (`Dockerfile`, `docker-compose.yml`).
- Add a GitHub Actions workflow to build, scan (Trivy, fails on HIGH/CRITICAL),
  and publish the image to GHCR on every push to `main` and on version tags.
- Pin all GitHub Actions in the publish workflow to commit SHAs.
