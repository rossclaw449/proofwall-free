#!/bin/sh
# Hosted volumes (Fly, Render, Railway) are usually mounted owned by root, so the
# "node" user could not write db.json. Fix ownership of the data folder, then drop privileges.
set -e
DATA_DIR=$(dirname "${PW_DATA:-/data/db.json}")
if [ "$(id -u)" = "0" ]; then
  mkdir -p "$DATA_DIR"
  chown -R node:node "$DATA_DIR"
  exec su-exec node "$@"
fi
exec "$@"
