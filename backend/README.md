# Laravel Backend

PHP Laravel REST API backend for JobApp.

## Setup

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan jwt:secret
```

## Environment Variables

See `../.env.example` for all required environment variables.

Key variables:
- `JWT_SECRET`: Secret key for JWT tokens
- `DB_*`: PostgreSQL connection details
- `MONGO_*`: MongoDB connection details
- `REDIS_*`: Redis connection details

## Database

### Migrations
```bash
php artisan migrate
```

### Seeders
```bash
php artisan db:seed
```

## Running

Development:
```bash
php artisan serve
```

## API Documentation

All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

See [../docs/API.md](../docs/API.md) for details.

## Structure

```
backend/
├── app/
│   ├── Models/          # Eloquent & MongoDB models
│   ├── Http/
│   │   ├── Controllers/ # API controllers
│   │   └── Requests/    # Form requests validation
│   ├── Services/        # Business logic
│   └── Exceptions/      # Custom exceptions
├── routes/
│   └── api.php          # API routes
├── database/
│   ├── migrations/      # Database migrations
│   └── seeders/         # Data seeders
├── config/              # Configuration files
└── storage/             # Logs & cache
```

## Authentication

Uses JWT (JSON Web Tokens) with Tymon/JWT-Auth:

1. User registers with email/password
2. Password hashed with Bcrypt (BCRYPT_ROUNDS from env)
3. JWT token returned and stored on client
4. All requests include: `Authorization: Bearer <token>`

## Queues

Redis is used for job queues:
```bash
php artisan queue:work redis
```
