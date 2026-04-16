import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { useRouter } from 'expo-router';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, TextInput, ImageBackground,
  Dimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme'; // ← centralized theme

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH      = (SCREEN_WIDTH - 40 - 12) / 2;
const HERO_CARD_WIDTH = SCREEN_WIDTH - 40;

// ─── Types & data ─────────────────────────────────────────────────────────────
type TagVariant = 'remote' | 'full' | 'hybrid' | 'contract' | 'onsite';

// Tag styles that look good on both dark image overlays — kept static.
const TAG_STYLES: Record<TagVariant, { bg: string; text: string; border: string }> = {
  remote:   { bg: 'rgba(168,85,247,0.22)', text: '#d8b4fe', border: 'rgba(168,85,247,0.35)' },
  full:     { bg: 'rgba(34,197,94,0.18)',  text: '#86efac', border: 'rgba(34,197,94,0.28)'  },
  hybrid:   { bg: 'rgba(56,189,248,0.18)', text: '#7dd3fc', border: 'rgba(56,189,248,0.28)' },
  contract: { bg: 'rgba(251,191,36,0.18)', text: '#fde68a', border: 'rgba(251,191,36,0.28)' },
  onsite:   { bg: 'rgba(251,113,133,0.18)',text: '#fda4af', border: 'rgba(251,113,133,0.28)'},
};

const FILTERS = ['All', 'Remote', 'Hybrid', 'On-site', 'Startup', 'Enterprise'];

const JOBS = [
  {
    id: 1, abbr: 'TF', company: 'TechFlow Inc', role: 'Sr. React Native Engineer',
    salary: '$120k – $150k', location: 'San Francisco · Remote',
    tags: [
      { label: 'Remote',    variant: 'remote' as TagVariant },
      { label: 'Full-time', variant: 'full'   as TagVariant },
    ],
    match: 92, posted: '2h ago', applicants: 34,
    accentColor: '#a855f7',
    distanceKm: 3.9,
    image: require('../assets/images/accenture.jpg') as any,
  },
  {
    id: 2, abbr: 'DS', company: 'DataStream', role: 'ML Engineer',
    salary: '$140k – $180k', location: 'Boston · On-site',
    tags: [
      { label: 'On-site',   variant: 'onsite' as TagVariant },
      { label: 'Full-time', variant: 'full'   as TagVariant },
    ],
    match: 85, posted: '1d ago', applicants: 22,
    accentColor: '#1e40af',
    distanceKm: 8.2,
    image: require('../assets/images/socia.png') as any,
  },
  {
    id: 3, abbr: 'IL', company: 'InnovateLabs', role: 'Product Designer',
    salary: '$100k – $130k', location: 'New York · Hybrid',
    tags: [
      { label: 'Hybrid',    variant: 'hybrid' as TagVariant },
      { label: 'Full-time', variant: 'full'   as TagVariant },
    ],
    match: 78, posted: '5h ago', applicants: 61,
    accentColor: '#9f1239',
    distanceKm: 15.4,
    image: require('../assets/images/alorica.jpg') as any,
  },
  {
    id: 4, abbr: 'CP', company: 'CloudPeak', role: 'Backend Engineer',
    salary: '$110k – $140k', location: 'Austin · Remote',
    tags: [
      { label: 'Remote',   variant: 'remote'   as TagVariant },
      { label: 'Contract', variant: 'contract' as TagVariant },
    ],
    match: 88, posted: '3h ago', applicants: 15,
    accentColor: '#166534',
    distanceKm: 20.1,
    image: require('../assets/images/accenture2.jpg') as any,
  },
  {
    id: 5, abbr: 'NA', company: 'Nexus AI', role: 'AI Product Manager',
    salary: '$130k – $160k', location: 'Seattle · Hybrid',
    tags: [
      { label: 'Hybrid',    variant: 'hybrid' as TagVariant },
      { label: 'Full-time', variant: 'full'   as TagVariant },
    ],
    match: 74, posted: '2d ago', applicants: 89,
    accentColor: '#7c3aed',
    distanceKm: 32.7,
    image: require('../assets/images/socia2.jpg') as any,
  },
  {
    id: 6, abbr: 'PW', company: 'Pixel Works', role: 'iOS Engineer',
    salary: '$115k – $145k', location: 'Los Angeles · Remote',
    tags: [
      { label: 'Remote',    variant: 'remote' as TagVariant },
      { label: 'Full-time', variant: 'full'   as TagVariant },
    ],
    match: 81, posted: '6h ago', applicants: 44,
    accentColor: '#be185d',
    distanceKm: 44.0,
    image: require('../assets/images/alorica2.jpg') as any,
  },
];

const BASE_CAROUSEL    = JOBS.slice(0, 5);
const CAROUSEL_JOBS    = [BASE_CAROUSEL[BASE_CAROUSEL.length - 1], ...BASE_CAROUSEL, BASE_CAROUSEL[0]];
const CAROUSEL_START_INDEX = 1;
const GRID_JOBS        = JOBS.slice(1);

type Job = typeof JOBS[number];

// ─── Tag pill ─────────────────────────────────────────────────────────────────
function TagPill({ label, variant }: { label: string; variant: TagVariant }) {
  const st = TAG_STYLES[variant];
  return (
    <View style={[s.tag, { backgroundColor: st.bg, borderColor: st.border }]}>
      <Text style={[s.tagText, { color: st.text }]}>{label}</Text>
    </View>
  );
}

// ─── Hero Carousel Card ───────────────────────────────────────────────────────
function HeroCarouselCard({ job, onPress }: { job: Job; onPress: (job: Job) => void }) {
  const T = useTheme();
  return (
    <TouchableOpacity activeOpacity={0.9} style={{ width: HERO_CARD_WIDTH, marginRight: 12 }} onPress={() => onPress(job)}>
      <ImageBackground source={job.image} style={[s.heroCard, { borderColor: T.border }]} imageStyle={s.heroCardImg}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10,5,30,0.75)', borderRadius: 24 }]} />

        <View style={s.heroTop}>
          <View style={[s.heroLogo, { backgroundColor: job.accentColor }]}>
            <Text style={s.heroLogoText}>{job.abbr}</Text>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[s.heroCompany, { color: 'rgba(255,255,255,0.6)' }]}>{job.company} · {job.location}</Text>
          <Text style={s.heroRole} numberOfLines={2}>{job.role}</Text>
          <Text style={[s.heroSalary, { color: '#c084fc' }]}>{job.salary}</Text>

          <View style={s.heroDistanceRow}>
            <MaterialCommunityIcons name="map-marker-distance" size={12} color="rgba(255,255,255,0.35)" />
            <Text style={[s.heroDistanceText, { color: 'rgba(255,255,255,0.35)' }]}>{job.distanceKm.toFixed(1)} km away</Text>
          </View>

          <View style={s.tagRow}>
            {job.tags.map(t => <TagPill key={t.label} label={t.label} variant={t.variant} />)}
          </View>
        </View>

        <View style={s.heroFooter}>
          <View style={s.metaRow}>
            <MaterialCommunityIcons name="account-group-outline" size={12} color="rgba(255,255,255,0.35)" />
            <Text style={[s.metaText, { color: 'rgba(255,255,255,0.35)' }]}>{job.applicants} applied · {job.posted}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.85} style={[s.applyBtn, { backgroundColor: job.accentColor }]} onPress={() => onPress(job)}>
            <Text style={s.applyBtnText}>View Details</Text>
            <MaterialCommunityIcons name="arrow-right" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

// ─── Grid card ────────────────────────────────────────────────────────────────
function GridCard({ job, saved, onSave, onPress }: { job: Job; saved: boolean; onSave: () => void; onPress: (job: Job) => void }) {
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={() => onPress(job)} style={{ width: CARD_WIDTH }}>
      <ImageBackground source={job.image} style={[s.gridCard, { width: '100%' }]} imageStyle={s.gridCardImg}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10,5,30,0.78)', borderRadius: 20 }]} />

        <View style={s.gridTop}>
          <View style={[s.gridLogo, { backgroundColor: job.accentColor }]}>
            <Text style={s.gridLogoText}>{job.abbr}</Text>
          </View>
          <View style={s.gridBadge}>
            <MaterialCommunityIcons name="account-group-outline" size={9} color="rgba(255,255,255,0.65)" />
            <Text style={s.gridBadgeText}>{job.applicants}</Text>
          </View>
        </View>

        {/* Bottom content */}
        <View>
          <Text style={s.gridRole} numberOfLines={2}>{job.role}</Text>
          <Text style={s.gridCompany} numberOfLines={1}>{job.company}</Text>
          <View style={s.tagRowSingle}>
            <TagPill label={job.tags[0].label} variant={job.tags[0].variant} />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

// ─── ExploreTab ───────────────────────────────────────────────────────────────
export default function ExploreTab() {
  const T            = useTheme();                     // ← live theme tokens
  const tabBarHeight = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch]             = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [savedIds, setSavedIds]         = useState<number[]>([2, 5]);
  const [dotIndex, setDotIndex]         = useState(0);
  const carouselRef        = useRef<ScrollView>(null);
  const isPausedRef        = useRef(false);
  const timerRef           = useRef<ReturnType<typeof setInterval> | null>(null);
  const rawIndexRef        = useRef(CAROUSEL_START_INDEX);
  const isJumpingRef       = useRef(false);
  const isAutoScrollingRef = useRef(false);

  const toggleSave = (id: number) =>
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleViewDetails = (job: Job) =>
    router.push({ pathname: '/jobs/[id]', params: { id: String(job.id) } });

  const jumpTo = (rawIdx: number) => {
    isJumpingRef.current = true;
    carouselRef.current?.scrollTo({ x: rawIdx * (HERO_CARD_WIDTH + 12), animated: false });
    rawIndexRef.current = rawIdx;
    setTimeout(() => { isJumpingRef.current = false; }, 50);
  };

  const handleCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isJumpingRef.current || isAutoScrollingRef.current) return;
    const x = e.nativeEvent.contentOffset.x;
    const rawIdx = Math.round(x / (HERO_CARD_WIDTH + 12));
    rawIndexRef.current = rawIdx;
    if (rawIdx === 0 || rawIdx === CAROUSEL_JOBS.length - 1) return;
    setDotIndex(rawIdx - 1);
  };

  const handleScrollEndDrag = () => {
    isPausedRef.current = false;
    const raw = rawIndexRef.current;
    if (raw === 0) { jumpTo(BASE_CAROUSEL.length); setDotIndex(BASE_CAROUSEL.length - 1); }
    else if (raw === CAROUSEL_JOBS.length - 1) { jumpTo(1); setDotIndex(0); }
    startAutoScroll();
  };

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const raw = Math.round(x / (HERO_CARD_WIDTH + 12));
    rawIndexRef.current = raw;
    if (raw === 0) { jumpTo(BASE_CAROUSEL.length); setDotIndex(BASE_CAROUSEL.length - 1); }
    else if (raw === CAROUSEL_JOBS.length - 1) { jumpTo(1); setDotIndex(0); }
  };

  const startAutoScroll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      const nextRaw = rawIndexRef.current + 1;
      isAutoScrollingRef.current = true;
      carouselRef.current?.scrollTo({ x: nextRaw * (HERO_CARD_WIDTH + 12), animated: true });
      rawIndexRef.current = nextRaw;
      if (nextRaw === CAROUSEL_JOBS.length - 1) {
        setTimeout(() => { jumpTo(1); setDotIndex(0); isAutoScrollingRef.current = false; }, 420);
      } else {
        setDotIndex(nextRaw - 1);
        setTimeout(() => { isAutoScrollingRef.current = false; }, 350);
      }
    }, 3000);
  }, []);

  useEffect(() => {
    carouselRef.current?.scrollTo({ x: CAROUSEL_START_INDEX * (HERO_CARD_WIDTH + 12), animated: false });
    startAutoScroll();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startAutoScroll]);

  const handleScrollBeginDrag = () => { isPausedRef.current = true; };

  const filteredGrid = GRID_JOBS.filter(j => {
    const matchesFilter =
      activeFilter === 'All' ||
      j.tags.some(t => t.label === activeFilter) ||
      j.location.includes(activeFilter);
    const matchesSearch =
      j.role.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const rows: [Job, Job | null][] = [];
  for (let i = 0; i < filteredGrid.length; i += 2) {
    rows.push([filteredGrid[i], filteredGrid[i + 1] ?? null]);
  }

  return (
    <View style={[s.screen, { backgroundColor: T.bg, paddingTop: topInset }]}>
      <StatusBar barStyle={T.bg === '#f5f3ff' ? 'dark-content' : 'light-content'} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={[s.pageTitle, { color: T.textPrimary }]}>Discover Jobs</Text>
          <TouchableOpacity style={[s.filterBtn, { backgroundColor: T.primary }]}>
            <MaterialCommunityIcons name="tune-variant" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <View style={[s.searchBar, { backgroundColor: T.surface, borderColor: T.borderFaint }]}>
          <MaterialCommunityIcons name="magnify" size={18} color={T.textHint} />
          <TextInput
            style={[s.searchInput, { color: T.textPrimary }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search roles, companies…"
            placeholderTextColor={T.textHint}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={16} color={T.textHint} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
        style={s.filterScrollView}
      >
        {FILTERS.map(f => f === activeFilter ? (
          <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} activeOpacity={0.8}
            style={[s.chip, s.chipActive, { backgroundColor: T.primary }]}>
            <Text style={[s.chipActiveText, { color: '#fff' }]}>{f}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} activeOpacity={0.75}
            style={[s.chip, s.chipInactive, { backgroundColor: T.surface, borderColor: T.borderFaint }]}>
            <Text style={[s.chipInactiveText, { color: T.textSub }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main scroll */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: tabBarHeight + 24 }]}
      >
        <View style={s.sectionRow}>
          <Text style={[s.sectionTitle, { color: T.textPrimary }]}>Top match for you</Text>
          <TouchableOpacity><Text style={[s.viewAll, { color: T.primary }]}>View all</Text></TouchableOpacity>
        </View>

        {/* Carousel */}
        <ScrollView
          ref={carouselRef}
          horizontal
          pagingEnabled={false}
          decelerationRate="fast"
          snapToInterval={HERO_CARD_WIDTH + 12}
          snapToAlignment="start"
          showsHorizontalScrollIndicator={false}
          onScroll={handleCarouselScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          contentContainerStyle={s.carouselContainer}
        >
          {CAROUSEL_JOBS.map((job, i) => (
            <HeroCarouselCard key={`carousel-${i}`} job={job} onPress={handleViewDetails} />
          ))}
        </ScrollView>

        {/* Dots */}
        <View style={s.dotsRow}>
          {BASE_CAROUSEL.map((_, i) => (
            <View
              key={i}
              style={[s.dot, i === dotIndex
                ? [s.dotActive,   { backgroundColor: T.primary }]
                : [s.dotInactive, { backgroundColor: T.borderFaint }]
              ]}
            />
          ))}
        </View>

        {/* Grid */}
        <View style={[s.sectionRow, { marginTop: 24 }]}>
          <Text style={[s.sectionTitle, { color: T.textPrimary }]}>Explore categories</Text>
          <TouchableOpacity><Text style={[s.viewAll, { color: T.primary }]}>View all</Text></TouchableOpacity>
        </View>

        {filteredGrid.length === 0 ? (
          <View style={s.empty}>
            <MaterialCommunityIcons name="magnify-close" size={36} color={T.borderFaint} />
            <Text style={[s.emptyText, { color: T.textSub }]}>No results for "{search}"</Text>
          </View>
        ) : (
          rows.map(([left, right], ri) => (
            <View key={ri} style={s.gridRow}>
              <GridCard job={left} saved={savedIds.includes(left.id)} onSave={() => toggleSave(left.id)} onPress={handleViewDetails} />
              {right
                ? <GridCard job={right} saved={savedIds.includes(right.id)} onSave={() => toggleSave(right.id)} onPress={handleViewDetails} />
                : <View style={[s.gridCard, { opacity: 0 }]} />
              }
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── Structural styles (no colours) ──────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1 },

  header:    { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  filterBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  searchWrap: { paddingHorizontal: 20, paddingBottom: 12 },
  searchBar:  { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, height: 48 },
  searchInput:{ flex: 1, fontSize: 14 },

  filterScrollView: { flexGrow: 0, flexShrink: 0, height: 52 },
  filterRow:  { paddingHorizontal: 20, paddingVertical: 8, gap: 8, alignItems: 'center' },
  chip:       { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  chipActive:      {},
  chipInactive:    { borderWidth: 1 },
  chipActiveText:  { fontSize: 13, fontWeight: '700' },
  chipInactiveText:{ fontSize: 13, fontWeight: '600' },

  scroll:     { paddingHorizontal: 20, paddingTop: 4 },

  sectionRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  viewAll:      { fontSize: 13, fontWeight: '600' },

  carouselContainer: { paddingRight: 20 },

  dotsRow:    { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 12 },
  dot:        { borderRadius: 4 },
  dotActive:  { width: 20, height: 6 },
  dotInactive:{ width: 6,  height: 6 },

  heroCard:      { borderRadius: 24, overflow: 'hidden', borderWidth: 1, padding: 20, height: 280, flexDirection: 'column' },
  heroCardImg:   { borderRadius: 24 },
  heroTop:       { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  heroLogo:      { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroLogoText:  { fontSize: 15, fontWeight: '800', color: '#fff' },
  heroCompany:   { fontSize: 12, marginBottom: 4 },
  heroRole:      { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.4, marginBottom: 4 },
  heroSalary:    { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  heroDistanceRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  heroDistanceText: { fontSize: 11 },
  heroFooter:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },

  tagRow:      { flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  tagRowSingle:{ flexDirection: 'row', marginTop: 6 },
  tag:         { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  tagText:     { fontSize: 11, fontWeight: '700' },

  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11 },

  applyBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 9 },
  applyBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  gridRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  gridCard:    { height: 200, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 12, justifyContent: 'space-between' },
  gridCardImg: { borderRadius: 20 },
  gridTop:     { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  gridLogo:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  gridLogoText:{ fontSize: 11, fontWeight: '800', color: '#fff' },
  gridBadge:   { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 },
  gridBadgeText:{ fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  gridRole:    { fontSize: 13, fontWeight: '800', color: '#fff', lineHeight: 17, marginBottom: 3 },
  gridCompany: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },

  empty:     { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
});