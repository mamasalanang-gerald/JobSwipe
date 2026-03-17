# React Native Mobile Frontend

React Native mobile app for JobApp (iOS & Android).

## Setup

### Prerequisites
- Node.js 18+
- Xcode (for iOS development)
- Android Studio & Android SDK (for Android development)

### Installation

```bash
cd frontend/mobile
npm install
# iOS only:
cd ios
pod install
cd ..
```

## Development

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Web (Expo)
```bash
npm run web
```

## Environment Variables

Create `.env`:
```
API_URL=http://localhost:8000/api
API_VERSION=v1
```

## Project Structure

```
frontend/mobile/
├── src/
│   ├── screens/         # Screen components
│   ├── components/      # Reusable components
│   ├── hooks/           # Custom hooks
│   ├── services/        # API service calls
│   ├── store/           # State management
│   ├── navigation/      # React Navigation setup
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── styles/          # Styling utilities
├── assets/              # Images, fonts, etc
├── ios/                 # iOS native code
├── android/             # Android native code
└── app.json             # Expo configuration
```

## Features

- Cross-platform development (iOS & Android)
- Navigation with React Navigation
- State management with Zustand
- API client with Axios
- JWT authentication
- AsyncStorage for persistence
- Gesture handling with React Native Gesture Handler
- Animations with Reanimated

## Authentication

JWT token stored in AsyncStorage. All requests include:
```
Authorization: Bearer <token>
```

See `src/hooks/useAuth.ts` for implementation.

## Building

### Android APK
```bash
cd android
./gradlew assembleRelease
```

### iOS App
```bash
cd ios
xcodebuild -workspace JobApp.xcworkspace -scheme JobApp -configuration Release
```

## Troubleshooting

### Metro bundler issues
```bash
npm start -- --reset-cache
```

### Pod/CocoaPods issues (iOS)
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```
