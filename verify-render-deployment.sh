#!/bin/bash

# Render Deployment Verification Script
# This script helps verify that your Render deployment is working correctly

BACKEND_URL="https://jobapp-backend-latest.onrender.com"
API_VERSION="v1"

echo "=========================================="
echo "Render Deployment Verification"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1. Testing Health Endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed (HTTP $HEALTH_RESPONSE)${NC}"
fi
echo ""

# Test 2: API Base Endpoint
echo "2. Testing API Base Endpoint..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/$API_VERSION")
if [ "$API_RESPONSE" = "200" ] || [ "$API_RESPONSE" = "404" ]; then
    echo -e "${GREEN}✓ API is reachable${NC}"
else
    echo -e "${RED}✗ API is not reachable (HTTP $API_RESPONSE)${NC}"
fi
echo ""

# Test 3: Register Endpoint (Check if migrations ran)
echo "3. Testing User Registration (verifies PostgreSQL tables exist)..."
REGISTER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/$API_VERSION/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "password": "TestPassword123!",
    "password_confirmation": "TestPassword123!",
    "role": "applicant"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "error"; then
    ERROR_MSG=$(echo "$REGISTER_RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    if echo "$ERROR_MSG" | grep -q "table\|relation\|column"; then
        echo -e "${RED}✗ Database tables missing - migrations didn't run!${NC}"
        echo -e "${YELLOW}Error: $ERROR_MSG${NC}"
    else
        echo -e "${YELLOW}⚠ Registration failed but tables exist${NC}"
        echo -e "${YELLOW}Error: $ERROR_MSG${NC}"
    fi
elif echo "$REGISTER_RESPONSE" | grep -q "success\|token\|user"; then
    echo -e "${GREEN}✓ Registration works - PostgreSQL tables exist!${NC}"
else
    echo -e "${YELLOW}⚠ Unexpected response${NC}"
    echo "$REGISTER_RESPONSE"
fi
echo ""

# Test 4: Check if MongoDB is accessible (indirect test)
echo "4. Testing MongoDB Connection (indirect)..."
echo -e "${YELLOW}Note: MongoDB can only be verified through application logs${NC}"
echo -e "${YELLOW}Check Render logs for: 'MongoDB setup completed successfully'${NC}"
echo ""

# Summary
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. If health check failed: Check Render service logs"
echo "2. If registration failed with table errors: Run migrations manually"
echo "3. Check Render logs for migration output"
echo ""
echo "Manual Migration Command (in Render Shell):"
echo "  cd /var/www/html && php artisan migrate --force && php artisan mongo:setup"
echo ""
echo "View Logs:"
echo "  Render Dashboard → jobapp-backend-latest → Logs"
echo ""
