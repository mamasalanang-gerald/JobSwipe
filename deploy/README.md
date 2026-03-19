# 🚀 Deployment Configuration

This directory contains all files needed to deploy JobApp to Render.

## 📁 Files Overview

| File | Purpose | Usage |
|------|---------|-------|
| `render.yaml` | Infrastructure as Code | Copy to repo root for Blueprint deployment |
| `.env.render.template` | Environment variables template | Reference for setting up Render environment |
| `generate-secrets.sh` | Security key generator | Run to generate secure secrets |
| `RENDER_DEPLOY.md` | Detailed deployment guide | Complete step-by-step instructions |
| `DEPLOYMENT_CHECKLIST.md` | Deployment checklist | Ensure nothing is missed |

## 🔐 Security First

**IMPORTANT**: Never commit actual secrets to git!

1. **Generate Secrets**:
   ```bash
   cd deploy
   ./generate-secrets.sh
   ```

2. **Copy secrets to Render environment variables** (not to files)

3. **Verify .gitignore excludes**:
   - `.env*` files
   - Any files with actual secrets

## 🚀 Quick Start

### Option 1: Blueprint Deployment (Recommended)
1. Copy `render.yaml` to repository root
2. In Render: New → Blueprint → Select repo → Choose render.yaml

### Option 2: Manual Deployment
1. Follow `RENDER_DEPLOY.md` step by step
2. Use `DEPLOYMENT_CHECKLIST.md` to track progress

## 📋 Deployment Checklist

- [ ] Secrets generated and stored securely
- [ ] No secrets committed to git
- [ ] Repository pushed to GitHub
- [ ] Render services created
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Health check passing

## 🔧 Local Testing

Test Docker build locally before deploying:

```bash
# Build image
docker build -t jobapp-test .

# Run container
docker run -p 8080:8080 jobapp-test

# Test health endpoint
curl http://localhost:8080/api/health
```

## 📞 Support

If you encounter issues:
1. Check `DEPLOYMENT_CHECKLIST.md` for common problems
2. Review Render service logs
3. Verify environment variables are set correctly
4. Ensure database services are running

## 🌐 Post-Deployment

After successful deployment:
- [ ] Update frontend API URLs
- [ ] Set up monitoring
- [ ] Configure custom domain
- [ ] Set up CI/CD pipeline