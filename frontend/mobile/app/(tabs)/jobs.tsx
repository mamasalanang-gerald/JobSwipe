import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { useRouter } from 'expo-router';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, TextInput, ImageBackground,
  Dimensions, NativeSyntheticEvent, NativeScrollEvent, Animated, Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import {
  BASE_CAROUSEL,
  CAROUSEL_JOBS,
  CAROUSEL_START_INDEX,
  FILTERS,
  GRID_JOBS,
  TAG_STYLES,
  filterJobs,
  type Job,
  type TagVariant,
} from '../../constants/jobs';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CARD_WIDTH = (SCREEN_WIDTH - 40 - 12) / 2;
const HERO_CARD_WIDTH = SCREEN_WIDTH - 40;
const MIN_SALARY_K = 80;
const MAX_SALARY_K = 180;

function TagPill({ label, variant }: { label: string; variant: TagVariant }) {
  const st = TAG_STYLES[variant];
  return (
    <View style={[s.tag, { backgroundColor: st.bg, borderColor: st.border }]}>
      <Text style={[s.tagText, { color: st.text }]}>{label}</Text>
    </View>
  );
}

function HeroCarouselCard({ job, onPress }: { job: Job; onPress: (job: Job) => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={{ width: HERO_CARD_WIDTH, marginRight: 12 }} onPress={() => onPress(job)}>
      <ImageBackground source={job.image} style={s.heroCard} imageStyle={s.heroCardImg}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10,5,30,0.75)', borderRadius: 24 }]} />

        <View style={s.heroTop}>
          <View style={[s.heroLogo, { backgroundColor: job.accentColor }]}>
            <Text style={s.heroLogoText}>{job.abbr}</Text>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[s.heroCompany, { color: 'rgba(255,255,255,0.6)' }]}>{job.company} - {job.location}</Text>
          <Text style={s.heroRole} numberOfLines={2}>{job.role}</Text>
          <Text style={[s.heroSalary, { color: '#c084fc' }]}>{job.salary.replace(' / yr', '')}</Text>

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
            <Text style={[s.metaText, { color: 'rgba(255,255,255,0.35)' }]}>{job.applicants} applied - {job.posted}</Text>
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

function GridCard({
  job,
  onPress,
  fullWidth = false,
}: {
  job: Job;
  saved: boolean;
  onSave: () => void;
  onPress: (job: Job) => void;
  fullWidth?: boolean;
}) {
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={() => onPress(job)} style={[s.gridCardWrap, fullWidth && s.gridCardWrapFull]}>
      <ImageBackground source={job.image} style={s.gridCard} imageStyle={[s.gridCardImg, { width: fullWidth ? HERO_CARD_WIDTH : CARD_WIDTH }]}>
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

export default function ExploreTab() {
  const T = useTheme();
  const tabBarHeight = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [savedIds, setSavedIds] = useState<number[]>([2, 5]);
  const [dotIndex, setDotIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [useKm, setUseKm] = useState(true);
  const [maxDistanceKm, setMaxDistanceKm] = useState(50);
  const [draftDistance, setDraftDistance] = useState(50);
  const [draftUseKm, setDraftUseKm] = useState(true);
  const [minSalaryK, setMinSalaryK] = useState(100);
  const [draftMinSalaryK, setDraftMinSalaryK] = useState(100);
  const [distanceTrackWidth, setDistanceTrackWidth] = useState(SCREEN_WIDTH - 40);
  const [salaryTrackWidth, setSalaryTrackWidth] = useState(SCREEN_WIDTH - 40);
  const carouselRef = useRef<ScrollView>(null);
  const isPausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rawIndexRef = useRef(CAROUSEL_START_INDEX);
  const isJumpingRef = useRef(false);
  const isAutoScrollingRef = useRef(false);
  const distanceSliderX = useRef(0);
  const salarySliderX = useRef(0);
  const settingsAnim = useRef(new Animated.Value(0)).current;

  const toggleSave = (id: number) =>
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const formatDistanceLabel = (value: number, inKm: boolean) =>
    `${value} ${inKm ? 'km' : 'mi'}`;

  const handleViewDetails = (job: Job) =>
    router.push({ pathname: '/jobs/[id]', params: { id: String(job.id) } });

  const openSettings = () => {
    setDraftDistance(maxDistanceKm);
    setDraftUseKm(useKm);
    setDraftMinSalaryK(minSalaryK);
    setSettingsOpen(true);
    Animated.spring(settingsAnim, { toValue: 1, bounciness: 3, useNativeDriver: false }).start();
  };

  const closeSettings = () => {
    Animated.timing(settingsAnim, { toValue: 0, duration: 220, useNativeDriver: false }).start(() => setSettingsOpen(false));
  };

  const applySettings = () => {
    setMaxDistanceKm(draftDistance);
    setUseKm(draftUseKm);
    setMinSalaryK(draftMinSalaryK);
    closeSettings();
  };

  const handleViewAllTopMatches = () =>
    router.push({ pathname: '/jobs/all', params: { source: 'top-matches' } });

  const handleViewAllJobs = () =>
    router.push({
      pathname: '/jobs/all',
      params: {
        source: 'explore',
        filter: activeFilter,
        search,
        distance: String(maxDistanceKm),
        salary: String(minSalaryK),
      },
    });

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

  const filteredGrid = filterJobs(GRID_JOBS, activeFilter, search, {
    maxDistanceKm,
    minSalaryK,
  });
  const draftFilteredCount = filterJobs(GRID_JOBS, activeFilter, search, {
    maxDistanceKm: draftDistance,
    minSalaryK: draftMinSalaryK,
  }).length;
  const draftDistanceLabel = formatDistanceLabel(draftDistance, draftUseKm);
  const salaryFillPct = ((draftMinSalaryK - MIN_SALARY_K) / (MAX_SALARY_K - MIN_SALARY_K)) * 100;

  const rows: [Job, Job | null][] = [];
  for (let i = 0; i < filteredGrid.length; i += 2) {
    rows.push([filteredGrid[i], filteredGrid[i + 1] ?? null]);
  }

  return (
    <View style={[s.screen, { backgroundColor: T.bg, paddingTop: topInset }]}>
      <StatusBar barStyle={T.bg === '#f5f3ff' ? 'dark-content' : 'light-content'} />

      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={[s.pageTitle, { color: T.textPrimary }]}>Discover Jobs</Text>
          <TouchableOpacity style={[s.filterBtn, { backgroundColor: T.primary }]} onPress={openSettings}>
            <MaterialCommunityIcons name="tune-variant" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.searchWrap}>
        <View style={[s.searchBar, { backgroundColor: T.surface, borderColor: T.borderFaint }]}>
          <MaterialCommunityIcons name="magnify" size={18} color={T.textHint} />
          <TextInput
            style={[s.searchInput, { color: T.textPrimary }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search roles, companies..."
            placeholderTextColor={T.textHint}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={16} color={T.textHint} />
            </TouchableOpacity>
          )}
        </View>
      </View>

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: tabBarHeight + 24 }]}
      >
        <View style={s.sectionRow}>
          <Text style={[s.sectionTitle, { color: T.textPrimary }]}>Top match for you</Text>
          <TouchableOpacity onPress={handleViewAllTopMatches}>
            <Text style={[s.viewAll, { color: T.primary }]}>View all</Text>
          </TouchableOpacity>
        </View>

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

        <View style={s.dotsRow}>
          {BASE_CAROUSEL.map((_, i) => (
            <View
              key={i}
              style={[s.dot, i === dotIndex
                ? [s.dotActive, { backgroundColor: T.primary }]
                : [s.dotInactive, { backgroundColor: T.borderFaint }]
              ]}
            />
          ))}
        </View>

        <View style={[s.sectionRow, { marginTop: 24 }]}>
          <Text style={[s.sectionTitle, { color: T.textPrimary }]}>Explore jobs</Text>
          <TouchableOpacity onPress={handleViewAllJobs}>
            <Text style={[s.viewAll, { color: T.primary }]}>View all</Text>
          </TouchableOpacity>
        </View>

        {filteredGrid.length === 0 ? (
          <View style={s.empty}>
            <MaterialCommunityIcons name="magnify-close" size={36} color={T.borderFaint} />
            <Text style={[s.emptyText, { color: T.textSub }]}>No results for "{search}"</Text>
          </View>
        ) : (
          rows.map(([left, right], ri) => (
            <View key={ri} style={s.gridRow}>
              <GridCard
                job={left}
                saved={savedIds.includes(left.id)}
                onSave={() => toggleSave(left.id)}
                onPress={handleViewDetails}
                fullWidth={!right}
              />
              {right
                ? <GridCard job={right} saved={savedIds.includes(right.id)} onSave={() => toggleSave(right.id)} onPress={handleViewDetails} />
                : null
              }
            </View>
          ))
        )}
      </ScrollView>

      {settingsOpen && (
        <TouchableOpacity style={s.settingsBackdrop} activeOpacity={1} onPress={closeSettings} />
      )}
      <Animated.View
        style={[
          s.settingsPanel,
          {
            backgroundColor: T.surface,
            paddingBottom: tabBarHeight + 16,
            transform: [{ translateY: settingsAnim.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_HEIGHT, 0] }) }],
          },
        ]}
        pointerEvents={settingsOpen ? 'box-none' : 'none'}
      >
        <View style={[s.panelHandle, { backgroundColor: T.borderFaint }]} />
        <TouchableOpacity style={[s.panelCloseBtn, { backgroundColor: T.surfaceHigh }]} onPress={closeSettings} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <MaterialCommunityIcons name="chevron-down" size={24} color={T.textSub} />
        </TouchableOpacity>

        <View style={s.settingsContent}>
          <Text style={[s.settingsTitle, { color: T.textPrimary }]}>Filters</Text>

          <View style={s.settingsSection}>
            <View style={s.settingsLabelRow}>
              <MaterialCommunityIcons name="map-marker-radius-outline" size={16} color={T.textSub} />
              <Text style={[s.settingsLabel, { color: T.textSub }]}>Max Distance</Text>
              <Text style={[s.settingsValue, { color: T.primary }]}>{draftDistanceLabel}</Text>
            </View>

            <View
              style={s.sliderWrapper}
              onLayout={(e) => setDistanceTrackWidth(e.nativeEvent.layout.width)}
              ref={(ref) => {
                if (ref) ref.measure((_x, _y, _w, _h, pageX) => { distanceSliderX.current = pageX; });
              }}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={(e) => {
                const pct = Math.max(0, Math.min(1, (e.nativeEvent.pageX - distanceSliderX.current) / distanceTrackWidth));
                setDraftDistance(Math.max(1, Math.round(pct * 100)));
              }}
              onResponderMove={(e) => {
                const pct = Math.max(0, Math.min(1, (e.nativeEvent.pageX - distanceSliderX.current) / distanceTrackWidth));
                setDraftDistance(Math.max(1, Math.round(pct * 100)));
              }}
            >
              <View style={[s.sliderTrack, { backgroundColor: T.borderFaint }]} pointerEvents="none">
                <View style={[s.sliderFill, { width: `${draftDistance}%`, backgroundColor: T.primary }]} />
              </View>
              <View style={[s.sliderThumb, { left: (draftDistance / 100) * distanceTrackWidth - 10 }]} pointerEvents="none" />
            </View>

            <View style={s.sliderLabels}>
              <Text style={[s.sliderMin, { color: T.textHint }]}>1 {draftUseKm ? 'km' : 'mi'}</Text>
              <Text style={[s.sliderMax, { color: T.textHint }]}>100 {draftUseKm ? 'km' : 'mi'}</Text>
            </View>
          </View>

          <View style={[s.settingsDivider, { backgroundColor: T.borderFaint }]} />

          <View style={s.settingsSection}>
            <View style={s.settingsLabelRow}>
              <MaterialCommunityIcons name="cash-multiple" size={16} color={T.textSub} />
              <Text style={[s.settingsLabel, { color: T.textSub }]}>Minimum Salary</Text>
              <Text style={[s.settingsValue, { color: T.primary }]}>${draftMinSalaryK}k+</Text>
            </View>

            <View
              style={s.sliderWrapper}
              onLayout={(e) => setSalaryTrackWidth(e.nativeEvent.layout.width)}
              ref={(ref) => {
                if (ref) ref.measure((_x, _y, _w, _h, pageX) => { salarySliderX.current = pageX; });
              }}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={(e) => {
                const pct = Math.max(0, Math.min(1, (e.nativeEvent.pageX - salarySliderX.current) / salaryTrackWidth));
                setDraftMinSalaryK(Math.round(MIN_SALARY_K + pct * (MAX_SALARY_K - MIN_SALARY_K)));
              }}
              onResponderMove={(e) => {
                const pct = Math.max(0, Math.min(1, (e.nativeEvent.pageX - salarySliderX.current) / salaryTrackWidth));
                setDraftMinSalaryK(Math.round(MIN_SALARY_K + pct * (MAX_SALARY_K - MIN_SALARY_K)));
              }}
            >
              <View style={[s.sliderTrack, { backgroundColor: T.borderFaint }]} pointerEvents="none">
                <View style={[s.sliderFill, { width: `${salaryFillPct}%`, backgroundColor: T.primary }]} />
              </View>
              <View style={[s.sliderThumb, { left: (salaryFillPct / 100) * salaryTrackWidth - 10 }]} pointerEvents="none" />
            </View>

            <View style={s.sliderLabels}>
              <Text style={[s.sliderMin, { color: T.textHint }]}>${MIN_SALARY_K}k</Text>
              <Text style={[s.sliderMax, { color: T.textHint }]}>${MAX_SALARY_K}k+</Text>
            </View>
          </View>

          <View style={[s.settingsDivider, { backgroundColor: T.borderFaint }]} />

          <View style={s.settingsSection}>
            <View style={s.settingsLabelRow}>
              <MaterialCommunityIcons name="map-outline" size={16} color={T.textSub} />
              <Text style={[s.settingsLabel, { color: T.textSub }]}>Distance Unit</Text>
            </View>
            <View style={s.unitToggleRow}>
              <Text style={[s.unitLabel, { color: T.textHint }, !draftUseKm && { color: T.textPrimary }]}>Miles</Text>
              <Switch
                value={draftUseKm}
                onValueChange={setDraftUseKm}
                trackColor={{ false: T.borderFaint, true: T.primary + '88' }}
                thumbColor={T.primary}
                ios_backgroundColor={T.borderFaint}
              />
              <Text style={[s.unitLabel, { color: T.textHint }, draftUseKm && { color: T.textPrimary }]}>Kilometres</Text>
            </View>
          </View>

          <View style={[s.settingsDivider, { backgroundColor: T.borderFaint }]} />

          <View style={s.settingsResultRow}>
            <MaterialCommunityIcons name="briefcase-search-outline" size={15} color={T.primary} />
            <Text style={[s.settingsResultText, { color: T.textSub }]}>
              {draftFilteredCount} job{draftFilteredCount !== 1 ? 's' : ''} within {draftDistanceLabel} and ${draftMinSalaryK}k+
            </Text>
          </View>

          <TouchableOpacity style={[s.applyFiltersBtn, { backgroundColor: T.primary }]} onPress={applySettings} activeOpacity={0.85}>
            <Text style={s.applyFiltersBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },

  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  filterBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  searchWrap: { paddingHorizontal: 20, paddingBottom: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, height: 48 },
  searchInput: { flex: 1, fontSize: 14 },

  filterScrollView: { flexGrow: 0, flexShrink: 0, height: 52 },
  filterRow: { paddingHorizontal: 20, paddingVertical: 8, gap: 8, alignItems: 'center' },
  chip: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  chipActive: {},
  chipInactive: { borderWidth: 1 },
  chipActiveText: { fontSize: 13, fontWeight: '700' },
  chipInactiveText: { fontSize: 13, fontWeight: '600' },

  scroll: { paddingHorizontal: 20, paddingTop: 4 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  viewAll: { fontSize: 13, fontWeight: '600' },

  carouselContainer: { paddingRight: 20 },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 12 },
  dot: { borderRadius: 4 },
  dotActive: { width: 20, height: 6 },
  dotInactive: { width: 6, height: 6 },

  heroCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, padding: 20, height: 280, flexDirection: 'column' },
  heroCardImg: { borderRadius: 24 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  heroLogo: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroLogoText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  heroCompany: { fontSize: 12, marginBottom: 4 },
  heroRole: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.4, marginBottom: 4 },
  heroSalary: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  heroDistanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  heroDistanceText: { fontSize: 11 },
  heroFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },

  tagRow: { flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  tagRowSingle: { flexDirection: 'row', marginTop: 6 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  tagText: { fontSize: 11, fontWeight: '700' },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11 },

  applyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 9 },
  applyBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  gridRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  gridCardWrap: { width: CARD_WIDTH },
  gridCardWrapFull: { width: '100%' },
  gridCard: { width: '100%', height: 200, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 12, justifyContent: 'space-between' },
  gridCardImg: { borderRadius: 20, width: CARD_WIDTH, height: 200, resizeMode: 'cover' },
  gridTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  gridLogo: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  gridLogoText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  gridBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 },
  gridBadgeText: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  gridRole: { fontSize: 13, fontWeight: '800', color: '#fff', lineHeight: 17, marginBottom: 3 },
  gridCompany: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },

  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },

  settingsBackdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 65, backgroundColor: 'rgba(0,0,0,0.5)' },
  settingsPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    zIndex: 70,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  panelHandle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 6 },
  panelCloseBtn: { alignSelf: 'flex-end', marginRight: 20, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  settingsContent: { paddingHorizontal: 20, paddingTop: 8 },
  settingsTitle: { fontSize: 24, fontWeight: '800', marginBottom: 20, marginTop: 8 },
  settingsSection: { marginBottom: 16 },
  settingsLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  settingsLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  settingsValue: { fontSize: 15, fontWeight: '700' },
  sliderWrapper: {
    height: 32,
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    position: 'relative',
    overflow: 'visible',
  },
  sliderFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute', top: 6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderMin: { fontSize: 12 },
  sliderMax: { fontSize: 12 },
  settingsDivider: { height: 1, marginBottom: 16 },
  unitToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  unitLabel: { fontSize: 15, fontWeight: '500' },
  settingsResultRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  settingsResultText: { fontSize: 12 },
  applyFiltersBtn: {
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 4,
  },
  applyFiltersBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
