import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ─── Theme (keep in sync with jobs.tsx) ─────────────────────────────────────
const T = {
  bg:       '#0f0a1e',
  surface:  '#1a1030',
  border:   'rgba(255,255,255,0.08)',
  primary:  '#a855f7',
  pink:     '#ec4899',
  inactive: 'rgba(255,255,255,0.35)',
};

type IconName =
  | 'home' | 'home-outline'
  | 'magnify'
  | 'heart' | 'heart-outline'
  | 'account' | 'account-outline';

function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  if (focused) {
    return (
      <View style={styles.activeIconWrap}>
        <View style={styles.activeIconCircle}>
          <MaterialCommunityIcons name={name as any} size={20} color="#fff" />
        </View>
      </View>
    );
  }
  return <MaterialCommunityIcons name={name as any} size={22} color={color} />;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);
  const tabBarHeight = 60 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: T.primary,
        tabBarInactiveTintColor: T.inactive,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: T.surface,
          borderTopWidth: 1,
          borderTopColor: T.border,
          height: tabBarHeight,
          paddingBottom: bottomInset > 0 ? bottomInset : 10,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="magnify" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'heart' : 'heart-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'account' : 'account-outline'} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});