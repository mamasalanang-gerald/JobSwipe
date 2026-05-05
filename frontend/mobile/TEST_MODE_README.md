# Test Mode - Complete Documentation

## 📚 Documentation Index

This folder contains comprehensive documentation for the test mode feature:

1. **[TEST_MODE_GUIDE.md](./TEST_MODE_GUIDE.md)** - Complete implementation guide
2. **[TEST_ACCOUNTS_QUICK_REFERENCE.md](./TEST_ACCOUNTS_QUICK_REFERENCE.md)** - Quick reference card
3. **[TEST_COMPANIES_GUIDE.md](./TEST_COMPANIES_GUIDE.md)** - Test companies and scenarios
4. **[TEST_MODE_VISUAL_GUIDE.md](./TEST_MODE_VISUAL_GUIDE.md)** - Visual design guide
5. **[TEST_MODE_IMPLEMENTATION_SUMMARY.md](../TEST_MODE_IMPLEMENTATION_SUMMARY.md)** - Technical summary

## 🚀 Quick Start

### For Developers

1. **Enable test mode** (already enabled by default):
   ```typescript
   // frontend/mobile/constants/testAccounts.ts
   export const TEST_MODE_ENABLED = true;
   ```

2. **Start the app**:
   ```bash
   cd frontend/mobile
   npm start
   ```

3. **Test login**:
   - Email: `applicant@test.com`
   - Password: `Test1234`

### For Testers

1. Open the app
2. Look for the 🧪 **Test Mode** toggle
3. Click to enable test mode
4. Use test credentials from the quick reference

## 📖 What to Read First

### New to Test Mode?
Start here: **[TEST_ACCOUNTS_QUICK_REFERENCE.md](./TEST_ACCOUNTS_QUICK_REFERENCE.md)**

### Need Detailed Instructions?
Read: **[TEST_MODE_GUIDE.md](./TEST_MODE_GUIDE.md)**

### Testing Companies?
Check: **[TEST_COMPANIES_GUIDE.md](./TEST_COMPANIES_GUIDE.md)**

### Want to Understand the UI?
Check: **[TEST_MODE_VISUAL_GUIDE.md](./TEST_MODE_VISUAL_GUIDE.md)**

### Technical Implementation Details?
See: **[TEST_MODE_IMPLEMENTATION_SUMMARY.md](../TEST_MODE_IMPLEMENTATION_SUMMARY.md)**

## 🎯 Common Use Cases

### Use Case 1: Quick Login Test
```
1. Toggle test mode ON
2. Email: applicant@test.com
3. Password: Test1234
4. ✅ Done!
```

### Use Case 2: Test Registration Flow
```
1. Toggle test mode ON
2. Select role (Applicant/HR)
3. Enter any email
4. Complete steps
5. OTP: 123456
6. ✅ Done!
```

### Use Case 3: Test Different Roles
```
Applicant: applicant@test.com / Test1234
HR: hr@test.com / Test1234
Admin: admin@test.com / Test1234
```

### Use Case 4: Test Different Companies
```
Tech Corp: admin@test.com / Test1234
Innovate Solutions: admin@innovate.com / Test1234
Global Bank: admin@globalbank.ph / Test1234
HealthPlus: admin@healthplus.com / Test1234
Creative Agency: admin@creativeagency.ph / Test1234
```

## 🔑 Test Credentials

### Login Accounts
| Email | Password | Role |
|-------|----------|------|
| applicant@test.com | Test1234 | Applicant |
| hr@test.com | Test1234 | HR |
| admin@test.com | Test1234 | Company Admin |

**More Companies**: See [TEST_COMPANIES_GUIDE.md](./TEST_COMPANIES_GUIDE.md) for 5 test companies with 10+ accounts

### Registration
- **OTP Code**: `123456`
- **Invite Codes**: `INVITE123`, `INNOVATE2024`, `BANK2024`, `HEALTH2024`, `CREATIVE2024`
- **Any email works** in test mode

## 🎨 Visual Indicators

When test mode is active, you'll see:
- 🧪 **Flask icon** - Test mode toggle
- 💡 **Info banner** - Test instructions
- ⚠️ **Warning badge** - "Test Mode Active"

## 📁 File Structure

```
frontend/mobile/
├── constants/
│   └── testAccounts.ts          # Test account definitions
├── app/
│   └── (auth)/
│       ├── login.tsx             # Login with test mode
│       └── register.tsx          # Registration with test mode
├── components/
│   └── auth/
│       └── register/
│           ├── RegisterEmailGate.tsx              # Email gate with toggle
│           └── RegisterOtpVerificationScreen.tsx  # OTP with helper
├── TEST_MODE_GUIDE.md                    # Complete guide
├── TEST_ACCOUNTS_QUICK_REFERENCE.md      # Quick reference
├── TEST_MODE_VISUAL_GUIDE.md             # Visual guide
└── TEST_MODE_README.md                   # This file
```

## 🛠️ Configuration

### Enable/Disable Test Mode

**File**: `frontend/mobile/constants/testAccounts.ts`

```typescript
// Enable test mode (default)
export const TEST_MODE_ENABLED = true;

// Disable test mode (production)
export const TEST_MODE_ENABLED = false;
```

### Add Custom Test Account

```typescript
export const TEST_ACCOUNTS: TestAccount[] = [
  // ... existing accounts
  {
    email: 'custom@test.com',
    password: 'Custom123',
    role: 'applicant',
    token: 'test_token_custom_001',
    profile: {
      first_name: 'Custom',
      last_name: 'User',
      // ... more profile data
    },
  },
];
```

### Change OTP Code

```typescript
export const TEST_OTP_CODE = '999999'; // Your custom code
```

## ✅ Features

### What Works
- ✅ Login with test accounts
- ✅ Registration without API
- ✅ OTP verification
- ✅ Role-based navigation
- ✅ Form validation
- ✅ All registration steps
- ✅ Invite code validation

### What's Skipped
- ⏭️ API calls
- ⏭️ File uploads
- ⏭️ Email sending
- ⏭️ Database operations

## 🚨 Important Notes

### For Development
- ✅ Test mode is safe for local development
- ✅ No API calls are made in test mode
- ✅ All data is mocked locally
- ✅ Perfect for offline testing

### For Production
- ⚠️ **MUST disable test mode** before production
- ⚠️ Set `TEST_MODE_ENABLED = false`
- ⚠️ Verify test UI elements are hidden
- ⚠️ Test real authentication flow

## 🐛 Troubleshooting

### Toggle Not Showing
- Check `TEST_MODE_ENABLED = true`
- Restart the app

### Login Fails
- Verify test mode is ON
- Check email/password exactly
- Try: `applicant@test.com` / `Test1234`

### OTP Not Working
- Use exactly `123456`
- Ensure test mode is active

### Navigation Issues
- Clear app cache
- Restart app
- Check auth store

## 📞 Getting Help

1. **Check the guides** in this folder
2. **Review error messages** in console
3. **Verify configuration** in testAccounts.ts
4. **Restart the app** after changes
5. **Check imports** are correct

## 🎓 Learning Path

### Beginner
1. Read **Quick Reference** for basic usage
2. Try logging in with test accounts
3. Test registration flow

### Intermediate
1. Read **Complete Guide** for details
2. Customize test accounts
3. Test all user roles

### Advanced
1. Read **Implementation Summary**
2. Understand the code structure
3. Extend test mode features

## 🔗 Related Documentation

- **API Documentation**: See backend API docs
- **Authentication Flow**: See auth architecture docs
- **Registration Steps**: See onboarding docs
- **User Roles**: See RBAC documentation

## 📊 Test Coverage

Test mode covers:
- ✅ Login flow (3 roles)
- ✅ Registration flow (2 types)
- ✅ OTP verification
- ✅ Invite code validation
- ✅ Form validation
- ✅ Navigation
- ✅ Error handling

## 🎯 Success Criteria

You'll know test mode is working when:
- ✅ Toggle appears on auth screens
- ✅ Test accounts log in successfully
- ✅ Registration completes without API
- ✅ OTP code `123456` works
- ✅ Navigation goes to correct dashboard
- ✅ No API errors in console

## 🚀 Next Steps

After setting up test mode:

1. **Test all flows** using the quick reference
2. **Verify UI** matches the visual guide
3. **Check navigation** works correctly
4. **Test error cases** (wrong password, etc.)
5. **Document any issues** you find

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Initial test mode implementation
- ✅ 4 test accounts (2 applicant, 1 HR, 1 admin)
- ✅ OTP verification with fixed code
- ✅ Invite code validation
- ✅ Visual indicators and toggles
- ✅ Complete documentation

### Future Enhancements
- 🔮 Persistent test mode preference
- 🔮 Custom test data editor
- 🔮 Test scenario presets
- 🔮 Mock API server
- 🔮 Debug panel

## 🤝 Contributing

To add new test features:

1. Update `testAccounts.ts` with new data
2. Modify auth screens to use new data
3. Update documentation
4. Test thoroughly
5. Submit for review

## 📄 License

This test mode implementation is part of the JobSwipe mobile app and follows the same license.

## 🎉 Conclusion

Test mode is ready to use! Start with the **Quick Reference** and explore from there. Happy testing! 🚀

---

**Last Updated**: 2026-05-05
**Version**: 1.0.0
**Status**: ✅ Production Ready (for development use)
