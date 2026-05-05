# Test Accounts - Quick Reference

## 🔐 Login Test Accounts

### Applicant Accounts
| Email | Password | Role | Profile |
|-------|----------|------|---------|
| `applicant@test.com` | `Test1234` | Applicant | Software Developer, Manila |
| `applicant2@test.com` | `Test1234` | Applicant | Marketing Professional, Cebu |

### Company Accounts

#### Tech Corp
| Email | Password | Role | Name |
|-------|----------|------|------|
| `admin@test.com` | `Test1234` | Company Admin | Michael Brown |
| `hr@test.com` | `Test1234` | HR | Sarah Johnson |

#### Innovate Solutions Inc.
| Email | Password | Role | Name |
|-------|----------|------|------|
| `admin@innovate.com` | `Test1234` | Company Admin | Carlos Reyes |
| `hr@innovate.com` | `Test1234` | HR | Maria Garcia |

#### Global Bank Philippines
| Email | Password | Role | Name |
|-------|----------|------|------|
| `admin@globalbank.ph` | `Test1234` | Company Admin | Roberto Cruz |
| `hr@globalbank.ph` | `Test1234` | HR | Patricia Santos |

#### HealthPlus Medical Center
| Email | Password | Role | Name |
|-------|----------|------|------|
| `admin@healthplus.com` | `Test1234` | Company Admin | Dr. Ramon Villanueva |
| `hr@healthplus.com` | `Test1234` | HR | Dr. Anna Mendoza |

#### Creative Minds Agency
| Email | Password | Role | Name |
|-------|----------|------|------|
| `admin@creativeagency.ph` | `Test1234` | Company Admin | Marco Dela Cruz |
| `hr@creativeagency.ph` | `Test1234` | HR | Isabella Torres |

## 📧 Registration Testing

### Any Email Works in Test Mode
When test mode is enabled, you can use **any email address** for registration:
- `test@example.com`
- `newuser@test.com`
- `demo@company.com`

### OTP Verification Code
```
123456
```
Use this code for all OTP verifications in test mode.

## 🎫 Invite Code Testing

### Test Invite Codes

| Code | Company | Industry | Size |
|------|---------|----------|------|
| `INVITE123` | Tech Corp | Technology | 50-200 |
| `INNOVATE2024` | Innovate Solutions Inc. | AI/ML | 11-50 |
| `BANK2024` | Global Bank Philippines | Banking | 1000+ |
| `HEALTH2024` | HealthPlus Medical Center | Healthcare | 201-500 |
| `CREATIVE2024` | Creative Minds Agency | Marketing | 11-50 |

### Company Email Domains

When you register with these email domains, the company is **automatically detected after password step**:
- `@techcorp.com` → Tech Corp (you must enter: INVITE123)
- `@innovate.com` → Innovate Solutions Inc. (you must enter: INNOVATE2024)
- `@globalbank.ph` → Global Bank Philippines (you must enter: BANK2024)
- `@healthplus.com` → HealthPlus Medical Center (you must enter: HEALTH2024)
- `@creativeagency.ph` → Creative Minds Agency (you must enter: CREATIVE2024)

**Flow**: Enter email → Create password → System detects company → **Manually enter invite code** → Join company

**Example**: 
1. Email: `newhr@innovate.com`
2. Password: `Test1234`
3. System shows: "Innovate Solutions Inc. already exists"
4. **You must manually enter**: `INNOVATE2024`
5. Join company!

**Note**: The invite code is **NOT auto-filled**. You must contact your company admin to get the code.

## 🧪 Quick Test Scenarios

### Scenario 1: Applicant Login
1. Toggle test mode ON
2. Email: `applicant@test.com`
3. Password: `Test1234`
4. ✅ Redirects to applicant dashboard

### Scenario 2: New Applicant Registration
1. Toggle test mode ON
2. Select "Applicant" role
3. Email: `newapplicant@test.com`
4. Complete registration steps
5. OTP: `123456`
6. ✅ Redirects to applicant dashboard

### Scenario 3: Company Admin Login
1. Toggle test mode ON
2. Email: `admin@test.com`
3. Password: `Test1234`
4. ✅ Redirects to company dashboard

### Scenario 4: HR Invite Registration
1. Toggle test mode ON
2. Select "Company/HR" role
3. Click "Register via Invite Code"
4. Try any code: `INVITE123`, `INNOVATE2024`, `BANK2024`, etc.
5. Complete HR registration
6. OTP: `123456`
7. ✅ Redirects to company dashboard

### Scenario 5: Company Email Auto-Detection
1. Toggle test mode ON
2. Select "Company/HR" role
3. Email: `newhr@innovate.com`
4. Click "Continue"
5. Create password: `Test1234`
6. Click "Next"
7. ⚠️ System detects: "Innovate Solutions Inc. already exists"
8. 📧 Message: "Contact company admin for invite code"
9. **Manually enter** invite code: `INNOVATE2024`
10. Click "Verify & Continue"
11. Complete registration
12. OTP: `123456`
13. ✅ Joined Innovate Solutions as HR

**Note**: The invite code field is **empty** - you must manually type the code.

### Scenario 6: Test Different Companies
1. Login as: `admin@globalbank.ph` / `Test1234`
2. ✅ See Global Bank Philippines dashboard
3. Logout and login as: `hr@healthplus.com` / `Test1234`
4. ✅ See HealthPlus Medical Center dashboard

## 🎯 Password Requirements

For new registrations, passwords must have:
- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter
- ✅ At least 1 number

Example valid passwords:
- `Test1234`
- `Password123`
- `MyPass99`

## 🔧 Enable/Disable Test Mode

**File**: `frontend/mobile/constants/testAccounts.ts`

```typescript
export const TEST_MODE_ENABLED = true;  // Enable test mode
export const TEST_MODE_ENABLED = false; // Disable test mode
```

## 📱 UI Indicators

When test mode is active, you'll see:
- 🧪 **Flask icon** on login/register screens
- 💡 **Info banner** with test account details
- ⚠️ **Warning badge** showing "Test Mode Active"

## ⚡ Quick Commands

### Add New Test Account
Edit `frontend/mobile/constants/testAccounts.ts`:

```typescript
{
  email: 'your@test.com',
  password: 'YourPass123',
  role: 'applicant',
  token: 'test_token_your_001',
  profile: { /* your profile data */ }
}
```

### Change OTP Code
Edit `frontend/mobile/constants/testAccounts.ts`:

```typescript
export const TEST_OTP_CODE = '999999'; // Your custom code
```

### Add New Company
Edit `frontend/mobile/constants/testAccounts.ts`:

```typescript
export const TEST_COMPANY_INVITES: TestCompanyInvite[] = [
  // ... existing companies
  {
    code: 'YOURCODE2024',
    company_name: 'Your Company Name',
    valid: true,
    company_email_domain: 'yourcompany.com',
  },
];
```

## 🚨 Important Notes

- ⚠️ Test mode bypasses all API calls
- ⚠️ File uploads are skipped in test mode
- ⚠️ Disable test mode before production
- ⚠️ Test accounts are for development only
- ⚠️ Restart app after changing test mode settings

## 📞 Need Help?

See the full guide: `TEST_MODE_GUIDE.md`
