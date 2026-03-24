# JobSwipe API Routes Reference

## Quick Reference Card

### Base URL
```
http://localhost:8000/api/v1
```

---

## Authentication Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login with email/password |
| POST | `/auth/verify-email` | ❌ | Verify email with OTP |
| POST | `/auth/resend-verification` | ❌ | Resend OTP code |
| POST | `/auth/logout` | ✅ | Logout (revoke token) |
| GET | `/auth/me` | ✅ | Get current user |
| GET | `/auth/google/redirect` | ❌ | Initiate Google OAuth |
| GET | `/auth/google/callback` | ❌ | Handle Google OAuth callback |

---

## Applicant Swipe Routes (Phase 1)

| Method | Endpoint | Auth | Middleware | Description |
|--------|----------|------|------------|-------------|
| GET | `/applicant/swipe/deck` | ✅ | - | Get job swipe deck |
| GET | `/applicant/swipe/limits` | ✅ | - | Get swipe limits/usage |
| POST | `/applicant/swipe/right/{job_id}` | ✅ | CheckSwipeLimit | Apply to job |
| POST | `/applicant/swipe/left/{job_id}` | ✅ | CheckSwipeLimit | Dismiss job |

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

---

## Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `EMAIL_TAKEN` | 409 | Email already registered |
| `OTP_EXPIRED` | 422 | Verification code expired |
| `OTP_INVALID` | 422 | Incorrect verification code |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `EMAIL_UNVERIFIED` | 403 | Email not verified |
| `SWIPE_LIMIT_REACHED` | 429 | Daily swipe limit reached |
| `ALREADY_SWIPED` | 409 | Already swiped on this job |
| `PROFILE_NOT_FOUND` | 404 | User profile not found |
| `UNAUTHENTICATED` | 401 | Missing or invalid token |

---

## Authentication Header

All authenticated routes require:
```
Authorization: Bearer {your_token_here}
```

---

## Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| Unauthenticated | 20 req/min per IP |
| Authenticated | 60 req/min per user |
| Swipe Actions | Daily limit (15 default) |

---

## Coming Soon (Phase 2+)

### Job Management
- `GET /company/jobs` - List company's jobs
- `POST /company/jobs` - Create job posting
- `GET /company/jobs/{id}` - Get job details
- `PUT /company/jobs/{id}` - Update job posting
- `DELETE /company/jobs/{id}` - Delete job posting
- `POST /company/jobs/{id}/publish` - Publish job

### HR Applicant Review
- `GET /company/jobs/{job_id}/applicants` - Get applicant queue
- `GET /company/jobs/{job_id}/applicants/{applicant_id}` - Get applicant details
- `POST /company/jobs/{job_id}/swipe/right/{applicant_id}` - Send invitation
- `POST /company/jobs/{job_id}/swipe/left/{applicant_id}` - Dismiss applicant

### Profile Management
- `GET /applicant/profile` - Get applicant profile
- `PUT /applicant/profile` - Update applicant profile
- `POST /applicant/profile/photo` - Upload profile photo
- `POST /applicant/profile/resume` - Upload resume

### Applications
- `GET /applicant/applications` - Get my applications
- `GET /applicant/applications/{id}` - Get application details

---

## Health Check

```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-24T10:00:00.000000Z"
}
```
