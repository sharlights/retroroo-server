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
  -e "ssh -i $KEY" \
  ./ "$USER@$HOST:$DEST_PATH"


ssh -i "$KEY" "$USER@$HOST" << EOF
  cd $DEST_PATH
  rm -rf dist
  rm -rf node_modules package-lock.json
  npm install --omit=dev
  npx nest build
  pm2 restart retroroo || pm2 start dist/main.js --name retroroo
  pm2 save
EOF