# Deploy JobApp to Render

This guide will help you deploy your Laravel backend to Render using Docker.

## 🚀 Quick Deploy Steps

### 1. Prepare Your Repository
- Ensure your code is pushed to GitHub
- The `Dockerfile` at root level is ready for production deployment

### 2. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with your GitHub account

### 3. Deploy Backend (Laravel API)

#### Option A: Using Render Dashboard
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `jobapp-backend`
   - **Environment**: `Docker`
   - **Region**: `Oregon` (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Docker Command**: Leave blank (uses Dockerfile CMD)

#### Option B: Using render.yaml (Recommended)
1. Push the `render.yaml` file to your repo
2. In Render dashboard: "New +" → "Blueprint"
3. Connect your repo and select `render.yaml`

### 4. Set Environment Variables

In Render dashboard, go to your service → Environment:

**Required Variables:**
```
APP_NAME=JobApp
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:YOUR_GENERATED_KEY
JWT_SECRET=your-super-secret-jwt-key
```

**Database Variables (after creating PostgreSQL):**
```
DB_CONNECTION=pgsql
DB_HOST=your-postgres-host
DB_PORT=5432
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
```

**Redis Variables (after creating Redis):**
```
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### 5. Create Database Services

#### PostgreSQL Database
1. "New +" → "PostgreSQL"
2. Name: `jobapp-postgres`
3. Plan: `Starter` ($7/month)
4. Copy connection details to your web service environment

#### Redis Cache
1. "New +" → "Redis"
2. Name: `jobapp-redis`  
3. Plan: `Starter` ($7/month)
4. Copy connection details to your web service environment

### 6. Deploy & Test

1. Your service will automatically deploy
2. Check logs for any errors
3. Test health endpoint: `https://your-app.onrender.com/api/health`
4. Should return: `{"status":"ok","timestamp":"..."}`

## 🔧 Production Optimizations

### Database Migrations
After first deploy, run migrations:
1. Go to your service → Shell
2. Run: `php artisan migrate --force`

### Queue Workers (Optional)
For background jobs, add a Background Worker:
1. "New +" → "Background Worker"
2. Build Command: `composer install --no-dev`
3. Start Command: `php artisan queue:work redis --sleep=3 --tries=3`

### File Storage
For file uploads, consider:
- AWS S3 (recommended)
- Render Persistent Disks

## 🚨 Common Issues & Fixes

### Issue: 502 Bad Gateway
**Fix**: Check that your app listens on port 8080
- Dockerfile exposes port 8080 ✅
- Nginx configured for port 8080 ✅

### Issue: Database Connection Failed
**Fix**: Verify environment variables
- Check DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD
- Ensure PostgreSQL service is running

### Issue: JWT Token Errors
**Fix**: Generate proper JWT secret
```bash
# Generate 32-character random string
openssl rand -base64 32
```

### Issue: Storage Permissions
**Fix**: Already handled in Dockerfile
- Storage directories created with proper permissions ✅

## 📊 Monitoring

### Health Check
- Endpoint: `/api/health`
- Render automatically monitors this endpoint

### Logs
- View logs in Render dashboard
- Logs are sent to stderr for Render compatibility

## 💰 Estimated Costs

**Minimum Setup:**
- Web Service (Starter): $7/month
- PostgreSQL (Starter): $7/month
- Redis (Starter): $7/month
- **Total: ~$21/month**

**Production Setup:**
- Web Service (Standard): $25/month
- PostgreSQL (Standard): $20/month
- Redis (Standard): $20/month
- **Total: ~$65/month**

## 🔄 CI/CD

Render automatically deploys when you push to your main branch:
1. Push code to GitHub
2. Render detects changes
3. Builds new Docker image
4. Deploys automatically
5. Zero-downtime deployment ✅

## 🌐 Custom Domain

1. Go to your service → Settings
2. Add custom domain
3. Update DNS records as instructed
4. SSL certificate automatically provisioned

## 📱 Next Steps

After backend is deployed:
1. Deploy frontend (React/Next.js) to Render Static Site
2. Update frontend API URLs to point to your backend
3. Set up MongoDB Atlas for document storage
4. Configure email service (SendGrid, Mailgun)
5. Set up monitoring (Sentry, LogRocket)

Your Laravel backend will be live at: `https://your-app-name.onrender.com`