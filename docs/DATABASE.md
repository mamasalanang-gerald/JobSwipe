# Database Architecture & Schema

JobApp uses three databases with specific purposes:

## PostgreSQL (Relational Data)

Primary relational database for structured data.

### Main Tables

#### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);
```

#### Jobs
```sql
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  location VARCHAR(255),
  job_type VARCHAR(50), -- full-time, part-time, contract
  status VARCHAR(50), -- active, closed, draft
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);
```

#### Applications
```sql
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  job_id INT REFERENCES jobs(id),
  user_id INT REFERENCES users(id),
  status VARCHAR(50), -- pending, accepted, rejected, withdrawn
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE(job_id, user_id)
);
```

#### Matches
```sql
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  user_id_1 INT REFERENCES users(id),
  user_id_2 INT REFERENCES users(id),
  status VARCHAR(50), -- pending, accepted, rejected, blocked
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE(user_id_1, user_id_2)
);
```

## MongoDB (User Profiles & NoSQL Data)

Used for unstructured and semi-structured user data.

### Collections

#### users_profiles
```json
{
  "_id": ObjectId,
  "user_id": Number,
  "bio": String,
  "skills": [String],
  "experience_years": Number,
  "education": {
    "school": String,
    "degree": String,
    "field": String
  },
  "preferences": {
    "salary_min": Number,
    "salary_max": Number,
    "locations": [String],
    "job_types": [String],
    "industries": [String]
  },
  "verified": Boolean,
  "verification_documents": [String],
  "created_at": Date,
  "updated_at": Date
}
```

#### user_settings
```json
{
  "_id": ObjectId,
  "user_id": Number,
  "notifications_enabled": Boolean,
  "email_notifications": Boolean,
  "push_notifications": Boolean,
  "visibility": String, -- public, private, friends
  "language": String,
  "theme": String,
  "two_factor_enabled": Boolean,
  "updated_at": Date
}
```

#### messages
```json
{
  "_id": ObjectId,
  "conversation_id": String,
  "sender_id": Number,
  "recipient_id": Number,
  "content": String,
  "read": Boolean,
  "created_at": Date,
  "updated_at": Date
}
```

## Redis (Cache & Sessions)

Volatile storage for performance-critical data.

### Key Patterns

- `session:{token}` - User session data
- `user:{id}:profile` - Cached user profiles
- `job:{id}:details` - Cached job listings
- `recommendations:{user_id}` - Cached recommendations
- `notifications:{user_id}` - User notification queue
- `ratelimit:{user_id}:{endpoint}` - Rate limiting

### Expiry Times

- Sessions: 24 hours
- User profiles: 1 hour
- Job details: 6 hours
- Recommendations: 12 hours
- Notifications: 30 days
- Rate limits: 1 hour

## Data Flow

```
User Registration:
1. User submits email/password (React Native/Next.js)
2. Backend creates PostgreSQL user record
3. User profile created in MongoDB
4. User settings created in MongoDB
5. JWT token generated and cached in Redis
6. Token returned to client

Job Creation:
1. Employer creates job (Next.js)
2. Job stored in PostgreSQL
3. Metadata cached in Redis
4. Elasticsearch indexed (optional for search)

Job Application:
1. User applies (React Native/Next.js)
2. Application recorded in PostgreSQL
3. Notification queued in Redis
4. Match algorithm triggered asynchronously

Match Creation:
1. Swipe events collected
2. Match calculated in background job
3. Match record in PostgreSQL
4. Chat initiated
5. Messages stored in MongoDB
```

## Backup Strategy

- PostgreSQL: Daily backups, 30-day retention
- MongoDB: Daily backups, 30-day retention
- Redis: Optional, depends on data criticality
