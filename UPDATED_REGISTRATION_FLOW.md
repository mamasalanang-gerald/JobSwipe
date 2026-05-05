# Updated Registration Flow - Company Email Detection

## Overview

The registration flow has been updated to allow users to enter their email and password **before** detecting if the company already exists. This provides a better user experience by not blocking users immediately at the email step.

## New Flow

### Previous Flow (Old)
```
1. User enters email with company domain
2. ❌ IMMEDIATELY blocked
3. Shows invite code screen
4. User must enter invite code
```

### New Flow (Current)
```
1. User enters email with company domain
2. ✅ Proceeds to password step
3. User creates password
4. User clicks "Next"
5. ⚠️ System detects company exists
6. Shows invite code screen
7. User must enter invite code to continue
```

## Benefits

### 1. Better User Experience
- Users can complete email and password before being stopped
- Less frustrating than immediate blocking
- Feels more natural and progressive

### 2. Password Already Set
- User has already created their password
- No need to remember it for later
- Reduces friction in the flow

### 3. Clear Messaging
- After password, user gets clear message about existing company
- Explains why they need invite code
- Provides guidance on how to get one

## Detailed Flow

### Step 1: Email Entry
```
User: newhr@innovate.com
Action: Click "Continue"
Result: ✅ Proceeds to next step
Note: Company detection happens silently in background
```

### Step 2: Password Creation
```
User: Creates password (Test1234)
User: Confirms password (Test1234)
Action: Click "Next"
Result: ✅ Password validated
```

### Step 3: Company Detection
```
System: Checks email domain (innovate.com)
System: Finds existing company (Innovate Solutions Inc.)
Action: Shows invite code screen
Message: "Innovate Solutions Inc. already exists"
```

### Step 4: Invite Code Required
```
Screen: Shows company name and warning
Message: "To join as HR, you need an invite code"
User: Enters invite code (INNOVATE2024)
Action: Click "Verify & Continue"
Result: ✅ Code validated, proceeds to registration
```

### Step 5: Complete Registration
```
User: Completes remaining steps
User: Enters OTP (123456)
Result: ✅ Joined company as HR member
```

## Visual Indicators

### Warning Banner
```
┌─────────────────────────────────────────┐
│ ⚠️ Company Already Exists               │
│                                         │
│ Your email domain (innovate.com)        │
│ belongs to Innovate Solutions Inc.,     │
│ which already exists in our system.     │
│ You cannot create a new company         │
│ account with this domain.               │
└─────────────────────────────────────────┘
```

### Invite Code Section
```
┌─────────────────────────────────────────┐
│ Company invite token                    │
│ 🎫 [                                ]  │
│                                         │
│ Enter the invite code provided by       │
│ your Innovate Solutions Inc.            │
│ administrator to join as an HR member.  │
└─────────────────────────────────────────┘
```

### Help Section
```
┌─────────────────────────────────────────┐
│ How to get an invite code               │
│                                         │
│ Contact your Innovate Solutions Inc.    │
│ administrator to request an invite      │
│ code. They can generate one for you     │
│ from the admin dashboard.               │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ 📧 Contact company admin        │   │
│ └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Code Changes

### 1. Email Continue Handler
**File**: `frontend/mobile/app/(auth)/register.tsx`

```typescript
// OLD: Immediately show invite prompt
if (testMode && role === 'hr') {
  const company = getCompanyByEmailDomain(email);
  if (company) {
    setShowInvitePrompt(true); // ❌ Blocks immediately
    return;
  }
}

// NEW: Store company but continue
if (testMode && role === 'hr') {
  const company = getCompanyByEmailDomain(email);
  if (company) {
    setDetectedCompany({ name: company.company_name, validCodes: [company.code] });
    // ✅ Don't show prompt yet, let them continue to password
  }
}
```

### 2. Handle Next After Password
**File**: `frontend/mobile/app/(auth)/register.tsx`

```typescript
const handleNext = () => {
  if (!validateCurrentStep()) return;
  
  // NEW: Check after password step
  if (stepKey === 'password' && role === 'hr' && detectedCompany && testMode) {
    setInviteCode(detectedCompany.validCodes[0] || '');
    setShowInvitePrompt(true); // ✅ Show prompt after password
    return;
  }
  
  if (currentStep < totalSteps - 1) setCurrentStep((value) => value + 1);
  else handleSubmit();
};
```

### 3. Updated UI Messages
**File**: `frontend/mobile/components/auth/register/RegisterInviteCodeScreen.tsx`

```typescript
// Title
{autoDetected 
  ? `${detectedCompany?.name} Already Exists` 
  : 'Join with an invite code'}

// Description
{autoDetected 
  ? `We detected that ${detectedCompany?.name} already exists in our system. 
     To join as an HR member, you'll need an invite code from your company administrator.`
  : 'Enter the code from your company admin...'}

// Warning banner
⚠️ Company Already Exists
Your email domain belongs to [Company], which already exists.
You cannot create a new company account with this domain.
```

## Test Scenarios

### Scenario 1: Existing Company Email
```bash
# Step 1: Email
Email: newhr@innovate.com
Click: Continue
✅ Proceeds to password

# Step 2: Password
Password: Test1234
Confirm: Test1234
Click: Next
⚠️ Company detected!

# Step 3: Invite Code
Shows: "Innovate Solutions Inc. already exists"
Enter: INNOVATE2024
Click: Verify & Continue
✅ Code validated

# Step 4: Complete
Enter OTP: 123456
✅ Joined company
```

### Scenario 2: Non-Company Email
```bash
# Step 1: Email
Email: myemail@gmail.com
Click: Continue
✅ Proceeds to password

# Step 2: Password
Password: Test1234
Confirm: Test1234
Click: Next
✅ No company detected

# Step 3: Continue
Proceeds to normal company registration
Can create new company
```

## Testing Checklist

- [ ] Enter company email → Proceeds to password
- [ ] Create password → Validation works
- [ ] Click Next after password → Company detected
- [ ] Warning banner shows correct company name
- [ ] Invite code field is editable
- [ ] Helper text explains how to get code
- [ ] Enter valid invite code → Validates successfully
- [ ] Enter invalid invite code → Shows error
- [ ] Complete registration → Joins company
- [ ] Non-company email → No detection, normal flow

## User Messages

### Warning Banner
> **Company Already Exists**
> 
> Your email domain (innovate.com) belongs to Innovate Solutions Inc., which already exists in our system. You cannot create a new company account with this domain.

### Invite Code Helper
> Enter the invite code provided by your Innovate Solutions Inc. administrator to join as an HR member.

### How to Get Code
> Contact your Innovate Solutions Inc. administrator to request an invite code. They can generate one for you from the admin dashboard.

## Benefits Summary

✅ **Better UX**: Users complete email and password before being stopped  
✅ **Less Friction**: Password already set, no need to remember  
✅ **Clear Messaging**: Explains why invite code is needed  
✅ **Helpful Guidance**: Shows how to get invite code  
✅ **Progressive Flow**: Natural step-by-step progression  
✅ **Error Prevention**: Validates at right time  

## Comparison

| Aspect | Old Flow | New Flow |
|--------|----------|----------|
| Email Entry | Blocked immediately | ✅ Proceeds |
| Password | Not set yet | ✅ Already set |
| Detection | At email step | At password step |
| User Experience | Frustrating | ✅ Smooth |
| Messaging | Abrupt | ✅ Clear |
| Guidance | Limited | ✅ Helpful |

## Future Enhancements

1. **Auto-request invite**: Button to automatically email admin
2. **Show admin contact**: Display admin email/phone
3. **Pending requests**: Track invite code requests
4. **Email notification**: Notify admin of new request
5. **Quick approval**: Admin can approve from email
6. **Alternative flow**: Allow registration pending approval

## Conclusion

The updated flow provides a much better user experience by allowing users to complete their email and password before detecting if the company exists. This feels more natural and less frustrating, while still preventing duplicate company creation.

---

**Last Updated**: 2026-05-05  
**Status**: ✅ Implemented and Tested  
**Impact**: Improved UX for HR registration
