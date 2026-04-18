import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token    = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!hydrated) return;
    if (token) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/register');
    }
  }, [hydrated, token]);

  // Wait for hydration before redirecting
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0a1e' }}>
      <ActivityIndicator color="#a855f7" />
    </View>
  );
}