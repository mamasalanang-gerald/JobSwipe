#!/bin/bash
# EC2 Rollback Script
# Rolls back to a previous version

set -e

echo "⏪ JobApp Rollback Script"
echo ""

# Check if commit SHA is provided
if [ -z "$1" ]; then
    echo "Usage: ./ec2-rollback.sh <commit-sha>"
    echo ""
    echo "Example: ./ec2-rollback.sh abc1234"
    echo ""
    echo "Or use 'latest' to pull the current latest tag"
    exit 1
fi

COMMIT_SHA=$1

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

echo "🔄 Rolling back to version: $COMMIT_SHA"
echo ""

# Pull specific version
if [ "$COMMIT_SHA" == "latest" ]; then
    echo "📥 Pulling latest images..."
    docker pull ${DOCKER_HUB_USERNAME}/jobapp-backend:latest
    docker pull ${DOCKER_HUB_USERNAME}/jobapp-web:latest
else
    echo "📥 Pulling images for commit $COMMIT_SHA..."
    docker pull ${DOCKER_HUB_USERNAME}/jobapp-backend:${COMMIT_SHA}
    docker pull ${DOCKER_HUB_USERNAME}/jobapp-web:${COMMIT_SHA}
    
    # Tag as latest for docker-compose
    docker tag ${DOCKER_HUB_USERNAME}/jobapp-backend:${COMMIT_SHA} ${DOCKER_HUB_USERNAME}/jobapp-backend:latest
    docker tag ${DOCKER_HUB_USERNAME}/jobapp-web:${COMMIT_SHA} ${DOCKER_HUB_USERNAME}/jobapp-web:latest
fi

# Stop services
echo "🛑 Stopping services..."
docker-compose -f docker-compose.prod.yml down backend frontend horizon

# Start with rolled back version
echo "🚀 Starting services with rolled back version..."
docker-compose -f docker-compose.prod.yml up -d backend
sleep 10

docker-compose -f docker-compose.prod.yml up -d horizon
sleep 5

docker-compose -f docker-compose.prod.yml up -d frontend
sleep 5

# Show status
echo ""
echo "✅ Rollback Complete!"
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "🔍 Check logs:"
echo "  docker logs jobapp_backend --tail 50"
echo "  docker logs jobapp_frontend --tail 50"
echo ""
