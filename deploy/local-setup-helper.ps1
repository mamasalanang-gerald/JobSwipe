# Local Setup Helper Script for Windows
# Run this on your LOCAL Windows machine to prepare for EC2 deployment

Write-Host "🚀 JobApp EC2 Deployment - Local Setup Helper" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""

# Collect information
$EC2_IP = Read-Host "Enter your EC2 Public IP"
$SSH_KEY = Read-Host "Enter your SSH key file path (e.g., C:\Users\YourName\.ssh\jobapp-key.pem)"
$DOMAIN = Read-Host "Enter your domain name (e.g., yourdomain.com)"
$DOCKER_USER = Read-Host "Enter your Docker Hub username"

Write-Host ""
Write-Host "📝 Configuration Summary:" -ForegroundColor Cyan
Write-Host "  EC2 IP: $EC2_IP"
Write-Host "  SSH Key: $SSH_KEY"
Write-Host "  Domain: $DOMAIN"
Write-Host "  Docker Hub: $DOCKER_USER"
Write-Host ""
$CONFIRM = Read-Host "Is this correct? (y/n)"

if ($CONFIRM -ne "y") {
    Write-Host "❌ Setup cancelled" -ForegroundColor Red
    exit 1
}

# Create .env.production from template
Write-Host ""
Write-Host "📝 Creating .env.production file..." -ForegroundColor Cyan
Copy-Item "deploy\.env.production.template" "deploy\.env.production"

# Generate secrets using OpenSSL (if available) or .NET
Write-Host ""
Write-Host "🔐 Generating secure secrets..." -ForegroundColor Cyan

function Generate-RandomString {
    param([int]$length = 32)
    $bytes = New-Object byte[] $length
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes).Substring(0, $length)
}

$APP_KEY = "base64:" + (Generate-RandomString -length 32)
$JWT_SECRET = Generate-RandomString -length 32
$DB_PASSWORD = Generate-RandomString -length 20
$MONGO_PASSWORD = Generate-RandomString -length 20
$REDIS_PASSWORD = Generate-RandomString -length 20

# Update .env.production
$envContent = Get-Content "deploy\.env.production"
$envContent = $envContent -replace "DOCKER_HUB_USERNAME=.*", "DOCKER_HUB_USERNAME=$DOCKER_USER"
$envContent = $envContent -replace "APP_URL=.*", "APP_URL=https://$DOMAIN"
$envContent = $envContent -replace "APP_KEY=.*", "APP_KEY=$APP_KEY"
$envContent = $envContent -replace "JWT_SECRET=.*", "JWT_SECRET=$JWT_SECRET"
$envContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=$DB_PASSWORD"
$envContent = $envContent -replace "MONGO_ROOT_PASSWORD=.*", "MONGO_ROOT_PASSWORD=$MONGO_PASSWORD"
$envContent = $envContent -replace "REDIS_PASSWORD=.*", "REDIS_PASSWORD=$REDIS_PASSWORD"
$envContent = $envContent -replace "NEXT_PUBLIC_API_URL=.*", "NEXT_PUBLIC_API_URL=https://api.$DOMAIN"
$envContent | Set-Content "deploy\.env.production"

# Update nginx config
$nginxContent = Get-Content "deploy\nginx\jobapp.conf"
$nginxContent = $nginxContent -replace "yourdomain.com", $DOMAIN
$nginxContent = $nginxContent -replace "api.yourdomain.com", "api.$DOMAIN"
$nginxContent | Set-Content "deploy\nginx\jobapp.conf"

Write-Host "✅ Configuration files updated!" -ForegroundColor Green
Write-Host ""

# Create helper scripts
$sshConnectScript = @"
# SSH Connect Helper
ssh -i "$SSH_KEY" ubuntu@$EC2_IP
"@
$sshConnectScript | Set-Content "deploy\ssh-connect.sh"

$uploadScript = @"
# Upload Files to EC2
Write-Host "📤 Uploading files to EC2..." -ForegroundColor Cyan

# Create directories on EC2
ssh -i "$SSH_KEY" ubuntu@$EC2_IP "mkdir -p ~/jobapp/scripts ~/jobapp/nginx"

# Upload docker-compose
scp -i "$SSH_KEY" deploy/docker-compose.prod.yml ubuntu@$EC2_IP:~/jobapp/

# Upload .env
scp -i "$SSH_KEY" deploy/.env.production ubuntu@$EC2_IP:~/jobapp/

# Upload scripts
scp -i "$SSH_KEY" deploy/scripts/*.sh ubuntu@$EC2_IP:~/jobapp/scripts/

# Upload nginx config
scp -i "$SSH_KEY" deploy/nginx/jobapp.conf ubuntu@$EC2_IP:~/jobapp/nginx/

Write-Host "✅ Files uploaded!" -ForegroundColor Green
"@
$uploadScript | Set-Content "deploy\upload-to-ec2.ps1"

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Test SSH connection:" -ForegroundColor Cyan
Write-Host "   ssh -i `"$SSH_KEY`" ubuntu@$EC2_IP"
Write-Host ""
Write-Host "2. Run server setup (on EC2):" -ForegroundColor Cyan
Write-Host "   ssh -i `"$SSH_KEY`" ubuntu@$EC2_IP 'bash -s' < deploy/scripts/ec2-server-setup.sh"
Write-Host ""
Write-Host "3. Upload configuration files:" -ForegroundColor Cyan
Write-Host "   powershell -ExecutionPolicy Bypass -File deploy\upload-to-ec2.ps1"
Write-Host ""
Write-Host "4. Configure DNS:" -ForegroundColor Cyan
Write-Host "   Point these A records to $EC2_IP:"
Write-Host "   - $DOMAIN"
Write-Host "   - www.$DOMAIN"
Write-Host "   - api.$DOMAIN"
Write-Host ""
Write-Host "5. SSH into server and continue setup:" -ForegroundColor Cyan
Write-Host "   ssh -i `"$SSH_KEY`" ubuntu@$EC2_IP"
Write-Host ""
Write-Host "📝 Your secrets have been saved to deploy\.env.production" -ForegroundColor Yellow
Write-Host "⚠️  KEEP THIS FILE SECURE - DO NOT COMMIT TO GIT!" -ForegroundColor Red
Write-Host ""

# Save connection info for reference
$connectionInfo = @"
# EC2 Connection Information
# Generated: $(Get-Date)

EC2_IP=$EC2_IP
SSH_KEY=$SSH_KEY
DOMAIN=$DOMAIN
DOCKER_USER=$DOCKER_USER

# SSH Command
ssh -i "$SSH_KEY" ubuntu@$EC2_IP

# SCP Command Template
scp -i "$SSH_KEY" <local-file> ubuntu@$EC2_IP:<remote-path>
"@
$connectionInfo | Set-Content "deploy\connection-info.txt"

Write-Host "💾 Connection info saved to deploy\connection-info.txt" -ForegroundColor Green
