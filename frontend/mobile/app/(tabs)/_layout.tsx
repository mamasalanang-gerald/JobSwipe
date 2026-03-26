import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography } from '../../components/ui';

type IconName =
  | 'home' | 'home-outline'
  | 'briefcase' | 'briefcase-outline'
  | 'heart' | 'heart-outline'
  | 'account' | 'account-outline';

function TabIcon({ name, color }: { name: IconName; color: string }) {
  return <MaterialCommunityIcons name={name} size={24} color={color} />;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // On Android, insets.bottom reflects the gesture nav bar height (0 on
  // devices with hardware buttons). On iOS it reflects the home indicator.
  // Use the system inset when available; guarantee at least 12px on phones
  // that report 0 (no gesture bar, no hardware buttons).
  const bottomInset = Math.max(insets.bottom, 12);
  const tabBarHeight = 56 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.gray100,
          height: tabBarHeight,
          paddingBottom: bottomInset > 0 ? bottomInset : 10,
          paddingTop: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: Typography.xs,
          fontWeight: Typography.medium,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'briefcase' : 'briefcase-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'heart' : 'heart-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'account' : 'account-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}