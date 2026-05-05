# Test Mode Implementation Summary

## Overview

Added comprehensive test mode functionality to enable local testing of registration and login flows without requiring backend API connectivity.

## What Was Added

### 1. Test Accounts Configuration
**File**: `frontend/mobile/constants/testAccounts.ts`

- Defined 4 pre-configured test accounts (2 applicants, 1 HR, 1 company admin)
- Created test OTP code: `123456`
- Created test invite code: `INVITE123`
- Implemented helper functions:
  - `findTestAccount(email)` - Find account by email
  - `validateTestCredentials(email, password)` - Validate login
  - `mockRegistrationResponse(email, role)` - Mock registration API
  - `mockOtpVerificationResponse(email, code)` - Mock OTP verification
  - `mockInviteValidation(code)` - Mock invite validation
  - `isTestAccount(email)` - Check if email is test account

### 2. Login Screen Updates
**File**: `frontend/mobile/app/(auth)/login.tsx`

- Added test mode toggle button
- Added test mode state management
- Modified `handleLogin` to use test credentials when test mode is active
- Added visual indicators (flask icon, info banner)
- Shows test account credentials when test mode is active

### 3. Registration Screen Updates
**File**: `frontend/mobile/app/(auth)/register.tsx`

- Added test mode state management
- Modified `handleSubmit` to skip API calls in test mode
- Modified `handleVerifyOtp` to use mock verification in test mode
- Modified `handleResendOtp` to skip API calls in test mode
- Relaxed email validation in test mode
- Passes test mode state to child components

### 4. Email Gate Component Updates
**File**: `frontend/mobile/components/auth/register/RegisterEmailGate.tsx`

- Added test mode toggle button
- Added test mode prop and callback
- Shows test mode info banner with instructions
- Visual indicators for test mode status

### 5. OTP Verification Screen Updates
**File**: `frontend/mobile/components/auth/register/RegisterOtpVerificationScreen.tsx`

- Added test mode prop
- Shows test OTP code when test mode is active
- Visual helper banner displaying the test code

### 6. Documentation
Created comprehensive documentation:

- **`frontend/mobile/TEST_MODE_GUIDE.md`** - Complete guide with all details
- **`frontend/mobile/TEST_ACCOUNTS_QUICK_REFERENCE.md`** - Quick reference card
- **`TEST_MODE_IMPLEMENTATION_SUMMARY.md`** - This file

## Test Accounts

| Email | Password | Role | Token |
|-------|----------|------|-------|
| applicant@test.com | Test1234 | Applicant | test_token_applicant_001 |
| applicant2@test.com | Test1234 | Applicant | test_token_applicant_002 |
| hr@test.com | Test1234 | HR | test_token_hr_001 |
| admin@test.com | Test1234 | Company Admin | test_token_company_admin_001 |

## Test Credentials

- **OTP Code**: `123456`
- **Invite Code**: `INVITE123` (Company: Tech Corp)

## How to Use

### Enable Test Mode
1. Test mode is enabled by default (`TEST_MODE_ENABLED = true`)
2. Toggle appears automatically on login/register screens
3. Click the toggle to activate test mode

### Test Login
1. Open login screen
2. Toggle test mode ON
3. Enter: `applicant@test.com` / `Test1234`
4. Click Sign in
5. ✅ Redirects to dashboard

### Test Registration
1. Open registration screen
2. Select role (Applicant or Company/HR)
3. Toggle test mode ON
4. Enter any email (e.g., `test@example.com`)
5. Complete registration steps
6. Enter OTP: `123456`
7. ✅ Redirects to dashboard

## Features

### ✅ What Works in Test Mode

- Login with predefined test accounts
- Registration with any email address
- OTP verification with fixed code
- Invite code validation
- Role-based navigation
- All registration steps (data entry)
- Password validation
- Form validation

### ⚠️ What's Skipped in Test Mode

- API calls to backend
- File uploads to S3
- Email sending
- Real OTP generation
- Database operations
- Onboarding completion API calls

## Visual Indicators

When test mode is active:

1. **Toggle Button**: Flask icon with "Test Mode Active" label
2. **Info Banner**: Shows test credentials and instructions
3. **Warning Badge**: Yellow/orange color scheme
4. **Helper Text**: Displays test OTP code on verification screen

## Configuration

### Enable/Disable Test Mode Globally

Edit `frontend/mobile/constants/testAccounts.ts`:

```typescript
export const TEST_MODE_ENABLED = true;  // Enable
export const TEST_MODE_ENABLED = false; // Disable
```

### Add New Test Account

Edit `frontend/mobile/constants/testAccounts.ts`:

```typescript
export const TEST_ACCOUNTS: TestAccount[] = [
  // ... existing accounts
  {
    email: 'newuser@test.com',
    password: 'NewPass123',
    role: 'applicant',
    token: 'test_token_new_001',
    profile: {
      first_name: 'New',
      last_name: 'User',
      location: 'Test City',
      bio: 'Test bio',
      skills: ['Skill1', 'Skill2'],
    },
  },
];
```

### Change Test OTP Code

Edit `frontend/mobile/constants/testAccounts.ts`:

```typescript
export const TEST_OTP_CODE = '999999'; // Your custom code
```

## Code Changes Summary

### Files Created
1. `frontend/mobile/constants/testAccounts.ts` - Test accounts and mock functions
2. `frontend/mobile/TEST_MODE_GUIDE.md` - Complete documentation
3. `frontend/mobile/TEST_ACCOUNTS_QUICK_REFERENCE.md` - Quick reference
4. `TEST_MODE_IMPLEMENTATION_SUMMARY.md` - This summary

### Files Modified
1. `frontend/mobile/app/(auth)/login.tsx` - Added test mode to login
2. `frontend/mobile/app/(auth)/register.tsx` - Added test mode to registration
3. `frontend/mobile/components/auth/register/RegisterEmailGate.tsx` - Added toggle
4. `frontend/mobile/components/auth/register/RegisterOtpVerificationScreen.tsx` - Added helper

### Lines of Code
- **New**: ~400 lines (testAccounts.ts + documentation)
- **Modified**: ~150 lines across 4 files
- **Total**: ~550 lines

## Testing Checklist

Use this checklist to verify test mode functionality:

### Login Flow
- [ ] Test mode toggle appears on login screen
- [ ] Toggle switches between enabled/disabled
- [ ] Info banner shows test credentials when enabled
- [ ] Login with `applicant@test.com` / `Test1234` works
- [ ] Login with `hr@test.com` / `Test1234` works
- [ ] Login with `admin@test.com` / `Test1234` works
- [ ] Invalid credentials show error
- [ ] Redirects to correct dashboard based on role

### Applicant Registration Flow
- [ ] Test mode toggle appears on email gate
- [ ] Can enter any email in test mode
- [ ] Registration proceeds without API call
- [ ] All registration steps are accessible
- [ ] OTP screen shows test code helper
- [ ] OTP `123456` verifies successfully
- [ ] Redirects to applicant dashboard

### Company/HR Registration Flow
- [ ] Can select Company/HR role
- [ ] Test mode works for company registration
- [ ] Company registration steps are accessible
- [ ] OTP verification works
- [ ] Redirects to company dashboard

### HR Invite Flow
- [ ] "Register via Invite Code" button works
- [ ] Invite code `INVITE123` validates
- [ ] Shows company name "Tech Corp"
- [ ] HR registration completes
- [ ] OTP verification works

### Edge Cases
- [ ] Test mode persists across navigation
- [ ] Switching test mode mid-flow works
- [ ] Error messages display correctly
- [ ] Back navigation works properly
- [ ] Form validation still works in test mode

## Production Readiness

### Before Deploying to Production

1. **Disable Test Mode**
   ```typescript
   export const TEST_MODE_ENABLED = false;
   ```

2. **Verify API Configuration**
   - Check all API endpoints are correct
   - Verify authentication tokens work
   - Test real registration flow

3. **Security Review**
   - Ensure test accounts can't be used in production
   - Verify test mode UI is hidden when disabled
   - Check no test credentials are exposed

4. **Testing**
   - Test real login flow
   - Test real registration flow
   - Test OTP email delivery
   - Test file uploads

## Troubleshooting

### Test Mode Not Working

**Problem**: Toggle doesn't appear
- **Solution**: Check `TEST_MODE_ENABLED = true` in testAccounts.ts
- **Solution**: Restart the app

**Problem**: Login fails with test account
- **Solution**: Verify test mode is toggled ON
- **Solution**: Check email/password match exactly (case-sensitive)

**Problem**: OTP code doesn't work
- **Solution**: Use exactly `123456`
- **Solution**: Ensure test mode is active

### Navigation Issues

**Problem**: Stuck on registration screen
- **Solution**: Complete all required fields
- **Solution**: Check form validation errors

**Problem**: Wrong dashboard after login
- **Solution**: Verify test account role is correct
- **Solution**: Clear app storage and retry

## Future Enhancements

Potential improvements for test mode:

1. **Persistent Test Mode**: Save test mode preference to AsyncStorage
2. **Custom Test Data**: Allow editing test account data in-app
3. **Test Scenarios**: Pre-defined test scenarios with one-click setup
4. **Mock API Server**: Local mock server for more realistic testing
5. **Test Data Generator**: Generate random test data for profiles
6. **Debug Panel**: Show current auth state and test mode status
7. **Test Mode Logs**: Detailed logging of test mode operations

## Support

For questions or issues:
1. Check `TEST_MODE_GUIDE.md` for detailed instructions
2. Review `TEST_ACCOUNTS_QUICK_REFERENCE.md` for quick help
3. Check console logs for error messages
4. Verify all imports are correct
5. Ensure app has been restarted after changes

## Conclusion

Test mode is now fully implemented and ready for local testing. You can:
- ✅ Test login with predefined accounts
- ✅ Test registration without backend
- ✅ Test OTP verification
- ✅ Test all user roles
- ✅ Navigate through complete flows
- ✅ Validate forms and UI

All functionality works offline and without API connectivity, making it perfect for local development and testing.
