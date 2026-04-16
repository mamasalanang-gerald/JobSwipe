import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const T = {
  bg:       '#0f0a1e',
  surface:  '#130d22',
  border:   'rgba(255,255,255,0.07)',
  active:   '#e91e8c',
  inactive: 'rgba(255,255,255,0.38)',
};

type IconName =
  | 'home-outline'
  | 'briefcase-plus-outline'
  | 'heart-outline'
  | 'office-building-outline';

const TABS: { name: string; label: string; icon: IconName }[] = [
  { name: 'index',      label: 'Home',     icon: 'home-outline'             },
  { name: 'applicants', label: 'Jobs',     icon: 'briefcase-plus-outline'   },
  { name: 'matches',    label: 'Matches',  icon: 'heart-outline'            },
  { name: 'profile',    label: 'Profile',  icon: 'office-building-outline'  },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets    = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.bar, { paddingBottom: bottomPad }]}>
      <View style={styles.topBorder} />
      <View style={styles.row}>
        {state.routes.map((route: any, i: number) => {
          const focused = state.index === i;
          const tab     = TABS[i];
          const color   = focused ? T.active : T.inactive;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tab}
            >
              <MaterialCommunityIcons
                name={(tab?.icon ?? 'home-outline') as any}
                size={24}
                color={color}
              />
              <Text style={[styles.label, { color }]}>
                {tab?.label ?? route.name}
              </Text>
              {focused && <View style={styles.indicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function CompanyTabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index"      options={{ title: 'Home'    }} />
      <Tabs.Screen name="applicants" options={{ title: 'Jobs'    }} />
      <Tabs.Screen name="matches"    options={{ title: 'Matches' }} />
      <Tabs.Screen name="profile"    options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: T.surface,
  },
  topBorder: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: T.border,
  },
  row: {
    flexDirection: 'row',
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingBottom: 4,
    position: 'relative',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  indicator: {
    position: 'absolute',
    bottom: -4,
    width: 20,
    height: 2,
    borderRadius: 2,
    backgroundColor: T.active,
  },
});