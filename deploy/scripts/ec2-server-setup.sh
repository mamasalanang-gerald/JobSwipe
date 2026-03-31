#!/bin/bash
# EC2 Server Initial Setup Script
# Run this on your EC2 instance after first login

set -e

echo "🚀 Starting EC2 Server Setup for JobApp..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
rm get-docker.sh

# Install Docker Compose Plugin
echo "🔧 Installing Docker Compose..."
sudo apt install docker-compose-plugin -y

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install nginx -y

# Install Certbot for SSL
echo "🔒 Installing Certbot..."
sudo apt install certbot python3-certbot-nginx -y

# Create deployment directory
echo "📁 Creating deployment directory..."
mkdir -p ~/jobapp
cd ~/jobapp

# Create Docker network
echo "🔗 Creating Docker network..."
docker network create jobapp_network || echo "Network already exists"

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Enable Docker to start on boot
echo "⚙️ Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

# Create directories for scripts and configs
mkdir -p ~/jobapp/scripts
mkdir -p ~/jobapp/nginx
mkdir -p ~/backups

echo ""
echo "✅ EC2 Server Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Upload docker-compose.prod.yml to ~/jobapp/"
echo "2. Upload .env.production to ~/jobapp/"
echo "3. Configure Nginx (upload config to /etc/nginx/sites-available/)"
echo "4. Setup SSL with: sudo certbot --nginx -d yourdomain.com"
echo "5. Run initial deployment script"
echo ""
