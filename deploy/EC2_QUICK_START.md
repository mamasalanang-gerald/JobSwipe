# 🚀 AWS EC2 Quick Start Guide

This is a condensed version of the full deployment plan. For complete details, see `AWS_EC2_DEPLOYMENT_PLAN.md`.

## Prerequisites

- [ ] AWS EC2 instance running Ubuntu 22.04
- [ ] Domain name with DNS access
- [ ] Docker Hub account
- [ ] GitHub repository with Actions enabled

## Step 1: Initial Server Setup (30 minutes)

SSH into your EC2 instance:
```bash
ssh ubuntu@your-ec2-ip
```

Run the setup script:
```bash
# Download and run setup script
curl -o setup.sh https://raw.githubusercontent.com/your-repo/main/deploy/scripts/ec2-server-setup.sh
chmod +x setup.sh
./setup.sh
```

Or manually:
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Install Nginx
sudo apt install nginx certbot python3-certbot-nginx -y

# Create directories
mkdir -p ~/jobapp
docker network create jobapp_network
```

## Step 2: Upload Configuration Files (15 minutes)

Upload these files to `~/jobapp/` on EC2:
- `docker-compose.prod.yml`
- `.env.production` (from template)

```bash
# From your local machine
scp deploy/docker-compose.prod.yml ubuntu@your-ec2-ip:~/jobapp/
scp deploy/.env.production ubuntu@your-ec2-ip:~/jobapp/
```

Edit `.env.production` with your actual values:
```bash
nano ~/jobapp/.env.production
```

## Step 3: Configure Nginx (15 minutes)

```bash
# Upload nginx config
sudo cp ~/jobapp/nginx/jobapp.conf /etc/nginx/sites-available/jobapp

# Enable site
sudo ln -s /etc/nginx/sites-available/jobapp /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 4: Setup SSL (10 minutes)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

## Step 5: Initial Deployment (20 minutes)

```bash
cd ~/jobapp
chmod +x scripts/*.sh
./scripts/ec2-initial-deploy.sh
```

Verify deployment:
```bash
docker ps
curl http://localhost:8080/api/health
curl http://localhost:3000
```

## Step 6: Configure GitHub Actions (15 minutes)

Add these secrets to your GitHub repository:
- `AWS_EC2_HOST` - Your EC2 IP or domain
- `AWS_EC2_USER` - ubuntu
- `AWS_EC2_SSH_KEY` - Your private SSH key
- `DOCKER_HUB_USERNAME` - Your Docker Hub username
- `DOCKER_HUB_TOKEN` - Your Docker Hub token

Replace `.github/workflows/cd.yml` with `deploy/workflows/cd-ec2.yml`

## Step 7: Test CI/CD

Push a small change to main branch and watch the deployment happen automatically!

## Common Commands

```bash
# View logs
docker logs jobapp_backend --tail 100 -f
docker logs jobapp_frontend --tail 100 -f
docker logs jobapp_horizon --tail 100 -f

# Restart a service
docker-compose -f docker-compose.prod.yml restart backend

# Update deployment
./scripts/ec2-update.sh

# Create backup
./scripts/ec2-backup.sh

# Rollback
./scripts/ec2-rollback.sh abc1234

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## Troubleshooting

**Container won't start?**
```bash
docker logs jobapp_backend
```

**Database connection failed?**
```bash
docker ps  # Check if databases are healthy
docker logs jobapp_postgres
```

**Out of disk space?**
```bash
docker system prune -a
```

## Next Steps

- [ ] Setup automated backups (cron job)
- [ ] Configure monitoring
- [ ] Test rollback procedure
- [ ] Document your specific configuration

---

For complete details, see `AWS_EC2_DEPLOYMENT_PLAN.md`
