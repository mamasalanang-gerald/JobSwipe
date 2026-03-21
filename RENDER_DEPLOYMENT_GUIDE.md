# 🚀 Render Deployment Guide - JobSwipe

## ✅ Current Status

You've completed the following steps:
- ✅ Created PostgreSQL database on Render
- ✅ Created Redis instance on Render
- ✅ Created MongoDB Atlas cluster
- ✅ Added all environment variables to Render

## 📋 Next Steps to Complete Deployment

### Step 1: Add GitHub Secrets for CD Pipeline

Your CD workflow requires these GitHub secrets. Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret:

1. **RENDER_API_KEY**
   - Go to Render Dashboard → Account Settings → API Keys
   - Create a new API key
   - Copy and add to GitHub secrets

2. **RENDER_SERVICE_ID**
   - Go to your Render service (JobSwipe)
   - Copy the Service ID from the URL or service details
   - Format: `srv-xxxxxxxxxxxxx`
   - Add to GitHub secrets

### Step 2: Update Render Environment Variables

You need to add ONE more variable for MongoDB Atlas connection:

Go to Render Dashboard → JobSwipe service → Environment → Add:

```
MONGO_DSN=<YOUR_MONGODB_CONNECTION_STRING>
```

Get this from MongoDB Atlas dashboard → Connect → Drivers.

### Step 3: Test Manual Deployment

Before setting up automated CD, test manual deployment:

1. Go to Render Dashboard → JobSwipe service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Watch the deployment logs for any errors

### Step 4: Monitor Deployment Logs

Watch for these key indicators in the logs:

✅ **Success indicators:**
```
✓ Docker image built successfully
✓ Container started
✓ PHP-FPM started
✓ Nginx started
✓ Application ready on port 8080
```

❌ **Common errors to watch for:**
- Database connection errors
- MongoDB connection errors
- Redis connection errors
- Missing environment variables
- Port binding issues

### Step 5: Test the Deployed API

Once deployment succeeds, test your API:

```bash
# Test health endpoint
curl https://jobswipe-eff8.onrender.com/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2026-03-21T..."
}
```

### Step 6: Verify Database Connections

Check that all databases are connected:

1. **PostgreSQL**: Check Render logs for migration success
2. **MongoDB**: Test MongoDB connection from your app
3. **Redis**: Check Redis connection in logs

### Step 7: Run Database Migrations

The Dockerfile automatically runs migrations on startup:
```bash
php artisan migrate --force
```

Check the logs to ensure migrations ran successfully.

## 🔧 Troubleshooting

### Issue: MongoDB Connection Failed

**Solution**: Make sure you added the `MONGO_DSN` environment variable with the full connection string.

### Issue: Redis Connection Failed

**Solution**: Verify `REDIS_HOST` matches your Redis instance hostname from Render.

### Issue: PostgreSQL Connection Failed

**Solution**: Double-check all DB_* environment variables match your PostgreSQL credentials.

### Issue: Port 8080 Not Accessible

**Solution**: Render requires port 8080. The Dockerfile is already configured for this.

### Issue: APP_KEY Not Set

**Solution**: The startup script generates this automatically, but you can also set it manually in Render environment variables.

## 📊 Deployment Checklist

- [ ] GitHub secrets added (RENDER_API_KEY, RENDER_SERVICE_ID)
- [ ] MONGO_DSN environment variable added to Render
- [ ] Manual deployment tested successfully
- [ ] Health check endpoint responding
- [ ] Database migrations completed
- [ ] All database connections verified
- [ ] API endpoints accessible
- [ ] CD pipeline tested (push to main branch)

## 🎯 Testing the CD Pipeline

Once GitHub secrets are added:

1. Make a small change to your code
2. Commit and push to `main` branch
3. Go to GitHub → Actions tab
4. Watch the CD pipeline run
5. Verify deployment succeeds

## 🌐 Production URLs

- **API Base URL**: `https://jobswipe-eff8.onrender.com`
- **Health Check**: `https://jobswipe-eff8.onrender.com/api/health`
- **API Endpoints**: `https://jobswipe-eff8.onrender.com/api/v1/*`

## 📝 Important Notes

1. **Free Tier Limitations**:
   - Services spin down after 15 minutes of inactivity
   - First request after spin-down takes 30-60 seconds
   - Consider upgrading to paid tier for production

2. **Database Backups**:
   - PostgreSQL: Render provides automatic backups on paid plans
   - MongoDB Atlas: Configure backup schedule in Atlas dashboard

3. **Monitoring**:
   - Use Render's built-in logs and metrics
   - Consider adding external monitoring (e.g., Sentry, New Relic)

4. **Security**:
   - All secrets are stored securely in Render
   - HTTPS is enabled by default
   - Keep your API keys and passwords secure

## 🚀 Next Steps After Deployment

1. Set up frontend deployment (Next.js web app)
2. Configure CORS for frontend access
3. Set up monitoring and alerting
4. Configure custom domain (optional)
5. Set up staging environment
6. Configure CI/CD for frontend

---

**Need Help?** Check the logs in Render Dashboard or review the troubleshooting section above.
