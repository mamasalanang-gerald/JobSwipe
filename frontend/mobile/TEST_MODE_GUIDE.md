# Test Mode Guide - Local Registration Testing

This guide explains how to test the registration and login flows locally without needing the backend API.

## Overview

Test mode allows you to:
- Test registration flows without API calls
- Use predefined test accounts for login
- Test OTP verification with a fixed code
- Navigate through all registration steps
- Test both applicant and company/HR registration flows

## Enabling Test Mode

Test mode is controlled by the `TEST_MODE_ENABLED` constant in `frontend/mobile/constants/testAccounts.ts`.

```typescript
export const TEST_MODE_ENABLED = true; // Set to false to disable test mode
```

When enabled, a test mode toggle button will appear on the login and registration screens.

## Test Accounts

### Pre-configured Test Accounts

You can use these accounts to test the login flow:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| `applicant@test.com` | `Test1234` | Applicant | Job seeker account |
| `applicant2@test.com` | `Test1234` | Applicant | Second job seeker account |
| `hr@test.com` | `Test1234` | HR | HR manager account |
| `admin@test.com` | `Test1234` | Company Admin | Company administrator account |

### Test OTP Code

When testing registration with OTP verification:
- **OTP Code**: `123456`

This code works for any email address when test mode is active.

## Testing Login Flow

1. Open the app and navigate to the login screen
2. Toggle **Test Mode** on (if not already enabled)
3. Enter one of the test account emails (e.g., `applicant@test.com`)
4. Enter the password: `Test1234`
5. Click **Sign in**
6. You'll be redirected to the appropriate dashboard based on the role

## Testing Registration Flow

### Applicant Registration

1. Navigate to the registration screen
2. Select **Applicant** role
3. Toggle **Test Mode** on
4. Enter any email address (e.g., `newuser@test.com`)
5. Click **Continue**
6. Fill in the registration steps:
   - **Password**: Create a password (must meet requirements)
   - **Basic Info**: First name, last name, location, bio
   - **Resume**: Upload a resume file (optional in test mode)
   - **Skills**: Add hard and soft skills
   - **Experience**: Add work experience and education
   - **Photo**: Upload a profile photo (optional)
   - **Social Links**: Add LinkedIn, GitHub, etc. (optional)
7. Complete the registration
8. Enter OTP code: `123456`
9. You'll be redirected to the applicant dashboard

### Company/HR Registration

1. Navigate to the registration screen
2. Select **Company/HR** role
3. Toggle **Test Mode** on
4. Enter any email address (e.g., `company@test.com`)
5. Click **Continue**
6. Fill in the registration steps:
   - **Password**: Create a password
   - **Company Details**: Name, description, industry, size, etc.
   - **Verification Docs**: Upload company verification documents
   - **Company Media**: Upload logo and office images
7. Complete the registration
8. Enter OTP code: `123456`
9. You'll be redirected to the company dashboard

### HR Invite Code Testing

1. Select **Company/HR** role
2. Click **Register via Invite Code**
3. Enter test invite code: `INVITE123`
4. Company name will be detected: **Tech Corp**
5. Complete the HR registration form
6. Enter OTP code: `123456`

## What Happens in Test Mode

### Login Screen
- Credentials are validated against the test accounts list
- No API call is made to `/auth/login`
- Token is set directly from the test account data
- Navigation happens immediately

### Registration Screen
- Email validation is relaxed (any format accepted)
- No API call is made to `/auth/register`
- OTP is sent immediately without backend
- File uploads are skipped (no S3 upload)

### OTP Verification
- Only accepts the code `123456`
- No API call is made to `/auth/verify-email`
- Token is generated from test account data
- Onboarding steps are skipped

### Invite Code Validation
- Code `INVITE123` is recognized as valid
- Returns mock company data: **Tech Corp**
- No API call is made to `/company/invites/validate`

## Customizing Test Accounts

You can add or modify test accounts in `frontend/mobile/constants/testAccounts.ts`:

```typescript
export const TEST_ACCOUNTS: TestAccount[] = [
  {
    email: 'your.email@test.com',
    password: 'YourPassword123',
    role: 'applicant',
    token: 'test_token_custom_001',
    profile: {
      first_name: 'Your',
      last_name: 'Name',
      location: 'Your City',
      bio: 'Your bio',
      skills: ['Skill1', 'Skill2'],
    },
  },
  // Add more accounts...
];
```

## Disabling Test Mode

To disable test mode and use the real API:

1. Open `frontend/mobile/constants/testAccounts.ts`
2. Set `TEST_MODE_ENABLED = false`
3. Restart the app
4. The test mode toggle will no longer appear
5. All API calls will be made to the backend

## Troubleshooting

### Test Mode Toggle Not Showing
- Check that `TEST_MODE_ENABLED` is `true` in `testAccounts.ts`
- Restart the app after changing the constant

### Login Fails with Test Account
- Verify the email and password match exactly (case-sensitive)
- Check that test mode is toggled ON
- Ensure `TEST_MODE_ENABLED` is `true`

### OTP Code Not Working
- Use exactly `123456` (no spaces)
- Ensure test mode is active
- Check that you're on the OTP verification screen

### Navigation Issues
- Clear app storage/cache
- Restart the app
- Check that the token is being set correctly

## Development Notes

### Files Modified for Test Mode

1. **`frontend/mobile/constants/testAccounts.ts`** - Test account definitions
2. **`frontend/mobile/app/(auth)/login.tsx`** - Login with test mode
3. **`frontend/mobile/app/(auth)/register.tsx`** - Registration with test mode
4. **`frontend/mobile/components/auth/register/RegisterEmailGate.tsx`** - Email gate with toggle
5. **`frontend/mobile/components/auth/register/RegisterOtpVerificationScreen.tsx`** - OTP with test helper

### Test Mode Functions

- `validateTestCredentials(email, password)` - Validate login credentials
- `mockRegistrationResponse(email, role)` - Mock registration API response
- `mockOtpVerificationResponse(email, code)` - Mock OTP verification
- `mockInviteValidation(code)` - Mock invite code validation
- `findTestAccount(email)` - Find test account by email
- `isTestAccount(email)` - Check if email is a test account

## Best Practices

1. **Always toggle test mode ON** when testing locally
2. **Use descriptive test emails** to identify different test scenarios
3. **Don't commit sensitive data** to test accounts
4. **Disable test mode** before production builds
5. **Document any new test accounts** you add
6. **Test both flows**: with and without test mode

## Production Considerations

⚠️ **Important**: Before deploying to production:

1. Set `TEST_MODE_ENABLED = false`
2. Remove or obfuscate test account credentials
3. Ensure all API endpoints are properly configured
4. Test the real authentication flow thoroughly
5. Verify that test mode UI elements are hidden

## Support

If you encounter issues with test mode:
1. Check the console for error messages
2. Verify all test mode files are properly imported
3. Ensure the app has been restarted after changes
4. Check that the auth store is working correctly
5. Verify navigation routes are configured properly
