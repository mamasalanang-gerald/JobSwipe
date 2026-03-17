# API Documentation

## Base URL
`http://localhost:8000/api/v1`

## Authentication

All endpoints (except auth) require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

Success response (2xx):
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

Error response:
```json
{
  "success": false,
  "error": "error_code",
  "message": "Human readable error message",
  "errors": { /* validation errors if applicable */ }
}
```

## Endpoints

### Authentication

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe"
}

Response: 
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "token": "eyJhbGc..."
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "token": "eyJhbGc..."
  }
}
```

#### Refresh Token
```
POST /auth/refresh
Authorization: Bearer <current_token>

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGc..."
  }
}
```

#### Logout
```
POST /auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Users

#### Get Current User
```
GET /users/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "profile": { /* profile data */ },
    "settings": { /* user settings */ }
  }
}
```

#### Get User by ID
```
GET /users/{id}
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "profile": { /* profile data */ }
  }
}
```

#### Update Profile
```
PATCH /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Software Engineer",
  "skills": ["PHP", "React", "PostgreSQL"],
  "experience_years": 5
}

Response:
{
  "success": true,
  "data": { /* updated user */ }
}
```

### Jobs

#### List All Jobs
```
GET /jobs?page=1&per_page=10&location=remote&job_type=full-time
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": 1,
        "title": "Senior PHP Developer",
        "description": "...",
        "salary_min": 80000,
        "salary_max": 120000,
        "location": "Remote",
        "job_type": "full-time",
        "user": { /* employer info */ },
        "created_at": "2024-03-17T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total": 100,
      "per_page": 10
    }
  }
}
```

#### Get Job Details
```
GET /jobs/{id}
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Senior PHP Developer",
    /* ... job details ... */
    "applications_count": 15,
    "applied": true /* if current user has applied */
  }
}
```

#### Create Job
```
POST /jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Senior PHP Developer",
  "description": "We are looking for...",
  "salary_min": 80000,
  "salary_max": 120000,
  "location": "Remote",
  "job_type": "full-time",
  "industry": "Technology"
}

Response:
{
  "success": true,
  "data": { /* created job */ }
}
```

#### Update Job
```
PATCH /jobs/{id}
Authorization: Bearer <token>
Content-Type: application/json

{ /* fields to update */ }

Response:
{
  "success": true,
  "data": { /* updated job */ }
}
```

#### Delete Job
```
DELETE /jobs/{id}
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Job deleted successfully"
}
```

### Applications

#### Apply for Job
```
POST /jobs/{id}/apply
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "job_id": 1,
    "user_id": 5,
    "status": "pending",
    "applied_at": "2024-03-17T10:30:00Z"
  }
}
```

#### Get Job Applications
```
GET /jobs/{id}/applications
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": { /* applicant info */ },
      "status": "pending",
      "applied_at": "2024-03-17T10:30:00Z"
    }
  ]
}
```

#### Accept Application
```
PATCH /applications/{id}/accept
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": { /* updated application */ }
}
```

#### Reject Application
```
PATCH /applications/{id}/reject
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": { /* updated application */ }
}
```

### Matches

#### Swipe
```
POST /matches/swipe
Authorization: Bearer <token>
Content-Type: application/json

{
  "target_user_id": 5,
  "action": "like" /* or "pass" */
}

Response:
{
  "success": true,
  "data": {
    "matched": true, /* true if mutual match */
    "match_id": 1
  }
}
```

#### Get Matches
```
GET /matches?status=pending
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": { /* matched user */ },
      "status": "pending",
      "created_at": "2024-03-17T10:30:00Z"
    }
  ]
}
```

### Messaging

#### Get Conversations
```
GET /messages/conversations
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": { /* other user */ },
      "last_message": "...",
      "unread_count": 3,
      "last_message_at": "2024-03-17T10:30:00Z"
    }
  ]
}
```

#### Get Messages
```
GET /messages/{conversation_id}
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sender_id": 1,
      "content": "Hello!",
      "read": true,
      "created_at": "2024-03-17T10:30:00Z"
    }
  ]
}
```

#### Send Message
```
POST /messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient_id": 5,
  "content": "Hi there!"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "conversation_id": "uuid",
    "content": "Hi there!",
    "created_at": "2024-03-17T10:30:00Z"
  }
}
```

## Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Missing or invalid authentication token
- `FORBIDDEN` - User doesn't have permission
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict (e.g., duplicate email)
- `RATE_LIMITED` - Too many requests
- `INTERNAL_ERROR` - Server error
- `SERVICE_UNAVAILABLE` - External service unavailable

## Rate Limiting

- 100 requests per minute per user
- 1000 requests per hour per user
- Limits per IP for unauthenticated requests

Rate limit info in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705519200
```
