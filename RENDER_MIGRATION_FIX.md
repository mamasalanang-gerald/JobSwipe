# Render Migration Fix Guide

## Problem
Migrations are not running on Render, causing database tables to not be created in PostgreSQL, Redis, and MongoDB.

## Root Causes
1. Pre-built Docker image might not be executing the startup script properly
2. MongoDB Atlas connection string was incorrect (using `mongodb://` instead of `mongodb+srv://`)
3. No database readiness checks before running migrations

## Solutions Applied

### 1. Updated Dockerfile `/start.sh`
- Added PostgreSQL readiness check
- Added better error handling for migrations
- Added verbose logging to track startup progress
- Fixed MongoDB setup to handle Atlas connections

### 2. Fixed MongoDB Connection
- Updated `MongoSetup.php` to detect MongoDB Atlas hosts
- Uses `mongodb+srv://` protocol for Atlas
- Properly URL-encodes credentials

## Deployment Steps

### Step 1: Rebuild and Push Docker Image

```bash
# Build the new image
docker build -t gm1026/jobapp-backend:latest .

# Push to Docker Hub
docker push gm1026/jobapp-backend:latest
```

### Step 2: Update Render Environment Variables

In your Render dashboard for `jobapp-backend-latest` service:

1. Verify these PostgreSQL variables are set:
   - `DB_CONNECTION=pgsql`
   - `DB_HOST` (from Render PostgreSQL)
   - `DB_PORT=5432`
   - `DB_DATABASE` (from Render PostgreSQL)
   - `DB_USERNAME` (from Render PostgreSQL)
   - `DB_PASSWORD` (from Render PostgreSQL)

2. Verify Redis variables:
   - `REDIS_HOST` (from Render Redis)
   - `REDIS_PORT=6379`
   - `REDIS_PASSWORD` (from Render Redis dashboard)
   - `CACHE_DRIVER=redis`
   - `SESSION_DRIVER=redis`
   - `QUEUE_CONNECTION=redis`

3. Fix MongoDB variables for Atlas:
   - `MONGO_HOST=your-cluster.mongodb.net` (NO PORT in hostname for Atlas)
   - `MONGO_PORT=27017` (keep this, but it won't be used for Atlas)
   - `MONGO_DATABASE=jobswipe`
   - `MONGO_ROOT_USERNAME=your_mongodb_username`
   - `MONGO_ROOT_PASSWORD=your_mongodb_password`

### Step 3: Trigger Redeploy

In Render dashboard:
1. Go to your `jobapp-backend-latest` service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Or click "Clear build cache & deploy"

### Step 4: Monitor Logs

Watch the deployment logs for:
```
=== Starting JobApp Backend ===
Waiting for PostgreSQL...
PostgreSQL is ready!
Clearing caches...
Running PostgreSQL migrations...
Migration: [timestamp]_create_users_table
Migrated: [timestamp]_create_users_table
...
Setting up MongoDB collections...
Created collection: applicant_profiles
...
=== Startup complete, starting services ===
```

### Step 5: Verify Tables Created

#### PostgreSQL Tables
You can verify by checking your application logs or using Render's PostgreSQL connection:

Expected tables:
- users
- applicant_profiles
- company_profiles
- job_postings
- job_skills
- applications
- subscriptions
- swipe_packs
- points_events
- company_reviews
- company_verifications
- notifications
- personal_access_tokens
- sessions

#### MongoDB Collections
Expected collections in MongoDB Atlas:
- applicant_profiles
- company_profiles
- swipe_history

#### Redis
Redis doesn't need migrations - it's a key-value store that creates keys on demand.

## Troubleshooting

### If migrations still don't run:

1. **Check logs for database connection errors**
   ```
   PostgreSQL is unavailable - sleeping
   ```
   This means the database isn't ready yet. The script will retry.

2. **Check if APP_KEY is set**
   Laravel needs APP_KEY to run. Render should auto-generate this.

3. **Manually run migrations via Render Shell**
   - Go to Render dashboard → your service → Shell tab
   - Run: `php artisan migrate --force`
   - Run: `php artisan mongo:setup`

4. **Check MongoDB connection**
   If MongoDB setup fails, verify:
   - MongoDB Atlas cluster is running
   - IP whitelist includes `0.0.0.0/0` (allow all) or Render's IPs
   - Database user has read/write permissions

### Common Errors

**Error: "SQLSTATE[08006] Connection refused"**
- PostgreSQL isn't ready or credentials are wrong
- Check `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD` in Render env vars

**Error: "No application encryption key has been specified"**
- `APP_KEY` is missing
- Run: `php artisan key:generate --force` in Render shell

**Error: "MongoDB connection failed"**
- Check MongoDB Atlas IP whitelist
- Verify credentials are correct
- Ensure using `mongodb+srv://` for Atlas

## Testing After Deployment

### Test PostgreSQL
```bash
curl https://jobapp-backend-latest.onrender.com/api/health
```

### Test API Endpoints
```bash
# Register a user (should create record in PostgreSQL)
curl -X POST https://jobapp-backend-latest.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "applicant"
  }'
```

If this works, your PostgreSQL tables are created and working!

## Quick Fix Alternative (If Docker rebuild doesn't work)

If you can't rebuild the Docker image, you can manually run migrations via Render Shell:

1. Go to Render dashboard → `jobapp-backend-latest` → Shell
2. Run these commands:
   ```bash
   cd /var/www/html
   php artisan config:clear
   php artisan migrate --force
   php artisan mongo:setup
   ```

This will create all tables immediately without redeploying.
