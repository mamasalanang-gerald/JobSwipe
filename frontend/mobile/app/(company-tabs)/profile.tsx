import React, { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { useAuthStore } from '../../store/authStore';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  FlatList,
  Image,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useTheme, setThemeMode, getThemeMode } from '../../theme';

const { width: SCREEN_W } = Dimensions.get('window');

const TECH_STACK = ['React Native', 'TypeScript', 'Node.js', 'AWS', 'PostgreSQL', 'Docker'];
const PERKS = ['Hybrid Work', 'HMO Coverage', '14th Month', 'Stock Options', 'L&D Budget'];

type TeamMember = {
  id: number;
  name: string;
  role: string;
  avatar: string;
};

type Plan = {
  id: string;
  name: string;
  price: string | null;
  color: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  badge: string | null;
  features: string[];
  locked: string[];
  cta: string | null;
};

const INITIAL_TEAM: TeamMember[] = [
  { id: 1, name: 'Sofia Reyes', role: 'HR Manager', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 2, name: 'Marco Cruz', role: 'CTO', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 3, name: 'Aisha Santos', role: 'Lead Recruiter', avatar: 'https://randomuser.me/api/portraits/women/65.jpg' },
];

function buildPlans(primary: string, gold: string): Plan[] {
  return [
    {
      id: 'free',
      name: 'Starter',
      price: null,
      color: primary,
      icon: 'star-outline',
      badge: null,
      features: ['3 active job posts', 'Basic applicant matching'],
      locked: ['See who liked your posts', 'Priority listing', 'Analytics dashboard', 'Dedicated sourcing'],
      cta: null,
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '$49 / mo',
      color: gold,
      icon: 'lightning-bolt',
      badge: 'POPULAR',
      features: ['Unlimited job posts', 'Advanced matching', 'See who liked your posts', 'Priority listing'],
      locked: ['Analytics dashboard', 'Dedicated sourcing'],
      cta: 'Upgrade to Growth',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$149 / mo',
      color: '#cbd5e1',
      icon: 'diamond-stone',
      badge: 'BEST VALUE',
      features: ['Everything in Growth', 'Analytics dashboard', 'Dedicated sourcing agent', 'AI-powered matching'],
      locked: [],
      cta: 'Upgrade to Enterprise',
    },
  ];
}

function SectionLabel({ title }: { title: string }) {
  const T = useTheme();
  return <Text style={[sl.label, { color: T.textHint }]}>{title}</Text>;
}

const sl = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
});

function Sep() {
  const T = useTheme();
  return <View style={{ height: 1, backgroundColor: T.borderFaint, marginVertical: 28, marginHorizontal: 24 }} />;
}

function SettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const T = useTheme();
  const [isLight, setIsLight] = useState(getThemeMode() === 'light');

  const handleToggle = (val: boolean) => {
    setIsLight(val);
    setThemeMode(val ? 'light' : 'dark');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <TouchableOpacity style={ss.scrim} activeOpacity={1} onPress={onClose} />

      <View style={[ss.sheet, { backgroundColor: T.surface, borderColor: T.border }]}>
        <View style={[ss.handle, { backgroundColor: T.borderFaint }]} />

        <View style={ss.sheetHeader}>
          <Text style={[ss.sheetTitle, { color: T.textPrimary }]}>Settings</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="close" size={20} color={T.textSub} />
          </TouchableOpacity>
        </View>

        <Text style={[ss.groupLabel, { color: T.textHint }]}>Appearance</Text>

        <View style={[ss.row, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}>
          <View style={[ss.iconWrap, { backgroundColor: isLight ? '#f59e0b18' : T.primary + '18' }]}>
            <MaterialCommunityIcons
              name={isLight ? 'weather-sunny' : 'weather-night'}
              size={18}
              color={isLight ? '#f59e0b' : T.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[ss.rowLabel, { color: T.textPrimary }]}>{isLight ? 'Light Mode' : 'Dark Mode'}</Text>
            <Text style={[ss.rowSub, { color: T.textHint }]}>
              {isLight ? 'Bright theme active' : 'Dark theme active'}
            </Text>
          </View>
          <Switch
            value={isLight}
            onValueChange={handleToggle}
            trackColor={{ false: T.primary + '55', true: '#f59e0b88' }}
            thumbColor={isLight ? '#f59e0b' : T.primary}
          />
        </View>

        <Text style={[ss.groupLabel, { color: T.textHint }]}>Account</Text>

        {[
          { icon: 'bell-outline' as const, label: 'Notifications', sub: 'Manage alerts' },
          { icon: 'shield-lock-outline' as const, label: 'Privacy', sub: 'Control your data' },
          { icon: 'help-circle-outline' as const, label: 'Help & Support', sub: 'FAQs and contact' },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            activeOpacity={0.7}
            style={[ss.row, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}
          >
            <View style={[ss.iconWrap, { backgroundColor: T.primary + '18' }]}>
              <MaterialCommunityIcons name={item.icon} size={18} color={T.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[ss.rowLabel, { color: T.textPrimary }]}>{item.label}</Text>
              <Text style={[ss.rowSub, { color: T.textHint }]}>{item.sub}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={T.textHint} />
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
}

const ss = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  handle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 6 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  sheetTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  groupLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 14, fontWeight: '600' },
  rowSub: { fontSize: 11, marginTop: 1 },
});

export default function CompanyProfileScreen() {
  const T = useTheme();
  const tabBarHeight = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();
  const clearToken = useAuthStore((s) => s.clearToken);

  const [showSettings, setShowSettings] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [logoPhoto, setLogoPhoto] = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<(string | null)[]>([null, null, null]);
  const [activePlan, setActivePlan] = useState(0);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [showAddPerk, setShowAddPerk] = useState(false);
  const [perks, setPerks] = useState<string[]>(PERKS);
  const [newPerk, setNewPerk] = useState('');
  const planRef = useRef<FlatList<Plan>>(null);

  const plans = buildPlans(T.primary, T.gold);
  const PLAN_W = SCREEN_W - 48;

  const pickLogo = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (!r.canceled) setLogoPhoto(r.assets[0].uri);
  };

  const pickCover = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [3, 1], quality: 0.85 });
    if (!r.canceled) setCoverPhoto(r.assets[0].uri);
  };

  const pickGallery = async (i: number) => {
    const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 5], quality: 0.85 });
    if (!r.canceled) {
      const p = [...galleryPhotos];
      p[i] = r.assets[0].uri;
      setGalleryPhotos(p);
    }
  };

  const addPerk = () => {
    if (!newPerk.trim()) return;
    setPerks((prev) => [...prev, newPerk.trim()]);
    setNewPerk('');
    setShowAddPerk(false);
  };

  const onPlanScroll = (e: any) => {
    setActivePlan(Math.round(e.nativeEvent.contentOffset.x / (PLAN_W + 12)));
  };

  const handleSignOut = async () => {
    await clearToken();
    router.replace('/(auth)/register');
  };

  const renderPlan = ({ item }: { item: Plan }) => {
    const isCurrent = item.id === 'free';
    const borderColor =
      item.id === 'growth' ? 'rgba(245,158,11,0.35)' : item.id === 'enterprise' ? 'rgba(203,213,225,0.3)' : T.border;
    const backgroundColor =
      item.id === 'growth' ? 'rgba(245,158,11,0.05)' : item.id === 'enterprise' ? 'rgba(148,163,184,0.05)' : T.primary + '0D';

    return (
      <View style={[ps.card, { width: PLAN_W, borderColor, backgroundColor }]}>
        <View style={ps.top}>
          <View style={[ps.iconWrap, { backgroundColor: item.color + '20' }]}>
            <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[ps.name, { color: item.color }]}>{item.name}</Text>
            <Text style={[ps.price, { color: T.textSub }]}>{item.price ?? 'Free forever'}</Text>
          </View>
          {item.badge && (
            <View style={[ps.badge, { backgroundColor: item.color + '18', borderColor: item.color + '40' }]}>
              <Text style={[ps.badgeText, { color: item.color }]}>{item.badge}</Text>
            </View>
          )}
        </View>

        <View style={[ps.sep, { backgroundColor: T.borderFaint }]} />

        <View style={{ gap: 8 }}>
          {item.features.map((f, i) => (
            <View key={`inc-${i}`} style={ps.row}>
              <MaterialCommunityIcons name="check-circle" size={13} color={item.color} />
              <Text style={[ps.rowText, { color: T.textSub }]}>{f}</Text>
            </View>
          ))}
          {item.locked.map((f, i) => (
            <View key={`lock-${i}`} style={ps.row}>
              <MaterialCommunityIcons name="lock-outline" size={13} color={T.textHint} />
              <Text style={[ps.rowText, { color: T.textHint }]}>{f}</Text>
            </View>
          ))}
        </View>

        {item.cta && !isCurrent ? (
          <TouchableOpacity
            style={[ps.cta, { backgroundColor: item.color }]}
            activeOpacity={0.85}
            onPress={() => router.push('/subscription')}
          >
            <Text style={[ps.ctaText, { color: item.id === 'enterprise' ? '#0f172a' : '#fff' }]}>{item.cta}</Text>
          </TouchableOpacity>
        ) : isCurrent ? (
          <View style={ps.activePill}>
            <MaterialCommunityIcons name="check-circle" size={12} color={T.primary} />
            <Text style={[ps.activePillText, { color: T.primary }]}>Current plan</Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={[s.screen, { backgroundColor: T.bg, paddingTop: topInset }]}>
      <StatusBar
        barStyle={T.bg === '#f5f3ff' ? 'dark-content' : 'light-content'}
        translucent
        backgroundColor="transparent"
      />

      <SettingsSheet visible={showSettings} onClose={() => setShowSettings(false)} />

      {showSignOutModal && (
        <View style={modal.overlay}>
          <TouchableOpacity style={modal.backdrop} activeOpacity={1} onPress={() => setShowSignOutModal(false)} />
          <View style={[modal.card, { backgroundColor: T.surface, borderColor: T.border }]}>
            <View style={[modal.iconWrap, { backgroundColor: T.dangerBg }]}>
              <MaterialCommunityIcons name="logout" size={28} color={T.danger} />
            </View>
            <Text style={[modal.title, { color: T.textPrimary }]}>Sign Out</Text>
            <Text style={[modal.message, { color: T.textSub }]}>Are you sure you want to sign out?</Text>
            <View style={modal.btnRow}>
              <TouchableOpacity
                style={[modal.cancelBtn, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}
                onPress={() => setShowSignOutModal(false)}
              >
                <Text style={[modal.cancelText, { color: T.textSub }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modal.confirmBtn, { backgroundColor: T.danger }]}
                onPress={async () => {
                  setShowSignOutModal(false);
                  await handleSignOut();
                }}
              >
                <Text style={modal.confirmText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 40 }}>
        <View style={[s.coverWrap, { height: 190 + topInset, backgroundColor: T.surfaceHigh }]}>
          {coverPhoto ? (
            <Image source={{ uri: coverPhoto }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, s.coverFallback, { borderBottomColor: T.borderFaint }]}>
              <MaterialCommunityIcons name="image-outline" size={32} color={T.textHint} />
            </View>
          )}

          <TouchableOpacity
            style={[s.settingsBtn, { backgroundColor: 'rgba(0,0,0,0.42)', borderColor: 'rgba(255,255,255,0.18)' }]}
            onPress={() => setShowSettings(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="cog-outline" size={17} color="#fff" />
          </TouchableOpacity>

          {editMode && (
            <TouchableOpacity style={s.coverEditBtn} onPress={pickCover} activeOpacity={0.8}>
              <MaterialCommunityIcons name="camera-outline" size={13} color="#fff" />
              <Text style={s.coverEditText}>Edit cover</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={s.heroRow}>
          <TouchableOpacity onPress={editMode ? pickLogo : undefined} activeOpacity={0.85} style={s.logoWrap}>
            {logoPhoto ? (
              <Image source={{ uri: logoPhoto }} style={[s.logoImg, { borderColor: T.bg }]} />
            ) : (
              <View style={[s.logoFallback, { backgroundColor: T.surfaceHigh, borderColor: T.bg }]}>
                <Text style={[s.logoInitials, { color: T.textPrimary }]}>AC</Text>
              </View>
            )}
            {editMode && (
              <View style={[s.camBadge, { backgroundColor: T.primary, borderColor: T.bg }]}>
                <MaterialCommunityIcons name="camera" size={10} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              s.editBtn,
              { borderColor: T.border, backgroundColor: T.surfaceHigh },
              editMode && s.editBtnSaving,
            ]}
            onPress={() => setEditMode((e) => !e)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={editMode ? 'check' : 'pencil-outline'}
              size={13}
              color={editMode ? '#4ade80' : T.primary}
            />
            <Text style={[s.editBtnText, { color: T.primary }, editMode && { color: '#4ade80' }]}>
              {editMode ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={s.heroInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <Text style={[s.companyName, { color: T.textPrimary }]}>Accenture PH</Text>
            <MaterialCommunityIcons name="check-decagram" size={15} color={T.primary} />
          </View>
          <Text style={[s.industry, { color: T.textSub }]}>Technology / Consulting</Text>
          <View style={s.locRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={11} color={T.textHint} />
            <Text style={[s.loc, { color: T.textHint }]}>BGC, Taguig, Philippines</Text>
          </View>
        </View>

        <View style={[s.statsCard, { backgroundColor: T.surface, borderColor: T.border }]}>
          {[
            { label: 'Active Jobs', value: '3' },
            { label: 'Applicants', value: '53' },
            { label: 'Matches', value: '12' },
          ].map((st, i) => (
            <React.Fragment key={st.label}>
              {i > 0 && <View style={[s.statSep, { backgroundColor: T.border }]} />}
              <View style={s.stat}>
                <Text style={[s.statVal, { color: T.textPrimary }]}>{st.value}</Text>
                <Text style={[s.statLbl, { color: T.textHint }]}>{st.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <Sep />

        <View style={s.section}>
          <SectionLabel title="About Us" />
          <Text style={[s.aboutText, { color: T.textSub }]}>
            A global professional services company with leading capabilities in digital, cloud and security. We help
            organisations grow, work efficiently and build lasting trust.
          </Text>
        </View>

        <Sep />

        <View style={s.section}>
          <SectionLabel title="Office Photos" />
          <View style={s.photoGrid}>
            {galleryPhotos.map((uri, i) => (
              <TouchableOpacity
                key={i}
                style={[s.photoSlot, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}
                onPress={() => pickGallery(i)}
                activeOpacity={0.8}
              >
                {uri ? (
                  <Image source={{ uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                ) : (
                  <MaterialCommunityIcons name="plus" size={22} color={T.textHint} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Sep />

        <View style={s.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionLabel title="Tech Stack" />
            {editMode && (
              <TouchableOpacity style={[s.addBtn, { borderColor: T.border, backgroundColor: T.surfaceHigh }]}>
                <MaterialCommunityIcons name="plus" size={12} color={T.primary} />
                <Text style={[s.addBtnText, { color: T.primary }]}>Add</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={s.skillSegment}>
            <View style={s.skillSegmentHeader}>
              <MaterialCommunityIcons name="code-braces" size={13} color={T.primary} />
              <Text style={[s.skillSegmentLabel, { color: T.primary }]}>Technologies We Use</Text>
            </View>
            <View style={s.chips}>
              {TECH_STACK.map((sk, i) => (
                <View key={i} style={[s.chip, { borderColor: T.border, backgroundColor: T.surfaceHigh }]}>
                  <Text style={[s.chipText, { color: T.primary }]}>{sk}</Text>
                  {editMode && <MaterialCommunityIcons name="close" size={10} color={T.primary} style={{ marginLeft: 4 }} />}
                </View>
              ))}
            </View>
          </View>

          <View style={[s.skillDivider, { backgroundColor: T.borderFaint }]} />

          <View style={s.skillSegment}>
            <View style={[s.skillSegmentHeader, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialCommunityIcons name="gift-outline" size={13} color="#4ade80" />
                <Text style={[s.skillSegmentLabel, { color: '#4ade80' }]}>Perks & Benefits</Text>
              </View>
              {editMode && (
                <TouchableOpacity
                  style={[s.addBtn, { borderColor: 'rgba(74,222,128,0.3)', backgroundColor: 'rgba(74,222,128,0.07)' }]}
                  onPress={() => setShowAddPerk((v) => !v)}
                >
                  <MaterialCommunityIcons name={showAddPerk ? 'minus' : 'plus'} size={12} color="#4ade80" />
                  <Text style={[s.addBtnText, { color: '#4ade80' }]}>{showAddPerk ? 'Cancel' : 'Add'}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={s.chips}>
              {perks.map((p, i) => (
                <View
                  key={i}
                  style={[s.chip, { borderColor: 'rgba(74,222,128,0.3)', backgroundColor: 'rgba(74,222,128,0.07)' }]}
                >
                  <Text style={[s.chipText, { color: '#4ade80' }]}>{p}</Text>
                  {editMode && (
                    <TouchableOpacity
                      onPress={() => setPerks((prev) => prev.filter((_, idx) => idx !== i))}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      style={{ marginLeft: 4 }}
                    >
                      <MaterialCommunityIcons name="close" size={10} color="#4ade80" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {editMode && showAddPerk && (
              <View style={[s.addForm, { marginTop: 12, backgroundColor: T.surfaceHigh, borderColor: T.border }]}>
                <TextInput
                  style={[s.addInput, { backgroundColor: T.surface, borderColor: T.border, color: T.textPrimary }]}
                  placeholder="e.g. Remote Work, Free Meals, Gym..."
                  placeholderTextColor={T.textHint}
                  value={newPerk}
                  onChangeText={setNewPerk}
                />
                <TouchableOpacity style={[s.addConfirmBtn, { backgroundColor: T.primary }]} onPress={addPerk}>
                  <Text style={s.addConfirmText}>Add Perk</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <Sep />

        <View style={s.section}>
          <SectionLabel title="Hiring Team" />
          <View style={{ gap: 16 }}>
            {team.map((member) => (
              <View key={member.id} style={s.expRow}>
                <Image source={{ uri: member.avatar }} style={[s.teamAvatar, { borderColor: T.border }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.expRole, { color: T.textPrimary }]}>{member.name}</Text>
                  <Text style={[s.expMeta, { color: T.textHint }]}>{member.role}</Text>
                </View>
                {editMode && (
                  <TouchableOpacity
                    onPress={() => setTeam((prev) => prev.filter((m) => m.id !== member.id))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons name="close-circle" size={18} color={T.danger} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        <Sep />

        <View style={[s.section, { marginBottom: 16 }]}>
          <SectionLabel title="Subscription" />
        </View>

        <FlatList
          ref={planRef}
          data={plans}
          renderItem={renderPlan}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          snapToInterval={PLAN_W + 12}
          snapToAlignment="start"
          decelerationRate="fast"
          onMomentumScrollEnd={onPlanScroll}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          getItemLayout={(_, i) => ({ length: PLAN_W + 12, offset: (PLAN_W + 12) * i, index: i })}
        />

        <View style={s.dotsRow}>
          {plans.map((plan, i) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => {
                planRef.current?.scrollToIndex({ index: i, animated: true });
                setActivePlan(i);
              }}
            >
              <View
                style={[
                  s.dot,
                  {
                    backgroundColor: activePlan === i ? plan.color : T.border,
                    width: activePlan === i ? 20 : 6,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[s.signOut, { backgroundColor: T.dangerBg, borderColor: T.danger + '26' }]}
          activeOpacity={0.8}
          onPress={() => setShowSignOutModal(true)}
        >
          <MaterialCommunityIcons name="logout" size={14} color={T.danger} />
          <Text style={[s.signOutText, { color: T.danger }]}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const ps = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1.5, padding: 18 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  iconWrap: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  price: { fontSize: 12, marginTop: 2 },
  badge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  sep: { height: 1, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowText: { fontSize: 12, flex: 1 },
  cta: { marginTop: 16, borderRadius: 22, paddingVertical: 13, alignItems: 'center' },
  ctaText: { fontSize: 13, fontWeight: '800' },
  activePill: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14, justifyContent: 'center' },
  activePillText: { fontSize: 11, fontWeight: '600' },
});

const s = StyleSheet.create({
  screen: { flex: 1 },

  coverWrap: { width: '100%', overflow: 'hidden' },
  coverFallback: { alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1 },
  coverEditBtn: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  coverEditText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  settingsBtn: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -38,
    marginBottom: 10,
  },
  heroInfo: { paddingHorizontal: 24, paddingBottom: 16 },

  logoWrap: { position: 'relative' },
  logoImg: { width: 84, height: 84, borderRadius: 22, borderWidth: 3 },
  logoFallback: { width: 84, height: 84, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  logoInitials: { fontSize: 26, fontWeight: '800' },
  camBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  companyName: { fontSize: 19, fontWeight: '800', letterSpacing: -0.4 },
  industry: { fontSize: 13, marginBottom: 4 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  loc: { fontSize: 11 },

  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginBottom: 6,
  },
  editBtnSaving: { borderColor: 'rgba(74,222,128,0.3)', backgroundColor: 'rgba(74,222,128,0.07)' },
  editBtnText: { fontSize: 11, fontWeight: '700' },

  statsCard: { flexDirection: 'row', marginHorizontal: 24, borderRadius: 16, borderWidth: 1, paddingVertical: 16 },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  statLbl: { fontSize: 10, marginTop: 3, fontWeight: '500' },
  statSep: { width: 1 },

  section: { paddingHorizontal: 24 },
  aboutText: { fontSize: 14, lineHeight: 22 },

  photoGrid: { flexDirection: 'row', gap: 8 },
  photoSlot: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  addBtnText: { fontSize: 11, fontWeight: '700' },
  skillSegment: { gap: 10 },
  skillSegmentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  skillSegmentLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  skillDivider: { height: 1, marginVertical: 14 },

  expRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expRole: { fontSize: 13, fontWeight: '700' },
  expMeta: { fontSize: 11, marginTop: 2 },
  teamAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5 },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14, marginBottom: 8 },
  dot: { height: 6, borderRadius: 3 },

  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginHorizontal: 24,
    marginTop: 28,
    paddingVertical: 13,
    borderRadius: 13,
    borderWidth: 1,
  },
  signOutText: { fontSize: 13, fontWeight: '700' },

  addForm: { marginTop: 16, padding: 14, borderRadius: 14, borderWidth: 1, gap: 10 },
  addInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  addConfirmBtn: { borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  addConfirmText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});

const modal = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 9999, alignItems: 'center', justifyContent: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  card: {
    width: SCREEN_W - 48,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    position: 'absolute',
    top: '30%',
  },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 10, letterSpacing: -0.5 },
  message: { fontSize: 15, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  btnRow: { flexDirection: 'row', gap: 14, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: 15, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '700' },
  confirmBtn: { flex: 1, paddingVertical: 15, borderRadius: 16, alignItems: 'center' },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
