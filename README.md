# Dough Calculator (Docker)

Current version: **1.3**

A recipe calculator for pizza, bread loaves, and bread-machine doughs.
Enter the number of pieces and weight per piece, and it works out exact
gram amounts for flour, water, salt, yeast, oil, milk, and butter.

## Features

- Gram-accurate dough calculator for pizza, loaf, and bread-machine recipes.
- Save, update, and delete your own recipes per category.
- Short, editable step-by-step instructions (in Swedish) per recipe.
- Proofing and baking timers with an alarm and vibration, tied to each
  recipe's suggested times.
- "Keep screen on" toggle for phone/tablet use in the kitchen.
- Dark mode, following your device's theme.

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

## Install as an App (Android/iOS)

The app is an installable PWA. On Android (Chrome), open the site and use
"Add to Home screen" (or the install prompt) to get a home-screen icon that
opens in its own window, with the last-loaded recipes available offline.
iOS Safari supports the same via Share → "Add to Home Screen".

This requires a secure context: it works out of the box over `localhost`,
but installing/offline support **will not work over plain HTTP on a LAN
address** (e.g. `http://192.168.1.x:3001`) — put the app behind HTTPS (a
reverse proxy with a certificate, or a tunnel like Tailscale/Cloudflare
Tunnel) if you want to install it from another device on your network.

## Updates

### 1.3

- Make the app installable as a PWA: home-screen icon, standalone window,
  and offline access to the last-loaded recipes via a service worker.
  Requires HTTPS (or `localhost`) to install — see "Install as an App"
  above.

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
