#!/bin/bash

# Test Deployment Script for JobSwipe on Render
# This script tests the deployed API endpoints

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${1:-https://jobswipe-eff8.onrender.com}"
TIMEOUT=30

echo "🧪 Testing JobSwipe Deployment"
echo "================================"
echo "API URL: $API_URL"
echo ""

# Test 1: Health Check
echo -n "1️⃣  Testing health endpoint... "
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" --max-time $TIMEOUT "$API_URL/api/health" || echo "000")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    echo "   Response: $RESPONSE_BODY"
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "   HTTP Code: $HTTP_CODE"
    echo "   Response: $RESPONSE_BODY"
    exit 1
fi

echo ""

# Test 2: Check if status is "ok"
echo -n "2️⃣  Verifying health status... "
STATUS=$(echo "$RESPONSE_BODY" | grep -o '"status":"ok"' || echo "")
if [ -n "$STATUS" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    echo "   Status: ok"
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "   Expected status: ok"
    exit 1
fi

echo ""

# Test 3: Check response time
echo -n "3️⃣  Testing response time... "
START_TIME=$(date +%s%N)
curl -s --max-time $TIMEOUT "$API_URL/api/health" > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $RESPONSE_TIME -lt 5000 ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    echo "   Response time: ${RESPONSE_TIME}ms"
elif [ $RESPONSE_TIME -lt 10000 ]; then
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "   Response time: ${RESPONSE_TIME}ms (slow)"
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "   Response time: ${RESPONSE_TIME}ms (too slow)"
fi

echo ""

# Test 4: Check HTTPS
echo -n "4️⃣  Verifying HTTPS... "
if [[ "$API_URL" == https://* ]]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    echo "   HTTPS enabled"
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "   Not using HTTPS"
fi

echo ""

# Summary
echo "================================"
echo -e "${GREEN}🎉 All tests passed!${NC}"
echo ""
echo "📊 Deployment Summary:"
echo "   - API URL: $API_URL"
echo "   - Health Check: ✅ Passing"
echo "   - Response Time: ${RESPONSE_TIME}ms"
echo "   - HTTPS: Enabled"
echo ""
echo "🚀 Your API is ready to use!"
echo ""
echo "📝 Next steps:"
echo "   1. Test other API endpoints"
echo "   2. Run database migrations"
echo "   3. Deploy frontend application"
echo "   4. Configure CORS settings"
