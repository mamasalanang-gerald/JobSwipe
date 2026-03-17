# Project Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway / Load Balancer               │
└─────────────────────┬──────────────────┬────────────────────┘
                      │                  │
        ┌─────────────┴────┐    ┌────────┴──────────┐
        │                  │    │                   │
    ┌───▼──────┐   ┌──────▼──┐ │   ┌────────────┐  │
    │Web Client│   │ Mobile  │ │   │  Desktop   │  │
    │(Next.js) │   │  Client │ │   │   Client   │  │
    │ Port3000 │   │ (React  │ │   │(Electron) │  │
    └─────┬────┘   │ Native) │ │   └────────────┘  │
          │        │Port 8000│ │                   │
    ┌─────▼────────▼─────────┴─┴───────────────────┐
    │                                               │
    │        REST API (Laravel)                     │
    │        Port 8000                              │
    │                                               │
    │  ┌────────────────────────────────────────┐  │
    │  │         API Controllers                │  │
    │  │  - Auth, Users, Jobs, Applications,   │  │
    │  │    Matches, Messages                  │  │
    │  └────────────────────────────────────────┘  │
    │  ┌────────────────────────────────────────┐  │
    │  │      Middleware                        │  │
    │  │  - JWT Authentication                 │  │
    │  │  - Rate Limiting                      │  │
    │  │  - CORS                               │  │
    │  └────────────────────────────────────────┘  │
    │  ┌────────────────────────────────────────┐  │
    │  │      Services / Business Logic         │  │
    │  │  - AuthService                        │  │
    │  │  - JobService                         │  │
    │  │  - MatchingService                    │  │
    │  │  - NotificationService                │  │
    │  └────────────────────────────────────────┘  │
    │  ┌────────────────────────────────────────┐  │
    │  │         Queue System (Redis)           │  │
    │  │  - Email notifications                │  │
    │  │  - Matching algorithm                 │  │
    │  │  - Data aggregation                   │  │
    │  └────────────────────────────────────────┘  │
    │                                               │
    └─────┬────────────────────────────────────────┘
          │
    ┌─────┴──────────────────────────────────────┐
    │                                             │
    │      Databases & Caching                    │
    │                                             │
    │  ┌──────────────┐  ┌──────────────┐  ┌─────▼────┐
    │  │ PostgreSQL   │  │  MongoDB     │  │  Redis   │
    │  │ Port 5432    │  │  Port 27017  │  │Port 6379 │
    │  │              │  │              │  │          │
    │  │ Relational   │  │  NoSQL Data  │  │  Cache   │
    │  │ - Jobs       │  │  - Profiles  │  │ Sessions │
    │  │ - Users      │  │  - Settings  │  │ Queues   │
    │  │ - Apps       │  │  - Messages  │  │          │
    │  └──────────────┘  └──────────────┘  └──────────┘
    │                                             │
    └─────────────────────────────────────────────┘
```

## Component Responsibilities

### Frontend Layer

#### Next.js (Web)
- Server-side rendering for performance
- Static site generation for docs
- API route handling
- Authentication UI
- Job listing and creation
- Matches and messaging
- Admin dashboard (future)

#### React Native (Mobile)
- Cross-platform mobile app
- Native performance
- Offline support
- Push notifications
- Camera and file upload
- Geolocation (future)

### Backend Layer

#### API Layer
- Request validation
- Authentication & authorization
- Rate limiting
- Response formatting
- Error handling

#### Service Layer
- Business logic
- Database operations
- External service integration
- Caching strategy
- Queue job creation

#### Data Access Layer
- Eloquent ORM (PostgreSQL)
- MongoDB document operations
- Redis operations
- Database transactions

### Database Layer

#### PostgreSQL
- Normalized relational data
- ACID transactions
- Complex queries
- Structured data

#### MongoDB
- User profiles and preferences
- Flexible schema
- Document-based storage
- Natural JSON serialization

#### Redis
- Distributed caching
- Session management
- Job queues
- Real-time data

## Data Flow Examples

### User Registration Flow
```
[ Mobile/Web Client ]
      │
      │ POST /auth/register
      │ { email, password, name }
      │
    [Laravel API]
      │
      ├─ Validate input
      ├─ Hash password with Bcrypt
      ├─ Create User in PostgreSQL
      ├─ Create UserProfile in MongoDB
      ├─ Create UserSettings in MongoDB
      ├─ Generate JWT token
      ├─ Cache session in Redis
      │
      │ Return { token, user }
      │
[ Client stores token ]
```

### Job Application Flow
```
[ Mobile/Web Client ]
      │
      │ POST /jobs/{jobId}/apply
      │
    [Laravel API]
      │
      ├─ Verify authentication
      ├─ Check if user already applied
      ├─ Create Application record in PostgreSQL
      ├─ Queue notification job to Redis
      ├─ Queue email job to Redis
      │
      │ Return { application, status }
      │
[ Background Worker ]
      │
      ├─ Send push notification
      ├─ Send email
      └─ Update MongoDB user activity
```

### Match Creation Flow
```
[ User Swipes ]
      │
      │ POST /matches/swipe
      │ { target_user_id, action }
      │
    [Laravel API]
      │
      ├─ Create swipe record in PostgreSQL
      ├─ Check for mutual match
      │
      ├─ If mutual match:
      │  ├─ Create Match in PostgreSQL
      │  ├─ Initiate conversation in MongoDB
      │  ├─ Queue notification job
      │  └─ Update cache in Redis
      │
      │ Return { matched: true/false }
      │
[ WebSocket / Polling ] ◄─── Real-time updates
```

## Performance Considerations

### Caching Strategy
- **Browser Cache**: Static assets, 1 week
- **Redis Cache**: User profiles, 1 hour
- **Redis Cache**: Job listings, 6 hours
- **Database Query Cache**: Common queries, 15 minutes

### Database Optimization
- Indexes on frequently queried fields
- Pagination for list endpoints
- Lazy loading relationships
- Connection pooling

### API Optimization
- Compression (gzip)
- Field selection (only return needed fields)
- Batch operations where possible
- Asynchronous processing with queues

### Frontend Optimization
- Code splitting and lazy loading
- Image optimization
- Memoization of components
- Efficient state management

## Security Architecture

### Authentication
- JWT tokens with expiration
- Bcrypt password hashing (12 rounds)
- Secure token storage
- Token refresh mechanism

### Authorization
- Role-based access control (RBAC)
- Resource ownership verification
- Middleware-based checks

### Data Protection
- HTTPS/TLS for all communication
- Environment-based secrets
- SQL injection prevention (prepared statements)
- XSS prevention (input sanitization)
- CSRF protection

### Rate Limiting
- Per-user rate limits
- Per-IP rate limits for unauthenticated endpoints
- Exponential backoff for failed auth attempts

## Scalability

### Horizontal Scaling
- Stateless API servers
- Load balancer for traffic distribution
- Separate job queue workers

### Data Scaling
- Read replicas for PostgreSQL
- Sharding strategy for MongoDB
- Redis cluster for session management

### Monitoring & Logging
- Centralized logging (ELK stack)
- Performance monitoring
- Error tracking
- User analytics
