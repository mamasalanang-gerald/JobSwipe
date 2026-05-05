# Company Email Detection Feature

## Overview

When registering as HR/Company Admin in test mode, the system automatically detects if your email belongs to an existing test company and guides you to join that company.

## How It Works

### 1. Email Entry

User enters their email during HR/Company registration.

### 2. Password Creation

User proceeds to create their password (even if company domain is detected).

### 3. Company Detection & Blocking

**After password step**, if the email domain matches an existing company:
- ✅ System detects the company
- ⚠️ **Blocks further registration**
- 📧 Shows message: "Company Already Exists"
- 🔑 Requires invite code to proceed

### 4. Invite Code Required

User must:
- Contact company administrator
- Request an invite code
- **Manually enter** the code (NOT auto-filled)
- Code validates and user joins the existing company

**Important**: The invite code field is empty. Users must type the code themselves after getting it from their company admin.

### Flow Diagram

```
User enters email (newhr@innovate.com)
         ↓
User creates password
         ↓
System checks email domain
         ↓
    [Company exists?]
         ↓
    YES → Show invite code screen
         "Innovate Solutions Inc. already exists"
         "Contact admin for invite code"
         ↓
    User enters invite code
         ↓
    Verification successful
         ↓
    Join existing company
```

## Test Scenarios

### Scenario 1: Register with Existing Company Email

```
1. Toggle test mode ON
2. Select "Company/HR" role
3. Enter email: newhr@innovate.com
4. Click "Continue"
5. ✅ Proceed to password step
6. Create password: Test1234
7. Confirm password: Test1234
8. Click "Next"
9. ⚠️ System detects: "Innovate Solutions Inc. already exists"
10. 📧 Shows message: "Contact company admin for invite code"
11. Enter invite code: INNOVATE2024
12. Click "Verify & Continue"
13. ✅ Invite code validated
14. Complete registration
15. Enter OTP: 123456
16. ✅ Joined Innovate Solutions as HR
```

### Scenario 2: Register with Non-Company Email

```
1. Toggle test mode ON
2. Select "Company/HR" role
3. Enter email: myemail@gmail.com
4. Click "Continue"
5. Create password
6. ✅ No company detected
7. ✅ Proceeds to normal company registration
8. Can create new company
```

### Scenario 3: Manual Invite Code Entry (No Email Detection)

```
1. Toggle test mode ON
2. Select "Company/HR" role
3. Click "Register via Invite Code"
4. Enter code: BANK2024
5. ✅ Company detected: "Global Bank Philippines"
6. Enter email: anyemail@example.com
7. Complete registration
8. ✅ Joined Global Bank
```

## Supported Company Domains

| Email Domain | Company | Invite Code |
|--------------|---------|-------------|
| @techcorp.com | Tech Corp | INVITE123 |
| @innovate.com | Innovate Solutions Inc. | INNOVATE2024 |
| @globalbank.ph | Global Bank Philippines | BANK2024 |
| @healthplus.com | HealthPlus Medical Center | HEALTH2024 |
| @creativeagency.ph | Creative Minds Agency | CREATIVE2024 |

## Example Emails

### Tech Corp
- `newhr@techcorp.com`
- `recruiter@techcorp.com`
- `talent@techcorp.com`

### Innovate Solutions
- `hr@innovate.com`
- `recruiter@innovate.com`
- `hiring@innovate.com`

### Global Bank
- `hr@globalbank.ph`
- `recruitment@globalbank.ph`
- `talent@globalbank.ph`

### HealthPlus
- `hr@healthplus.com`
- `recruitment@healthplus.com`
- `careers@healthplus.com`

### Creative Minds
- `hr@creativeagency.ph`
- `talent@creativeagency.ph`
- `hiring@creativeagency.ph`

## Visual Flow

### Before Detection (Email Entry)
```
┌─────────────────────────────────────┐
│ Create your account                 │
│                                     │
│ Email address                       │
│ 📧 [newhr@innovate.com         ]   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │      Continue          →    │   │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Password Step
```
┌─────────────────────────────────────┐
│ Registration Form                   │
│                                     │
│ Password                            │
│ 🔒 [••••••••]              👁      │
│                                     │
│ Confirm password                    │
│ 🔒 [••••••••]              👁      │
│                                     │
│ ┌─────────────────────────────┐   │
│ │      Next              →    │   │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### After Detection (Invite Code Required)
```
┌─────────────────────────────────────┐
│ ⚠️ Company Already Exists           │
│ Your email domain (innovate.com)    │
│ belongs to Innovate Solutions Inc., │
│ which already exists in our system. │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Innovate Solutions Inc.             │
│ Already Exists                      │
│                                     │
│ We detected that Innovate Solutions │
│ Inc. already exists in our system.  │
│ To join as an HR member, you'll     │
│ need an invite code from your       │
│ company administrator.              │
│                                     │
│ Company invite token                │
│ 🎫 [                           ]   │
│ Enter the invite code provided by   │
│ your company administrator          │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ Verify & Continue      →    │   │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ How to get an invite code   │   │
│ │                             │   │
│ │ Contact your company admin  │   │
│ │ to request an invite code.  │   │
│ │                             │   │
│ │ 📧 Contact company admin    │   │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## Benefits

### 1. Seamless Onboarding
- No need to manually enter invite codes
- Faster registration process
- Reduced errors

### 2. Company Validation
- Ensures users join the correct company
- Validates email domain ownership
- Prevents accidental company creation

### 3. Better UX
- Clear visual feedback
- Automatic form filling
- Guided workflow

### 4. Error Prevention
- Prevents typos in invite codes
- Ensures correct company assignment
- Validates email domain

## Technical Details

### Detection Logic

```typescript
// Check if email belongs to a test company
const company = getCompanyByEmailDomain(email);

if (company) {
  // Company detected
  setDetectedCompany({ 
    name: company.company_name, 
    validCodes: [company.code] 
  });
  setInviteCode(company.code);
  setShowInvitePrompt(true);
}
```

### Helper Functions

```typescript
// Get company by email domain
getCompanyByEmailDomain('hr@innovate.com')
// Returns: { code: 'INNOVATE2024', company_name: 'Innovate Solutions Inc.', ... }

// Check if email belongs to company
isCompanyEmail('hr@innovate.com')
// Returns: true

// Get all test companies
getAllTestCompanies()
// Returns: Array of 5 companies
```

## Configuration

### Add New Company Domain

Edit `frontend/mobile/constants/testAccounts.ts`:

```typescript
export const TEST_COMPANY_INVITES: TestCompanyInvite[] = [
  // ... existing companies
  {
    code: 'YOURCODE2024',
    company_name: 'Your Company Name',
    valid: true,
    company_email_domain: 'yourcompany.com', // Add domain here
  },
];
```

### Disable Auto-Detection

To disable auto-detection, comment out the detection logic in `register.tsx`:

```typescript
// Comment out this block to disable
// if (testMode && role === 'hr') {
//   const company = getCompanyByEmailDomain(email);
//   if (company) {
//     setDetectedCompany({ name: company.company_name, validCodes: [company.code] });
//     setInviteCode(company.code);
//     setShowInvitePrompt(true);
//     setError('');
//     return;
//   }
// }
```

## Testing Checklist

- [ ] Enter company email → Company detected
- [ ] Enter non-company email → No detection
- [ ] Detected company name is correct
- [ ] Invite code is auto-filled
- [ ] Invite code field is locked
- [ ] Success banner appears
- [ ] Can proceed to registration
- [ ] Can go back and change email
- [ ] OTP verification works
- [ ] Joins correct company

## Troubleshooting

### Company Not Detected

**Problem**: Email domain not recognized
- **Solution**: Check email domain matches exactly
- **Solution**: Verify domain is in TEST_COMPANY_INVITES
- **Solution**: Ensure test mode is enabled

### Wrong Company Detected

**Problem**: Wrong company assigned
- **Solution**: Check email domain spelling
- **Solution**: Verify TEST_COMPANY_INVITES configuration
- **Solution**: Clear form and re-enter email

### Invite Code Not Auto-Filled

**Problem**: Code field is empty
- **Solution**: Ensure company has invite code in config
- **Solution**: Check detection logic is running
- **Solution**: Verify testMode is true

## Future Enhancements

Potential improvements:
1. Support multiple domains per company
2. Add subdomain detection (e.g., hr.company.com)
3. Show company logo when detected
4. Display company info (size, industry)
5. Allow manual override of detected company
6. Add company verification step
7. Support email aliases

## Conclusion

The company email detection feature streamlines HR registration by automatically detecting and assigning users to their companies based on email domains. This reduces friction, prevents errors, and provides a better user experience.

---

**Last Updated**: 2026-05-05  
**Feature Status**: ✅ Active in Test Mode  
**Supported Companies**: 5
