# 🚀 AWS EC2 Setup Progress Tracker

**Started**: March 31, 2026
**Status**: Server Setup Complete ✅

**Server Details:**
- EC2 IP: 13.213.13.180
- Domain: jobswipe.site
- OS: Ubuntu 24.04 LTS

---

## ✅ Phase 1: AWS EC2 Instance Setup

### 1.1 Create EC2 Instance
- [x] EC2 instance created
- [x] Public IP: 13.213.13.180
- [x] SSH access configured
- [x] Connection successful

### 1.2 Initial Connection Test
- [x] SSH key configured
- [x] Connected to server successfully

---

## ✅ Phase 2: Server Initial Setup

### 2.1 Run Server Setup Script
- [x] Connected to EC2 via SSH
- [x] System updated
- [x] Docker installed (already present)
- [x] Docker Compose installed (v5.1.1)
- [x] Nginx installed
- [x] Certbot installed
- [x] Deployment directory created
- [x] Docker network created
- [x] Firewall configured

### 2.2 Verify Installation
- [x] Docker version verified
- [x] Docker Compose version verified
- [x] Nginx installed
- [x] Certbot installed

---

## 📋 Phase 3: Domain & DNS Configuration

### 3.1 Domain Setup
- [ ] Domain name: jobswipe.site
- [ ] DNS A Record: jobswipe.site → 13.213.13.180
- [ ] DNS A Record: www.jobswipe.site → 13.213.13.180
- [ ] DNS A Record: api.jobswipe.site → 13.213.13.180
- [ ] DNS propagation verified (use: https://dnschecker.org)

**Action Required:** Go to Hostinger DNS management and add the A records above

---

## 📋 Phase 4: Configuration Files

### 4.1 Generate Secrets (Local Machine)
- [ ] Run: `powershell -ExecutionPolicy Bypass -File deploy\generate-env-windows.ps1`
- [ ] Docker Hub username entered
- [ ] Secrets generated
- [ ] deploy\.env.production updated

### 4.2 Upload Files to EC2 (Local Machine)
- [ ] docker-compose.prod.yml uploaded
- [ ] .env.production uploaded
- [ ] Scripts uploaded to ~/jobapp/scripts/
- [ ] nginx/jobapp.conf uploaded

**Commands to run on local machine:**
```powershell
scp deploy/docker-compose.prod.yml ubuntu@13.213.13.180:~/jobapp/
scp deploy/.env.production ubuntu@13.213.13.180:~/jobapp/
scp deploy/scripts/*.sh ubuntu@13.213.13.180:~/jobapp/scripts/
scp deploy/nginx/jobapp.conf ubuntu@13.213.13.180:~/jobapp/nginx/
```

---

## 📋 Phase 5: Nginx & SSL Setup

### 5.1 Nginx Configuration (On EC2)
- [ ] Config file copied to /etc/nginx/sites-available/
- [ ] Symlink created in /etc/nginx/sites-enabled/
- [ ] Default site removed
- [ ] Nginx config tested: `sudo nginx -t`
- [ ] Nginx reloaded

### 5.2 SSL Certificates (On EC2)
- [ ] Certbot run for all domains
- [ ] SSL certificates obtained
- [ ] HTTPS working
- [ ] Auto-renewal configured

**Command to run on EC2:**
```bash
sudo certbot --nginx -d jobswipe.site -d www.jobswipe.site -d api.jobswipe.site
```

---

## 📋 Phase 6: Docker Hub & Initial Deployment

### 6.1 Docker Hub Setup
- [ ] Docker Hub account created
- [ ] Repository created: jobapp-backend
- [ ] Repository created: jobapp-web
- [ ] Access token generated

### 6.2 Build and Push Images (Local Machine)
- [ ] Backend image built
- [ ] Backend image pushed
- [ ] Frontend image built
- [ ] Frontend image pushed

### 6.3 First Deployment (On EC2)
- [ ] Scripts made executable
- [ ] Initial deploy script run
- [ ] All containers started
- [ ] Database migrations completed
- [ ] Health checks passing

### 6.4 Verification
- [ ] Backend health: `curl https://api.jobswipe.site/api/health`
- [ ] Frontend: `curl https://jobswipe.site`
- [ ] All containers running: `docker ps`

---

## 📋 Phase 7: GitHub Actions CI/CD

### 7.1 GitHub Secrets
- [ ] AWS_EC2_HOST added (13.213.13.180)
- [ ] AWS_EC2_USER added (ubuntu)
- [ ] AWS_EC2_SSH_KEY added
- [ ] DOCKER_HUB_USERNAME added
- [ ] DOCKER_HUB_TOKEN added

### 7.2 Workflow Update
- [ ] New workflow file copied
- [ ] Committed and pushed
- [ ] Workflow tested

---

## 📋 Phase 8: Post-Deployment

### 8.1 Monitoring & Backups
- [ ] Backup script tested
- [ ] Backup cron job configured (optional)

### 8.2 Documentation
- [ ] Server details documented
- [ ] Credentials stored securely
- [ ] Team notified

---

## 📝 Important Information

### Server Details
- **EC2 IP**: 13.213.13.180
- **Domain**: jobswipe.site
- **SSH Command**: `ssh ubuntu@13.213.13.180`

### Next Immediate Steps
1. ⚠️ **Configure DNS in Hostinger** (Phase 3)
2. 🔐 **Generate secrets** - Run `deploy\generate-env-windows.ps1`
3. 🐳 **Setup Docker Hub account**
4. 📤 **Upload files to EC2**
5. 🌐 **Configure Nginx**
6. 🔒 **Setup SSL**
7. 🚀 **Deploy!**

---

## 📖 Documentation Files

- `deploy/NEXT_STEPS.md` - Detailed step-by-step guide
- `deploy/AWS_EC2_DEPLOYMENT_PLAN.md` - Complete deployment plan
- `deploy/EC2_QUICK_START.md` - Quick reference guide

---

**Last Updated**: March 31, 2026

---

## ✅ Phase 1: AWS EC2 Instance Setup

### 1.1 Create EC2 Instance
- [ ] Log into AWS Console
- [ ] Navigate to EC2 Dashboard
- [ ] Launch new instance with these specs:
  - **Name**: jobapp-production
  - **AMI**: Ubuntu Server 22.04 LTS
  - **Instance Type**: t3.medium (2 vCPU, 4GB RAM)
  - **Storage**: 30GB gp3 EBS volume
  - **Key Pair**: Create/select SSH key pair (SAVE THIS!)
- [ ] Configure Security Group:
  - SSH (22) - Your IP only
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0
- [ ] Launch instance
- [ ] Note down: **Public IP Address**: _________________

### 1.2 Initial Connection Test
- [ ] Download SSH key (if new)
- [ ] Set key permissions: `chmod 400 your-key.pem` (Linux/Mac)
- [ ] Test SSH connection: `ssh -i your-key.pem ubuntu@YOUR_EC2_IP`
- [ ] Connection successful

---

## ✅ Phase 2: Server Initial Setup

### 2.1 Run Server Setup Script
- [ ] Connected to EC2 via SSH
- [ ] System updated
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Nginx installed
- [ ] Certbot installed
- [ ] Deployment directory created
- [ ] Docker network created
- [ ] Firewall configured

### 2.2 Verify Installation
- [ ] Docker version: `docker --version`
- [ ] Docker Compose version: `docker compose version`
- [ ] Nginx status: `sudo systemctl status nginx`

---

## ✅ Phase 3: Domain & DNS Configuration

### 3.1 Domain Setup
- [ ] Domain name: _________________
- [ ] DNS A Record: yourdomain.com → EC2 IP
- [ ] DNS A Record: www.yourdomain.com → EC2 IP
- [ ] DNS A Record: api.yourdomain.com → EC2 IP
- [ ] DNS propagation verified (use: https://dnschecker.org)

---

## ✅ Phase 4: Configuration Files

### 4.1 Upload Files to EC2
- [ ] `docker-compose.prod.yml` uploaded to ~/jobapp/
- [ ] `.env.production` created and configured
- [ ] `nginx/jobapp.conf` uploaded
- [ ] All scripts uploaded to ~/jobapp/scripts/

### 4.2 Environment Variables Configured
- [ ] DOCKER_HUB_USERNAME
- [ ] APP_URL
- [ ] APP_KEY (generated)
- [ ] JWT_SECRET (generated)
- [ ] DB_PASSWORD (strong password)
- [ ] MONGO_ROOT_PASSWORD (strong password)
- [ ] REDIS_PASSWORD (strong password)
- [ ] MAIL_* variables (SMTP configured)
- [ ] NEXT_PUBLIC_API_URL

---

## ✅ Phase 5: Nginx & SSL Setup

### 5.1 Nginx Configuration
- [ ] Config file copied to /etc/nginx/sites-available/
- [ ] Symlink created in /etc/nginx/sites-enabled/
- [ ] Nginx config tested: `sudo nginx -t`
- [ ] Nginx reloaded

### 5.2 SSL Certificates
- [ ] Certbot run for all domains
- [ ] SSL certificates obtained
- [ ] HTTPS working
- [ ] Auto-renewal configured

---

## ✅ Phase 6: Initial Deployment

### 6.1 Docker Hub Setup
- [ ] Docker Hub account created
- [ ] Repository created: jobapp-backend
- [ ] Repository created: jobapp-web
- [ ] Access token generated

### 6.2 First Deployment
- [ ] Scripts made executable
- [ ] Initial deploy script run
- [ ] All containers started
- [ ] Database migrations completed
- [ ] Health checks passing

### 6.3 Verification
- [ ] Backend health: `curl http://localhost:8080/api/health`
- [ ] Frontend: `curl http://localhost:3000`
- [ ] HTTPS backend: `curl https://api.yourdomain.com/api/health`
- [ ] HTTPS frontend: `curl https://yourdomain.com`

---

## ✅ Phase 7: GitHub Actions CI/CD

### 7.1 GitHub Secrets
- [ ] AWS_EC2_HOST added
- [ ] AWS_EC2_USER added (ubuntu)
- [ ] AWS_EC2_SSH_KEY added
- [ ] DOCKER_HUB_USERNAME added
- [ ] DOCKER_HUB_TOKEN added

### 7.2 Workflow Update
- [ ] New workflow file created
- [ ] Old workflow backed up
- [ ] Workflow tested with push to main

---

## ✅ Phase 8: Post-Deployment

### 8.1 Monitoring & Backups
- [ ] Backup script tested
- [ ] Backup cron job configured
- [ ] Monitoring setup (optional)

### 8.2 Documentation
- [ ] Server details documented
- [ ] Credentials stored securely
- [ ] Team notified

---

## 📝 Important Information

### Server Details
- **EC2 IP**: _________________
- **Domain**: _________________
- **SSH Key Location**: _________________

### Credentials (KEEP SECURE!)
- **Docker Hub Username**: _________________
- **DB Password**: _________________
- **Mongo Password**: _________________
- **Redis Password**: _________________

### Useful Commands
```bash
# SSH into server
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# View logs
docker logs jobapp_backend -f

# Restart service
docker-compose -f docker-compose.prod.yml restart backend

# Update deployment
cd ~/jobapp && ./scripts/ec2-update.sh

# Create backup
cd ~/jobapp && ./scripts/ec2-backup.sh
```

---

## 🚨 Issues Encountered

Document any issues here:

1. 
2. 
3. 

---

**Last Updated**: March 31, 2026
