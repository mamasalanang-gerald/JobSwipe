import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
  const hydrate  = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  const token    = useAuthStore((s) => s.token);

  // Read persisted token once on mount
  useEffect(() => {
    hydrate();
  }, []);

  // Redirect once hydration is done
  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace('/(auth)/register');
    }
  }, [hydrated, token]);

  // Blank screen while AsyncStorage is being read
  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0a1e' }}>
        <ActivityIndicator color="#a855f7" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)/register" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="jobs/[id]" options={{ headerShown: true, title: 'Job Details' }} />
      <Stack.Screen name="messages/[conversationId]" options={{ headerShown: true }} />
    </Stack>
  );
}