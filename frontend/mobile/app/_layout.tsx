import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="index" />
  <Stack.Screen name="(auth)/login" />
  <Stack.Screen name="(auth)/register" />
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="subscription" />  
  <Stack.Screen name="jobs/[id]" options={{ headerShown: true, title: 'Job Details' }} />
  <Stack.Screen name="messages/[conversationId]" options={{ headerShown: true }} />
</Stack>
  );
}