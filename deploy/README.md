# 🚀 Deployment Documentation

This directory contains all deployment-related documentation and configuration files for the JobApp project.

## 📁 Directory Structure

```
deploy/
├── README.md                      # This file
├── DEPLOYMENT_CHECKLIST.md        # Pre-deployment checklist
├── AWS_EC2_DEPLOYMENT_PLAN.md     # Complete AWS EC2 deployment plan ⭐ NEW
├── EC2_QUICK_START.md             # Quick start guide for EC2 ⭐ NEW
├── RENDER_DEPLOY.md               # Render-specific deployment guide
├── render.yaml                    # Render Blueprint configuration
├── docker-compose.prod.yml        # Production Docker Compose for EC2 ⭐ NEW
├── .env.production.template       # Environment variables template for EC2 ⭐ NEW
├── .env.render.template           # Environment variables template for Render
├── generate-secrets.sh            # Script to generate secure secrets
├── scripts/                       # Deployment scripts ⭐ NEW
│   ├── ec2-server-setup.sh        # Initial EC2 server setup
│   ├── ec2-initial-deploy.sh      # First deployment to EC2
│   ├── ec2-update.sh              # Update deployment script
│   ├── ec2-backup.sh              # Database backup script
│   └── ec2-rollback.sh            # Rollback script
├── nginx/                         # Nginx configurations ⭐ NEW
│   └── jobapp.conf                # Nginx reverse proxy config
└── workflows/                     # GitHub Actions workflows ⭐ NEW
    └── cd-ec2.yml                 # CI/CD workflow for EC2
```

## 🚀 Deployment Platforms

### AWS EC2 (Recommended) ⭐ NEW
- **Status**: Production-ready
- **Guide**: See [AWS_EC2_DEPLOYMENT_PLAN.md](./AWS_EC2_DEPLOYMENT_PLAN.md)
- **Quick Start**: See [EC2_QUICK_START.md](./EC2_QUICK_START.md)
- **Configuration**: [docker-compose.prod.yml](./docker-compose.prod.yml)
- **Features**:
  - Full control over infrastructure
  - Independent container lifecycle
  - Persistent data with Docker volumes
  - Auto-restart on server reboot
  - Zero-downtime deployments
  - Cost-effective

### Render (Legacy)
- **Status**: Transitioning to EC2
- **Guide**: See [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)
- **Configuration**: [render.yaml](./render.yaml)

## 📋 Quick Start

### For AWS EC2 Deployment:
1. Review [AWS_EC2_DEPLOYMENT_PLAN.md](./AWS_EC2_DEPLOYMENT_PLAN.md)
2. Follow [EC2_QUICK_START.md](./EC2_QUICK_START.md) for rapid setup
3. Run `scripts/ec2-server-setup.sh` on your EC2 instance
4. Configure environment variables using `.env.production.template`
5. Run `scripts/ec2-initial-deploy.sh`

### For Render Deployment:
1. Review the [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
2. Follow the platform-specific guide [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)
3. Generate secrets using [generate-secrets.sh](./generate-secrets.sh)
4. Configure environment variables using `.env.render.template`

## 🔐 Security

- Never commit `.env` files or secrets to version control
- Use the provided templates and fill in values manually
- Rotate secrets regularly
- Use strong, randomly generated passwords
- Keep SSH keys secure
- Configure firewall rules properly

## 📚 Additional Resources

- [CI/CD Setup Guide](../.github/CI_CD_SETUP.md)
- [Complete Setup Guide](../COMPLETE_SETUP_GUIDE.md)
- [Troubleshooting Guide](../TROUBLESHOOTING.md)

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section in the deployment guide
2. Review container logs: `docker logs jobapp_backend`
3. Check GitHub Actions logs for CI/CD issues
4. Verify environment variables are set correctly

---

**Note**: Scripts in `scripts/` directory need to be made executable on Linux/Mac:
```bash
chmod +x deploy/scripts/*.sh
```
