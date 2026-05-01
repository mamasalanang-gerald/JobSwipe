import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
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
    const inApplicantTabs = segments[0] === '(tabs)';
    const inCompanyTabs = segments[0] === '(company-tabs)';
    const isCompanyRole = role === 'hr' || role === 'company_admin';

    if (token && role) {
      if (inAuthGroup || segments[0] === undefined) {
        router.replace(isCompanyRole ? '/(company-tabs)' : '/(tabs)');
        return;
      }

      if (isCompanyRole && inApplicantTabs) {
        router.replace('/(company-tabs)');
        return;
      }

      if (!isCompanyRole && inCompanyTabs) {
        router.replace('/(tabs)');
      }
      return;
    }

    if (!inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [hydrated, token, role, segments]);

  useEffect(() => {
    if (!hydrated || !token || role !== 'company_admin') return;
    if (segments[0] === '(auth)') return;

    let cancelled = false;

    const enforceCompanyOnboarding = async () => {
      try {
        const status = await api.get('/profile/onboarding/status') as {
          completed?: boolean;
          onboarding_step?: number | string;
        };

        if (cancelled) return;

        const completed = status?.completed === true || status?.onboarding_step === 'completed';
        const isOnCompanyProfile = segments[0] === '(company-tabs)' && segments[1] === 'profile';

        if (!completed && !isOnCompanyProfile) {
          router.replace('/(company-tabs)/profile');
        }
      } catch {
        // If status fetch fails, keep the current route instead of hard-blocking navigation.
      }
    };

    void enforceCompanyOnboarding();

    return () => {
      cancelled = true;
    };
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
