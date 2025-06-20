#!/bin/bash

# Variables
KEY="~/.ssh/cttc-aws-key-pair.pem"
USER="ec2-user"
HOST="api.retroroo.com.au"
DEST_PATH="/opt/retroroo"

# Rsync options
# -a: archive mode (recursive + preserves permissions)
# -v: verbose
# -e: use SSH with specified key
# --exclude: directories to skip
rsync -av \
  --exclude 'dist' \
  --exclude 'node_modules' \
  --exclude '.env.dev' \
  -e "ssh -i $KEY" \
  ./ "$USER@$HOST:$DEST_PATH"

ssh -i "$KEY" "$USER@$HOST" << EOF
  set -e
  cd $DEST_PATH
  rm -rf dist
  rm -rf node_modules package-lock.json
  npm install --omit=dev
  NODE_ENV=prod node node_modules/@nestjs/cli/bin/nest.js build
  pm2 delete retroroo || true
  NODE_ENV=prod pm2 start dist/main.js --name retroroo
  pm2 save
EOF