# One-click and one-command deploys

ProofWall Free is a single Node process plus one JSON file (`/data/db.json`). Every host below builds the included `Dockerfile` and needs two things from you:

1. **`PW_ADMIN_PASSWORD`**: a long password for `/admin`.
2. **A persistent volume at `/data`**. Without one, your testimonials are wiped on every redeploy.

The container fixes the volume's ownership at startup and then runs as the unprivileged `node` user (see `proofwall-entrypoint.sh`).

## Render (Blueprint, `render.yaml`)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/rossclaw449/proofwall-free)

1. Click the button (or go to New > Blueprint and pick your fork).
2. Enter `PW_ADMIN_PASSWORD` when Render asks for it.
3. The Blueprint creates a web service on the **Starter** instance with a 1 GB disk at `/data`. Render only attaches disks to paid instances. You can switch to the free instance, but your data won't survive a redeploy.

## Railway (`railway.json`)
1. In Railway: New Project > Deploy from GitHub repo, and pick your fork of `proofwall-free`. `railway.json` tells Railway to build the Dockerfile and health-check `/`.
2. Variables: add `PW_ADMIN_PASSWORD`, plus `PW_DATA=/data/db.json`.
3. Right-click the service > Attach volume, with mount path `/data`.
4. Settings > Networking > Generate domain.

CLI alternative: `railway init && railway up`, then add the variable and the volume as above.

## Fly.io (`fly.toml`)
```sh
fly launch --copy-config --no-deploy        # choose a unique app name
fly volumes create proofwall_data --size 1  # same region as the app
fly secrets set PW_ADMIN_PASSWORD='choose-a-long-password'
fly deploy
```
Machines stop when idle and start again on the next request (`auto_stop_machines`). Keep a single machine, because the JSON file lives on one volume.

## After deploying
- `https://<your-app>/`: the collect form you share with customers
- `https://<your-app>/admin`: approve or reject (any username plus your password)
- Embed code: `<div id="proofwall"></div><script src="https://<your-app>/widget.js" async></script>`

Back up by downloading `/data/db.json` now and then. On Fly: `fly ssh sftp get /data/db.json`.

Hosting prices and free-tier rules change often, so check each host's pricing page before you choose one.
