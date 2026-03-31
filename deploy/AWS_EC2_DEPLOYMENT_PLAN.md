# 🚀 AWS EC2 Docker Deployment Plan

## 📋 Overview
Transition from Render to AWS EC2 with Docker-based deployment featuring:
- Separate containers for frontend, backend, and databases
- Independent container lifecycle (one fails, others stay up)
- Persistent database volumes
- Auto-restart on server reboot
- Nginx reverse proxy with SSL
- Zero-downtime deployments via CI/CD

---

## 🏗️ Architecture

```
Internet → Route 53 (DNS) → EC2 Instance
                              ├─ Nginx (Port 80/443) - Reverse Proxy + SSL
                              ├─ Frontend Container (Port 3000)
                              ├─ Backend Container (Port 8080)
                              ├─ Horizon Worker Container
                              ├─ PostgreSQL Container (Port 5432) - Persistent Volume
                              ├─ MongoDB Container (Port 27017) - Persistent Volume
                              └─ Redis Container (Port 6379) - Persistent Volume
```

---

## 📝 Phase 1: EC2 Server Setup (One-Time)

### 1.1 EC2 Instance Requirements
- **Instance Type**: t3.medium or larger (2 vCPU, 4GB RAM minimum)
- **OS**: Ubuntu 22.04 LTS
- **Storage**: 30GB+ EBS volume (gp3 recommended)
- **Security Group Rules**:
  - Port 22 (SSH) - Your IP only
  - Port 80 (HTTP) - 0.0.0.0/0
  - Port 443 (HTTPS) - 0.0.0.0/0
  - Port 8080 (Backend - optional, for direct access)
  - Port 3000 (Frontend - optional, for direct access)

### 1.2 Initial Server Setup Script
See `deploy/scripts/ec2-server-setup.sh` for the complete setup script.

Key steps:
- Update system packages
- Install Docker and Docker Compose
- Install Nginx and Certbot
- Create deployment directory
- Setup firewall rules
- Create Docker network

---

## 📦 Phase 2: Docker Compose Configuration

### 2.1 Production docker-compose.yml
Create `docker-compose.prod.yml` with separate services for:
- PostgreSQL (with persistent volume)
- MongoDB (with persistent volume)
- Redis (with persistent volume)
- Backend API
- Horizon Worker
- Frontend Web

**Key Features**:
- `restart: unless-stopped` - Auto-restart on server reboot
- Health checks for all databases
- Separate networks for isolation
- Named volumes for data persistence
- Environment variable configuration

See `deploy/docker-compose.prod.yml` for the complete configuration.

### 2.2 Production Environment Variables
Create `.env.production` on EC2 with:
- Docker Hub credentials
- App secrets (APP_KEY, JWT_SECRET)
- Database credentials
- MongoDB credentials
- Redis password
- Mail configuration
- Frontend API URL

See `deploy/.env.production.template` for the complete template.

---

## 🌐 Phase 3: Nginx Reverse Proxy Setup

### 3.1 Nginx Configuration
Configure Nginx as reverse proxy for:
- **Backend API**: api.yourdomain.com → localhost:8080
- **Frontend Web**: yourdomain.com → localhost:3000

Features:
- WebSocket support
- Proper headers forwarding
- Timeout configurations
- SSL termination

See `deploy/nginx/jobapp.conf` for the complete configuration.

### 3.2 SSL Certificate Setup
Use Let's Encrypt with Certbot:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

Auto-renewal is configured automatically by Certbot.

---

## 🔄 Phase 4: CI/CD Pipeline Update

### 4.1 GitHub Secrets to Add
Required secrets for GitHub Actions:
- `AWS_EC2_HOST` - Your EC2 public IP or domain
- `AWS_EC2_USER` - SSH user (usually 'ubuntu')
- `AWS_EC2_SSH_KEY` - Private SSH key for EC2 access
- `DOCKER_HUB_USERNAME` - Docker Hub username
- `DOCKER_HUB_TOKEN` - Docker Hub access token

### 4.2 Updated CI/CD Workflow
The updated `.github/workflows/cd.yml` includes:

**Phase 1: Build & Push**
- Build backend and frontend Docker images
- Push to Docker Hub with tags (latest + commit SHA)
- Use GitHub Actions cache for faster builds

**Phase 2: Deploy to EC2**
- SSH into EC2 instance
- Pull latest Docker images
- Perform rolling update (zero downtime)
- Cleanup old images

**Phase 3: Deployment Summary**
- Generate deployment report
- Show status of all services

See `deploy/workflows/cd-ec2.yml` for the complete workflow.

---

## 🔧 Phase 5: Deployment Scripts

### 5.1 Initial Deployment Script
`deploy/scripts/ec2-initial-deploy.sh`
- Creates Docker network
- Starts databases first
- Waits for database health checks
- Starts backend (runs migrations)
- Starts Horizon worker and frontend

### 5.2 Update Deployment Script
`deploy/scripts/ec2-update.sh`
- Pulls latest images
- Performs rolling update
- Zero downtime deployment
- Cleans up old images

### 5.3 Backup Script
`deploy/scripts/ec2-backup.sh`
- Backs up PostgreSQL database
- Backs up MongoDB database
- Saves to timestamped directory

### 5.4 Rollback Script
`deploy/scripts/ec2-rollback.sh`
- Rolls back to previous Docker image version
- Restores database from backup if needed

---

## 🔒 Phase 6: Security & Monitoring

### 6.1 Security Checklist
- [ ] Change default SSH port (optional but recommended)
- [ ] Setup fail2ban for SSH protection
- [ ] Enable automatic security updates
- [ ] Use AWS Security Groups properly
- [ ] Rotate secrets regularly
- [ ] Setup CloudWatch or monitoring
- [ ] Configure Docker log rotation
- [ ] Restrict database ports to internal network only
- [ ] Use strong passwords for all services
- [ ] Enable UFW firewall

### 6.2 Monitoring Setup
Options for monitoring:
- **cAdvisor**: Container metrics and monitoring
- **CloudWatch**: AWS native monitoring
- **Prometheus + Grafana**: Advanced metrics
- **Uptime monitoring**: UptimeRobot, Pingdom, etc.

### 6.3 Log Management
Configure Docker log rotation in `/etc/docker/daemon.json`:
- Max log size: 10MB per file
- Keep 3 log files per container
- Prevents disk space issues

---

## 📋 Phase 7: Deployment Checklist

### Pre-Deployment
- [ ] EC2 instance created and accessible via SSH
- [ ] Domain DNS A records pointed to EC2 IP
- [ ] Docker and Docker Compose installed on EC2
- [ ] Nginx installed and configured
- [ ] SSL certificates obtained via Certbot
- [ ] `.env.production` file created with all secrets
- [ ] GitHub secrets configured in repository
- [ ] Docker Hub account created and credentials set
- [ ] Security groups configured properly

### Initial Deployment
- [ ] Upload `docker-compose.prod.yml` to EC2
- [ ] Upload `.env.production` to EC2
- [ ] Run `ec2-initial-deploy.sh`
- [ ] Verify all containers running: `docker ps`
- [ ] Check backend health: `curl http://localhost:8080/api/health`
- [ ] Check frontend: `curl http://localhost:3000`
- [ ] Test through Nginx: `curl https://yourdomain.com`
- [ ] Verify SSL certificates working
- [ ] Test API endpoints
- [ ] Verify database connections
- [ ] Check Horizon worker logs

### Post-Deployment
- [ ] Setup automated backups (cron job)
- [ ] Configure monitoring alerts
- [ ] Test CI/CD pipeline with a small change
- [ ] Document rollback procedure
- [ ] Setup log aggregation
- [ ] Create runbook for common operations
- [ ] Test disaster recovery procedure

---

## 🔄 Phase 8: Rollback Strategy

### Quick Rollback (Image-based)
```bash
cd ~/jobapp
docker-compose -f docker-compose.prod.yml down backend
docker pull ${DOCKER_HUB_USERNAME}/jobapp-backend:previous-sha
docker-compose -f docker-compose.prod.yml up -d backend
```

### Full Rollback (Database restore)
```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restore PostgreSQL
docker-compose -f docker-compose.prod.yml up -d postgres
cat backup.sql | docker exec -i jobapp_postgres psql -U ${DB_USERNAME} ${DB_DATABASE}

# Restore MongoDB
docker cp mongodb_backup jobapp_mongodb:/tmp/
docker exec jobapp_mongodb mongorestore --username=${MONGO_ROOT_USERNAME} --password=${MONGO_ROOT_PASSWORD} /tmp/mongodb_backup

# Start all services
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📊 Expected Timeline

| Phase | Task | Estimated Time |
|-------|------|----------------|
| 1 | EC2 Server Setup | 2-3 hours |
| 2 | Docker Compose Configuration | 1 hour |
| 3 | Nginx & SSL Setup | 1 hour |
| 4 | CI/CD Pipeline Update | 1-2 hours |
| 5 | Deployment Scripts | 1-2 hours |
| 6 | Security & Monitoring | 1-2 hours |
| 7 | Testing & Validation | 1-2 hours |

**Total**: 8-14 hours for complete setup and testing

---

## 🎯 Key Benefits

✅ **Independent Containers**: Each service runs separately; one failure doesn't affect others
✅ **Persistent Data**: Docker volumes ensure data survives container restarts
✅ **Auto-Restart**: Containers automatically restart on server reboot
✅ **Zero-Downtime**: Rolling updates keep services available during deployment
✅ **Easy Rollback**: Quick rollback to previous versions
✅ **SSL/HTTPS**: Automatic SSL certificates with Let's Encrypt
✅ **Scalable**: Easy to add more containers or move to orchestration later
✅ **Cost-Effective**: More control and potentially lower costs than PaaS
✅ **Full Control**: Complete access to server and configuration

---

## 🚨 Common Issues & Solutions

### Issue: Container won't start
**Solution**: Check logs with `docker logs jobapp_backend` and verify environment variables

### Issue: Database connection failed
**Solution**: Ensure databases are healthy with `docker ps` and check network connectivity

### Issue: SSL certificate renewal fails
**Solution**: Ensure ports 80/443 are open and Nginx is running

### Issue: Out of disk space
**Solution**: Run `docker system prune -a` to clean up unused images and containers

### Issue: High memory usage
**Solution**: Monitor with `docker stats` and consider upgrading instance type

---

## 📚 Additional Resources

### Documentation
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)

### Monitoring Tools
- [cAdvisor](https://github.com/google/cadvisor)
- [Prometheus](https://prometheus.io/)
- [Grafana](https://grafana.com/)

### Backup Solutions
- [AWS Backup](https://aws.amazon.com/backup/)
- [Automated EBS Snapshots](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-creating-snapshot.html)

---

## 🔗 Related Files

- `deploy/docker-compose.prod.yml` - Production Docker Compose configuration
- `deploy/.env.production.template` - Environment variables template
- `deploy/nginx/jobapp.conf` - Nginx configuration
- `deploy/scripts/ec2-server-setup.sh` - Initial server setup
- `deploy/scripts/ec2-initial-deploy.sh` - First deployment script
- `deploy/scripts/ec2-update.sh` - Update deployment script
- `deploy/scripts/ec2-backup.sh` - Backup script
- `deploy/scripts/ec2-rollback.sh` - Rollback script
- `.github/workflows/cd-ec2.yml` - CI/CD workflow for EC2

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- **Daily**: Monitor application logs and error rates
- **Weekly**: Check disk space and container health
- **Monthly**: Review security updates and apply patches
- **Quarterly**: Test backup restoration procedure
- **Annually**: Rotate secrets and credentials

### Emergency Contacts
Document your team's emergency contacts and escalation procedures here.

---

## ✅ Next Steps

1. **Review this plan** with your team
2. **Provision EC2 instance** in AWS Console
3. **Configure DNS** to point to EC2 IP
4. **Run Phase 1** server setup script
5. **Create configuration files** (docker-compose, .env, nginx)
6. **Test locally** with docker-compose.prod.yml
7. **Update CI/CD** workflow
8. **Perform initial deployment**
9. **Test thoroughly** before switching DNS
10. **Monitor closely** for first 24-48 hours

---

**Last Updated**: March 31, 2026
**Version**: 1.0.0
**Status**: Ready for Implementation
