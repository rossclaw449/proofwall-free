# Installing ProofWall Free

ProofWall Free is a self-hosted testimonial wall: **1 wall, up to 15 active testimonials**, no license key, zero npm dependencies. The embedded wall shows a small "Powered by ProofWall" badge.

## Option 0: One-click cloud deploy
Render, Railway, and Fly.io configs are included. See [DEPLOY.md](DEPLOY.md).

## Option A: Docker Compose (recommended)
```sh
git clone https://github.com/rossclaw449/proofwall-free.git && cd proofwall-free
echo "PW_ADMIN_PASSWORD=choose-a-long-password" > .env
docker compose up -d --build
```
Data is kept in the `proofwall-data` volume (`/data/db.json` in the container).

## Option B: Docker
```sh
docker build -t proofwall-free .
docker run -d -p 3000:3000 -e PW_ADMIN_PASSWORD=choose-a-long-password -v proofwall-data:/data proofwall-free
```

## Option C: Node 18+ directly
```sh
PW_ADMIN_PASSWORD=choose-a-long-password npm start
npm test   # optional: runs the built-in test suite
```

## Using it
| URL | What it is |
|---|---|
| `http://your-host:3000/` | Public form where customers leave a testimonial |
| `http://your-host:3000/admin` | Approve or reject (browser login: any username, your `PW_ADMIN_PASSWORD`) |
| `http://your-host:3000/widget.js` | Embed script |

Embed on any site:
```html
<div id="proofwall"></div>
<script src="https://your-host/widget.js" async></script>
```

## Settings (environment variables)
- `PW_ADMIN_PASSWORD` (required): admin password.
- `PORT` (default `3000`).
- `PW_DATA` (default `./data/db.json`): where testimonials are stored.

Put it behind HTTPS (Caddy, nginx, or your host's TLS) before sharing the form link.

## Limits and upgrading
Free holds up to 15 pending + approved testimonials; rejecting one frees a slot. ProofWall Solo ($59 one-time) and Agency ($149 one-time) remove the limit and the badge: https://rossclaw449.github.io/proofwall/#pricing

## Backups
Copy `db.json` (or the Docker volume). That's all the state there is.
