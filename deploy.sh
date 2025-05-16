#!/bin/bash

# Variables
KEY="~/.ssh/cttc-aws-key-pair.pem"
USER="ec2-user"
HOST="ec2-54-206-214-147.ap-southeast-2.compute.amazonaws.com"
DEST_PATH="~/retroroo-server"

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