import React, { useState, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Dimensions, FlatList, Image, TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Theme (mirrors ProfileTab exactly) ──────────────────────────────────────
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
const TECH_STACK = ['React Native', 'TypeScript', 'Node.js', 'AWS', 'PostgreSQL', 'Docker'];
const PERKS      = ['Hybrid Work', 'HMO Coverage', '14th Month', 'Stock Options', 'L&D Budget'];

type JobPost = {
  id: number; title: string; dept: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string; applicants: number; status: 'open' | 'paused';
};

type TeamMember = {
  id: number; name: string; role: string; avatar: string;
};

type Plan = {
  id: string; name: string; price: string | null;
  color: string; border: string; bg: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  badge: string | null;
  features: string[];
  locked: string[];
  cta: string | null;
};

const INITIAL_JOBS: JobPost[] = [
  { id: 1, title: 'Frontend Developer',  dept: 'Engineering', icon: 'code-braces',      color: T.primary,  applicants: 24, status: 'open' },
  { id: 2, title: 'UI/UX Designer',      dept: 'Design',      icon: 'pencil-ruler',     color: '#4ade80',  applicants: 18, status: 'open' },
  { id: 3, title: 'Backend Developer',   dept: 'Engineering', icon: 'server-outline',   color: '#60a5fa',  applicants: 11, status: 'paused' },
];

const INITIAL_TEAM: TeamMember[] = [
  { id: 1, name: 'Sofia Reyes',  role: 'HR Manager',       avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 2, name: 'Marco Cruz',   role: 'CTO',              avatar: 'https://randomuser.me/api/portraits/men/32.jpg'   },
  { id: 3, name: 'Aisha Santos', role: 'Lead Recruiter',   avatar: 'https://randomuser.me/api/portraits/women/65.jpg' },
];

const PLANS: Plan[] = [
  {
    id: 'free', name: 'Starter', price: null,
    color: T.primary, border: 'rgba(168,85,247,0.3)', bg: 'rgba(168,85,247,0.05)',
    icon: 'star-outline', badge: null,
    features: ['3 active job posts', 'Basic applicant matching'],
    locked: ['See who liked your posts', 'Priority listing', 'Analytics dashboard', 'Dedicated sourcing'],
    cta: null,
  },
  {
    id: 'growth', name: 'Growth', price: '$49 / mo',
    color: T.gold, border: 'rgba(245,158,11,0.35)', bg: 'rgba(245,158,11,0.05)',
    icon: 'lightning-bolt', badge: 'POPULAR',
    features: ['Unlimited job posts', 'Advanced matching', 'See who liked your posts', 'Priority listing'],
    locked: ['Analytics dashboard', 'Dedicated sourcing'],
    cta: 'Upgrade to Growth',
  },
  {
    id: 'enterprise', name: 'Enterprise', price: '$149 / mo',
    color: '#cbd5e1', border: 'rgba(203,213,225,0.3)', bg: 'rgba(148,163,184,0.05)',
    icon: 'diamond-stone', badge: 'BEST VALUE',
    features: ['Everything in Growth', 'Analytics dashboard', 'Dedicated sourcing agent', 'AI-powered matching'],
    locked: [],
    cta: 'Upgrade to Enterprise',
  },
];

const PLAN_W = SCREEN_W - 48;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionLabel({ title }: { title: string }) {
  return <Text style={sl.label}>{title}</Text>;
}
const sl = StyleSheet.create({
  label: {
    fontSize: 11, fontWeight: '700',
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
});

function Sep() {
  return (
    <View style={{
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.06)',
      marginVertical: 28,
      marginHorizontal: 24,
    }} />
  );
}

// ─── CompanyProfileScreen ─────────────────────────────────────────────────────
export default function CompanyProfileScreen() {
  const tabBarHeight      = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();

  const [editMode, setEditMode]         = useState(false);
  const [logoPhoto, setLogoPhoto]       = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto]     = useState<string | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<(string | null)[]>([null, null, null]);
  const [activePlan, setActivePlan]     = useState(0);
  const planRef = useRef<FlatList<Plan>>(null);

  const [jobs, setJobs]   = useState<JobPost[]>(INITIAL_JOBS);
  const [team, setTeam]   = useState<TeamMember[]>(INITIAL_TEAM);

  const [showAddJob, setShowAddJob]   = useState(false);
  const [showAddPerk, setShowAddPerk] = useState(false);
  const [perks, setPerks]             = useState<string[]>(PERKS);
  const [newPerk, setNewPerk]         = useState('');
  const [newJob, setNewJob]           = useState({ title: '', dept: '' });

  const JOB_COLORS: string[] = [T.primary, '#4ade80', '#60a5fa', '#f472b6', '#fb923c'];
  const JOB_ICONS: React.ComponentProps<typeof MaterialCommunityIcons>['name'][] = [
    'code-braces', 'pencil-ruler', 'server-outline', 'chart-line', 'account-group-outline',
  ];

  const addJob = () => {
    if (!newJob.title.trim()) return;
    const idx = jobs.length % JOB_COLORS.length;
    setJobs(prev => [...prev, {
      id: Date.now(), title: newJob.title, dept: newJob.dept || 'General',
      icon: JOB_ICONS[idx], color: JOB_COLORS[idx], applicants: 0, status: 'open',
    }]);
    setNewJob({ title: '', dept: '' });
    setShowAddJob(false);
  };

  const addPerk = () => {
    if (!newPerk.trim()) return;
    setPerks(prev => [...prev, newPerk.trim()]);
    setNewPerk('');
    setShowAddPerk(false);
  };

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
            <Text style={[ps.ctaText, { color: item.id === 'enterprise' ? '#0f172a' : '#fff' }]}>
              {item.cta}
            </Text>
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 40 }}
      >

        {/* ── Hero (cover + logo) ───────────────────────────────────────── */}
        <TouchableOpacity onPress={pickCover} activeOpacity={0.85} style={s.coverWrap}>
          {coverPhoto
            ? <Image source={{ uri: coverPhoto }} style={s.coverImg} resizeMode="cover" />
            : <View style={s.coverFallback}>
                <MaterialCommunityIcons name="image-plus" size={22} color="rgba(168,85,247,0.4)" />
                <Text style={s.coverHint}>Tap to add cover photo</Text>
              </View>
          }
          <View style={s.coverScrim} />
        </TouchableOpacity>

        <View style={s.heroRow}>
          <TouchableOpacity onPress={pickLogo} activeOpacity={0.85} style={s.logoWrap}>
            {logoPhoto
              ? <Image source={{ uri: logoPhoto }} style={s.logoImg} />
              : <View style={s.logoFallback}>
                  <Text style={s.logoInitials}>AC</Text>
                </View>
            }
            <View style={s.camBadge}>
              <MaterialCommunityIcons name="camera" size={10} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1, paddingLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <Text style={s.companyName}>Accenture PH</Text>
              <MaterialCommunityIcons name="check-decagram" size={15} color={T.primary} />
            </View>
            <Text style={s.industry}>Technology · Consulting</Text>
            <View style={s.locRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={11} color={T.textHint} />
              <Text style={s.loc}>BGC, Taguig, Philippines</Text>
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

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <View style={s.statsCard}>
          {[
            { label: 'Active Jobs',   value: `${jobs.filter(j => j.status === 'open').length}` },
            { label: 'Applicants',    value: `${jobs.reduce((a, j) => a + j.applicants, 0)}` },
            { label: 'Matches',       value: '12' },
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

        {/* ── About ─────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel title="About Us" />
          <Text style={s.aboutText}>
            A global professional services company with leading capabilities in digital, cloud and
            security. We help organisations grow, work efficiently and build lasting trust.
          </Text>
        </View>

        <Sep />

        {/* ── Gallery ───────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel title="Office Photos" />
          <View style={s.photoGrid}>
            {galleryPhotos.map((uri, i) => (
              <TouchableOpacity key={i} style={s.photoSlot} onPress={() => pickGallery(i)} activeOpacity={0.8}>
                {uri
                  ? <Image source={{ uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                  : <MaterialCommunityIcons name="plus" size={22} color={T.textHint} />
                }
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Sep />

        {/* ── Tech Stack ────────────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionLabel title="Tech Stack" />
            {editMode && (
              <TouchableOpacity style={s.addBtn}>
                <MaterialCommunityIcons name="plus" size={12} color={T.primary} />
                <Text style={s.addBtnText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={s.skillSegment}>
            <View style={s.skillSegmentHeader}>
              <MaterialCommunityIcons name="code-braces" size={13} color={T.primary} />
              <Text style={s.skillSegmentLabel}>Technologies We Use</Text>
            </View>
            <View style={s.chips}>
              {TECH_STACK.map((sk, i) => (
                <View key={i} style={[s.chip, s.chipHard]}>
                  <Text style={[s.chipText, { color: T.primary }]}>{sk}</Text>
                  {editMode && (
                    <MaterialCommunityIcons name="close" size={10} color={T.primary} style={{ marginLeft: 4 }} />
                  )}
                </View>
              ))}
            </View>
          </View>

          <View style={s.skillDivider} />

          {/* Perks */}
          <View style={s.skillSegment}>
            <View style={[s.skillSegmentHeader, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialCommunityIcons name="gift-outline" size={13} color="#4ade80" />
                <Text style={[s.skillSegmentLabel, { color: '#4ade80' }]}>Perks & Benefits</Text>
              </View>
              {editMode && (
                <TouchableOpacity style={[s.addBtn, { borderColor: 'rgba(74,222,128,0.3)', backgroundColor: 'rgba(74,222,128,0.07)' }]} onPress={() => setShowAddPerk(v => !v)}>
                  <MaterialCommunityIcons name={showAddPerk ? 'minus' : 'plus'} size={12} color="#4ade80" />
                  <Text style={[s.addBtnText, { color: '#4ade80' }]}>{showAddPerk ? 'Cancel' : 'Add'}</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={s.chips}>
              {perks.map((p, i) => (
                <View key={i} style={[s.chip, s.chipSoft]}>
                  <Text style={[s.chipText, { color: '#4ade80' }]}>{p}</Text>
                  {editMode && (
                    <TouchableOpacity onPress={() => setPerks(prev => prev.filter((_, idx) => idx !== i))} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} style={{ marginLeft: 4 }}>
                      <MaterialCommunityIcons name="close" size={10} color="#4ade80" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
            {editMode && showAddPerk && (
              <View style={[s.addForm, { marginTop: 12 }]}>
                <TextInput
                  style={s.addInput}
                  placeholder="e.g. Remote Work, Free Meals, Gym…"
                  placeholderTextColor={T.textHint}
                  value={newPerk}
                  onChangeText={setNewPerk}
                />
                <TouchableOpacity style={s.addConfirmBtn} onPress={addPerk}>
                  <Text style={s.addConfirmText}>Add Perk</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <Sep />

        {/* ── Active Job Posts ───────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionLabel title="Active Job Posts" />
            {editMode && (
              <TouchableOpacity style={s.addBtn} onPress={() => setShowAddJob(v => !v)}>
                <MaterialCommunityIcons name={showAddJob ? 'minus' : 'plus'} size={12} color={T.primary} />
                <Text style={s.addBtnText}>{showAddJob ? 'Cancel' : 'Add'}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ gap: 16 }}>
            {jobs.map((job) => (
              <View key={job.id} style={s.expRow}>
                <View style={[s.expIcon, { backgroundColor: job.color + '18' }]}>
                  <MaterialCommunityIcons name={job.icon} size={15} color={job.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.expRole}>{job.title}</Text>
                  <Text style={s.expMeta}>{job.dept} · {job.applicants} applicants</Text>
                </View>
                <View style={[
                  s.statusTag,
                  job.status === 'open'
                    ? s.statusTagOpen
                    : s.statusTagPaused,
                ]}>
                  <Text style={[
                    s.statusTagText,
                    job.status === 'open'
                      ? { color: '#4ade80' }
                      : { color: T.textHint },
                  ]}>
                    {job.status === 'open' ? 'Open' : 'Paused'}
                  </Text>
                </View>
                {editMode && (
                  <TouchableOpacity
                    onPress={() => setJobs(prev => prev.filter(j => j.id !== job.id))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ marginLeft: 6 }}
                  >
                    <MaterialCommunityIcons name="close-circle" size={18} color={T.danger} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
          {editMode && showAddJob && (
            <View style={s.addForm}>
              <TextInput
                style={s.addInput}
                placeholder="Job Title"
                placeholderTextColor={T.textHint}
                value={newJob.title}
                onChangeText={t => setNewJob(p => ({ ...p, title: t }))}
              />
              <TextInput
                style={s.addInput}
                placeholder="Department (e.g. Engineering, Design)"
                placeholderTextColor={T.textHint}
                value={newJob.dept}
                onChangeText={t => setNewJob(p => ({ ...p, dept: t }))}
              />
              <TouchableOpacity style={s.addConfirmBtn} onPress={addJob}>
                <Text style={s.addConfirmText}>Post Job</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Sep />

        {/* ── Hiring Team ───────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel title="Hiring Team" />
          <View style={{ gap: 16 }}>
            {team.map((member) => (
              <View key={member.id} style={s.expRow}>
                <Image source={{ uri: member.avatar }} style={s.teamAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={s.expRole}>{member.name}</Text>
                  <Text style={s.expMeta}>{member.role}</Text>
                </View>
                {editMode && (
                  <TouchableOpacity
                    onPress={() => setTeam(prev => prev.filter(m => m.id !== member.id))}
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

        {/* ── Subscription ──────────────────────────────────────────────── */}
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
              onPress={() => {
                planRef.current?.scrollToIndex({ index: i, animated: true });
                setActivePlan(i);
              }}
            >
              <View style={[
                s.dot,
                {
                  backgroundColor: activePlan === i ? PLANS[i].color : T.border,
                  width: activePlan === i ? 20 : 6,
                },
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Sign out ──────────────────────────────────────────────────── */}
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
  card:          { borderRadius: 20, borderWidth: 1.5, padding: 18 },
  top:           { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  iconWrap:      { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  name:          { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  price:         { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  badge:         { borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:     { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  sep:           { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 14 },
  row:           { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowText:       { fontSize: 12, color: 'rgba(255,255,255,0.6)', flex: 1 },
  cta:           { marginTop: 16, borderRadius: 22, paddingVertical: 13, alignItems: 'center' },
  ctaText:       { fontSize: 13, fontWeight: '800' },
  activePill:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14, justifyContent: 'center' },
  activePillText:{ fontSize: 11, fontWeight: '600', color: 'rgba(168,85,247,0.6)' },
});

// ─── Main styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },

  // Cover
  coverWrap: {
    width: '100%', height: 130,
    backgroundColor: T.surfaceHigh,
    position: 'relative', overflow: 'hidden',
  },
  coverImg:     { width: '100%', height: '100%' },
  coverFallback:{
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#16102a', gap: 6,
  },
  coverHint:    { fontSize: 11, color: 'rgba(168,85,247,0.45)' },
  coverScrim:   {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
    backgroundColor: 'rgba(15,10,30,0.6)',
  },

  // Hero row
  heroRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 20, paddingBottom: 20,
    marginTop: -38,
  },
  logoWrap:     { position: 'relative' },
  logoImg:      { width: 76, height: 76, borderRadius: 20, borderWidth: 3, borderColor: T.bg },
  logoFallback: {
    width: 76, height: 76, borderRadius: 20,
    backgroundColor: '#2d1b69', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: T.bg,
  },
  logoInitials: { fontSize: 22, fontWeight: '800', color: '#fff' },
  camBadge: {
    position: 'absolute', bottom: 1, right: 1,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: T.primary, borderWidth: 2, borderColor: T.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  companyName: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  industry:    { fontSize: 12, color: T.textSub, marginBottom: 3 },
  locRow:      { flexDirection: 'row', alignItems: 'center', gap: 3 },
  loc:         { fontSize: 11, color: T.textHint },

  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.28)',
    borderRadius: 20, paddingHorizontal: 11, paddingVertical: 5,
    backgroundColor: 'rgba(168,85,247,0.08)',
    alignSelf: 'flex-end', marginBottom: 4,
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
  section:   { paddingHorizontal: 24 },
  aboutText: { fontSize: 14, color: T.textSub, lineHeight: 22 },

  // Photos
  photoGrid: { flexDirection: 'row', gap: 8 },
  photoSlot: {
    flex: 1, aspectRatio: 0.85, borderRadius: 14,
    backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },

  // Skills / chips
  chips:              { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip:               { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border },
  chipHard:           { borderColor: 'rgba(168,85,247,0.35)', backgroundColor: 'rgba(168,85,247,0.09)' },
  chipSoft:           { borderColor: 'rgba(74,222,128,0.3)',  backgroundColor: 'rgba(74,222,128,0.07)' },
  chipText:           { fontSize: 12, fontWeight: '600', color: T.textSub },
  addBtn:             { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(168,85,247,0.28)', backgroundColor: 'rgba(168,85,247,0.08)' },
  addBtnText:         { fontSize: 11, fontWeight: '700', color: T.primary },
  skillSegment:       { gap: 10 },
  skillSegmentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  skillSegmentLabel:  { fontSize: 11, fontWeight: '700', color: T.primary, letterSpacing: 0.4 },
  skillDivider:       { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 14 },

  // Job posts & team rows
  expRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expIcon:    { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  expRole:    { fontSize: 13, fontWeight: '700', color: '#fff' },
  expMeta:    { fontSize: 11, color: T.textHint, marginTop: 2 },
  teamAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: T.border },

  statusTag:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusTagOpen:   { backgroundColor: 'rgba(74,222,128,0.1)'  },
  statusTagPaused: { backgroundColor: 'rgba(255,255,255,0.06)' },
  statusTagText:   { fontSize: 10, fontWeight: '700' },

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

  // Add forms
  addForm: {
    marginTop: 16, padding: 14, borderRadius: 14,
    backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border, gap: 10,
  },
  addInput: {
    backgroundColor: T.surface, borderRadius: 10, borderWidth: 1, borderColor: T.border,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, color: T.textPrimary,
  },
  addConfirmBtn:  { backgroundColor: T.primary, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  addConfirmText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});