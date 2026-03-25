# JobSwipe Backend - Phase 1: Core Swipe Functionality

## 🎯 Overview

Phase 1 implements the core swipe functionality for the JobSwipe platform, enabling applicants to swipe through job postings with a Tinder-like interface. This includes swipe limit enforcement, deduplication, relevance-based deck sorting, and Redis caching with MongoDB fallback.

## 📦 What's Included

### Core Features
- ✅ Job swipe deck with relevance-based sorting
- ✅ Swipe right (apply) and swipe left (dismiss) actions
- ✅ Daily swipe limit enforcement (15 default, configurable)
- ✅ Extra swipes balance support
- ✅ Deduplication (prevents double-swiping)
- ✅ Redis caching with MongoDB fallback
- ✅ Automatic daily swipe reset at midnight PHT
- ✅ Swipe usage tracking and limits endpoint

### Architecture
- **Controller → Service → Repository** pattern
- **Multi-database**: PostgreSQL (relational), MongoDB (documents), Redis (cache)
- **Middleware**: Swipe limit enforcement before request processing
- **Scheduled Jobs**: Daily reset of swipe counters
- **Atomic Transactions**: Ensures data consistency across databases

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
composer install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Run Migrations
```bash
php artisan migrate
```

### 4. Start Services
```bash
# Start Redis, MongoDB, PostgreSQL (via Docker)
cd ..
make docker-up

# Start Laravel dev server
cd backend
php artisan serve
```

### 5. Test the API
```bash
# Health check
curl http://localhost:8000/api/health

# Register a user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"applicant"}'
```

See `API_TESTING_GUIDE.md` for complete testing instructions.

## 📁 File Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Applicant/
│   │   │       └── SwipeController.php          # 4 swipe endpoints
│   │   └── Middleware/
│   │       └── CheckSwipeLimit.php              # Limit enforcement
│   ├── Jobs/
│   │   └── ResetDailySwipesJob.php             # Daily reset job
│   ├── Repositories/
│   │   ├── MongoDB/
│   │   │   └── SwipeHistoryRepository.php      # Swipe history queries
│   │   ├── PostgreSQL/
│   │   │   └── ApplicationRepository.php       # Application CRUD
│   │   └── Redis/
│   │       └── SwipeCacheRepository.php        # Redis caching
│   └── Services/
│       ├── DeckService.php                     # Deck generation & sorting
│       └── SwipeService.php                    # Swipe business logic
├── routes/
│   ├── api.php                                 # API routes
│   └── console.php                             # Scheduled jobs
├── API_TESTING_GUIDE.md                        # Complete testing guide
├── PHASE1_IMPLEMENTATION_SUMMARY.md            # Implementation details
├── PHASE1_VERIFICATION_CHECKLIST.md            # Testing checklist
└── ROUTES_REFERENCE.md                         # Quick route reference
```

## 🔌 API Endpoints

### Swipe Endpoints (Authenticated)
```
GET    /api/v1/applicant/swipe/deck              # Get job deck
GET    /api/v1/applicant/swipe/limits            # Get swipe limits
POST   /api/v1/applicant/swipe/right/{job_id}    # Apply to job
POST   /api/v1/applicant/swipe/left/{job_id}     # Dismiss job
```

### Authentication Endpoints
```
POST   /api/v1/auth/register                     # Register new user
POST   /api/v1/auth/login                        # Login
POST   /api/v1/auth/verify-email                 # Verify OTP
POST   /api/v1/auth/logout                       # Logout
GET    /api/v1/auth/me                           # Get current user
```

See `ROUTES_REFERENCE.md` for complete route documentation.

## 🧪 Testing

### Run All Tests
```bash
php artisan test
```

### Manual Testing
Follow the step-by-step guide in `API_TESTING_GUIDE.md`:
1. Register and authenticate
2. Get job deck
3. Check swipe limits
4. Swipe right/left on jobs
5. Verify deduplication
6. Test limit enforcement

### Verification Checklist
Use `PHASE1_VERIFICATION_CHECKLIST.md` to verify all functionality:
- [ ] Functional tests
- [ ] Database verification
- [ ] Redis caching
- [ ] Error handling
- [ ] Performance benchmarks

## 🗄️ Database Schema

### PostgreSQL Tables
- `users` - User accounts
- `applicant_profiles` - Applicant metadata (points, limits, subscription)
- `applications` - Job applications (created on swipe right)
- `job_postings` - Job listings

### MongoDB Collections
- `swipe_history` - Source of truth for all swipes
- `applicant_profiles` - Rich profile data (skills, experience)

### Redis Keys
- `swipe:counter:{user_id}:{date}` - Daily swipe counter
- `swipe:deck:seen:{user_id}` - Seen job IDs (Set)
- `points:{user_id}` - Cached points value

## 🔄 Data Flow

### Swipe Right Flow
```
1. Request → CheckSwipeLimit Middleware
2. SwipeController → SwipeService
3. Check Redis for deduplication
4. If miss → Check MongoDB → Rehydrate Redis
5. Write to MongoDB (swipe_history)
6. Write to PostgreSQL (applications)
7. Update Redis cache (counter + seen Set)
8. Return success response
```

### Get Deck Flow
```
1. Request → SwipeController → DeckService
2. Get seen job IDs from Redis
3. If miss → Query MongoDB → Rehydrate Redis
4. Query PostgreSQL for active jobs (exclude seen)
5. Load applicant skills from MongoDB
6. Calculate relevance scores
7. Sort by relevance DESC
8. Return top N jobs
```

## 📊 Relevance Algorithm

Jobs are sorted by a weighted relevance score:

```
Score = (skill_match × 0.7) + (recency × 0.3) + location_bonus + remote_bonus

Where:
- skill_match: 0.0-1.0 (matched skills / total job skills)
- recency: 1.0 (<7d), 0.8 (7-14d), 0.6 (14-30d), 0.4 (>30d)
- location_bonus: 0.1 if same city, else 0.0
- remote_bonus: 0.05 if remote, else 0.0
```

## ⏰ Scheduled Jobs

### Daily Swipe Reset
Runs daily at midnight Philippine Time (UTC+8):
```bash
# Manual trigger
php artisan queue:work --once
```

**What it does:**
1. Resets all `daily_swipes_used` to 0
2. Updates `swipe_reset_at` timestamp
3. Clears Redis counter keys
4. Logs completion

**Setup cron:**
```bash
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
```

## 🔧 Configuration

### Environment Variables
```env
# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=jobswipe
DB_USERNAME=postgres
DB_PASSWORD=secret

# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=jobswipe

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null

# App
APP_TIMEZONE=Asia/Manila
```

### Swipe Limits (Configurable)
Default limits are set in the database:
- Free tier: 15 swipes/day
- Basic tier: 15 swipes/day
- Pro tier: Unlimited

Modify in `applicant_profiles` table:
```sql
UPDATE applicant_profiles 
SET daily_swipe_limit = 20 
WHERE subscription_tier = 'basic';
```

## 🐛 Troubleshooting

### Issue: Swipe limit not enforced
**Solution:** Verify middleware is registered in `bootstrap/app.php`

### Issue: Jobs appearing after swiping
**Solution:** Check Redis Set contains job ID, verify MongoDB record exists

### Issue: Redis connection failed
**Solution:** Ensure Redis is running, check `REDIS_HOST` in `.env`

### Issue: Deck returns empty
**Solution:** Verify active job postings exist, check `status = 'active'`

### Issue: Daily reset not running
**Solution:** Verify cron is configured, check scheduler logs

## 📚 Documentation

- **API_TESTING_GUIDE.md** - Complete API testing guide with examples
- **PHASE1_IMPLEMENTATION_SUMMARY.md** - Detailed implementation overview
- **PHASE1_VERIFICATION_CHECKLIST.md** - Testing and verification checklist
- **ROUTES_REFERENCE.md** - Quick reference for all routes

## 🔜 Next Steps (Phase 2)

After Phase 1 is tested and deployed:
1. Job Posting CRUD endpoints
2. Job publishing workflow
3. Skill tagging system
4. Meilisearch integration
5. Job expiration handling

See `IMPLEMENTATION_ROADMAP.md` for the complete roadmap.

## 🤝 Contributing

### Code Style
```bash
# Format code
php vendor/bin/pint

# Check formatting
php vendor/bin/pint --test
```

### Commit Guidelines
- Follow conventional commits
- Reference issue numbers
- Keep commits atomic

## 📞 Support

For issues or questions:
1. Check documentation files in `backend/`
2. Review logs: `storage/logs/laravel.log`
3. Verify service bindings in `AppServiceProvider.php`
4. Test with examples in `API_TESTING_GUIDE.md`

## ✅ Phase 1 Completion Criteria

Phase 1 is complete when:
- [x] All 4 swipe endpoints functional
- [x] Redis caching with MongoDB fallback working
- [x] Swipe limits enforced correctly
- [x] Deduplication prevents double swipes
- [x] Deck sorting by relevance accurate
- [x] Daily reset job scheduled
- [x] All services registered
- [x] Middleware blocks limit-exceeded requests
- [x] Documentation complete

---

**Version:** 1.0.0  
**Last Updated:** March 24, 2026  
**Status:** ✅ Phase 1 Complete
