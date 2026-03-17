# JobApp - Monorepo Setup Guide

This is a complete monorepo setup for JobApp - a modern dating-style job matching platform.

## 📁 Folder Structure

```
JobApp/
├── frontend/
│   ├── mobile/              # React Native iOS & Android app
│   └── web/                 # Next.js web application
├── backend/                 # PHP Laravel REST API
├── docker/                  # Docker configurations
├── docs/                    # Project documentation
│   ├── API.md              # API endpoints documentation
│   ├── DATABASE.md         # Database schema & design
│   ├── ARCHITECTURE.md     # System architecture
│   ├── DEVELOPMENT.md      # Development workflow guide
│   └── CONTRIBUTING.md     # Contributing guidelines
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── docker-compose.yml      # Docker services configuration
└── README.md               # Main project README
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- PHP 8.1+
- Git

### 1. Setup Environment
```bash
# Clone repo
git clone <repo-url>
cd JobApp

# Copy environment template
cp .env.example .env

# Update .env with your values (optional)
```

### 2. Start Services
```bash
# Start all services (PostgreSQL, MongoDB, Redis, Laravel)
docker-compose up -d

# Check services are running
docker-compose ps
```

Services will be available at:
- PostgreSQL: localhost:5432
- MongoDB: localhost:27017
- Redis: localhost:6379
- Laravel API: localhost:8000
- Redis Commander: localhost:8081
- Mongo Express: localhost:8082

### 3. Backend Setup
```bash
cd backend

# Install dependencies
composer install

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed
```

### 4. Web Frontend Setup
```bash
cd frontend/web

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Web app available at: http://localhost:3000

### 5. Mobile Frontend Setup
```bash
cd frontend/mobile

# Install dependencies
npm install

# Install iOS pods (if on macOS)
npm run pod-install

# Start development
npm run android  # or npm run ios
```

## 📋 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend (Web)** | Next.js + React + TypeScript | Server-side rendering, web app |
| **Frontend (Mobile)** | React Native | iOS & Android app |
| **Backend** | PHP Laravel | REST API |
| **Authentication** | JWT + Bcrypt | Secure auth & token-based sessions |
| **Database (Relational)** | PostgreSQL | Jobs, users, applications, matches |
| **Database (NoSQL)** | MongoDB | User profiles, preferences, settings |
| **Cache & Queue** | Redis | Session management, job queues |
| **Containerization** | Docker | Development environment |

## 🔑 Key Features

- ✅ **Dating-style Job Matching** - Swipe interface for job matching
- ✅ **Cross-platform** - Web and mobile access
- ✅ **Real-time Messaging** - In-app chat
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Multiple Databases** - PostgreSQL, MongoDB, Redis
- ✅ **API-driven** - RESTful API with JWT auth
- ✅ **Type-safe** - TypeScript across frontend
- ✅ **Scalable** - Docker-based infrastructure

## 📝 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[API.md](docs/API.md)** - Complete API endpoints reference
- **[DATABASE.md](docs/DATABASE.md)** - Database schema and design
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture overview
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Development workflow and tutorials
- **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** - Contributing guidelines

## 🛠️ Development

### Running All Services Locally

**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve
```

**Terminal 2 - Web:**
```bash
cd frontend/web
npm run dev
```

**Terminal 3 - Mobile:**
```bash
cd frontend/mobile
npm run android  # or npm run ios
```

Or use Docker (includes all services):
```bash
docker-compose up -d
```

### Creating New Features

1. Create feature branch: `git checkout -b feature/feature-name`
2. Develop and test locally
3. Write tests for new code
4. Commit with conventional commit messages
5. Push and create pull request

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

### Common Commands

**Backend (Laravel):**
```bash
php artisan make:controller UserController --api
php artisan make:model User -m
php artisan migrate
php artisan tinker
```

**Web Frontend:**
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Check code style
```

**Mobile:**
```bash
npm run android  # Run on Android emulator
npm run ios      # Run on iOS simulator
npm test         # Run tests
```

**Docker:**
```bash
docker-compose up              # Start all services
docker-compose down            # Stop all services
docker-compose logs -f         # View logs
docker-compose exec laravel bash # Enter Laravel container
```

## 🗄️ Database Access

### PostgreSQL
```bash
docker-compose exec postgres psql -U postgres -d jobapp
```

### MongoDB
```bash
docker-compose exec mongodb mongosh -u root -p password
```

### Redis
```bash
docker-compose exec redis redis-cli -a password
```

## 🔒 Security

- Passwords hashed with Bcrypt (12 rounds)
- JWT tokens for stateless authentication
- Environment variables for secrets
- SQL injection prevention (prepared statements)
- CORS configuration
- Rate limiting on API endpoints

## 📱 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - User logout

### Jobs
- `GET /api/v1/jobs` - List jobs
- `GET /api/v1/jobs/{id}` - Get job details
- `POST /api/v1/jobs` - Create job
- `PATCH /api/v1/jobs/{id}` - Update job
- `DELETE /api/v1/jobs/{id}` - Delete job

See [docs/API.md](docs/API.md) for complete API documentation.

## 🐛 Debugging

**Check Logs:**
```bash
# Laravel logs
tail -f backend/storage/logs/laravel.log

# Docker logs
docker-compose logs -f laravel
```

**Database Inspection:**
- PostgreSQL: `docker-compose exec postgres psql -U postgres -d jobapp`
- MongoDB: Visit http://localhost:8082
- Redis: Visit http://localhost:8081

## 📦 Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment instructions (to be created).

## 🤝 Contributing

We welcome contributions! Please see [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for:
- Code style guidelines
- Pull request process
- Commit message standards
- Testing requirements

## 📄 License

MIT License - see LICENSE file for details.

## 📞 Support

For issues and questions:
1. Check existing documentation in `docs/`
2. Create an issue on GitHub
3. Reach out to the development team

## 🎯 Project Status

- ✅ Initial monorepo structure created
- ⏳ Backend Laravel scaffolding
- ⏳ Frontend components setup
- ⏳ Database schema implementation
- ⏳ API endpoints development
- ⏳ Testing suite setup
- ⏳ CI/CD pipeline
- ⏳ Production deployment

---

**Happy coding! 🚀**
