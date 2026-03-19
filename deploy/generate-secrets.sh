#!/bin/bash

# Generate Secrets for Render Deployment
# Run this script to generate secure secrets for your environment variables

echo "🔐 Generating secrets for Render deployment..."
echo "================================================"

# Generate APP_KEY
echo "📱 APP_KEY:"
php -r "echo 'base64:' . base64_encode(random_bytes(32)) . PHP_EOL;"
echo ""

# Generate JWT_SECRET
echo "🔑 JWT_SECRET:"
php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"
echo ""

# Generate random database password (if needed)
echo "🗄️  Random Database Password:"
openssl rand -base64 32
echo ""

# Generate random Redis password (if needed)
echo "📦 Random Redis Password:"
openssl rand -base64 24
echo ""

echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "- Copy these values to your Render environment variables"
echo "- Never commit these secrets to git"
echo "- Use different secrets for staging/production"
echo "- Store backup of secrets in secure password manager"
echo ""

echo "✅ Next steps:"
echo "1. Copy secrets above to Render dashboard"
echo "2. Set up PostgreSQL and Redis services in Render"
echo "3. Update database connection strings"
echo "4. Deploy your application"