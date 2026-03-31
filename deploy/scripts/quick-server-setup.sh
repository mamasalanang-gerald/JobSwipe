#!/bin/bash
# Quick EC2 Server Setup Script
# Run this directly on your EC2 instance

set -e

echo "🚀 JobApp EC2 Server Setup"
echo "=========================="
echo ""

# Check if running as ubuntu user
if [ "$USER" != "ubuntu" ]; then
    echo "⚠️  Warning: This script should be run as 'ubuntu' user"
fi

# Update system
echo "📦 Step 1/8: Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install Docker
echo "🐳 Step 2/8: Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm get-docker.sh
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose Plugin
echo "🔧 Step 3/8: Installing Docker Compose..."
if ! docker compose version &> /dev/null; then
    sudo apt install docker-compose-plugin -y
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# Install Nginx
echo "🌐 Step 4/8: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    echo "✅ Nginx installed"
else
    echo "✅ Nginx already installed"
fi

# Install Certbot for SSL
echo "🔒 Step 5/8: Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    sudo apt install certbot python3-certbot-nginx -y
    echo "✅ Certbot installed"
else
    echo "✅ Certbot already installed"
fi

# Create deployment directory
echo "📁 Step 6/8: Creating deployment directories..."
mkdir -p ~/jobapp/scripts
mkdir -p ~/jobapp/nginx
mkdir -p ~/backups
echo "✅ Directories created"

# Create Docker network
echo "🔗 Step 7/8: Creating Docker network..."
docker network create jobapp_network 2>/dev/null || echo "✅ Network already exists"

# Setup firewall
echo "🔥 Step 8/8: Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
echo "✅ Firewall configured"

# Enable Docker to start on boot
echo "⚙️  Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

# Configure Docker log rotation
echo "📝 Configuring Docker log rotation..."
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
sudo systemctl restart docker

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ EC2 Server Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Installed Software:"
echo "  Docker: $(docker --version)"
echo "  Docker Compose: $(docker compose version)"
echo "  Nginx: $(nginx -v 2>&1)"
echo "  Certbot: $(certbot --version 2>&1 | head -n1)"
echo ""
echo "📁 Directories created:"
echo "  ~/jobapp/          - Main deployment directory"
echo "  ~/jobapp/scripts/  - Deployment scripts"
echo "  ~/jobapp/nginx/    - Nginx configurations"
echo "  ~/backups/         - Database backups"
echo ""
echo "🔗 Docker network: jobapp_network"
echo ""
echo "⚠️  IMPORTANT: You need to log out and log back in for Docker group changes to take effect!"
echo ""
echo "📋 Next Steps:"
echo "1. Log out: exit"
echo "2. Log back in: ssh ubuntu@your-server"
echo "3. Upload configuration files from your local machine"
echo "4. Configure your domain DNS"
echo "5. Run initial deployment"
echo ""
