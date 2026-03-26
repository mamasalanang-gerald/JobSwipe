import React, { useState, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Dimensions, FlatList, Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:          '#0f0a1e',
  surface:     '#16102a',
  surfaceHigh: '#1e1535',
  border:      'rgba(255,255,255,0.07)',
  primary:     '#a855f7',
  danger:      '#f87171',
  dangerBg:    'rgba(239,68,68,0.08)',
  textPrimary: '#ffffff',
  textSub:     'rgba(255,255,255,0.5)',
  textHint:    'rgba(255,255,255,0.28)',
  gold:        '#f59e0b',
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python',
  'AWS', 'GraphQL', 'Figma', 'Leadership',
];

const EXPERIENCE = [
  { role: 'Senior Developer',    company: 'Tech Company', period: '2021 – Present', icon: 'code-braces' as const, color: T.primary   },
  { role: 'Full Stack Developer', company: 'Startup Inc',  period: '2019 – 2021',   icon: 'laptop'      as const, color: '#4ade80' },
];

type Plan = {
  id: string; name: string; price: string | null;
  color: string; border: string; bg: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  badge: string | null;
  features: string[];
  locked: string[];
  cta: string | null;
};

const PLANS: Plan[] = [
  {
    id: 'free', name: 'Free', price: null,
    color: T.primary, border: 'rgba(168,85,247,0.3)', bg: 'rgba(168,85,247,0.05)',
    icon: 'star-outline', badge: null,
    features: ['10 applications / month', 'Basic job matching'],
    locked: ['See who liked you', 'Priority results', 'Advanced insights', 'Career coach'],
    cta: null,
  },
  {
    id: 'gold', name: 'Gold', price: '$9.99 / mo',
    color: T.gold, border: 'rgba(245,158,11,0.35)', bg: 'rgba(245,158,11,0.05)',
    icon: 'lightning-bolt', badge: 'POPULAR',
    features: ['Unlimited applications', 'Advanced matching', 'See who liked you', 'Priority results'],
    locked: ['Advanced insights', 'Career coach'],
    cta: 'Upgrade to Gold',
  },
  {
    id: 'platinum', name: 'Platinum', price: '$19.99 / mo',
    color: '#cbd5e1', border: 'rgba(203,213,225,0.3)', bg: 'rgba(148,163,184,0.05)',
    icon: 'diamond-stone', badge: 'BEST VALUE',
    features: ['Everything in Gold', 'Advanced insights', 'Dedicated career coach', 'AI-powered matching'],
    locked: [],
    cta: 'Upgrade to Platinum',
  },
];

const PLAN_W = SCREEN_W - 48;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionLabel({ title }: { title: string }) {
  return <Text style={sl.label}>{title}</Text>;
}
const sl = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 },
});

function Sep() {
  return <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 28, marginHorizontal: 24 }} />;
}

// ─── ProfileTab ───────────────────────────────────────────────────────────────
export default function ProfileTab() {
  const tabBarHeight      = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();

  const [editMode, setEditMode]       = useState(false);
  const [avatarPhoto, setAvatarPhoto] = useState<string | null>(null);
  const [photos, setPhotos]           = useState<(string | null)[]>([null, null, null]);
  const [activePlan, setActivePlan]   = useState(0);
  const planRef = useRef<FlatList<Plan>>(null);

  const pickAvatar = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (!r.canceled) setAvatarPhoto(r.assets[0].uri);
  };

  const pickPhoto = async (i: number) => {
    const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 5], quality: 0.85 });
    if (!r.canceled) { const p = [...photos]; p[i] = r.assets[0].uri; setPhotos(p); }
  };

  const onPlanScroll = (e: any) =>
    setActivePlan(Math.round(e.nativeEvent.contentOffset.x / (PLAN_W + 12)));

  const renderPlan = ({ item }: { item: Plan }) => {
    const isCurrent = item.id === 'free';
    return (
      <View style={[ps.card, { width: PLAN_W, borderColor: item.border, backgroundColor: item.bg }]}>
        <View style={ps.top}>
          <View style={[ps.iconWrap, { backgroundColor: item.color + '20' }]}>
            <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[ps.name, { color: item.color }]}>{item.name}</Text>
            <Text style={ps.price}>{item.price ?? 'Free forever'}</Text>
          </View>
          {item.badge && (
            <View style={[ps.badge, { backgroundColor: item.color + '18', borderColor: item.color + '40' }]}>
              <Text style={[ps.badgeText, { color: item.color }]}>{item.badge}</Text>
            </View>
          )}
        </View>

        <View style={ps.sep} />

        <View style={{ gap: 8 }}>
          {item.features.map((f, i) => (
            <View key={`inc-${i}`} style={ps.row}>
              <MaterialCommunityIcons name="check-circle" size={13} color={item.color} />
              <Text style={ps.rowText}>{f}</Text>
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
          <TouchableOpacity style={[ps.cta, { backgroundColor: item.color }]} activeOpacity={0.85}>
            <Text style={[ps.ctaText, { color: item.id === 'platinum' ? '#0f172a' : '#fff' }]}>{item.cta}</Text>
          </TouchableOpacity>
        ) : isCurrent ? (
          <View style={ps.activePill}>
            <MaterialCommunityIcons name="check-circle" size={12} color={T.primary} />
            <Text style={ps.activePillText}>Current plan</Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={[s.screen, { paddingTop: topInset }]}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 40 }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <View style={s.hero}>
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.85} style={s.avatarWrap}>
            {avatarPhoto
              ? <Image source={{ uri: avatarPhoto }} style={s.avatar} />
              : <View style={s.avatarFallback}><Text style={s.avatarInitials}>JD</Text></View>
            }
            <View style={s.camBadge}>
              <MaterialCommunityIcons name="camera" size={10} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <Text style={s.name}>John Doe</Text>
              <MaterialCommunityIcons name="check-decagram" size={15} color={T.primary} />
            </View>
            <Text style={s.headline}>Full Stack Developer</Text>
            <View style={s.locRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={11} color={T.textHint} />
              <Text style={s.loc}>San Francisco, CA</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[s.editBtn, editMode && s.editBtnSaving]}
            onPress={() => setEditMode(e => !e)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={editMode ? 'check' : 'pencil-outline'}
              size={13}
              color={editMode ? '#4ade80' : T.primary}
            />
            <Text style={[s.editBtnText, editMode && { color: '#4ade80' }]}>
              {editMode ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <View style={s.statsCard}>
          {[
            { label: 'Applied',    value: '12'  },
            { label: 'Interviews', value: '3'   },
            { label: 'Match %',    value: '88%' },
          ].map((st, i) => (
            <React.Fragment key={st.label}>
              {i > 0 && <View style={s.statSep} />}
              <View style={s.stat}>
                <Text style={s.statVal}>{st.value}</Text>
                <Text style={s.statLbl}>{st.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <Sep />

        {/* ── About ────────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel title="About" />
          <Text style={s.aboutText}>
            Passionate developer with expertise in building modern web applications.
            Strong background in React, Node.js, and cloud technologies.
          </Text>
        </View>

        <Sep />

        {/* ── Photos ───────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel title="Photos" />
          <View style={s.photoGrid}>
            {photos.map((uri, i) => (
              <TouchableOpacity key={i} style={s.photoSlot} onPress={() => pickPhoto(i)} activeOpacity={0.8}>
                {uri
                  ? <Image source={{ uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                  : <MaterialCommunityIcons name="plus" size={22} color={T.textHint} />
                }
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Sep />

        {/* ── Skills ───────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionLabel title="Skills" />
            {editMode && (
              <TouchableOpacity style={s.addBtn}>
                <MaterialCommunityIcons name="plus" size={12} color={T.primary} />
                <Text style={s.addBtnText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={s.chips}>
            {SKILLS.map((sk, i) => (
              <View key={i} style={s.chip}>
                <Text style={s.chipText}>{sk}</Text>
                {editMode && (
                  <MaterialCommunityIcons name="close" size={10} color={T.textHint} style={{ marginLeft: 4 }} />
                )}
              </View>
            ))}
          </View>
        </View>

        <Sep />

        {/* ── Experience ───────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel title="Experience" />
          <View style={{ gap: 16 }}>
            {EXPERIENCE.map((exp, i) => (
              <View key={i} style={s.expRow}>
                <View style={[s.expIcon, { backgroundColor: exp.color + '18' }]}>
                  <MaterialCommunityIcons name={exp.icon} size={15} color={exp.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.expRole}>{exp.role}</Text>
                  <Text style={s.expMeta}>{exp.company} · {exp.period}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Sep />

        {/* ── Education ────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel title="Education" />
          <View style={s.expRow}>
            <View style={[s.expIcon, { backgroundColor: 'rgba(168,85,247,0.12)' }]}>
              <MaterialCommunityIcons name="school-outline" size={15} color={T.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.expRole}>BS Computer Science</Text>
              <Text style={s.expMeta}>University of California · 2015 – 2019</Text>
            </View>
          </View>
        </View>

        <Sep />

        {/* ── Preferences ──────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel title="Job preferences" />
          <View style={s.chips}>
            {[
              { label: 'Remote',    icon: 'home-outline'     as const, on: true  },
              { label: 'Full-time', icon: 'briefcase-outline' as const, on: true  },
              { label: '$120k+',    icon: 'currency-usd'     as const, on: true  },
            ].map((p, i) => (
              <View key={i} style={[s.prefChip, p.on && s.prefChipOn]}>
                <MaterialCommunityIcons name={p.icon} size={13} color={p.on ? T.primary : T.textHint} />
                <Text style={[s.chipText, p.on && { color: T.primary }]}>{p.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Sep />

        {/* ── Subscription ─────────────────────────────────────────────────── */}
        <View style={[s.section, { marginBottom: 16 }]}>
          <SectionLabel title="Subscription" />
        </View>

        <FlatList<Plan>
          ref={planRef}
          data={PLANS}
          renderItem={renderPlan}
          keyExtractor={item => item.id}
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
          {PLANS.map((plan, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => { planRef.current?.scrollToIndex({ index: i, animated: true }); setActivePlan(i); }}
            >
              <View style={[s.dot, { backgroundColor: activePlan === i ? PLANS[i].color : T.border, width: activePlan === i ? 20 : 6 }]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Sign out ─────────────────────────────────────────────────────── */}
        <TouchableOpacity style={s.signOut} activeOpacity={0.8}>
          <MaterialCommunityIcons name="logout" size={14} color={T.danger} />
          <Text style={s.signOutText}>Sign out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// ─── Plan card styles ─────────────────────────────────────────────────────────
const ps = StyleSheet.create({
  card:         { borderRadius: 20, borderWidth: 1.5, padding: 18 },
  top:          { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  iconWrap:     { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  name:         { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  price:        { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  badge:        { borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:    { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  sep:          { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 14 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowText:      { fontSize: 12, color: 'rgba(255,255,255,0.6)', flex: 1 },
  cta:          { marginTop: 16, borderRadius: 22, paddingVertical: 13, alignItems: 'center' },
  ctaText:      { fontSize: 13, fontWeight: '800' },
  activePill:   { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14, justifyContent: 'center' },
  activePillText: { fontSize: 11, fontWeight: '600', color: 'rgba(168,85,247,0.6)' },
});

// ─── Main styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },

  // Hero
  hero: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20, gap: 14,
  },
  avatarWrap:     { position: 'relative' },
  avatar:         { width: 76, height: 76, borderRadius: 38 },
  avatarFallback: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#2d1b69', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 24, fontWeight: '800', color: '#fff' },
  camBadge: {
    position: 'absolute', bottom: 1, right: 1,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: T.primary, borderWidth: 2, borderColor: T.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  name:     { fontSize: 19, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  headline: { fontSize: 13, color: T.textSub, marginBottom: 4 },
  locRow:   { flexDirection: 'row', alignItems: 'center', gap: 3 },
  loc:      { fontSize: 11, color: T.textHint },
  editBtn:  {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.28)',
    borderRadius: 20, paddingHorizontal: 11, paddingVertical: 5,
    backgroundColor: 'rgba(168,85,247,0.08)',
  },
  editBtnSaving:  { borderColor: 'rgba(74,222,128,0.3)', backgroundColor: 'rgba(74,222,128,0.07)' },
  editBtnText:    { fontSize: 11, fontWeight: '700', color: T.primary },

  // Stats
  statsCard: {
    flexDirection: 'row', marginHorizontal: 24,
    backgroundColor: T.surface, borderRadius: 16,
    borderWidth: 1, borderColor: T.border, paddingVertical: 16,
  },
  stat:    { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  statLbl: { fontSize: 10, color: T.textHint, marginTop: 3, fontWeight: '500' },
  statSep: { width: 1, backgroundColor: T.border },

  // Sections
  section: { paddingHorizontal: 24 },
  aboutText: { fontSize: 14, color: T.textSub, lineHeight: 22 },

  // Photos
  photoGrid: { flexDirection: 'row', gap: 8 },
  photoSlot: {
    flex: 1, aspectRatio: 0.85, borderRadius: 14,
    backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },

  // Skills
  chips:     { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border },
  chipText:  { fontSize: 12, fontWeight: '600', color: T.textSub },
  addBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(168,85,247,0.28)', backgroundColor: 'rgba(168,85,247,0.08)' },
  addBtnText:{ fontSize: 11, fontWeight: '700', color: T.primary },

  // Preferences
  prefChip:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border },
  prefChipOn: { borderColor: 'rgba(168,85,247,0.35)', backgroundColor: 'rgba(168,85,247,0.09)' },

  // Experience
  expRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  expRole: { fontSize: 13, fontWeight: '700', color: '#fff' },
  expMeta: { fontSize: 11, color: T.textHint, marginTop: 2 },

  // Plan dots
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14, marginBottom: 8 },
  dot:     { height: 6, borderRadius: 3 },

  // Sign out
  signOut: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, marginHorizontal: 24, marginTop: 28,
    paddingVertical: 13, borderRadius: 13,
    backgroundColor: T.dangerBg, borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)',
  },
  signOutText: { fontSize: 13, fontWeight: '700', color: T.danger },
});