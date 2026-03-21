# ⚡ Quick Deploy Steps - JobSwipe

## 🎯 What You Need to Do Right Now

### 1️⃣ Add MONGO_DSN to Render (2 minutes)

1. Go to: https://dashboard.render.com
2. Click on your **JobSwipe** service
3. Click **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Add:
   ```
   Key: MONGO_DSN
   Value: <YOUR_MONGODB_CONNECTION_STRING>
   ```
   Get this from MongoDB Atlas → Connect → Drivers
6. Click **Save Changes**

This will automatically trigger a new deployment.

### 2️⃣ Watch the Deployment (5-10 minutes)

1. Stay on the Render dashboard
2. Click **Logs** in the left sidebar
3. Watch for these success messages:
   ```
   ✓ Building Docker image...
   ✓ Starting container...
   ✓ Running migrations...
   ✓ Service live at https://jobswipe-eff8.onrender.com
   ```

### 3️⃣ Test the API (1 minute)

Open your browser or use curl:
```bash
https://jobswipe-eff8.onrender.com/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-03-21T..."}
```

## ✅ If Everything Works

You'll see:
- ✅ Deployment succeeded
- ✅ Health check returns 200 OK
- ✅ No errors in logs

**Next**: Set up GitHub secrets for automated deployments

## ❌ If Something Fails

Check the Render logs for errors:

**Common Error 1: MongoDB Connection Failed**
- Solution: Verify MONGO_DSN is correct
- Check: MongoDB Atlas IP whitelist includes 0.0.0.0/0

**Common Error 2: PostgreSQL Connection Failed**
- Solution: Verify DB_* environment variables
- Check: Database exists and credentials are correct

**Common Error 3: Port Binding Failed**
- Solution: Dockerfile already uses port 8080 (correct for Render)
- Check: No conflicting port configurations

## 📞 Need Help?

1. Check `RENDER_DEPLOYMENT_GUIDE.md` for detailed troubleshooting
2. Check `DEPLOYMENT_STATUS.md` for current configuration
3. Review Render logs for specific error messages

## 🚀 After Successful Deployment

### Set Up GitHub Secrets (Optional - for CD pipeline)

1. Go to GitHub repository → Settings → Secrets → Actions
2. Add **RENDER_API_KEY**:
   - Get from: Render Dashboard → Account Settings → API Keys
3. Add **RENDER_SERVICE_ID**:
   - Get from: Your Render service details
   - Format: `srv-xxxxxxxxxxxxx`

### Test Automated Deployment

1. Make a small change to your code
2. Push to `main` branch
3. Watch GitHub Actions run the CD pipeline
4. Verify deployment succeeds automatically

---

**Time Estimate**: 10-15 minutes total
**Difficulty**: Easy
**Status**: Ready to deploy! 🚀
