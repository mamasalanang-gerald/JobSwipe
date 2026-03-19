# 🚀 CI/CD Pipeline Documentation

## 📋 Overview

This document describes the comprehensive CI/CD pipeline for JobApp, implementing a 4-layer testing strategy with 7 phases for CI and 3 phases for CD.

## 🌳 Branch Strategy

```
main (production)
├── staging (production-ready features)
├── feature/* (new features)
└── fix/* (bug fixes)
```

### Branch Rules:
- **feature/**: New feature development
- **fix/**: Bug fixes and debugging
- **staging**: Production-ready complete features
- **main**: Production branch

### Workflow Triggers:
- **CI Pipeline**: Triggered on PR from `staging` → `main`
- **CD Pipeline**: Triggered on push to `main`
- **No workflows**: Feature/fix branches → staging (manual merge)

## 🔄 CI Pipeline (7 Phases, 4 Testing Layers)

### Phase 1: 📋 Lint & Validate
**Purpose**: Code quality and merge conflict prevention
- ✅ Merge conflict detection
- ✅ Dockerfile validation
- ✅ Code linting (PHP Pint, ESLint)
- ✅ Dependency installation

### Phase 2: 🧪 Unit Tests (Layer 1)
**Purpose**: Individual component testing
- ✅ Backend unit tests (PHPUnit)
- ✅ Frontend unit tests (Jest/Vitest)
- ✅ Code coverage reporting
- ✅ Isolated component validation

### Phase 3: 🔗 Integration Tests (Layer 2)
**Purpose**: Component interaction testing
- ✅ Database integration tests
- ✅ API endpoint testing
- ✅ Service integration validation
- ✅ Cross-component communication

**Runs in parallel with Phase 2**

### Phase 4: 🎭 E2E Tests (Layer 3)
**Purpose**: Complete user workflow testing
- ✅ Playwright browser testing
- ✅ Full application flow validation
- ✅ Multi-browser compatibility
- ✅ Mobile responsiveness testing

**Requires**: Phases 2 & 3 to pass

### Phase 5: 🐳 Test & Build Docker
**Purpose**: Container build and functionality validation
- ✅ Docker image build
- ✅ Container functionality testing
- ✅ Health check validation
- ✅ Build cache optimization

**Requires**: Phases 2 & 3 to pass

### Phase 6: 🔒 Security Scan (Layer 4)
**Purpose**: Security and compliance validation
- ✅ **SBOM Generation** (Syft)
- ✅ **Vulnerability Scanning** (Trivy)
- ✅ **Container Signing** (Cosign)
- ✅ Security report generation

**Requires**: Phases 4 & 5 to pass

### Phase 7: 📊 CI Summary
**Purpose**: Pipeline status reporting
- ✅ Comprehensive status report
- ✅ Phase-by-phase results
- ✅ Testing layer summary
- ✅ Pass/fail determination

## 🚀 CD Pipeline (3 Phases)

### Phase 1: 🏗️ Build & Push Production Images
**Purpose**: Production image creation and registry storage
- ✅ Multi-platform Docker build
- ✅ Container registry push (GHCR)
- ✅ Image signing with Cosign
- ✅ Production SBOM generation
- ✅ Image attestation

### Phase 2: 🚀 Deploy to Render
**Purpose**: Production deployment and verification
- ✅ Render service deployment
- ✅ Health check validation
- ✅ API endpoint verification
- ✅ Deployment status monitoring

### Phase 3: 📊 Deployment Summary
**Purpose**: Deployment status reporting
- ✅ Deployment success/failure reporting
- ✅ Production URL validation
- ✅ Security feature confirmation
- ✅ Service status verification

## 🧪 Testing Layers Breakdown

### Layer 1: Unit Tests
- **Scope**: Individual functions, methods, components
- **Tools**: PHPUnit (Backend), Jest/Vitest (Frontend)
- **Coverage**: Code coverage reporting
- **Speed**: Fast execution (< 5 minutes)

### Layer 2: Integration Tests
- **Scope**: Component interactions, API endpoints
- **Tools**: PHPUnit Feature tests, API testing
- **Dependencies**: Database, Redis, external services
- **Speed**: Medium execution (5-15 minutes)

### Layer 3: E2E Tests
- **Scope**: Complete user workflows
- **Tools**: Playwright
- **Coverage**: Multi-browser, mobile, accessibility
- **Speed**: Slower execution (15-30 minutes)

### Layer 4: Security Tests
- **Scope**: Vulnerability scanning, compliance
- **Tools**: Trivy, Syft, Cosign
- **Coverage**: Container security, dependency scanning
- **Speed**: Medium execution (5-10 minutes)

## 🔐 Security Features

### Container Security:
- ✅ **Cosign Signing**: All production images signed
- ✅ **SBOM Generation**: Software Bill of Materials
- ✅ **Vulnerability Scanning**: Trivy security scans
- ✅ **Registry Security**: GitHub Container Registry

### Secrets Management:
- ✅ GitHub Secrets for sensitive data
- ✅ Environment-specific configurations
- ✅ No secrets in code or logs
- ✅ Secure secret rotation capability

## 📊 Pipeline Metrics

### CI Pipeline:
- **Total Phases**: 7
- **Testing Layers**: 4
- **Parallel Execution**: Phases 2 & 3
- **Average Duration**: 20-30 minutes
- **Success Rate Target**: >95%

### CD Pipeline:
- **Total Phases**: 3
- **Deployment Time**: 5-10 minutes
- **Zero-downtime**: ✅ Supported
- **Rollback Capability**: ✅ Available

## 🛠️ Required Secrets

Configure these secrets in GitHub repository settings:

```bash
# Render Deployment
RENDER_API_KEY=your_render_api_key
RENDER_SERVICE_ID=your_render_service_id

# Container Registry (auto-configured)
GITHUB_TOKEN=auto_generated

# Optional: Additional integrations
SLACK_WEBHOOK_URL=your_slack_webhook
DISCORD_WEBHOOK_URL=your_discord_webhook
```

## 🔧 Local Testing

### Run CI Tests Locally:
```bash
# Backend tests
cd backend
composer install
php artisan test

# Frontend tests
cd frontend/web
npm install
npm run test
npm run test:integration

# E2E tests
npx playwright test

# Docker build test
docker build -t jobapp-test .
docker run --rm -p 8080:8080 jobapp-test
```

### Security Scanning:
```bash
# Install tools
brew install syft trivy cosign

# Generate SBOM
syft jobapp-test:latest -o spdx-json

# Vulnerability scan
trivy image jobapp-test:latest

# Sign image (requires setup)
cosign sign jobapp-test:latest
```

## 📈 Monitoring & Alerts

### Pipeline Monitoring:
- ✅ GitHub Actions status badges
- ✅ Slack/Discord notifications
- ✅ Email alerts on failures
- ✅ Deployment status tracking

### Production Monitoring:
- ✅ Render service monitoring
- ✅ Health check endpoints
- ✅ Error rate tracking
- ✅ Performance metrics

## 🚨 Troubleshooting

### Common CI Issues:
1. **Lint Failures**: Check code formatting
2. **Test Failures**: Review test logs and fix issues
3. **Docker Build Failures**: Verify Dockerfile syntax
4. **Security Scan Failures**: Address vulnerabilities

### Common CD Issues:
1. **Deployment Failures**: Check Render service logs
2. **Health Check Failures**: Verify API endpoints
3. **Image Push Failures**: Check registry permissions
4. **Secret Issues**: Verify GitHub secrets

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render Deployment Guide](../deploy/RENDER_DEPLOY.md)
- [Security Best Practices](https://docs.github.com/en/actions/security-guides)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Last Updated**: $(date)
**Pipeline Version**: 1.0.0
**Maintained by**: DevOps Team