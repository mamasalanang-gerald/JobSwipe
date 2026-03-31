#!/bin/bash
# Initial EC2 Deployment Script
# Run this for the first deployment only

set -e

echo "🚀 Starting Initial JobApp Deployment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production with all required variables"
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Create Docker network if it doesn't exist
echo "🔗 Creating Docker network..."
docker network create jobapp_network 2>/dev/null || echo "Network already exists"

# Pull latest images
echo "📥 Pulling Docker images..."
docker pull ${DOCKER_HUB_USERNAME}/jobapp-backend:latest
docker pull ${DOCKER_HUB_USERNAME}/jobapp-web:latest

# Start databases first
echo "🗄️ Starting databases..."
docker-compose -f docker-compose.prod.yml up -d postgres mongodb redis

# Wait for databases to be healthy
echo "⏳ Waiting for databases to be ready..."
sleep 30

# Check database health
echo "🔍 Checking database health..."
docker-compose -f docker-compose.prod.yml ps

# Start backend (will run migrations)
echo "🚀 Starting backend..."
docker-compose -f docker-compose.prod.yml up -d backend

# Wait for backend to initialize
echo "⏳ Waiting for backend to initialize..."
sleep 20

# Start horizon worker
echo "⚙️ Starting Horizon worker..."
docker-compose -f docker-compose.prod.yml up -d horizon

# Start frontend
echo "🌐 Starting frontend..."
docker-compose -f docker-compose.prod.yml up -d frontend

# Show status
echo ""
echo "✅ Initial Deployment Complete!"
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "🔍 Check logs with:"
echo "  docker logs jobapp_backend"
echo "  docker logs jobapp_frontend"
echo "  docker logs jobapp_horizon"
echo ""
echo "🌐 Access your application:"
echo "  Backend: http://localhost:8080/api/health"
echo "  Frontend: http://localhost:3000"
echo ""
