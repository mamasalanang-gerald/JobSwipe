# 🚀 Render Deployment Checklist

## Pre-Deployment Security Check ✅

### 1. Verify Secrets are Protected
- [ ] `.env` files are in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] Production secrets generated using `./generate-secrets.sh`
- [ ] Secrets stored securely (password manager)

### 2. Code Repository
- [ ] All code committed to git
- [ ] Pushed to GitHub/GitLab
- [ ] Repository is accessible to Render

## Render Setup Steps 🔧

### 3. Create Render Account
- [ ] Sign up at [render.com](https://render.com)
- [ ] Connect GitHub/GitLab account
- [ ] Verify email address

### 4. Deploy Using Blueprint (Recommended)
- [ ] Copy `deploy/render.yaml` to repository root
- [ ] In Render: New → Blueprint
- [ ] Select your repository
- [ ] Choose `render.yaml` file

### 5. Manual Setup (Alternative)
- [ ] New → Web Service
- [ ] Connect repository
- [ ] Environment: Docker
- [ ] Dockerfile path: `./Dockerfile`
- [ ] Port: 8080 (auto-detected)

## Database Services 🗄️

### 6. PostgreSQL Database
- [ ] New → PostgreSQL
- [ ] Name: `jobapp-postgres`
- [ ] Plan: Starter ($7/month)
- [ ] Region: Same as web service
- [ ] Copy connection details

### 7. Redis Cache
- [ ] New → Redis  
- [ ] Name: `jobapp-redis`
- [ ] Plan: Starter ($7/month)
- [ ] Region: Same as web service
- [ ] Copy connection details

## Environment Variables 🔐

### 8. Set Required Variables
Copy from `deploy/.env.render.template`:

**Application:**
- [ ] `APP_NAME=JobApp`
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_KEY=` (from generate-secrets.sh)
- [ ] `APP_URL=` (your Render service URL)

**Database:**
- [ ] `DB_CONNECTION=pgsql`
- [ ] `DB_HOST=` (from PostgreSQL service)
- [ ] `DB_PORT=5432`
- [ ] `DB_DATABASE=` (from PostgreSQL service)
- [ ] `DB_USERNAME=` (from PostgreSQL service)
- [ ] `DB_PASSWORD=` (from PostgreSQL service)

**Redis:**
- [ ] `REDIS_HOST=` (from Redis service)
- [ ] `REDIS_PORT=6379`
- [ ] `REDIS_PASSWORD=` (from Redis service)

**Authentication:**
- [ ] `JWT_SECRET=` (from generate-secrets.sh)

## Post-Deployment 🎯

### 9. Initial Setup
- [ ] Service deployed successfully
- [ ] Health check passes: `/api/health`
- [ ] No errors in deployment logs

### 10. Database Migration
- [ ] Open service shell in Render
- [ ] Run: `php artisan migrate --force`
- [ ] Verify tables created

### 11. Testing
- [ ] API health endpoint works
- [ ] Database connection successful
- [ ] Redis connection successful
- [ ] JWT authentication working

## Optional Enhancements 🚀

### 12. Custom Domain
- [ ] Add custom domain in Render
- [ ] Update DNS records
- [ ] SSL certificate auto-provisioned

### 13. Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure log monitoring
- [ ] Set up uptime monitoring

### 14. Background Workers (if needed)
- [ ] New → Background Worker
- [ ] Command: `php artisan queue:work redis`
- [ ] Same environment variables as web service

## Security Verification 🔒

### 15. Final Security Check
- [ ] No secrets in git history
- [ ] Environment variables set correctly
- [ ] HTTPS enabled (automatic)
- [ ] Database connections encrypted
- [ ] JWT secrets are strong

## Troubleshooting 🔧

### Common Issues:
- **502 Error**: Check port 8080 configuration
- **Database Error**: Verify connection strings
- **JWT Error**: Ensure JWT_SECRET is set
- **Build Error**: Check Dockerfile syntax

### Useful Commands:
```bash
# Generate secrets locally
./deploy/generate-secrets.sh

# Test Docker build locally
docker build -t jobapp-test .

# Check Laravel configuration
php artisan config:show
```

## Cost Estimate 💰

**Minimum Setup:**
- Web Service: $7/month
- PostgreSQL: $7/month  
- Redis: $7/month
- **Total: ~$21/month**

---

✅ **Deployment Complete!**
Your Laravel API will be available at: `https://your-service-name.onrender.com`