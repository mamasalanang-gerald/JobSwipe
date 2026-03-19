# 🚨 Troubleshooting Guide

## 🔍 Quick Diagnosis

### Check Pipeline Status
```bash
# View recent workflow runs
gh run list

# View specific run details
gh run view RUN_ID --log

# Check workflow files syntax
gh workflow list
```

### Check Service Health
```bash
# Test production endpoint
curl -v https://your-service.onrender.com/api/health

# Expected response
{"status":"ok","timestamp":"2024-01-01T12:00:00.000000Z"}
```

---

## 🔧 CI Pipeline Issues

### ❌ Phase 1: Lint & Validate Failures

**Issue**: Merge conflicts detected
```bash
# Fix merge conflicts
git checkout staging
git pull origin main
# Resolve conflicts manually
git add .
git commit -m "fix: resolve merge conflicts"
git push origin staging
```

**Issue**: Dockerfile not found
```bash
# Verify Dockerfile exists at root
ls -la Dockerfile

# If missing, check if it's in wrong location
find . -name "Dockerfile" -type f
```

**Issue**: Lint errors
```bash
# Backend lint (Laravel Pint)
cd backend
./vendor/bin/pint

# Frontend lint (ESLint)
cd frontend/web
npm run lint -- --fix
```

### ❌ Phase 2: Unit Test Failures

**Issue**: Backend unit tests failing
```bash
# Run tests locally
cd backend
php artisan test --testsuite=Unit

# Check specific test
php artisan test --filter=ExampleTest

# Clear cache and retry
php artisan config:clear
php artisan cache:clear
php artisan test
```

**Issue**: Frontend unit tests failing
```bash
# Run tests locally
cd frontend/web
npm run test:unit

# Run with verbose output
npm run test:unit -- --verbose

# Update snapshots if needed
npm run test:unit -- --updateSnapshot
```

**Issue**: Database connection in tests
```bash
# Check test environment
cd backend
cat .env.testing

# Ensure test database is configured
DB_CONNECTION=sqlite
DB_DATABASE=:memory:
```

### ❌ Phase 3: Integration Test Failures

**Issue**: API endpoint tests failing
```bash
# Test API locally
cd backend
php artisan serve &
curl http://localhost:8000/api/health

# Check routes
php artisan route:list
```

**Issue**: Database migration issues
```bash
# Run migrations manually
php artisan migrate:fresh --seed

# Check migration status
php artisan migrate:status
```

### ❌ Phase 4: E2E Test Failures

**Issue**: Playwright tests failing
```bash
# Run E2E tests locally
cd frontend/web
npx playwright test

# Run with UI mode
npx playwright test --ui

# Generate test report
npx playwright show-report
```

**Issue**: Services not starting
```bash
# Check if backend is running
curl http://localhost:8000/api/health

# Check if frontend is running
curl http://localhost:3000

# Start services manually
cd backend && php artisan serve &
cd frontend/web && npm run dev &
```

### ❌ Phase 5: Docker Build Failures

**Issue**: Docker build fails
```bash
# Test Docker build locally
docker build -t jobapp-test .

# Build with verbose output
docker build -t jobapp-test . --progress=plain

# Check Dockerfile syntax
docker build -t jobapp-test . --dry-run
```

**Issue**: Container health check fails
```bash
# Run container locally
docker run -d --name jobapp-test -p 8080:8080 jobapp-test

# Check container logs
docker logs jobapp-test

# Test health endpoint
curl http://localhost:8080/api/health

# Clean up
docker stop jobapp-test && docker rm jobapp-test
```

### ❌ Phase 6: Security Scan Failures

**Issue**: Vulnerability scan failures
```bash
# Run Trivy scan locally
trivy image jobapp-test:latest

# Scan with specific severity
trivy image --severity HIGH,CRITICAL jobapp-test:latest

# Generate report
trivy image --format json --output report.json jobapp-test:latest
```

**Issue**: SBOM generation fails
```bash
# Generate SBOM locally
syft jobapp-test:latest -o spdx-json

# Check image exists
docker images | grep jobapp-test
```

---

## 🚀 CD Pipeline Issues

### ❌ Phase 1: Build & Push Failures

**Issue**: Container registry authentication
```bash
# Check GitHub token permissions
gh auth status

# Re-authenticate if needed
gh auth refresh
```

**Issue**: Multi-platform build fails
```bash
# Test single platform build
docker build --platform linux/amd64 -t jobapp-test .

# Check buildx setup
docker buildx ls
```

### ❌ Phase 2: Render Deployment Failures

**Issue**: Render API authentication
```bash
# Verify secrets are set
gh secret list

# Test Render API access
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.render.com/v1/services
```

**Issue**: Service deployment timeout
- Check Render dashboard for deployment logs
- Verify environment variables are set correctly
- Ensure database and Redis services are running

**Issue**: Health check fails after deployment
```bash
# Check service logs in Render dashboard
# Test health endpoint manually
curl https://your-service.onrender.com/api/health

# Check if migrations ran
# Go to Render Shell and run:
php artisan migrate:status
```

---

## 🗄️ Database Issues

### Connection Problems
```bash
# Test database connection
cd backend
php artisan tinker
# In tinker:
DB::connection()->getPdo();
```

### Migration Issues
```bash
# Reset migrations (CAUTION: destroys data)
php artisan migrate:fresh

# Run specific migration
php artisan migrate --path=/database/migrations/specific_migration.php

# Check migration status
php artisan migrate:status
```

---

## 🔐 Security Issues

### Secrets Management
```bash
# Verify GitHub secrets
gh secret list

# Update secret
gh secret set SECRET_NAME --body "new_value"

# Check Render environment variables
# Go to Render dashboard → Service → Environment
```

### JWT Issues
```bash
# Generate new JWT secret
php artisan jwt:secret --force

# Test JWT token generation
php artisan tinker
# In tinker:
JWTAuth::attempt(['email' => 'test@example.com', 'password' => 'password']);
```

---

## 🌐 Network & Connectivity Issues

### CORS Issues
```bash
# Check CORS configuration
cd backend
cat config/cors.php

# Test CORS headers
curl -H "Origin: https://your-frontend.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS \
  https://your-api.onrender.com/api/health
```

### SSL/TLS Issues
```bash
# Test SSL certificate
curl -vI https://your-service.onrender.com/api/health

# Check certificate details
openssl s_client -connect your-service.onrender.com:443 -servername your-service.onrender.com
```

---

## 📊 Performance Issues

### Slow Pipeline
- **Parallel execution**: Ensure Unit and Integration tests run in parallel
- **Cache optimization**: Check if Docker layer caching is working
- **Resource limits**: Consider upgrading GitHub Actions runners

### Slow Deployment
- **Image size**: Optimize Dockerfile for smaller images
- **Build cache**: Ensure Docker buildx cache is configured
- **Resource allocation**: Consider upgrading Render plan

---

## 🆘 Emergency Procedures

### Rollback Deployment
```bash
# In Render dashboard:
# 1. Go to your service
# 2. Click "Deployments" tab
# 3. Find previous successful deployment
# 4. Click "Redeploy"
```

### Disable CI/CD Temporarily
```bash
# Disable workflow
gh workflow disable ci.yml
gh workflow disable cd.yml

# Re-enable when ready
gh workflow enable ci.yml
gh workflow enable cd.yml
```

### Emergency Database Access
```bash
# Connect to production database (use carefully)
# Get connection string from Render dashboard
psql "postgresql://user:password@host:port/database"
```

---

## 📞 Getting Help

### Check Logs
1. **GitHub Actions**: Repository → Actions → Click failed run
2. **Render Service**: Dashboard → Service → Logs tab
3. **Database**: Dashboard → Database → Logs tab

### Common Log Locations
- **CI Pipeline**: GitHub Actions logs
- **Application**: Render service logs
- **Database**: Render PostgreSQL logs
- **Security Scans**: GitHub Security tab

### Support Resources
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)
- **Render**: [render.com/docs](https://render.com/docs)
- **Laravel**: [laravel.com/docs](https://laravel.com/docs)
- **Docker**: [docs.docker.com](https://docs.docker.com)

### Create Support Ticket
```bash
# For repository issues
gh issue create --title "CI/CD Pipeline Issue" --body "Description of problem"

# For Render issues
# Use Render dashboard support chat or email
```

---

## ✅ Prevention Checklist

### Before Each Release
- [ ] All tests pass locally
- [ ] Docker build succeeds locally
- [ ] Environment variables are up to date
- [ ] Database migrations are tested
- [ ] Security scans show no critical issues

### Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Review security scan results
- [ ] Monitor pipeline performance
- [ ] Check service resource usage
- [ ] Rotate secrets quarterly

---

**Remember**: Most issues can be resolved by checking logs first, then testing locally before pushing fixes.