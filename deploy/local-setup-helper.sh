#!/bin/bash
# Local Setup Helper Script
# Run this on your LOCAL machine to prepare for EC2 deployment

set -e

echo "🚀 JobApp EC2 Deployment - Local Setup Helper"
echo "=============================================="
echo ""

# Collect information
read -p "Enter your EC2 Public IP: " EC2_IP
read -p "Enter your SSH key file path (e.g., ~/.ssh/jobapp-key.pem): " SSH_KEY
read -p "Enter your domain name (e.g., yourdomain.com): " DOMAIN
read -p "Enter your Docker Hub username: " DOCKER_USER

echo ""
echo "📝 Configuration Summary:"
echo "  EC2 IP: $EC2_IP"
echo "  SSH Key: $SSH_KEY"
echo "  Domain: $DOMAIN"
echo "  Docker Hub: $DOCKER_USER"
echo ""
read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "❌ Setup cancelled"
    exit 1
fi

# Create .env.production from template
echo ""
echo "📝 Creating .env.production file..."
cp deploy/.env.production.template deploy/.env.production

# Generate secrets
echo ""
echo "🔐 Generating secure secrets..."
APP_KEY="base64:$(openssl rand -base64 32)"
JWT_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)
MONGO_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)
REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)

# Update .env.production
sed -i.bak "s|DOCKER_HUB_USERNAME=.*|DOCKER_HUB_USERNAME=$DOCKER_USER|g" deploy/.env.production
sed -i.bak "s|APP_URL=.*|APP_URL=https://$DOMAIN|g" deploy/.env.production
sed -i.bak "s|APP_KEY=.*|APP_KEY=$APP_KEY|g" deploy/.env.production
sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" deploy/.env.production
sed -i.bak "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|g" deploy/.env.production
sed -i.bak "s|MONGO_ROOT_PASSWORD=.*|MONGO_ROOT_PASSWORD=$MONGO_PASSWORD|g" deploy/.env.production
sed -i.bak "s|REDIS_PASSWORD=.*|REDIS_PASSWORD=$REDIS_PASSWORD|g" deploy/.env.production
sed -i.bak "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://api.$DOMAIN|g" deploy/.env.production

# Update nginx config
sed -i.bak "s|yourdomain.com|$DOMAIN|g" deploy/nginx/jobapp.conf
sed -i.bak "s|api.yourdomain.com|api.$DOMAIN|g" deploy/nginx/jobapp.conf

echo "✅ Configuration files updated!"
echo ""

# Create SSH config helper
cat > deploy/ssh-connect.sh << EOF
#!/bin/bash
ssh -i $SSH_KEY ubuntu@$EC2_IP
EOF
chmod +x deploy/ssh-connect.sh

# Create upload script
cat > deploy/upload-to-ec2.sh << EOF
#!/bin/bash
echo "📤 Uploading files to EC2..."

# Create directories on EC2
ssh -i $SSH_KEY ubuntu@$EC2_IP "mkdir -p ~/jobapp/scripts ~/jobapp/nginx"

# Upload docker-compose
scp -i $SSH_KEY deploy/docker-compose.prod.yml ubuntu@$EC2_IP:~/jobapp/

# Upload .env
scp -i $SSH_KEY deploy/.env.production ubuntu@$EC2_IP:~/jobapp/

# Upload scripts
scp -i $SSH_KEY deploy/scripts/*.sh ubuntu@$EC2_IP:~/jobapp/scripts/

# Upload nginx config
scp -i $SSH_KEY deploy/nginx/jobapp.conf ubuntu@$EC2_IP:~/jobapp/nginx/

echo "✅ Files uploaded!"
EOF
chmod +x deploy/upload-to-ec2.sh

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Test SSH connection:"
echo "   ./deploy/ssh-connect.sh"
echo ""
echo "2. Run server setup (on EC2):"
echo "   ssh -i $SSH_KEY ubuntu@$EC2_IP 'bash -s' < deploy/scripts/ec2-server-setup.sh"
echo ""
echo "3. Upload configuration files:"
echo "   ./deploy/upload-to-ec2.sh"
echo ""
echo "4. Configure DNS:"
echo "   Point these A records to $EC2_IP:"
echo "   - $DOMAIN"
echo "   - www.$DOMAIN"
echo "   - api.$DOMAIN"
echo ""
echo "5. SSH into server and continue setup:"
echo "   ./deploy/ssh-connect.sh"
echo ""
echo "📝 Your secrets have been saved to deploy/.env.production"
echo "⚠️  KEEP THIS FILE SECURE - DO NOT COMMIT TO GIT!"
echo ""
