import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { getTheme } from '../theme';

export default function RootLayout() {
  const hydrate  = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  const token    = useAuthStore((s) => s.token);
  const role     = useAuthStore((s) => s.role);
  const theme    = getTheme();
  const segments = useSegments();

  // Read persisted token once on mount
  useEffect(() => {
    hydrate();
  }, []);

  // Redirect once hydration is done
  useEffect(() => {
    if (!hydrated) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (token && role) {
      if (inAuthGroup || segments[0] === undefined) {
        router.replace(role === 'hr' ? '/(company-tabs)' : '/(tabs)');
      }
      return;
    }

    if (!inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [hydrated, token, role, segments]);

  // Blank screen while AsyncStorage is being read
  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)/register" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(company-tabs)" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="team-management" />
      <Stack.Screen name="jobs/[id]" options={{ headerShown: true, title: 'Job Details' }} />
      <Stack.Screen name="messages/[conversationId]" options={{ headerShown: true }} />
    </Stack>
  );
}
