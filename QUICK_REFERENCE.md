# 🚀 Quick Reference Card

## 📋 Essential Commands

### Repository Setup
```bash
# 1. Run setup script
./.github/setup-repository.sh

# 2. Commit CI/CD files
git add .github/ deploy/ frontend/web/playwright.config.js frontend/web/tests/
git commit -m "feat: add CI/CD pipeline"
git push origin main

# 3. Create branches
git checkout -b staging && git push origin staging
git checkout -b feature/setup && git push origin feature/setup
git checkout main
```

### GitHub CLI Setup
```bash
# Install and authenticate
brew install gh  # or winget install --id GitHub.cli
gh auth login

# Set secrets
gh secret set RENDER_API_KEY --body "YOUR_API_KEY"
gh secret set RENDER_SERVICE_ID --body "YOUR_SERVICE_ID"
gh secret list
```

### Generate Secrets
```bash
cd deploy
./generate-secrets.sh
# Copy the output for Render environment variables
```

### Test CI/CD Pipeline
```bash
# 1. Create feature
git checkout -b feature/test-pipeline
echo "// Test" >> backend/routes/api.php
git add . && git commit -m "feat: test pipeline"
git push origin feature/test-pipeline

# 2. Merge to staging (no CI)
git checkout staging
git merge feature/test-pipeline
git push origin staging

# 3. Create PR to main (triggers CI)
gh pr create --base main --head staging --title "Test Pipeline"

# 4. After CI passes, merge PR (triggers CD)
```

### Local Testing
```bash
# Backend tests
cd backend
php artisan test

# Frontend tests
cd frontend/web
npm run test
npx playwright test

# Docker test
docker build -t jobapp-test .
docker run --rm -p 8080:8080 jobapp-test
curl http://localhost:8080/api/health
```

## 🔧 Render Configuration

### Required Environment Variables
```bash
# Application
APP_NAME=JobApp
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:YOUR_GENERATED_KEY
APP_URL=https://your-service.onrender.com

# Database (from Render PostgreSQL)
DB_CONNECTION=pgsql
DB_HOST=YOUR_POSTGRES_HOST
DB_PORT=5432
DB_DATABASE=jobapp
DB_USERNAME=jobapp_user
DB_PASSWORD=YOUR_POSTGRES_PASSWORD

# Redis (from Render Redis)
REDIS_HOST=YOUR_REDIS_HOST
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD

# Authentication
JWT_SECRET=YOUR_GENERATED_JWT_SECRET
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600

# Additional
BCRYPT_ROUNDS=12
LOG_CHANNEL=stderr
LOG_LEVEL=error
```

### Database Setup Commands
```bash
# In Render Shell
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

## 🌳 Branch Strategy

```
main (production)     ← CD triggers here
  ↑
staging (ready)       ← Manual merges, CI triggers on PR to main
  ↑
feature/* & fix/*     ← Development branches
```

## 📊 Pipeline Phases

### CI Pipeline (PR: staging → main)
1. **📋 Lint & Validate** - Code quality checks
2. **🧪 Unit Tests** - Individual components (parallel with #3)
3. **🔗 Integration Tests** - Component interactions (parallel with #2)
4. **🎭 E2E Tests** - Complete user flows
5. **🐳 Docker Build** - Container testing
6. **🔒 Security Scan** - SBOM + Trivy + Cosign
7. **📊 CI Summary** - Results report

### CD Pipeline (Push to main)
1. **🏗️ Build & Push** - Production images
2. **🚀 Deploy** - Render deployment
3. **📊 Summary** - Deployment report

## 🔐 Security Checklist

- ✅ Secrets in GitHub (not in code)
- ✅ Branch protection enabled
- ✅ Required status checks configured
- ✅ Container images signed with Cosign
- ✅ SBOM generated for compliance
- ✅ Vulnerability scanning with Trivy
- ✅ HTTPS/TLS encryption enabled

## 🚨 Troubleshooting

### CI Pipeline Issues
```bash
# Check workflow syntax
gh workflow list
gh run list --workflow=ci.yml

# View logs
gh run view RUN_ID --log
```

### Render Issues
```bash
# Test health endpoint
curl https://your-service.onrender.com/api/health

# Check service logs in Render dashboard
# Verify environment variables are set
```

### Common Fixes
- **Lint errors**: Fix code formatting
- **Test failures**: Update failing tests
- **Docker build fails**: Check Dockerfile syntax
- **Deployment fails**: Verify Render secrets
- **Health check fails**: Check API routes

## 📞 Quick Links

- **GitHub Actions**: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
- **Render Dashboard**: `https://dashboard.render.com`
- **Production API**: `https://your-service.onrender.com/api/health`
- **Container Registry**: `https://github.com/YOUR_USERNAME/YOUR_REPO/pkgs/container/YOUR_REPO`

## 💰 Monthly Costs

- Render Web Service: $7
- PostgreSQL Database: $7
- Redis Cache: $7
- **Total: ~$21/month**

---

**Need detailed instructions?** See [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)