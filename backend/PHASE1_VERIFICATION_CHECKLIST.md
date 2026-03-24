# Phase 1 Verification Checklist

Use this checklist to verify that Phase 1 (Core Swipe Functionality) is fully implemented and working correctly.

## 📋 Pre-Deployment Verification

### 1. Code Files Created ✅

- [x] `app/Repositories/Redis/SwipeCacheRepository.php` - Complete implementation
- [x] `app/Services/SwipeService.php` - All methods implemented
- [x] `app/Services/DeckService.php` - Deck generation with relevance scoring
- [x] `app/Http/Controllers/Applicant/SwipeController.php` - 4 endpoints
- [x] `app/Http/Middleware/CheckSwipeLimit.php` - Limit enforcement
- [x] `app/Jobs/ResetDailySwipesJob.php` - Daily reset job
- [x] `routes/api.php` - Swipe routes added
- [x] `routes/console.php` - Schedule configured
- [x] `bootstrap/app.php` - Middleware registered

### 2. Repository Updates ✅

- [x] `SwipeHistoryRepository` - Added 4 new methods
- [x] `ApplicationRepository` - Updated create() and added markInvited()

### 3. Service Provider Registration ✅

- [x] `SwipeCacheRepository` registered as singleton
- [x] `SwipeService` registered as singleton
- [x] `DeckService` registered as singleton
- [x] `JobPostingRepository` registered as singleton

### 4. Documentation Created ✅

- [x] `API_TESTING_GUIDE.md` - Complete testing guide
- [x] `PHASE1_IMPLEMENTATION_SUMMARY.md` - Implementation overview
- [x] `ROUTES_REFERENCE.md` - Quick reference
- [x] `PHASE1_VERIFICATION_CHECKLIST.md` - This file

---

## 🧪 Functional Testing

### Test 1: Basic Swipe Flow
```bash
# Step 1: Register and get token
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"applicant"}'

# Step 2: Verify email (use OTP from email/logs)
curl -X POST http://localhost:8000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'

# Save the token from response!

# Step 3: Get job deck
curl -X GET http://localhost:8000/api/v1/applicant/swipe/deck \
  -H "Authorization: Bearer YOUR_TOKEN"

# Step 4: Check limits
curl -X GET http://localhost:8000/api/v1/applicant/swipe/limits \
  -H "Authorization: Bearer YOUR_TOKEN"

# Step 5: Swipe right on a job
curl -X POST http://localhost:8000/api/v1/applicant/swipe/right/JOB_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Step 6: Verify limits updated
curl -X GET http://localhost:8000/api/v1/applicant/swipe/limits \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Results:**
- [ ] Deck returns list of jobs
- [ ] Limits show correct usage (0 initially)
- [ ] Swipe right succeeds with 200 status
- [ ] Limits show incremented usage (1 after swipe)
- [ ] Swiped job excluded from next deck call

---

### Test 2: Swipe Limit Enforcement
```bash
# Swipe 15 times (default limit)
for i in {1..15}; do
  curl -X POST http://localhost:8000/api/v1/applicant/swipe/right/JOB_ID_$i \
    -H "Authorization: Bearer YOUR_TOKEN"
done

# Attempt 16th swipe
curl -X POST http://localhost:8000/api/v1/applicant/swipe/right/JOB_ID_16 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Results:**
- [ ] First 15 swipes succeed (200)
- [ ] 16th swipe fails with 429 status
- [ ] Error code is `SWIPE_LIMIT_REACHED`
- [ ] Error message mentions upgrade/purchase

---

### Test 3: Deduplication
```bash
# Swipe right on job A
curl -X POST http://localhost:8000/api/v1/applicant/swipe/right/JOB_A \
  -H "Authorization: Bearer YOUR_TOKEN"

# Attempt to swipe right on job A again
curl -X POST http://localhost:8000/api/v1/applicant/swipe/right/JOB_A \
  -H "Authorization: Bearer YOUR_TOKEN"

# Attempt to swipe left on job A
curl -X POST http://localhost:8000/api/v1/applicant/swipe/left/JOB_A \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Results:**
- [ ] First swipe succeeds (200)
- [ ] Second swipe fails with 409 status
- [ ] Error code is `ALREADY_SWIPED`
- [ ] Third swipe also fails (409)

---

### Test 4: Deck Relevance Sorting
```bash
# Get deck for user with specific skills
curl -X GET http://localhost:8000/api/v1/applicant/swipe/deck \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Results:**
- [ ] Jobs with matching skills appear first
- [ ] Recent jobs ranked higher than old ones
- [ ] Remote jobs get slight boost
- [ ] Same-city jobs get location bonus
- [ ] Each job has `relevance_score` field

---

## 🗄️ Database Verification

### PostgreSQL Checks
```sql
-- Check application created
SELECT * FROM applications 
WHERE applicant_id = 'YOUR_APPLICANT_ID' 
ORDER BY created_at DESC 
LIMIT 5;

-- Check swipe counter updated
SELECT daily_swipes_used, daily_swipe_limit, extra_swipes_balance 
FROM applicant_profiles 
WHERE user_id = 'YOUR_USER_ID';

-- Verify application status
SELECT status, invitation_message, invited_at 
FROM applications 
WHERE id = 'APPLICATION_ID';
```

**Expected Results:**
- [ ] Application record exists with status 'applied'
- [ ] `daily_swipes_used` increments correctly
- [ ] Timestamps are accurate

---

### MongoDB Checks
```javascript
// Check swipe history
db.swipe_history.find({
  user_id: "YOUR_USER_ID",
  actor_type: "applicant"
}).sort({ swiped_at: -1 }).limit(5)

// Verify swipe record structure
db.swipe_history.findOne({
  user_id: "YOUR_USER_ID",
  target_type: "job_posting"
})

// Count today's swipes
db.swipe_history.countDocuments({
  user_id: "YOUR_USER_ID",
  actor_type: "applicant",
  swiped_at: { $gte: new Date(new Date().setHours(0,0,0,0)) }
})
```

**Expected Results:**
- [ ] Swipe history records exist
- [ ] Records have correct structure (user_id, target_id, direction, etc.)
- [ ] Meta field contains subscription_tier
- [ ] Count matches PostgreSQL counter

---

### Redis Checks
```bash
# Check swipe counter
redis-cli GET "swipe:counter:USER_ID:2026-03-24"

# Check seen jobs Set
redis-cli SMEMBERS "swipe:deck:seen:USER_ID"

# Check counter TTL
redis-cli TTL "swipe:counter:USER_ID:2026-03-24"

# Check Set TTL
redis-cli TTL "swipe:deck:seen:USER_ID"
```

**Expected Results:**
- [ ] Counter value matches PostgreSQL
- [ ] Seen Set contains swiped job IDs
- [ ] Counter TTL expires at midnight PHT
- [ ] Set TTL is 90 days (7776000 seconds)

---

## 🔄 Redis Fallback Testing

### Test 5: Cache Miss Fallback
```bash
# Step 1: Swipe on several jobs
# Step 2: Clear Redis cache
redis-cli FLUSHDB

# Step 3: Swipe again (should fallback to MongoDB)
curl -X POST http://localhost:8000/api/v1/applicant/swipe/right/NEW_JOB_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Step 4: Check Redis was rehydrated
redis-cli SMEMBERS "swipe:deck:seen:USER_ID"
```

**Expected Results:**
- [ ] Swipe succeeds despite Redis flush
- [ ] MongoDB is queried for seen jobs
- [ ] Redis cache is rehydrated
- [ ] Subsequent swipes use Redis

---

## ⏰ Scheduled Job Testing

### Test 6: Daily Reset Job
```bash
# Run job manually
php artisan queue:work --once

# Or dispatch directly
php artisan tinker
>>> dispatch(new \App\Jobs\ResetDailySwipesJob);
```

**SQL Verification:**
```sql
SELECT user_id, daily_swipes_used, swipe_reset_at 
FROM applicant_profiles 
LIMIT 10;
```

**Expected Results:**
- [ ] All `daily_swipes_used` reset to 0
- [ ] `swipe_reset_at` updated to today
- [ ] Redis counters cleared
- [ ] Job logs completion message

---

## 🚨 Error Handling Testing

### Test 7: Invalid Job ID
```bash
curl -X POST http://localhost:8000/api/v1/applicant/swipe/right/invalid-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Results:**
- [ ] Returns 404 or 500 with error message
- [ ] No database records created
- [ ] Redis not updated

---

### Test 8: Missing Authentication
```bash
curl -X GET http://localhost:8000/api/v1/applicant/swipe/deck
```

**Expected Results:**
- [ ] Returns 401 status
- [ ] Error code is `UNAUTHENTICATED`
- [ ] No data returned

---

### Test 9: Wrong User Role
```bash
# Register as HR user
# Try to access applicant swipe endpoints
curl -X GET http://localhost:8000/api/v1/applicant/swipe/deck \
  -H "Authorization: Bearer HR_TOKEN"
```

**Expected Results:**
- [ ] Returns 404 (profile not found)
- [ ] Or appropriate role-based error

---

## 📊 Performance Testing

### Test 10: Deck Load Time
```bash
# Measure response time
time curl -X GET http://localhost:8000/api/v1/applicant/swipe/deck \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Results:**
- [ ] Response time < 500ms
- [ ] Redis queries are fast
- [ ] Relevance calculation is efficient

---

### Test 11: Concurrent Swipes
```bash
# Use Apache Bench or similar
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/applicant/swipe/deck
```

**Expected Results:**
- [ ] No race conditions
- [ ] Counters remain accurate
- [ ] No duplicate applications

---

## 🔍 Code Quality Checks

### Static Analysis
```bash
# Run Laravel Pint
cd backend
php vendor/bin/pint --test

# Check for syntax errors
php artisan route:list
php artisan config:clear
php artisan cache:clear
```

**Expected Results:**
- [ ] No linting errors
- [ ] All routes registered correctly
- [ ] No configuration errors

---

### Diagnostics
```bash
# Check service bindings
php artisan tinker
>>> app(\App\Services\SwipeService::class)
>>> app(\App\Services\DeckService::class)
>>> app(\App\Repositories\Redis\SwipeCacheRepository::class)
```

**Expected Results:**
- [ ] All services resolve correctly
- [ ] No binding errors
- [ ] Dependencies injected properly

---

## ✅ Final Checklist

### Code Quality
- [ ] All files follow PSR-12 coding standards
- [ ] No unused imports or variables
- [ ] Proper type hints on all methods
- [ ] Consistent naming conventions

### Functionality
- [ ] All 4 swipe endpoints work
- [ ] Middleware enforces limits correctly
- [ ] Deduplication prevents double swipes
- [ ] Deck sorting is accurate
- [ ] Daily reset job runs successfully

### Data Integrity
- [ ] PostgreSQL records created correctly
- [ ] MongoDB records match PostgreSQL
- [ ] Redis cache stays in sync
- [ ] No orphaned records

### Performance
- [ ] Redis caching reduces DB queries
- [ ] Deck loads in < 500ms
- [ ] No N+1 query problems
- [ ] Proper indexing on all queries

### Documentation
- [ ] API endpoints documented
- [ ] Testing guide complete
- [ ] Error codes documented
- [ ] Architecture diagrams clear

---

## 🎯 Sign-Off

Phase 1 is ready for production when:
- [ ] All functional tests pass
- [ ] All database checks pass
- [ ] All error handling tests pass
- [ ] Performance benchmarks met
- [ ] Code quality checks pass
- [ ] Documentation is complete

**Tested By:** _______________  
**Date:** _______________  
**Sign-Off:** _______________

---

## 🐛 Known Issues / Notes

Document any issues found during testing:

1. 
2. 
3. 

---

## 📞 Support

If any tests fail:
1. Check `storage/logs/laravel.log` for errors
2. Verify all services are running (Redis, MongoDB, PostgreSQL)
3. Ensure `.env` variables are correct
4. Review `API_TESTING_GUIDE.md` for examples
5. Check service bindings in `AppServiceProvider.php`
