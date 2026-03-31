# 🚀 Next Steps for JobSwipe Deployment

**Server IP**: 13.213.13.180  
**Domain**: jobswipe.site  
**Status**: Server setup complete ✅

---

## Step 1: Configure DNS (Do This First!)

Go to your Hostinger DNS management and add these A records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 13.213.13.180 | 3600 |
| A | www | 13.213.13.180 | 3600 |
| A | api | 13.213.13.180 | 3600 |

**Wait 5-10 minutes for DNS propagation**, then verify:
```bash
nslookup jobswipe.site
nslookup www.jobswipe.site
nslookup api.jobswipe.site
```

All should return: 13.213.13.180

---

## Step 2: Setup Docker Hub

1. Go to https://hub.docker.com
2. Create account (if you don't have one)
3. Create two repositories:
   - `jobapp-backend` (public or private)
   - `jobapp-web` (public or private)
4. Generate access token:
   - Account Settings → Security → New Access Token
   - Name it: "GitHub Actions"
   - Copy the token (you'll need it later)

---

## Step 3: Generate Secrets & Configure .env

On your LOCAL machine (Windows PowerShell):

```powershell
# Navigate to your project
cd C:\path\to\your\project

# Generate secrets using PowerShell
$APP_KEY = "base64:" + [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$JWT_SECRET = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$DB_PASSWORD = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(24)).Substring(0,20)
$MONGO_PASSWORD = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(24)).Substring(0,20)
$REDIS_PASSWORD = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(24)).Substring(0,20)

# Display them
Write-Host "APP_KEY=$APP_KEY"
Write-Host "JWT_SECRET=$JWT_SECRET"
Write-Host "DB_PASSWORD=$DB_PASSWORD"
Write-Host "MONGO_PASSWORD=$MONGO_PASSWORD"
Write-Host "REDIS_PASSWORD=$REDIS_PASSWORD"
```

Now edit `deploy/.env.production` and replace:
- `DOCKER_HUB_USERNAME` with your Docker Hub username
- `APP_KEY` with generated value
- `JWT_SECRET` with generated value
- `DB_PASSWORD` with generated value
- `MONGO_ROOT_PASSWORD` with generated value
- `REDIS_PASSWORD` with generated value
- `MAIL_PASSWORD` with your SendGrid API key (if you have one)

---

## Step 4: Upload Files to EC2

From your LOCAL machine (PowerShell):

```powershell
# Upload docker-compose
scp deploy/docker-compose.prod.yml ubuntu@13.213.13.180:~/jobapp/

# Upload .env file
scp deploy/.env.production ubuntu@13.213.13.180:~/jobapp/

# Upload scripts
scp deploy/scripts/*.sh ubuntu@13.213.13.180:~/jobapp/scripts/

# Upload nginx config
scp deploy/nginx/jobapp.conf ubuntu@13.213.13.180:~/jobapp/nginx/
```

---

## Step 5: Configure Nginx on EC2

SSH into your server:
```bash
ssh ubuntu@13.213.13.180
```

Then run:
```bash
# Copy nginx config
sudo cp ~/jobapp/nginx/jobapp.conf /etc/nginx/sites-available/jobapp

# Enable the site
sudo ln -s /etc/nginx/sites-available/jobapp /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## Step 6: Setup SSL Certificates

On your EC2 server:
```bash
sudo certbot --nginx -d jobswipe.site -d www.jobswipe.site -d api.jobswipe.site
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

---

## Step 7: Build and Push Docker Images

On your LOCAL machine, you need to build and push images to Docker Hub first.

```powershell
# Login to Docker Hub
docker login

# Build and push backend
docker build -t your-dockerhub-username/jobapp-backend:latest -f Dockerfile .
docker push your-dockerhub-username/jobapp-backend:latest

# Build and push frontend
docker build -t your-dockerhub-username/jobapp-web:latest -f frontend/web/Dockerfile frontend/web
docker push your-dockerhub-username/jobapp-web:latest
```

---

## Step 8: Initial Deployment on EC2

SSH into your server and run:
```bash
cd ~/jobapp

# Make scripts executable
chmod +x scripts/*.sh

# Run initial deployment
./scripts/ec2-initial-deploy.sh
```

This will:
- Pull Docker images
- Start databases
- Run migrations
- Start backend, frontend, and Horizon worker

---

## Step 9: Verify Deployment

Check if everything is running:
```bash
# View all containers
docker ps

# Check backend logs
docker logs jobapp_backend --tail 50

# Check frontend logs
docker logs jobapp_frontend --tail 50

# Test backend health
curl https://api.jobswipe.site/api/health

# Test frontend
curl https://jobswipe.site
```

---

## Step 10: Setup GitHub Actions CI/CD

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Value |
|-------------|-------|
| `AWS_EC2_HOST` | 13.213.13.180 |
| `AWS_EC2_USER` | ubuntu |
| `AWS_EC2_SSH_KEY` | Your private SSH key content |
| `DOCKER_HUB_USERNAME` | Your Docker Hub username |
| `DOCKER_HUB_TOKEN` | Your Docker Hub access token |

Then update your workflow:
```bash
# On your local machine
cp deploy/workflows/cd-ec2.yml .github/workflows/cd.yml
git add .github/workflows/cd.yml
git commit -m "Update CI/CD for EC2 deployment"
git push
```

---

## 🎉 You're Done!

Your application should now be live at:
- **Frontend**: https://jobswipe.site
- **API**: https://api.jobswipe.site

---

## 📋 Useful Commands

```bash
# SSH into server
ssh ubuntu@13.213.13.180

# View logs
docker logs jobapp_backend -f
docker logs jobapp_frontend -f
docker logs jobapp_horizon -f

# Restart a service
cd ~/jobapp
docker-compose -f docker-compose.prod.yml restart backend

# Update deployment
cd ~/jobapp
./scripts/ec2-update.sh

# Create backup
cd ~/jobapp
./scripts/ec2-backup.sh

# Check container status
docker ps

# Check disk space
df -h

# Check memory usage
free -h
```

---

## 🚨 Troubleshooting

**Container won't start?**
```bash
docker logs jobapp_backend
docker logs jobapp_postgres
```

**Database connection failed?**
```bash
docker ps  # Check if databases are healthy
docker exec -it jobapp_postgres psql -U jobapp_user -d jobapp
```

**SSL not working?**
```bash
sudo certbot certificates
sudo nginx -t
sudo systemctl status nginx
```

**Out of disk space?**
```bash
docker system prune -a
```

---

**Need help?** Check the full deployment plan in `deploy/AWS_EC2_DEPLOYMENT_PLAN.md`
