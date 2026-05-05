# Test Mode Visual Guide

This guide shows what test mode looks like in the UI and how to interact with it.

## 🎨 Visual Elements

### 1. Test Mode Toggle Button

When test mode is available, you'll see a toggle button that looks like this:

```
┌─────────────────────────────────────────────┐
│ 🧪 Test Mode Active          Tap to toggle │
└─────────────────────────────────────────────┘
```

**Colors**:
- **Active**: Yellow/Orange background with warning color
- **Inactive**: Gray background with subtle border

**Icon**:
- **Active**: 🧪 Filled flask icon
- **Inactive**: 🧪 Outlined flask icon

### 2. Test Account Info Banner

When test mode is active on the login screen:

```
┌─────────────────────────────────────────────────────────┐
│ ℹ️ Test accounts: applicant@test.com, hr@test.com,     │
│    admin@test.com (password: Test1234)                  │
└─────────────────────────────────────────────────────────┘
```

**Colors**: Blue/Primary color scheme

### 3. Registration Test Mode Info

When test mode is active on registration:

```
┌─────────────────────────────────────────────────────────┐
│ ℹ️ Test mode: Use any email. OTP code is 123456.       │
│    No API calls will be made.                           │
└─────────────────────────────────────────────────────────┘
```

**Colors**: Blue/Primary color scheme

### 4. OTP Test Code Helper

On the OTP verification screen in test mode:

```
┌─────────────────────────────────────────────────────────┐
│ 🧪 Test Mode: Use code 123456                           │
└─────────────────────────────────────────────────────────┘
```

**Colors**: Yellow/Warning color scheme

## 📱 Screen-by-Screen Guide

### Login Screen

```
┌─────────────────────────────────────────┐
│                                         │
│  Sign In                                │
│  Welcome back to JobSwipe               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🧪 Test Mode Active             │   │
│  │                  Tap to toggle  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ℹ️ Test accounts:               │   │
│  │ applicant@test.com, hr@test.com│   │
│  │ (password: Test1234)            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Your credentials                │   │
│  │                                 │   │
│  │ Email                           │   │
│  │ 📧 [applicant@test.com      ]  │   │
│  │                                 │   │
│  │ Password                        │   │
│  │ 🔒 [••••••••]              👁  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Sign in              →     │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Registration Email Gate

```
┌─────────────────────────────────────────┐
│                                         │
│  ← Back                                 │
│                                         │
│  Create your account                    │
│  Start with your email...               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🧪 Test Mode Active             │   │
│  │                  Tap to toggle  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ℹ️ Test mode: Use any email.   │   │
│  │ OTP code is 123456.             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Registration Form               │   │
│  │                                 │   │
│  │ Email address                   │   │
│  │ 📧 [test@example.com        ]  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Continue             →     │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### OTP Verification Screen

```
┌─────────────────────────────────────────┐
│                                         │
│  ← Back                                 │
│                                         │
│  Verify your email                      │
│  We sent a 6-digit code to              │
│  test@example.com                       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🧪 Test Mode: Use code 123456   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Verification Code               │   │
│  │                                 │   │
│  │ 6-digit OTP                     │   │
│  │                                 │   │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ │
│  │  │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │ │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Verify and create account  ✓   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📧 Resend code                 │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## 🎯 Interaction Flow

### Flow 1: Quick Login Test

```
1. Open App
   ↓
2. See Login Screen
   ↓
3. Click Test Mode Toggle (if not active)
   ↓ [Toggle turns yellow/orange]
4. See Info Banner with test accounts
   ↓
5. Enter: applicant@test.com
   ↓
6. Enter: Test1234
   ↓
7. Click "Sign in"
   ↓ [No loading, instant redirect]
8. ✅ Applicant Dashboard
```

### Flow 2: New Registration Test

```
1. Open App
   ↓
2. Click "Create one" on login
   ↓
3. Select "Applicant" role
   ↓
4. Click Test Mode Toggle (if not active)
   ↓ [Toggle turns yellow/orange]
5. See Info Banner with instructions
   ↓
6. Enter: newuser@test.com
   ↓
7. Click "Continue"
   ↓
8. Fill registration steps
   ↓
9. See OTP screen with test code banner
   ↓
10. Enter: 123456
    ↓
11. Click "Verify and create account"
    ↓ [No loading, instant redirect]
12. ✅ Applicant Dashboard
```

## 🎨 Color Scheme

### Test Mode Active
- **Background**: `#FFF3CD` (Light yellow)
- **Border**: `#FFC107` (Warning/Amber)
- **Text**: `#856404` (Dark amber)
- **Icon**: `#FFC107` (Warning/Amber)

### Test Mode Inactive
- **Background**: `#F5F5F5` (Light gray)
- **Border**: `#E0E0E0` (Gray)
- **Text**: `#757575` (Medium gray)
- **Icon**: `#9E9E9E` (Gray)

### Info Banner
- **Background**: `#E3F2FD` (Light blue)
- **Border**: `#2196F3` (Primary blue)
- **Text**: `#1565C0` (Dark blue)
- **Icon**: `#2196F3` (Primary blue)

## 📐 Layout Specifications

### Toggle Button
- **Height**: 48px
- **Padding**: 12px horizontal, 12px vertical
- **Border Radius**: 8px
- **Border Width**: 1px
- **Gap**: 8px between icon and text

### Info Banner
- **Height**: Auto (min 48px)
- **Padding**: 12px horizontal, 12px vertical
- **Border Radius**: 8px
- **Border Width**: 1px
- **Gap**: 8px between icon and text

### OTP Code Display
- **Font Size**: 22px (digits)
- **Font Weight**: 700 (bold)
- **Cell Size**: 48x56px
- **Gap**: 8px between cells
- **Border Width**: 1.5px (normal), 2px (focused)

## 🔄 State Transitions

### Toggle Button States

```
Inactive → Click → Active
  Gray          Yellow/Orange

Active → Click → Inactive
  Yellow/Orange    Gray
```

### Visual Feedback

```
Button Press:
  Normal → Pressed (0.85 opacity) → Normal

Loading State:
  Button → Spinner → Success/Error

Error State:
  Normal → Red border + shake → Normal (after 3s)
```

## 💡 Tips for Testing UI

1. **Toggle Visibility**: Toggle should be visible immediately on screen load
2. **Color Contrast**: Ensure text is readable on all backgrounds
3. **Touch Targets**: All interactive elements should be at least 44x44px
4. **Animations**: Toggle should have smooth transition (200ms)
5. **Feedback**: Provide immediate visual feedback on interactions
6. **Accessibility**: Use proper color contrast ratios (WCAG AA)

## 🎭 Dark Mode Support

If your app supports dark mode, test mode colors should adapt:

### Dark Mode Colors

**Test Mode Active**:
- Background: `#3E2723` (Dark brown)
- Border: `#FF9800` (Orange)
- Text: `#FFE0B2` (Light orange)

**Test Mode Inactive**:
- Background: `#212121` (Dark gray)
- Border: `#424242` (Medium gray)
- Text: `#BDBDBD` (Light gray)

**Info Banner**:
- Background: `#0D47A1` (Dark blue)
- Border: `#1976D2` (Blue)
- Text: `#BBDEFB` (Light blue)

## 📱 Responsive Design

Test mode UI should work on all screen sizes:

### Small Screens (< 375px)
- Stack toggle text vertically if needed
- Reduce padding to 8px
- Use smaller font sizes (12px)

### Medium Screens (375px - 768px)
- Standard layout as shown above
- Normal padding (12px)
- Standard font sizes (14px)

### Large Screens (> 768px)
- Maintain max width of 600px
- Center content
- Increase padding to 16px

## 🎬 Animation Specifications

### Toggle Transition
```css
transition: all 200ms ease-in-out
```

### Banner Fade In
```css
opacity: 0 → 1
duration: 300ms
easing: ease-in
```

### Error Shake
```css
translateX: 0 → 10 → -10 → 10 → -10 → 0
duration: 250ms (50ms per step)
easing: linear
```

### OTP Cell Focus
```css
scale: 1 → 1.05 → 1
duration: 200ms
easing: ease-out
```

## ✅ Visual Testing Checklist

- [ ] Toggle button appears on login screen
- [ ] Toggle button appears on registration email gate
- [ ] Toggle changes color when clicked
- [ ] Info banner appears when test mode is active
- [ ] Info banner disappears when test mode is inactive
- [ ] OTP helper banner appears on verification screen
- [ ] All text is readable and properly sized
- [ ] Icons are properly aligned with text
- [ ] Touch targets are large enough (44x44px minimum)
- [ ] Animations are smooth and not jarring
- [ ] Colors have sufficient contrast
- [ ] Layout works on different screen sizes
- [ ] Dark mode colors work (if applicable)

## 🎨 Design Assets

### Icons Used
- **Flask**: `MaterialCommunityIcons` - `flask` / `flask-outline`
- **Info**: `MaterialCommunityIcons` - `information-outline`
- **Alert**: `MaterialCommunityIcons` - `alert-circle-outline`
- **Email**: `MaterialCommunityIcons` - `email-outline`
- **Lock**: `MaterialCommunityIcons` - `lock-outline`

### Typography
- **Title**: 24px, Bold, -0.3 letter spacing
- **Body**: 14px, Regular
- **Small**: 12px, Regular
- **Label**: 13px, Semibold, 0.2 letter spacing

This visual guide should help you understand exactly what test mode looks like and how users will interact with it!
