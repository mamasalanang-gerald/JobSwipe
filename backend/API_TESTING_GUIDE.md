# JobSwipe API Testing Guide - Phase 1: Core Swipe Functionality

This guide provides all the endpoints and example requests for testing the Phase 1 implementation of the swipe functionality.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All swipe endpoints require authentication via Laravel Sanctum. Include the bearer token in the Authorization header:
```
Authorization: Bearer {your_token_here}
```

---

## 1. Prerequisites - Get Authentication Token

### Register a New Applicant
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "applicant@example.com",
  "password": "password123",
  "role": "applicant"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "applicant@example.com"
  },
  "message": "Verification code sent successfully"
}
```

### Verify Email with OTP
```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "email": "applicant@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "1|abcdef123456...",
    "user": {
      "id": "uuid-here",
      "email": "applicant@example.com",
      "role": "applicant",
      "email_verified_at": "2026-03-24T10:00:00.000000Z"
    }
  },
  "message": "Email verified successfully. Account created."
}
```

**Save the token for subsequent requests!**

---

## 2. Swipe Endpoints

### 2.1 Get Job Swipe Deck

Retrieves a paginated list of job postings sorted by relevance.

```http
GET /api/v1/applicant/swipe/deck?per_page=20
Authorization: Bearer {token}
```

**Query Parameters:**
- `per_page` (optional): Number of jobs to return (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job-uuid-1",
        "title": "Senior Software Engineer",
        "description": "We are looking for...",
        "work_type": "remote",
        "location": "Makati City, Metro Manila",
        "location_city": "Makati City",
        "location_region": "Metro Manila",
        "salary_min": 80000,
        "salary_max": 120000,
        "salary_is_hidden": false,
        "status": "active",
        "published_at": "2026-03-20T10:00:00.000000Z",
        "relevance_score": 0.85,
        "company": {
          "id": "company-uuid",
          "company_name": "TechCorp Inc.",
          "is_verified": true
        },
        "skills": [
          {
            "skill_name": "PHP",
            "skill_type": "hard"
          },
          {
            "skill_name": "Laravel",
            "skill_type": "hard"
          }
        ]
      }
    ],
    "has_more": true,
    "total_unseen": 45
  }
}
```

---

### 2.2 Get Swipe Limits

Check current swipe usage and remaining swipes.

```http
GET /api/v1/applicant/swipe/limits
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "daily_swipes_used": 5,
    "daily_swipe_limit": 15,
    "extra_swipes_balance": 0,
    "has_swipes_remaining": true,
    "swipe_reset_at": "2026-03-24"
  }
}
```

---

### 2.3 Swipe Right (Apply to Job)

Submit an application by swiping right on a job posting.

```http
POST /api/v1/applicant/swipe/right/{job_id}
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application submitted successfully"
}
```

**Error Responses:**

**Swipe Limit Reached (429):**
```json
{
  "success": false,
  "message": "Daily swipe limit reached. Upgrade or purchase swipe packs.",
  "code": "SWIPE_LIMIT_REACHED"
}
```

**Already Swiped (409):**
```json
{
  "success": false,
  "message": "You have already swiped on this job",
  "code": "ALREADY_SWIPED"
}
```

---

### 2.4 Swipe Left (Dismiss Job)

Dismiss a job posting by swiping left.

```http
POST /api/v1/applicant/swipe/left/{job_id}
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Job dismissed"
}
```

**Error Responses:**

**Swipe Limit Reached (429):**
```json
{
  "success": false,
  "message": "Daily swipe limit reached. Upgrade or purchase swipe packs.",
  "code": "SWIPE_LIMIT_REACHED"
}
```

**Already Swiped (409):**
```json
{
  "success": false,
  "message": "You have already swiped on this job",
  "code": "ALREADY_SWIPED"
}
```

---

## 3. Testing Scenarios

### Scenario 1: Normal Swipe Flow
1. Get authentication token
2. Get job deck: `GET /applicant/swipe/deck`
3. Check limits: `GET /applicant/swipe/limits`
4. Swipe right on a job: `POST /applicant/swipe/right/{job_id}`
5. Verify limits updated: `GET /applicant/swipe/limits`
6. Get deck again (swiped job should be excluded)

### Scenario 2: Swipe Limit Enforcement
1. Swipe right/left 15 times (default limit)
2. Attempt 16th swipe
3. Should receive `SWIPE_LIMIT_REACHED` error (429)
4. Verify middleware blocks the request

### Scenario 3: Deduplication
1. Swipe right on job A
2. Attempt to swipe right on job A again
3. Should receive `ALREADY_SWIPED` error (409)
4. Same for swipe left

### Scenario 4: Redis Cache Fallback
1. Swipe on several jobs
2. Clear Redis cache manually
3. Swipe again - should fallback to MongoDB
4. Redis cache should be rehydrated

---

## 4. Database Verification

### Check Application Created (PostgreSQL)
```sql
SELECT * FROM applications 
WHERE applicant_id = 'your-applicant-id' 
ORDER BY created_at DESC;
```

### Check Swipe History (MongoDB)
```javascript
db.swipe_history.find({
  user_id: "your-user-id",
  actor_type: "applicant"
}).sort({ swiped_at: -1 })
```

### Check Redis Cache
```bash
# Check swipe counter
redis-cli GET "swipe:counter:{user_id}:{YYYY-MM-DD}"

# Check seen jobs
redis-cli SMEMBERS "swipe:deck:seen:{user_id}"
```

---

## 5. cURL Examples

### Get Deck
```bash
curl -X GET "http://localhost:8000/api/v1/applicant/swipe/deck?per_page=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Swipe Right
```bash
curl -X POST "http://localhost:8000/api/v1/applicant/swipe/right/JOB_UUID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Swipe Left
```bash
curl -X POST "http://localhost:8000/api/v1/applicant/swipe/left/JOB_UUID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Get Limits
```bash
curl -X GET "http://localhost:8000/api/v1/applicant/swipe/limits" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

---

## 6. Postman Collection

Import this JSON into Postman for easy testing:

```json
{
  "info": {
    "name": "JobSwipe - Phase 1 Swipe API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000/api/v1"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Get Job Deck",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/applicant/swipe/deck?per_page=20",
          "host": ["{{base_url}}"],
          "path": ["applicant", "swipe", "deck"],
          "query": [
            {
              "key": "per_page",
              "value": "20"
            }
          ]
        }
      }
    },
    {
      "name": "Get Swipe Limits",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/applicant/swipe/limits",
          "host": ["{{base_url}}"],
          "path": ["applicant", "swipe", "limits"]
        }
      }
    },
    {
      "name": "Swipe Right",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/applicant/swipe/right/:job_id",
          "host": ["{{base_url}}"],
          "path": ["applicant", "swipe", "right", ":job_id"],
          "variable": [
            {
              "key": "job_id",
              "value": ""
            }
          ]
        }
      }
    },
    {
      "name": "Swipe Left",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/applicant/swipe/left/:job_id",
          "host": ["{{base_url}}"],
          "path": ["applicant", "swipe", "left", ":job_id"],
          "variable": [
            {
              "key": "job_id",
              "value": ""
            }
          ]
        }
      }
    }
  ]
}
```

---

## 7. Expected Behavior Summary

| Action | PostgreSQL | MongoDB | Redis |
|--------|-----------|---------|-------|
| Swipe Right | `applications` record created | `swipe_history` record created | Counter incremented, job marked seen |
| Swipe Left | No record | `swipe_history` record created | Counter incremented, job marked seen |
| Get Deck | Query active jobs | Check seen jobs (fallback) | Check seen jobs (primary) |
| Daily Reset | `daily_swipes_used = 0` | No change | Counters cleared |

---

## 8. Troubleshooting

### Issue: "SWIPE_LIMIT_REACHED" but counter shows < limit
- Check if `extra_swipes_balance` is 0
- Verify `daily_swipe_limit` in database
- Check Redis counter key exists

### Issue: Jobs appearing in deck after swiping
- Verify Redis Set contains job ID
- Check MongoDB swipe_history for record
- Ensure deduplication logic is working

### Issue: Middleware not blocking requests
- Verify middleware is registered in bootstrap/app.php
- Check route uses CheckSwipeLimit middleware
- Ensure user has applicant profile

---

## Next Steps

After Phase 1 testing is complete, proceed to:
- Phase 2: Job Management (CRUD endpoints)
- Phase 3: HR Applicant Review
- Phase 4: Points System
- Phase 5: Notification System
