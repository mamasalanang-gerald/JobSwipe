# Development Guide

## Getting Started

### 1. Clone Repository
```bash
git clone <repository-url>
cd JobApp
```

### 2. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Update .env with your values
# Generate JWT secret if needed
```

### 3. Start Services with Docker
```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- MongoDB (port 27017)
- Redis (port 6379)
- Laravel API (port 8000)
- Redis Commander (port 8081)
- Mongo Express (port 8082)

### 4. Initialize Backend

In new terminal:
```bash
cd backend

# Install dependencies
composer install

# Setup database
php artisan migrate
php artisan db:seed

# Generate JWT secret
php artisan jwt:secret
```

### 5. Start Frontend Development

**Web (Next.js):**
```bash
cd frontend/web
npm install
npm run dev
# Opens http://localhost:3000
```

**Mobile (React Native):**
```bash
cd frontend/mobile
npm install
npm run android
# or: npm run ios
```

## Development Workflow

### Creating Features

1. **Create feature branch**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Work on backend (Laravel)**
   - Create model: `php artisan make:model User -m`
   - Create controller: `php artisan make:controller UserController --api`
   - Add routes in `routes/api.php`
   - Create tests

3. **Work on frontend**
   - Create components
   - Create API services
   - Add routing/navigation
   - Add state management

4. **Test locally**
   - Test API with Postman/Insomnia
   - Test frontend in browser
   - Test mobile app on emulator/device

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: description of feature"
   git push origin feature/feature-name
   ```

6. **Create PR and get review**

### Database Migrations

**Create migration:**
```bash
cd backend
php artisan make:migration create_users_table
```

**Run migrations:**
```bash
php artisan migrate
```

**Rollback:**
```bash
php artisan migrate:rollback
```

**Create MongoDB model:**
```bash
# In app/Models/User.php
use MongoDB\Laravel\Eloquent\Model;

class UserProfile extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'user_profiles';
}
```

### API Development

**Create API resource:**
```bash
php artisan make:resource UserResource
php artisan make:controller Api/UserController --api
```

**Example controller:**
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class UserController extends Controller
{
    public function index()
    {
        return User::all();
    }
    
    public function show($id)
    {
        return User::findOrFail($id);
    }
}
```

**Register in routes/api.php:**
```php
Route::apiResource('users', UserController::class);
```

### Frontend Development

**Web (Next.js):**
```bash
# Create page
touch frontend/web/src/pages/jobs.tsx

# Create component
touch frontend/web/src/components/JobCard.tsx

# Create hook
touch frontend/web/src/hooks/useJobs.ts

# Create service
touch frontend/web/src/services/jobService.ts
```

**Mobile (React Native):**
```bash
# Create screen
touch frontend/mobile/src/screens/JobsScreen.tsx

# Create component
touch frontend/mobile/src/components/JobCard.tsx

# Create hook
touch frontend/mobile/src/hooks/useJobs.ts
```

### Authentication Flow

1. User enters credentials in login screen
2. Frontend calls `/api/v1/auth/login`
3. Backend validates credentials, hashes password with Bcrypt
4. Returns JWT token
5. Frontend stores token (AsyncStorage for mobile, secure cookie for web)
6. Frontend includes token in all subsequent requests
7. Token expires after configured time (default: 1 hour)
8. Frontend calls `/api/v1/auth/refresh` to get new token
9. User logs out → token invalidated

### Testing

**Backend:**
```bash
cd backend
php artisan test
```

**Frontend (Web):**
```bash
cd frontend/web
npm test
```

**Frontend (Mobile):**
```bash
cd frontend/mobile
npm test
```

### Debugging

**Laravel:**
- Enable debug in `.env`: `APP_DEBUG=true`
- Check logs: `tail -f backend/storage/logs/laravel.log`
- Use Laravel Tinker: `php artisan tinker`

**Next.js:**
- Check browser dev tools
- Check terminal output
- Enable React DevTools extension

**React Native:**
- Use `console.log` (visible in Metro bundler)
- Use React Native Debugger
- Check device logs: `React Native > Developer Menu`

**Database:**
- PostgreSQL: `psql -U postgres -d jobapp`
- MongoDB: Visit http://localhost:8082
- Redis: Visit http://localhost:8081

### Performance Optimization

1. **Backend:**
   - Use eager loading: `User::with('jobs')->get()`
   - Cache frequent queries in Redis
   - Use queues for heavy operations
   - Add database indexes for common queries

2. **Frontend:**
   - Use React.memo for pure components
   - Implement lazy loading for lists
   - Cache API responses in Zustand
   - Optimize images

3. **Database:**
   - Add proper indexes
   - Archive old data
   - Monitor query performance with slow query log

### Common Tasks

**Clear cache:**
```bash
# Backend
php artisan cache:clear
php artisan config:cache

# Frontend (Next.js)
rm -rf .next
```

**Reset database:**
```bash
php artisan migrate:refresh --seed
```

**View logs in real-time:**
```bash
# Laravel
tail -f backend/storage/logs/laravel.log

# Docker
docker-compose logs -f laravel
```

**Access database:**
```bash
# PostgreSQL
docker-compose exec postgres psql -U postgres -d jobapp

# MongoDB
docker-compose exec mongodb mongosh -u root -p password

# Redis
docker-compose exec redis redis-cli -a password
```

## Code Style

### PHP (Laravel)
- PSR-12 coding standard
- Namespace: `App\{Feature}`
- Use type hints for all parameters and returns
- Use strict types: `declare(strict_types=1);`

### JavaScript/TypeScript
- ESLint configuration in place
- Prettier for formatting
- Use functional components in React
- Use TypeScript for type safety

### Component Naming
- Components: PascalCase (UserCard.tsx)
- Utilities: camelCase (formatDate.ts)
- Hooks: camelCase starting with "use" (useAuth.ts)
- Files: Match export name

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment guide.
