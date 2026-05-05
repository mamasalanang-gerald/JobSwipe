# Test Companies Guide

## Overview

This guide covers all test companies available in test mode, including their profiles, invite codes, and test scenarios.

## 🏢 Available Test Companies

### 1. Tech Corp
**Industry**: Technology  
**Size**: 50-200 employees  
**Description**: Leading technology company in the Philippines

**Accounts**:
- **Admin**: `admin@test.com` / `Test1234`
  - Name: Michael Brown
  - Role: Company Administrator
  
- **HR**: `hr@test.com` / `Test1234`
  - Name: Sarah Johnson
  - Title: HR Manager

**Invite Code**: `INVITE123`  
**Email Domain**: `@techcorp.com`

**Use Cases**:
- General technology company testing
- Mid-size company workflows
- Standard HR operations

---

### 2. Innovate Solutions Inc.
**Industry**: Artificial Intelligence  
**Size**: 11-50 employees  
**Description**: Fast-growing startup specializing in AI and machine learning solutions for businesses across Southeast Asia

**Accounts**:
- **Admin**: `admin@innovate.com` / `Test1234`
  - Name: Carlos Reyes
  - Role: Company Administrator
  
- **HR**: `hr@innovate.com` / `Test1234`
  - Name: Maria Garcia
  - Title: Senior Recruiter

**Invite Code**: `INNOVATE2024`  
**Email Domain**: `@innovate.com`

**Use Cases**:
- Startup/small company testing
- Tech-focused recruitment
- Fast-paced hiring workflows

---

### 3. Global Bank Philippines
**Industry**: Banking & Finance  
**Size**: 1000+ employees  
**Description**: One of the leading financial institutions in the Philippines, offering comprehensive banking and financial services

**Accounts**:
- **Admin**: `admin@globalbank.ph` / `Test1234`
  - Name: Roberto Cruz
  - Role: Company Administrator
  
- **HR**: `hr@globalbank.ph` / `Test1234`
  - Name: Patricia Santos
  - Title: Talent Acquisition Lead

**Invite Code**: `BANK2024`  
**Email Domain**: `@globalbank.ph`

**Use Cases**:
- Large enterprise testing
- Financial sector workflows
- High-volume recruitment
- Compliance-heavy processes

---

### 4. HealthPlus Medical Center
**Industry**: Healthcare  
**Size**: 201-500 employees  
**Description**: Premier healthcare provider with state-of-the-art facilities and a team of highly qualified medical professionals

**Accounts**:
- **Admin**: `admin@healthplus.com` / `Test1234`
  - Name: Dr. Ramon Villanueva
  - Role: Company Administrator
  
- **HR**: `hr@healthplus.com` / `Test1234`
  - Name: Dr. Anna Mendoza
  - Title: HR Director

**Invite Code**: `HEALTH2024`  
**Email Domain**: `@healthplus.com`

**Use Cases**:
- Healthcare industry testing
- Medical professional recruitment
- Specialized role hiring
- Credential verification workflows

---

### 5. Creative Minds Agency
**Industry**: Marketing & Advertising  
**Size**: 11-50 employees  
**Description**: Award-winning creative agency specializing in branding, digital marketing, and innovative advertising campaigns

**Accounts**:
- **Admin**: `admin@creativeagency.ph` / `Test1234`
  - Name: Marco Dela Cruz
  - Role: Company Administrator
  
- **HR**: `hr@creativeagency.ph` / `Test1234`
  - Name: Isabella Torres
  - Title: People Operations Manager

**Invite Code**: `CREATIVE2024`  
**Email Domain**: `@creativeagency.ph`

**Use Cases**:
- Creative industry testing
- Portfolio-based hiring
- Project-based recruitment
- Freelance/contract workflows

---

## 🎯 Test Scenarios

### Scenario 1: Login as Different Companies

**Test switching between companies:**

```
1. Login as: admin@test.com / Test1234
   → See Tech Corp dashboard

2. Logout and login as: admin@innovate.com / Test1234
   → See Innovate Solutions dashboard

3. Logout and login as: hr@globalbank.ph / Test1234
   → See Global Bank HR view

4. Logout and login as: hr@healthplus.com / Test1234
   → See HealthPlus HR view
```

### Scenario 2: HR Invite Registration

**Test joining an existing company via invite code:**

```
1. Toggle test mode ON
2. Select "Company/HR" role
3. Click "Register via Invite Code"
4. Enter code: INNOVATE2024
5. See company name: "Innovate Solutions Inc."
6. Complete registration with:
   - Email: newhr@innovate.com
   - Password: Test1234
   - First Name: Juan
   - Last Name: Dela Cruz
   - Job Title: Recruiter
7. Enter OTP: 123456
8. ✅ Join Innovate Solutions as HR
```

### Scenario 3: Company Email Auto-Detection

**Test automatic company detection by email domain:**

```
1. Toggle test mode ON
2. Select "Company/HR" role
3. Enter email: newrecruiter@globalbank.ph
4. System detects: "Global Bank Philippines"
5. Shows message: "Detected company: Global Bank Philippines"
6. Complete registration
7. Enter OTP: 123456
8. ✅ Automatically join Global Bank
```

### Scenario 4: Multiple HR Users per Company

**Test multiple HR users in the same company:**

```
1. Login as: hr@test.com / Test1234
   → Tech Corp HR (Sarah Johnson)

2. Register new HR: newhr@techcorp.com
   → Use invite code: INVITE123
   → Complete registration
   → ✅ Second HR user in Tech Corp

3. Both HR users can:
   - Post jobs
   - Review applicants
   - Manage candidates
```

### Scenario 5: Company Size Variations

**Test different company sizes:**

```
Small (11-50):
- Login: admin@innovate.com
- Login: admin@creativeagency.ph

Medium (50-200):
- Login: admin@test.com

Medium-Large (201-500):
- Login: admin@healthplus.com

Enterprise (1000+):
- Login: admin@globalbank.ph
```

### Scenario 6: Industry-Specific Testing

**Test different industries:**

```
Technology:
- Login: admin@test.com (Tech Corp)
- Login: admin@innovate.com (AI/ML)

Finance:
- Login: admin@globalbank.ph

Healthcare:
- Login: admin@healthplus.com

Creative:
- Login: admin@creativeagency.ph
```

---

## 📊 Company Comparison Table

| Company | Industry | Size | Invite Code | Email Domain | Admin Email |
|---------|----------|------|-------------|--------------|-------------|
| Tech Corp | Technology | 50-200 | INVITE123 | techcorp.com | admin@test.com |
| Innovate Solutions | AI/ML | 11-50 | INNOVATE2024 | innovate.com | admin@innovate.com |
| Global Bank | Banking | 1000+ | BANK2024 | globalbank.ph | admin@globalbank.ph |
| HealthPlus | Healthcare | 201-500 | HEALTH2024 | healthplus.com | admin@healthplus.com |
| Creative Minds | Marketing | 11-50 | CREATIVE2024 | creativeagency.ph | admin@creativeagency.ph |

---

## 🔧 Configuration

### Add New Test Company

Edit `frontend/mobile/constants/testAccounts.ts`:

```typescript
// 1. Add to TEST_COMPANY_INVITES
export const TEST_COMPANY_INVITES: TestCompanyInvite[] = [
  // ... existing companies
  {
    code: 'YOURCODE2024',
    company_name: 'Your Company Name',
    valid: true,
    company_email_domain: 'yourcompany.com',
  },
];

// 2. Add admin account to TEST_ACCOUNTS
{
  email: 'admin@yourcompany.com',
  password: 'Test1234',
  role: 'company_admin',
  token: 'test_token_company_admin_006',
  profile: {
    first_name: 'Admin',
    last_name: 'Name',
    company_name: 'Your Company Name',
    company_description: 'Your company description',
    company_industry: 'Your Industry',
    company_size: '11-50',
  },
},

// 3. Add HR account to TEST_ACCOUNTS
{
  email: 'hr@yourcompany.com',
  password: 'Test1234',
  role: 'hr',
  token: 'test_token_hr_006',
  profile: {
    first_name: 'HR',
    last_name: 'Name',
    company_name: 'Your Company Name',
    job_title: 'HR Manager',
  },
}
```

---

## 🧪 Testing Workflows

### Workflow 1: Company Admin Setup

```
1. Login as company admin
2. Complete company profile
3. Upload company logo
4. Add office images
5. Set company details
6. Generate invite codes
7. Invite HR team members
```

### Workflow 2: HR Team Member Onboarding

```
1. Receive invite code from admin
2. Register with company email
3. Enter invite code
4. Complete HR profile
5. Set job title
6. Access company dashboard
7. Start posting jobs
```

### Workflow 3: Multi-Company Testing

```
1. Create accounts in multiple companies
2. Test switching between companies
3. Verify data isolation
4. Test company-specific features
5. Verify permissions per company
```

---

## 📝 Company Profile Data

### Tech Corp Profile
```json
{
  "name": "Tech Corp",
  "tagline": "Innovation Through Technology",
  "description": "Leading technology company in the Philippines",
  "industry": "Technology",
  "size": "50-200",
  "founded": 2015,
  "website": "https://techcorp.com",
  "location": "Makati City, Metro Manila"
}
```

### Innovate Solutions Profile
```json
{
  "name": "Innovate Solutions Inc.",
  "tagline": "AI-Powered Business Solutions",
  "description": "Fast-growing startup specializing in AI and machine learning",
  "industry": "Artificial Intelligence",
  "size": "11-50",
  "founded": 2020,
  "website": "https://innovate.com",
  "location": "BGC, Taguig City"
}
```

### Global Bank Profile
```json
{
  "name": "Global Bank Philippines",
  "tagline": "Your Trusted Financial Partner",
  "description": "Leading financial institution in the Philippines",
  "industry": "Banking & Finance",
  "size": "1000+",
  "founded": 1995,
  "website": "https://globalbank.ph",
  "location": "Ortigas Center, Pasig City"
}
```

### HealthPlus Profile
```json
{
  "name": "HealthPlus Medical Center",
  "tagline": "Excellence in Healthcare",
  "description": "Premier healthcare provider with state-of-the-art facilities",
  "industry": "Healthcare",
  "size": "201-500",
  "founded": 2010,
  "website": "https://healthplus.com",
  "location": "Quezon City, Metro Manila"
}
```

### Creative Minds Profile
```json
{
  "name": "Creative Minds Agency",
  "tagline": "Where Creativity Meets Strategy",
  "description": "Award-winning creative agency specializing in branding",
  "industry": "Marketing & Advertising",
  "size": "11-50",
  "founded": 2018,
  "website": "https://creativeagency.ph",
  "location": "Makati City, Metro Manila"
}
```

---

## 🎯 Use Case Matrix

| Use Case | Recommended Company | Why |
|----------|-------------------|-----|
| Small startup testing | Innovate Solutions | Small team, agile processes |
| Enterprise workflows | Global Bank | Large scale, complex hierarchy |
| Healthcare compliance | HealthPlus | Industry-specific requirements |
| Creative portfolios | Creative Minds | Portfolio-based hiring |
| General testing | Tech Corp | Balanced, mid-size company |

---

## 🔍 Testing Checklist

### Company Admin Testing
- [ ] Login with admin credentials
- [ ] View company dashboard
- [ ] Edit company profile
- [ ] Upload company logo
- [ ] Add office images
- [ ] Generate invite codes
- [ ] Invite HR members
- [ ] Post job listings
- [ ] Review applications
- [ ] Manage team members

### HR Testing
- [ ] Login with HR credentials
- [ ] View HR dashboard
- [ ] Access company profile (read-only)
- [ ] Post job listings
- [ ] Review applications
- [ ] Message candidates
- [ ] Schedule interviews
- [ ] Manage job postings

### Multi-Company Testing
- [ ] Login to different companies
- [ ] Verify data isolation
- [ ] Test company switching
- [ ] Verify permissions
- [ ] Test invite codes
- [ ] Test email domain detection

---

## 🚨 Important Notes

1. **Data Isolation**: Each company's data is isolated in test mode
2. **Permissions**: Admin has full access, HR has limited access
3. **Invite Codes**: Each company has a unique invite code
4. **Email Domains**: Email domain auto-detection works in test mode
5. **Test Data**: All company data is mocked and not persisted

---

## 📞 Support

For issues with test companies:
1. Verify test mode is enabled
2. Check company email domain matches
3. Verify invite code is correct
4. Ensure using correct credentials
5. Restart app if needed

---

**Last Updated**: 2026-05-05  
**Total Test Companies**: 5  
**Total Test Accounts**: 12 (2 applicants + 10 company users)
