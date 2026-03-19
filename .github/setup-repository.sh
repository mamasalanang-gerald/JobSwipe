#!/bin/bash

# 🚀 Repository CI/CD Setup Script
# This script helps configure the repository for the CI/CD pipeline

set -e

echo "🚀 Setting up JobApp CI/CD Pipeline..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "This is not a git repository!"
    exit 1
fi

print_status "Git repository detected"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_warning "GitHub CLI (gh) is not installed"
    print_info "Install it from: https://cli.github.com/"
    print_info "Some features will be skipped"
    GH_AVAILABLE=false
else
    print_status "GitHub CLI detected"
    GH_AVAILABLE=true
fi

# Create necessary directories
echo ""
echo "📁 Creating directory structure..."
mkdir -p .github/workflows
mkdir -p frontend/web/tests/e2e
mkdir -p backend/tests/Unit
mkdir -p backend/tests/Feature
mkdir -p deploy

print_status "Directory structure created"

# Check if package.json exists for frontend
echo ""
echo "📦 Checking frontend configuration..."

if [ ! -f "frontend/web/package.json" ]; then
    print_warning "Frontend package.json not found"
    print_info "Creating basic package.json for frontend..."
    
    cat > frontend/web/package.json << 'EOF'
{
  "name": "jobapp-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "jest": "^29.0.0",
    "typescript": "^5.0.0"
  }
}
EOF
    print_status "Basic package.json created for frontend"
else
    print_status "Frontend package.json exists"
fi

# Check backend composer.json
echo ""
echo "🐘 Checking backend configuration..."

if [ -f "backend/composer.json" ]; then
    print_status "Backend composer.json exists"
else
    print_warning "Backend composer.json not found"
fi

# Create basic test files if they don't exist
echo ""
echo "🧪 Setting up test files..."

# Backend unit test example
if [ ! -f "backend/tests/Unit/ExampleTest.php" ]; then
    cat > backend/tests/Unit/ExampleTest.php << 'EOF'
<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic unit test example.
     */
    public function test_that_true_is_true(): void
    {
        $this->assertTrue(true);
    }
}
EOF
    print_status "Created backend unit test example"
fi

# Backend feature test example
if [ ! -f "backend/tests/Feature/ExampleTest.php" ]; then
    cat > backend/tests/Feature/ExampleTest.php << 'EOF'
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic feature test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/api/health');

        $response->assertStatus(200);
    }
}
EOF
    print_status "Created backend feature test example"
fi

# Frontend unit test example
if [ ! -f "frontend/web/tests/unit/example.test.js" ]; then
    mkdir -p frontend/web/tests/unit
    cat > frontend/web/tests/unit/example.test.js << 'EOF'
// Example unit test
describe('Example Unit Test', () => {
  test('should pass basic test', () => {
    expect(true).toBe(true);
  });

  test('should test basic math', () => {
    expect(2 + 2).toBe(4);
  });
});
EOF
    print_status "Created frontend unit test example"
fi

# Frontend integration test example
if [ ! -f "frontend/web/tests/integration/api.test.js" ]; then
    mkdir -p frontend/web/tests/integration
    cat > frontend/web/tests/integration/api.test.js << 'EOF'
// Example integration test
describe('API Integration Tests', () => {
  test('should connect to health endpoint', async () => {
    // Mock or actual API call
    const mockResponse = { status: 'ok', timestamp: new Date().toISOString() };
    expect(mockResponse.status).toBe('ok');
  });
});
EOF
    print_status "Created frontend integration test example"
fi

# GitHub repository configuration
if [ "$GH_AVAILABLE" = true ]; then
    echo ""
    echo "🔧 Configuring GitHub repository..."
    
    # Check if logged in to GitHub
    if gh auth status > /dev/null 2>&1; then
        print_status "GitHub CLI authenticated"
        
        # Enable GitHub Actions if not already enabled
        print_info "Ensuring GitHub Actions is enabled..."
        
        # Create repository secrets (interactive)
        echo ""
        echo "🔐 Repository Secrets Setup"
        echo "The following secrets need to be configured in GitHub:"
        echo ""
        echo "Required secrets:"
        echo "  - RENDER_API_KEY: Your Render API key"
        echo "  - RENDER_SERVICE_ID: Your Render service ID"
        echo ""
        echo "Optional secrets:"
        echo "  - SLACK_WEBHOOK_URL: For Slack notifications"
        echo "  - DISCORD_WEBHOOK_URL: For Discord notifications"
        echo ""
        
        read -p "Would you like to set up secrets now? (y/N): " setup_secrets
        
        if [[ $setup_secrets =~ ^[Yy]$ ]]; then
            echo ""
            read -p "Enter your Render API Key (or press Enter to skip): " render_api_key
            if [ ! -z "$render_api_key" ]; then
                gh secret set RENDER_API_KEY --body "$render_api_key"
                print_status "RENDER_API_KEY secret set"
            fi
            
            read -p "Enter your Render Service ID (or press Enter to skip): " render_service_id
            if [ ! -z "$render_service_id" ]; then
                gh secret set RENDER_SERVICE_ID --body "$render_service_id"
                print_status "RENDER_SERVICE_ID secret set"
            fi
        fi
        
    else
        print_warning "GitHub CLI not authenticated"
        print_info "Run 'gh auth login' to authenticate"
    fi
else
    print_warning "GitHub CLI not available - skipping repository configuration"
fi

# Create branch protection documentation
echo ""
echo "🛡️  Branch Protection Setup"
print_info "Branch protection rules need to be configured manually in GitHub:"
print_info "1. Go to Settings > Branches"
print_info "2. Add rule for 'main' branch"
print_info "3. Enable required status checks"
print_info "4. Require pull request reviews"
print_info ""
print_info "See .github/branch-protection.yml for detailed configuration"

# Final setup verification
echo ""
echo "🔍 Verifying setup..."

# Check if all workflow files exist
workflows=("ci.yml" "cd.yml")
for workflow in "${workflows[@]}"; do
    if [ -f ".github/workflows/$workflow" ]; then
        print_status "Workflow $workflow exists"
    else
        print_error "Workflow $workflow missing"
    fi
done

# Check if Dockerfile exists
if [ -f "Dockerfile" ]; then
    print_status "Dockerfile exists"
else
    print_error "Dockerfile missing"
fi

# Check if deployment files exist
deploy_files=("render.yaml" "README.md" "RENDER_DEPLOY.md")
for file in "${deploy_files[@]}"; do
    if [ -f "deploy/$file" ]; then
        print_status "Deploy file $file exists"
    else
        print_warning "Deploy file $file missing"
    fi
done

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. 📝 Review and customize the workflow files"
echo "2. 🔐 Configure GitHub repository secrets"
echo "3. 🛡️  Set up branch protection rules"
echo "4. 🧪 Add your actual test cases"
echo "5. 🚀 Create a PR from staging to main to test CI"
echo ""
echo "Documentation:"
echo "- CI/CD Setup: .github/CI_CD_SETUP.md"
echo "- Deployment Guide: deploy/RENDER_DEPLOY.md"
echo "- Branch Protection: .github/branch-protection.yml"
echo ""
print_status "Repository is ready for CI/CD!"