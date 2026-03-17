# JobApp - Monorepo

A modern job matching platform built like a dating app, featuring React Native mobile app, Next.js web app, and PHP Laravel backend.

## Project Structure

```
JobApp/
├── frontend/
│   ├── mobile/          # React Native - iOS & Android
│   └── web/             # Next.js - Web Application
├── backend/             # PHP Laravel API
├── docker/              # Docker configurations
├── docs/                # Documentation
├── docker-compose.yml   # Development environment setup
└── README.md
```

## Tech Stack

### Frontend
- **Mobile**: React Native
- **Web**: Next.js

### Backend
- **Framework**: PHP Laravel
- **Authentication**: JWT, Bcrypt

### Databases
- **PostgreSQL**: Relational data (jobs, applications, matches)
- **MongoDB**: NoSQL (users, profiles, preferences)
- **Redis**: Caching & sessions

## Prerequisites

- Node.js 18+
- PHP 8.1+
- Docker & Docker Compose
- Git

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd JobApp
```

### 2. Environment Setup

#### Backend Setup
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
```

#### Web Frontend Setup
```bash
cd frontend/web
npm install
```

#### Mobile Frontend Setup
```bash
cd frontend/mobile
npm install
# For iOS: cd ios && pod install && cd ..
# For Android: required Android SDK
```

### 3. Start Development Environment

Using Docker Compose:
```bash
docker-compose up -d
```

Or manually:
```bash
# Terminal 1 - Backend
cd backend
php artisan serve

# Terminal 2 - Web
cd frontend/web
npm run dev

# Terminal 3 - Mobile
cd frontend/mobile
npx react-native run-android  # or run-ios
```

## Database Configuration

### PostgreSQL
Used for relational data:
- Jobs
- User applications
- Matches
- Reviews

### MongoDB
Used for NoSQL data:
- User profiles
- Preferences
- Settings

### Redis
Used for:
- Caching
- Session management
- Real-time features
- Job queues

## API Documentation

See [docs/API.md](docs/API.md) for detailed API documentation.

## Authentication

The app uses JWT for stateless authentication:
1. User registers/logs in
2. Backend returns JWT token
3. Token stored in secure storage (mobile) / secure cookie (web)
4. All requests include token in Authorization header

Passwords are hashed using Bcrypt with 12 rounds.

## Development Workflow

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and test locally
3. Submit pull request
4. Code review and merge

## Contributing

Please ensure:
- Code follows project style guidelines
- All tests pass
- Database migrations are properly documented

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
