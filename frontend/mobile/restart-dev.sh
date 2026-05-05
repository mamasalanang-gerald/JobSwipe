#!/bin/bash
# Script to cleanly restart the Expo development server

echo "Stopping any running Metro bundlers..."
# Kill any node processes running expo/metro
pkill -f "expo start" || true
pkill -f "metro" || true

echo "Clearing Metro bundler cache..."
npx expo start --clear

echo ""
echo "Development server restarted with cleared cache!"
echo "Press 'r' in the terminal to reload the app"
echo "Or shake your device and tap 'Reload'"
