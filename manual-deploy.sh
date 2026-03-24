#!/bin/bash

echo "=== Manual Backend Deployment Script ==="
echo ""

# Configuration
IMAGE_NAME="gm1026/jobapp-backend"
TAG="latest"
FULL_IMAGE="$IMAGE_NAME:$TAG"

echo "Building Docker image: $FULL_IMAGE"
echo ""

# Step 1: Build the Docker image
echo "Step 1: Building Docker image..."
docker build -f Dockerfile -t $FULL_IMAGE .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker build successful!"
echo ""

# Step 2: Push to Docker Hub
echo "Step 2: Pushing to Docker Hub..."
docker push $FULL_IMAGE

if [ $? -ne 0 ]; then
    echo "❌ Docker push failed!"
    echo "Make sure you're logged in: docker login"
    exit 1
fi

echo "✅ Docker push successful!"
echo ""

# Step 3: Instructions for Render
echo "=== Next Steps ==="
echo ""
echo "1. Go to Render Dashboard: https://dashboard.render.com"
echo "2. Find your 'jobapp-backend-latest' service"
echo "3. Click 'Manual Deploy' → 'Deploy latest commit'"
echo "4. Wait for deployment to complete"
echo ""
echo "5. Check the logs for these messages:"
echo "   - '=== Starting JobApp Backend ==='"
echo "   - 'Clearing all caches...'"
echo "   - 'Setting up MongoDB collections...'"
echo "   - 'MongoDB setup completed successfully!'"
echo ""
echo "6. Test the endpoints:"
echo "   curl https://jobapp-backend-latest.onrender.com/api/health"
echo "   curl https://jobapp-backend-latest.onrender.com/api/debug/database"
echo ""
echo "=== Deployment Complete ==="
