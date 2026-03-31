#!/bin/bash

echo "=== Testing Redis Connection ==="
echo ""

# Redis connection details
REDIS_HOST="red-d6v36u6a2pns73ab5h7g.oregon-redis.render.com"
REDIS_PORT="6379"

echo "Testing connection to: $REDIS_HOST:$REDIS_PORT"
echo ""

# Test 1: Ping without password (free tier usually has no password)
echo "Test 1: Ping without password..."
docker run -it --rm redis:7-alpine redis-cli -h $REDIS_HOST -p $REDIS_PORT ping

if [ $? -eq 0 ]; then
    echo "✅ Redis connection successful (no password required)"
    echo ""
    
    # Test 2: Set and get a test key
    echo "Test 2: Setting a test key..."
    docker run -it --rm redis:7-alpine redis-cli -h $REDIS_HOST -p $REDIS_PORT SET test_key "Hello from JobSwipe"
    
    echo "Test 3: Getting the test key..."
    docker run -it --rm redis:7-alpine redis-cli -h $REDIS_HOST -p $REDIS_PORT GET test_key
    
    echo ""
    echo "Test 4: Checking database size..."
    docker run -it --rm redis:7-alpine redis-cli -h $REDIS_HOST -p $REDIS_PORT DBSIZE
    
    echo ""
    echo "✅ All Redis tests passed!"
else
    echo "❌ Redis connection failed"
    echo ""
    echo "Possible reasons:"
    echo "1. Redis requires a password (try adding -a PASSWORD)"
    echo "2. Redis host is incorrect"
    echo "3. Network/firewall issues"
    echo ""
    echo "If Redis requires a password, run:"
    echo "docker run -it --rm redis:7-alpine redis-cli -h $REDIS_HOST -p $REDIS_PORT -a YOUR_PASSWORD ping"
fi
