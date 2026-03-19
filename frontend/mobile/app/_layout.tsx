import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="jobs/[id]" options={{ headerShown: true, title: 'Job Details' }} />
      <Stack.Screen name="messages/[conversationId]" options={{ headerShown: true }} />
    </Stack>
  );
}