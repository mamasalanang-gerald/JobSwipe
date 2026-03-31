#!/bin/bash
# EC2 Update Deployment Script
# Run this for subsequent deployments (zero downtime)

set -e

echo "🔄 Starting JobApp Update Deployment..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Pull latest images
echo "📥 Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull backend frontend

# Rolling update - Backend
echo "🔄 Updating backend (zero downtime)..."
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
echo "⏳ Waiting for backend to stabilize..."
sleep 10

# Rolling update - Horizon Worker
echo "🔄 Updating Horizon worker..."
docker-compose -f docker-compose.prod.yml up -d --no-deps horizon
echo "⏳ Waiting for Horizon to stabilize..."
sleep 5

# Rolling update - Frontend
echo "🔄 Updating frontend..."
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend
echo "⏳ Waiting for frontend to stabilize..."
sleep 5

# Cleanup old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -af --filter "until=24h"

# Show status
echo ""
echo "✅ Update Deployment Complete!"
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "🔍 Check logs if needed:"
echo "  docker logs jobapp_backend --tail 50"
echo "  docker logs jobapp_frontend --tail 50"
echo "  docker logs jobapp_horizon --tail 50"
echo ""
