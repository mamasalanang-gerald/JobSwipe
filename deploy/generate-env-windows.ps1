# Generate Environment Variables for Windows
# Run this script to generate secure secrets for your deployment

Write-Host "🔐 Generating Secure Secrets for JobSwipe Deployment" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""

# Collect Docker Hub username
$DOCKER_USER = Read-Host "Enter your Docker Hub username"

# Generate secrets
Write-Host ""
Write-Host "Generating secrets..." -ForegroundColor Cyan

$APP_KEY = "base64:" + [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$JWT_SECRET = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$DB_PASSWORD = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 20 | ForEach-Object {[char]$_})
$MONGO_PASSWORD = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 20 | ForEach-Object {[char]$_})
$REDIS_PASSWORD = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 20 | ForEach-Object {[char]$_})

# Update .env.production file
$envContent = Get-Content "deploy\.env.production" -Raw
$envContent = $envContent -replace "DOCKER_HUB_USERNAME=.*", "DOCKER_HUB_USERNAME=$DOCKER_USER"
$envContent = $envContent -replace "APP_KEY=.*", "APP_KEY=$APP_KEY"
$envContent = $envContent -replace "JWT_SECRET=.*", "JWT_SECRET=$JWT_SECRET"
$envContent = $envContent -replace "DB_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD", "DB_PASSWORD=$DB_PASSWORD"
$envContent = $envContent -replace "MONGO_ROOT_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD", "MONGO_ROOT_PASSWORD=$MONGO_PASSWORD"
$envContent = $envContent -replace "REDIS_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD", "REDIS_PASSWORD=$REDIS_PASSWORD"
$envContent | Set-Content "deploy\.env.production"

Write-Host ""
Write-Host "✅ Secrets generated and saved to deploy\.env.production" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Your Generated Secrets:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "DOCKER_HUB_USERNAME: $DOCKER_USER" -ForegroundColor White
Write-Host "APP_KEY: $APP_KEY" -ForegroundColor White
Write-Host "JWT_SECRET: $JWT_SECRET" -ForegroundColor White
Write-Host "DB_PASSWORD: $DB_PASSWORD" -ForegroundColor White
Write-Host "MONGO_PASSWORD: $MONGO_PASSWORD" -ForegroundColor White
Write-Host "REDIS_PASSWORD: $REDIS_PASSWORD" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  IMPORTANT: Keep these secrets secure!" -ForegroundColor Red
Write-Host "⚠️  Do NOT commit deploy\.env.production to git!" -ForegroundColor Red
Write-Host ""

# Save secrets to a separate file for reference
$secretsFile = @"
# JobSwipe Deployment Secrets
# Generated: $(Get-Date)
# KEEP THIS FILE SECURE!

DOCKER_HUB_USERNAME=$DOCKER_USER
APP_KEY=$APP_KEY
JWT_SECRET=$JWT_SECRET
DB_PASSWORD=$DB_PASSWORD
MONGO_ROOT_PASSWORD=$MONGO_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD

# EC2 Details
EC2_IP=13.213.13.180
DOMAIN=jobswipe.site
"@

$secretsFile | Set-Content "deploy\SECRETS.txt"

Write-Host "💾 Secrets also saved to deploy\SECRETS.txt for your reference" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Setup DNS in Hostinger (point jobswipe.site to 13.213.13.180)" -ForegroundColor White
Write-Host "2. Create Docker Hub account and repositories" -ForegroundColor White
Write-Host "3. Build and push Docker images" -ForegroundColor White
Write-Host "4. Upload files to EC2" -ForegroundColor White
Write-Host "5. Configure Nginx and SSL" -ForegroundColor White
Write-Host "6. Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "📖 See deploy\NEXT_STEPS.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""
