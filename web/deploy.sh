#!/bin/bash
# Pure Olentia Web - Quick Deploy Script
# Kullanım: ./deploy.sh

set -e

SERVER="root@213.159.6.225"
PORT="23422"
REMOTE_DIR="/var/www/pureolentia/web"
LOCAL_DIR="/Users/emre/Desktop/pure/web"

echo "🚀 Pure Olentia Web Deploy Basliyor..."

# 1. Lokal build
echo "📦 Building locally..."
cd "$LOCAL_DIR"
npm run build

# 2. Upload to server
echo "📤 Uploading to server..."
rsync -avz --progress \
  -e "ssh -p $PORT" \
  --exclude 'node_modules' \
  --exclude '.next/cache' \
  --exclude '.git' \
  --exclude '.env.local' \
  --exclude 'deploy.sh' \
  "$LOCAL_DIR/" \
  "$SERVER:$REMOTE_DIR/"

# 3. Remote commands
echo "🔧 Installing deps and restarting..."
ssh -p $PORT $SERVER << 'EOF'
cd /var/www/pureolentia/web
npm ci --production=false
# Build already uploaded, no need to rebuild unless source differs

# Start or restart
if pm2 describe pureolentia-web > /dev/null 2>&1; then
  pm2 restart pureolentia-web
else
  pm2 start ecosystem.config.js
  pm2 save
fi

pm2 logs pureolentia-web --lines 10 --nostream
EOF

echo "✅ Deploy tamamlandi!"
echo "🌐 https://pureolentia.com"
