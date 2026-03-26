# Render Configuration Fix Guide

## Problem
Render is NOT using the Dockerfile's `/start.sh` script. Instead, it's running Laravel commands directly from a Pre-Deploy Command or Start Command configured in the dashboard.

Your logs show:
```
INFO  Nothing to migrate.
INFO  Configuration cached successfully.
INFO  Routes cached successfully.
```

This means Render is running:
- `php artisan migrate --force`
- `php artisan config:cache`
- `php artisan route:cache`

But it's NOT running:
- `php artisan route:clear` (before caching)
- `php artisan mongo:setup`

## Solution: Update Render Dashboard Settings

### Step 1: Find the Override Commands

Go to your Render dashboard for `jobapp-backend-latest`:

1. Click on your service
2. Go to **Settings** tab
3. Look for these fields:
   - **Pre-Deploy Command** (most likely location)
   - **Start Command** (alternative location)
   - **Docker Command** (override for CMD)

### Step 2: Update the Commands

**Option A: If you find a Pre-Deploy Command**

Replace it with:
```bash
/pre-deploy.sh
```

This will run the new pre-deploy script that:
- Clears all caches
- Runs migrations
- Sets up MongoDB
- Does NOT cache yet (caching happens in start.sh)

**Option B: If you find a Start Command**

Replace it with:
```bash
/start.sh
```

This ensures the Dockerfile's CMD is used.

**Option C: If you find a Docker Command**

Remove it entirely, or set it to:
```bash
/start.sh
```

### Step 3: Save and Redeploy

1. Click **Save Changes**
2. Click **Manual Deploy** → **Deploy latest commit**
3. Wait for deployment to complete

### Step 4: Verify the Fix

After deployment, check the logs for these messages:

```
=== Pre-Deploy: Clearing caches ===
=== Pre-Deploy: Running migrations ===
=== Pre-Deploy: Setting up MongoDB ===
=== Starting JobApp Backend ===
Clearing all caches...
Setting up MongoDB collections...
Connecting to MongoDB...
Created collection: applicant_profiles
Created collection: company_profiles
Created collection: swipe_history
MongoDB setup completed successfully!
```

### Step 5: Test the Routes

```bash
# Test health endpoint
curl https://jobapp-backend-latest.onrender.com/api/health

# Test debug endpoint (should work now, not 404)
curl https://jobapp-backend-latest.onrender.com/api/debug/database

# Test auth routes
curl -X POST https://jobapp-backend-latest.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"applicant"}'
```

## Alternative: If No Override Found

If you don't find any Pre-Deploy Command or Start Command override, the issue might be:

1. **Cached Docker Image**: Render is using an old cached image
   - Solution: Force rebuild by changing something in Dockerfile (add a comment)
   - Commit and push to trigger CI/CD
   - Wait for new image to be built and pushed

2. **Render.yaml Override**: Check if there's a `render.yaml` in your repo root
   - Solution: We already checked `deploy/render.yaml` - it's clean
   - Make sure there's no `render.yaml` in the root directory

## Verification Checklist

After fixing:

- [ ] PostgreSQL migrations run successfully
- [ ] MongoDB collections created (3 collections)
- [ ] Routes work (no 404 errors)
- [ ] `/api/health` returns `{"status":"ok"}`
- [ ] `/api/debug/database` returns database info
- [ ] `/api/v1/auth/register` accepts POST requests

## Database Verification Commands

### PostgreSQL (Already Working ✅)
```bash
# Use your PostgreSQL connection string from Render dashboard
docker run -it --rm postgres:15-alpine psql postgresql://username:password@host:5432/database -c "\dt"
```

### Redis (Test Connection)
```bash
docker run -it --rm redis:7-alpine redis-cli -h red-d6v36u6a2pns73ab5h7g.oregon-redis.render.com -p 6379 ping
```

Note: If Redis requires a password, add `-a YOUR_PASSWORD`

### MongoDB (Check Collections)
After the fix, check MongoDB Atlas dashboard:
- Database: `jobswipe`
- Expected collections: `applicant_profiles`, `company_profiles`, `swipe_history`

## Need Help?

If the issue persists after following these steps:

1. Share the full deployment logs from Render
2. Share screenshots of the Settings page showing Pre-Deploy Command and Start Command
3. Confirm the Docker image tag being used
