# 🚀 Complete Setup Guide: Repository to Production

This guide takes you from zero to a fully deployed JobApp with CI/CD pipeline on Render.

## 📋 Prerequisites

Before starting, ensure you have:
- [ ] Git installed
- [ ] GitHub account
- [ ] Render account (sign up at [render.com](https://render.com))
- [ ] GitHub CLI installed (optional but recommended)

## 🎯 What We'll Build

By the end of this guide, you'll have:
- ✅ Repository with CI/CD pipeline
- ✅ 4-layer testing strategy
- ✅ Automated deployments to Render
- ✅ Production-ready Laravel API
- ✅ Security scanning and container signing

---

# PART 1: REPOSITORY SETUP

## Step 1: Initialize Repository Structure

### 1.1 Run the Setup Script
```bash
# Make the script executable (if not already)
chmod +x .github/setup-repository.sh

# Run the setup script
./.github/setup-repository.sh
```

**What this does:**
- Creates necessary directories
- Sets up test files
- Configures basic package.json files
- Validates the repository structure

### 1.2 Commit the CI/CD Files
```bash
# Add all the new CI/CD files
git add .github/ deploy/ frontend/web/playwright.config.js frontend/web/tests/

# Commit the CI/CD setup
git commit -m "feat: add comprehensive CI/CD pipeline with 4-layer testing"

# Push to your repository
git push origin main
```

## Step 2: Configure GitHub Repository

### 2.1 Install GitHub CLI (if not installed)
```bash
# macOS
brew install gh

# Windows (using winget)
winget install --id GitHub.cli

# Or download from: https://cli.github.com/
```

### 2.2 Authenticate with GitHub
```bash
# Login to GitHub CLI
gh auth login

# Follow the prompts to authenticate
```

### 2.3 Enable GitHub Actions
```bash
# Ensure GitHub Actions is enabled (usually enabled by default)
gh api repos/:owner/:repo/actions/permissions --method PUT --field enabled=true
```

## Step 3: Set Up Branch Protection Rules

### 3.1 Create Required Branches
```bash
# Create staging branch
git checkout -b staging
git push origin staging

# Create example feature branch
git checkout -b feature/setup-example
git push origin feature/setup-example

# Return to main
git checkout main
```

### 3.2 Configure Branch Protection (GitHub Web UI)

1. **Go to your GitHub repository**
2. **Click Settings → Branches**
3. **Add rule for `main` branch:**

   **Branch name pattern:** `main`
   
   **Protection settings:**
   - ✅ Require a pull request before merging
   - ✅ Require approvals: `2`
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require review from code owners
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   
   **Required status checks:**
   - `📋 Phase 1 - Lint & Validate`
   - `🧪 Phase 2 - Unit Tests (Layer 1)`
   - `🔗 Phase 3 - Integration Tests (Layer 2)`
   - `🎭 Phase 4 - E2E Tests (Layer 3)`
   - `🐳 Phase 5 - Test & Build Docker`
   - `🔒 Phase 6 - Security Scan (Layer 4)`
   - `📊 Phase 7 - CI Summary`
   
   **Additional settings:**
   - ✅ Restrict pushes that create files larger than 100MB
   - ✅ Require linear history
   - ✅ Include administrators

4. **Add rule for `staging` branch:**
   
   **Branch name pattern:** `staging`
   
   **Protection settings:**
   - ✅ Require a pull request before merging
   - ✅ Require approvals: `1`

5. **Click "Create" for each rule**

---

# PART 2: RENDER SERVER SETUP

## Step 4: Create Render Account and Services

### 4.1 Sign Up for Render
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Verify your email address

### 4.2 Create PostgreSQL Database
1. **In Render Dashboard:**
   - Click "New +" → "PostgreSQL"
   - **Name:** `jobapp-postgres`
   - **Database:** `jobapp`
   - **User:** `jobapp_user`
   - **Region:** `Oregon` (or closest to you)
   - **Plan:** `Starter` ($7/month)
   - Click "Create Database"

2. **Save Connection Details:**
   - Copy the **Internal Database URL**
   - Copy the **External Database URL**
   - Save these for later use

### 4.3 Create Redis Instance
1. **In Render Dashboard:**
   - Click "New +" → "Redis"
   - **Name:** `jobapp-redis`
   - **Region:** `Oregon` (same as database)
   - **Plan:** `Starter` ($7/month)
   - Click "Create Redis"

2. **Save Connection Details:**
   - Copy the **Internal Redis URL**
   - Copy the **External Redis URL**

### 4.4 Create Web Service
1. **In Render Dashboard:**
   - Click "New +" → "Web Service"
   - **Connect Repository:** Select your JobApp repository
   - **Name:** `jobapp-backend`
   - **Region:** `Oregon` (same as database)
   - **Branch:** `main`
   - **Root Directory:** Leave blank
   - **Environment:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Plan:** `Starter` ($7/month)

2. **Don't deploy yet** - we need to set environment variables first

## Step 5: Generate Production Secrets

### 5.1 Generate Secure Keys
```bash
# Navigate to deploy directory
cd deploy

# Generate secrets
./generate-secrets.sh
```

**Copy the output** - you'll need these values for environment variables.

### 5.2 Set Environment Variables in Render

1. **In your Render Web Service:**
   - Go to "Environment" tab
   - Add the following variables:

**Application Variables:**
```
APP_NAME=JobApp
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:YOUR_GENERATED_KEY_FROM_SCRIPT
APP_URL=https://jobapp-backend.onrender.com
```

**Database Variables (from Step 4.2):**
```
DB_CONNECTION=pgsql
DB_HOST=YOUR_POSTGRES_INTERNAL_HOST
DB_PORT=5432
DB_DATABASE=jobapp
DB_USERNAME=jobapp_user
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
```

**Redis Variables (from Step 4.3):**
```
REDIS_HOST=YOUR_REDIS_INTERNAL_HOST
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD
```

**Authentication Variables:**
```
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_FROM_SCRIPT
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600
```

**Additional Variables:**
```
BCRYPT_ROUNDS=12
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis
LOG_CHANNEL=stderr
LOG_LEVEL=error
API_PREFIX=/api
API_VERSION=v1
```

2. **Click "Save Changes"**

---

# PART 3: GITHUB SECRETS SETUP

## Step 6: Configure GitHub Repository Secrets

### 6.1 Get Render API Key
1. **In Render Dashboard:**
   - Click your profile → "Account Settings"
   - Go to "API Keys" tab
   - Click "Create API Key"
   - **Name:** `JobApp CI/CD`
   - Copy the generated API key

### 6.2 Get Render Service ID
1. **In your Render Web Service:**
   - Look at the URL: `https://dashboard.render.com/web/srv-XXXXXXXXX`
   - The Service ID is the part after `srv-`: `XXXXXXXXX`

### 6.3 Add Secrets to GitHub
```bash
# Add Render API Key
gh secret set RENDER_API_KEY --body "YOUR_RENDER_API_KEY"

# Add Render Service ID  
gh secret set RENDER_SERVICE_ID --body "YOUR_RENDER_SERVICE_ID"

# Verify secrets were added
gh secret list
```

**Or via GitHub Web UI:**
1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add:
   - Name: `RENDER_API_KEY`, Value: Your Render API key
   - Name: `RENDER_SERVICE_ID`, Value: Your Render service ID

---

# PART 4: FIRST DEPLOYMENT

## Step 7: Initial Manual Deployment

### 7.1 Deploy to Render Manually
1. **In Render Web Service:**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment to complete (5-10 minutes)

### 7.2 Run Database Migrations
1. **In Render Web Service:**
   - Go to "Shell" tab
   - Run the following commands:
   ```bash
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   ```

### 7.3 Test the Deployment
1. **Get your service URL:**
   - In Render dashboard, copy your service URL
   - Should be: `https://jobapp-backend.onrender.com`

2. **Test health endpoint:**
   ```bash
   curl https://jobapp-backend.onrender.com/api/health
   ```
   
   **Expected response:**
   ```json
   {"status":"ok","timestamp":"2024-01-01T12:00:00.000000Z"}
   ```

---

# PART 5: CI/CD PIPELINE TESTING

## Step 8: Test the CI Pipeline

### 8.1 Create a Test Feature
```bash
# Create and switch to feature branch
git checkout -b feature/test-ci-pipeline

# Make a small change (add a comment to a file)
echo "// CI/CD Pipeline Test" >> backend/routes/api.php

# Commit the change
git add .
git commit -m "feat: test CI/CD pipeline"

# Push feature branch
git push origin feature/test-ci-pipeline
```

### 8.2 Merge to Staging (No CI Triggered)
```bash
# Switch to staging
git checkout staging
git pull origin staging

# Merge feature branch
git merge feature/test-ci-pipeline

# Push to staging
git push origin staging
```

**Note:** No CI pipeline should run for this push to staging.

### 8.3 Create PR to Main (Triggers CI)
```bash
# Create pull request from staging to main
gh pr create \
  --base main \
  --head staging \
  --title "Test CI/CD Pipeline" \
  --body "Testing the complete CI/CD pipeline with 4-layer testing strategy"
```

### 8.4 Monitor CI Pipeline
1. **Go to your GitHub repository**
2. **Click "Actions" tab**
3. **Watch the CI pipeline execute:**
   - Phase 1: Lint & Validate
   - Phase 2: Unit Tests (parallel with Phase 3)
   - Phase 3: Integration Tests (parallel with Phase 2)
   - Phase 4: E2E Tests
   - Phase 5: Docker Build & Test
   - Phase 6: Security Scan
   - Phase 7: CI Summary

**Expected duration:** 20-30 minutes

### 8.5 Merge PR (Triggers CD)
1. **After CI passes:**
   - Review the PR
   - Click "Merge pull request"
   - Confirm merge

2. **Watch CD Pipeline:**
   - Phase 1: Build & Push Production Images
   - Phase 2: Deploy to Render
   - Phase 3: Deployment Summary

**Expected duration:** 5-10 minutes

---

# PART 6: VERIFICATION AND MONITORING

## Step 9: Verify Complete Setup

### 9.1 Test Production Deployment
```bash
# Test health endpoint
curl https://your-service-name.onrender.com/api/health

# Test with verbose output
curl -v https://your-service-name.onrender.com/api/health
```

### 9.2 Verify Security Features
1. **Check GitHub Container Registry:**
   - Go to your repository → Packages
   - Verify signed container images

2. **Check Security Scans:**
   - Go to repository → Security → Code scanning
   - Verify Trivy scan results

### 9.3 Monitor Pipeline Status
1. **GitHub Actions:**
   - Repository → Actions
   - Check pipeline success rates

2. **Render Dashboard:**
   - Monitor service health
   - Check deployment logs

## Step 10: Set Up Monitoring (Optional)

### 10.1 Enable Render Monitoring
1. **In Render Service:**
   - Go to "Metrics" tab
   - Enable monitoring alerts

### 10.2 Set Up Slack/Discord Notifications (Optional)
```bash
# Add Slack webhook (optional)
gh secret set SLACK_WEBHOOK_URL --body "YOUR_SLACK_WEBHOOK"

# Add Discord webhook (optional)  
gh secret set DISCORD_WEBHOOK_URL --body "YOUR_DISCORD_WEBHOOK"
```

---

# 🎉 SETUP COMPLETE!

## ✅ What You Now Have:

### **Repository:**
- ✅ 4-layer testing strategy (Unit, Integration, E2E, Security)
- ✅ 7-phase CI pipeline with parallel execution
- ✅ 3-phase CD pipeline with zero-downtime deployment
- ✅ Branch protection rules enforcing code quality
- ✅ Security scanning with Trivy, SBOM generation, and Cosign signing

### **Production Environment:**
- ✅ Laravel API deployed on Render
- ✅ PostgreSQL database with migrations
- ✅ Redis cache for sessions and queues
- ✅ HTTPS/TLS encryption
- ✅ Health monitoring and logging

### **CI/CD Pipeline:**
- ✅ Automated testing on every PR to main
- ✅ Automated deployment on merge to main
- ✅ Security scanning and vulnerability detection
- ✅ Container signing for supply chain security
- ✅ Comprehensive reporting and notifications

## 🔄 Daily Workflow:

1. **Developers:**
   ```bash
   git checkout -b feature/new-feature
   # ... make changes ...
   git push origin feature/new-feature
   # Merge to staging manually
   ```

2. **Release to Production:**
   ```bash
   gh pr create --base main --head staging --title "Release v1.x.x"
   # CI pipeline runs automatically
   # After approval and merge, CD pipeline deploys to production
   ```

## 📊 Cost Breakdown:
- **Render Web Service:** $7/month
- **PostgreSQL Database:** $7/month  
- **Redis Cache:** $7/month
- **Total:** ~$21/month

## 🆘 Need Help?

### **Common Issues:**
- **CI Pipeline Fails:** Check `.github/workflows/ci.yml` and fix test failures
- **CD Pipeline Fails:** Verify GitHub secrets and Render configuration
- **Deployment Issues:** Check Render service logs and environment variables

### **Resources:**
- [CI/CD Documentation](.github/CI_CD_SETUP.md)
- [Deployment Guide](deploy/RENDER_DEPLOY.md)
- [Troubleshooting Guide](deploy/DEPLOYMENT_CHECKLIST.md)

### **Support:**
- Create GitHub issues for bugs
- Check Render documentation for deployment issues
- Review pipeline logs in GitHub Actions

---

**🎉 Congratulations! Your JobApp is now production-ready with enterprise-grade CI/CD pipeline!**