import React, { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { LinearGradient } from 'expo-linear-gradient';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  LayoutChangeEvent,
  Switch,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  SwipeLabel,
  TagBadge,
  PrimaryButton,
  Colors,
  Typography,
  Spacing,
  Radii,
  Shadows,
} from '../../components/ui';

const { width: SW, height: SH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SW * 0.28;
const ACTIONS_HEIGHT  = 80;
const PANEL_HEIGHT    = SH * 0.62;

// ── Mock applicant cards ──────────────────────────────────────────────────────
const APPLICANTS = [
  {
    id: 1,
    name: 'Maria Santos',
    avatarColor: Colors.primary,
    rating: 4.8,
    role: 'Frontend Developer',
    experience: '3 years experience',
    location: 'Quezon City, PH · Open to Remote',
    tags: [
      { label: 'React Native', variant: 'primary' as const },
      { label: 'TypeScript',   variant: 'success' as const },
      { label: 'Open to Work', variant: 'warning' as const },
    ],
    bio: 'Passionate mobile developer with 3 years of experience building consumer-facing apps. Shipped 5 apps with 100k+ downloads. Loves clean code and pixel-perfect UI.',
    matchPercent: 94,
    photos: [
      { uri: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { uri: 'https://randomuser.me/api/portraits/women/45.jpg' },
      { uri: 'https://randomuser.me/api/portraits/women/46.jpg' },
    ],
    hardSkills: ['React Native', 'TypeScript', 'Node.js', 'REST APIs', 'Git'],
    softSkills: ['Communication', 'Team Player', 'Detail-Oriented', 'Proactive'],
    distanceKm: 3.5,
    reviews: [
      {
        company: 'Accenture PH', role: 'Project Manager', initial: 'A', color: '#6366F1',
        rating: 5, date: 'Mar 2024',
        text: 'Maria was an exceptional contractor. Delivered pixel-perfect UI ahead of schedule and communicated proactively throughout.',
      },
      {
        company: 'Lalamove PH', role: 'Tech Lead', initial: 'L', color: '#F59E0B',
        rating: 4, date: 'Nov 2023',
        text: 'Great collaborator and quick learner. Adapted fast to our codebase and shipped quality work with minimal supervision.',
      },
    ],
  },
  {
    id: 2,
    name: 'Juan dela Cruz',
    avatarColor: Colors.warning,
    rating: 4.5,
    role: 'UI/UX Designer',
    experience: '2 years experience',
    location: 'Makati, PH · Hybrid',
    tags: [
      { label: 'Figma',     variant: 'primary' as const },
      { label: 'Adobe XD',  variant: 'success' as const },
      { label: 'Available', variant: 'neutral' as const },
    ],
    bio: 'Creative designer who lives at the intersection of aesthetics and usability. Led design for 3 SaaS products. Passionate about design systems and accessibility.',
    matchPercent: 81,
    photos: [
      { uri: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { uri: 'https://randomuser.me/api/portraits/men/33.jpg' },
      { uri: 'https://randomuser.me/api/portraits/men/34.jpg' },
    ],
    hardSkills: ['Figma', 'Adobe XD', 'Prototyping', 'Design Systems', 'Accessibility'],
    softSkills: ['Creativity', 'Empathy', 'Critical Thinking', 'Collaboration'],
    distanceKm: 9.1,
    reviews: [
      {
        company: 'Globe Telecom', role: 'Design Director', initial: 'G', color: '#10B981',
        rating: 5, date: 'Jan 2024',
        text: 'Juan brought a fresh perspective to our design system. His work on accessibility was outstanding.',
      },
      {
        company: 'Voyager Innovations', role: 'Product Owner', initial: 'V', color: '#8B5CF6',
        rating: 4, date: 'Sep 2023',
        text: 'Very talented designer. Occasionally needed direction on scope but always delivered polished, thoughtful work.',
      },
    ],
  },
  {
    id: 3,
    name: 'Ana Reyes',
    avatarColor: Colors.success,
    rating: 4.9,
    role: 'Backend Developer',
    experience: '5 years experience',
    location: 'Pasig, PH · On-site',
    tags: [
      { label: 'Python',     variant: 'warning' as const },
      { label: 'Django',     variant: 'success' as const },
      { label: 'PostgreSQL', variant: 'neutral' as const },
    ],
    bio: 'Senior backend engineer who builds scalable and reliable systems. Designed APIs serving 10M+ requests/day. Strong focus on performance, security, and clean architecture.',
    matchPercent: 88,
    photos: [
      { uri: 'https://randomuser.me/api/portraits/women/68.jpg' },
      { uri: 'https://randomuser.me/api/portraits/women/69.jpg' },
      { uri: 'https://randomuser.me/api/portraits/women/70.jpg' },
    ],
    hardSkills: ['Python', 'Django', 'PostgreSQL', 'AWS', 'Docker'],
    softSkills: ['Problem Solving', 'Analytical', 'Self-Motivated', 'Adaptability'],
    distanceKm: 22.0,
    reviews: [
      {
        company: 'Mynt (GCash)', role: 'Engineering Manager', initial: 'M', color: '#3B82F6',
        rating: 5, date: 'Feb 2024',
        text: 'Ana is one of the best backend engineers we have worked with. Clean, well-documented APIs built to scale.',
      },
      {
        company: 'PayMongo', role: 'CTO', initial: 'P', color: '#EF4444',
        rating: 5, date: 'Aug 2023',
        text: 'Exceptional engineer. Ana refactored our entire payment pipeline and cut response times by 40%.',
      },
    ],
  },
] as const;

// ── Report reasons ────────────────────────────────────────────────────────────
const REPORT_REASONS = [
  { id: 'fake',        icon: 'account-alert-outline',   label: 'Fake or misleading profile'   },
  { id: 'spam',        icon: 'email-alert-outline',      label: 'Spam or scam activity'        },
  { id: 'harassment',  icon: 'hand-back-left-off-outline', label: 'Harassment or threats'      },
  { id: 'copyright',   icon: 'file-document-alert-outline', label: 'Copyright infringement'   },
  { id: 'other',       icon: 'dots-horizontal-circle-outline', label: 'Other reason'           },
] as const;

type ReportReason = typeof REPORT_REASONS[number]['id'];
type ModalType = 'report' | 'block' | 'report_confirm' | 'block_confirm' | null;

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <MaterialCommunityIcons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={13}
          color={i <= rating ? Colors.warning : 'rgba(255,255,255,0.25)'}
        />
      ))}
    </View>
  );
}

function SkillChip({ label, variant }: { label: string; variant: 'hard' | 'soft' }) {
  const isHard = variant === 'hard';
  return (
    <View style={[s.skillChip, isHard ? s.skillChipHard : s.skillChipSoft]}>
      <MaterialCommunityIcons
        name={isHard ? 'code-braces' : 'account-heart-outline'}
        size={11}
        color={isHard ? '#818CF8' : '#34D399'}
        style={{ marginRight: 4 }}
      />
      <Text style={[s.skillChipText, isHard ? s.skillChipTextHard : s.skillChipTextSoft]}>
        {label}
      </Text>
    </View>
  );
}

export default function CompanyHomeTab() {
  const navigation = useNavigation();
  const tabBarHeight      = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();

  const actionsBottom = tabBarHeight + 20;
  const overlayBottom = actionsBottom + ACTIONS_HEIGHT + 8;

  const [index, setIndex]           = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [timerKey, setTimerKey]     = useState(0);
  const [liked, setLiked]           = useState<number[]>([]);
  const [expanded, setExpanded]     = useState(false);
  const [history, setHistory]       = useState<{ id: number; dir: number }[]>([]);
  const [cardSize, setCardSize]     = useState({ width: SW, height: SH });

  // ── Report / Block modal state ─────────────────────────────────────────────
  const [modalType, setModalType]           = useState<ModalType>(null);
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [blockedIds, setBlockedIds]         = useState<number[]>([]);

  const openReport = () => { setSelectedReason(null); setModalType('report'); };
  const openBlock  = () => setModalType('block');

  const submitReport = () => {
    if (!selectedReason) return;
    setModalType('report_confirm');
  };

  const submitBlock = () => {
    setBlockedIds(prev => [...prev, filteredApplicants[index].id]);
    setModalType('block_confirm');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedReason(null);
  };

  const afterConfirm = () => {
    closeModal();
    // Skip to next card
    collapsePanel();
    position.setValue({ x: 0, y: 0 });
    setPhotoIndex(0);
    setIndex(i => i + 1);
  };

  // ── Settings ──────────────────────────────────────────────────────────────
  const [settingsOpen, setSettingsOpen]         = useState(false);
  const [useKm, setUseKm]                       = useState(true);
  const [maxDistanceKm, setMaxDistanceKm]       = useState(50);
  const [draftDistance, setDraftDistance]       = useState(50);
  const [draftUseKm, setDraftUseKm]             = useState(true);
  const [sliderTrackWidth, setSliderTrackWidth] = useState(SW - 40);
  const sliderWrapperX  = useRef(0);
  const settingsAnim    = useRef(new Animated.Value(0)).current;
  const settingsOpenRef = useRef(false);

  const openSettings = () => {
    settingsOpenRef.current = true;
    setDraftDistance(maxDistanceKm);
    setDraftUseKm(useKm);
    setSettingsOpen(true);
    Animated.spring(settingsAnim, { toValue: 1, bounciness: 3, useNativeDriver: false }).start();
  };
  const closeSettings = () => {
    settingsOpenRef.current = false;
    Animated.timing(settingsAnim, { toValue: 0, duration: 220, useNativeDriver: false }).start(
      () => setSettingsOpen(false)
    );
  };
  const applySettings = () => {
    setMaxDistanceKm(draftDistance);
    setUseKm(draftUseKm);
    setIndex(0);
    setPhotoIndex(0);
    closeSettings();
  };

  const formatDistance = (km: number) =>
    useKm ? `${km.toFixed(1)} km away` : `${(km * 0.621371).toFixed(1)} mi away`;

  const draftLabel         = draftUseKm ? `${draftDistance} km` : `${(draftDistance * 0.621371).toFixed(0)} mi`;
  const draftFilteredCount = APPLICANTS.filter(a => a.distanceKm <= draftDistance).length;
  const filteredApplicants = APPLICANTS.filter(
    a => a.distanceKm <= maxDistanceKm && !blockedIds.includes(a.id)
  );

  const position       = useRef(new Animated.ValueXY()).current;
  const expandAnim     = useRef(new Animated.Value(0)).current;
  const progressAnim   = useRef(new Animated.Value(0)).current;
  const photoScrollRef = useRef<ScrollView>(null);

  const TIMER_DURATION   = 5000;
  const isDraggingRef    = useRef(false);
  const pausedElapsedRef = useRef(0);

  useEffect(() => {
    const total = filteredApplicants[index]?.photos.length ?? 1;
    if (total <= 1) return;

    let accumulatedMs = pausedElapsedRef.current;
    let lastTick      = Date.now();

    const id = setInterval(() => {
      const now = Date.now();
      if (!isDraggingRef.current) accumulatedMs += now - lastTick;
      lastTick = now;
      progressAnim.setValue(Math.min(accumulatedMs / TIMER_DURATION, 1));

      if (accumulatedMs >= TIMER_DURATION) {
        pausedElapsedRef.current = 0;
        clearInterval(id);
        progressAnim.setValue(0);
        setPhotoIndex(p => {
          const isLast = p === total - 1;
          const next   = isLast ? 0 : p + 1;
          if (isLast) {
            photoScrollRef.current?.scrollTo({ x: total * cardSize.width, animated: true });
            setTimeout(() => photoScrollRef.current?.scrollTo({ x: 0, animated: false }), 400);
          } else {
            photoScrollRef.current?.scrollTo({ x: next * cardSize.width, animated: true });
          }
          return next;
        });
        setTimerKey(k => k + 1);
      }
    }, 100);

    return () => clearInterval(id);
  }, [index, cardSize.width, timerKey, filteredApplicants.length]);

  const onRootLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setCardSize({ width, height });
  };

  const likeOpacity        = position.x.interpolate({ inputRange: [0, 80],               outputRange: [0, 1],       extrapolate: 'clamp' });
  const nopeOpacity        = position.x.interpolate({ inputRange: [-80, 0],              outputRange: [1, 0],       extrapolate: 'clamp' });
  const rotate             = position.x.interpolate({ inputRange: [-SW, 0, SW],          outputRange: ['-18deg', '0deg', '18deg'] });
  const likeOverlayOpacity = position.x.interpolate({ inputRange: [0, SWIPE_THRESHOLD],  outputRange: [0, 0.45],    extrapolate: 'clamp' });
  const nopeOverlayOpacity = position.x.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [0.45, 0],    extrapolate: 'clamp' });
  const nextCardScale      = position.x.interpolate({ inputRange: [-SW, 0, SW],          outputRange: [1, 0.93, 1], extrapolate: 'clamp' });
  const panelTranslateY    = expandAnim.interpolate({ inputRange: [0, 1],                outputRange: [PANEL_HEIGHT, 0] });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_e, { dx, dy }) =>
        !expanded && !settingsOpenRef.current && Math.abs(dx) > Math.abs(dy),
      onMoveShouldSetPanResponder: (_e, { dx, dy }) =>
        !expanded && !settingsOpenRef.current && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5,
      onPanResponderGrant: () => { isDraggingRef.current = true; },
      onPanResponderMove: (_e, { dx, dy }) => {
        isDraggingRef.current = true;
        position.setValue({ x: dx, y: dy * 0.25 });
      },
      onPanResponderRelease: (_e, { dx, vx }) => {
        isDraggingRef.current = false;
        if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(vx) > 0.6) {
          pausedElapsedRef.current = 0;
          commitSwipe(dx > 0 ? 1 : -1);
        } else {
          resetCard();
        }
      },
    })
  ).current;

  const commitSwipe = (dir: number) => {
    collapsePanel();
    Animated.timing(position, {
      toValue: { x: dir * SW * 1.5, y: 0 },
      duration: 280,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      if (dir > 0) setLiked(prev => [...prev, filteredApplicants[index].id]);
      setHistory(prev => [...prev, { id: filteredApplicants[index].id, dir }]);
      setPhotoIndex(0);
      setIndex(i => i + 1);
    });
  };

  const resetCard = () =>
    Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();

  const collapsePanel = () => {
    setExpanded(false);
    Animated.timing(expandAnim, { toValue: 0, duration: 250, useNativeDriver: false }).start();
  };

  const openPanel = () => {
    setExpanded(true);
    Animated.spring(expandAnim, { toValue: 1, bounciness: 3, useNativeDriver: false }).start();
  };

  const handleImageTap = (evt: any) => {
    if (expanded) return;
    const x     = evt.nativeEvent.locationX;
    const total = filteredApplicants[index].photos.length;
    if (x < SW * 0.35 || x > SW * 0.65) {
      setPhotoIndex(p => {
        const next = x < SW * 0.35
          ? (p === 0 ? total - 1 : p - 1)
          : (p === total - 1 ? 0 : p + 1);
        photoScrollRef.current?.scrollTo({ x: next * cardSize.width, animated: true });
        return next;
      });
      setTimerKey(k => k + 1);
      pausedElapsedRef.current = 0;
    }
  };

  // ── Settings panel content ────────────────────────────────────────────────
  const SettingsPanelContent = () => (
    <View style={s.settingsContent}>
      <Text style={s.settingsTitle}>Filters</Text>

      <View style={s.settingsSection}>
        <View style={s.settingsLabelRow}>
          <MaterialCommunityIcons name="map-marker-radius-outline" size={16} color="rgba(255,255,255,0.6)" />
          <Text style={s.settingsLabel}>Max Distance</Text>
          <Text style={s.settingsValue}>{draftLabel}</Text>
        </View>
        <View
          style={s.sliderWrapper}
          onLayout={e => setSliderTrackWidth(e.nativeEvent.layout.width)}
          ref={ref => { if (ref) ref.measure((_x, _y, _w, _h, pageX) => { sliderWrapperX.current = pageX; }); }}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={e => {
            const pct = Math.max(0, Math.min(1, (e.nativeEvent.pageX - sliderWrapperX.current) / sliderTrackWidth));
            setDraftDistance(Math.max(1, Math.round(pct * 100)));
          }}
          onResponderMove={e => {
            const pct = Math.max(0, Math.min(1, (e.nativeEvent.pageX - sliderWrapperX.current) / sliderTrackWidth));
            setDraftDistance(Math.max(1, Math.round(pct * 100)));
          }}
        >
          <View style={s.sliderTrack} pointerEvents="none">
            <View style={[s.sliderFill, { width: `${draftDistance}%` }]} />
          </View>
          <View style={[s.sliderThumb, { left: (draftDistance / 100) * sliderTrackWidth - 10 }]} pointerEvents="none" />
        </View>
        <View style={s.sliderLabels}>
          <Text style={s.sliderMin}>1 {draftUseKm ? 'km' : 'mi'}</Text>
          <Text style={s.sliderMax}>100 {draftUseKm ? 'km' : 'mi'}</Text>
        </View>
      </View>

      <View style={s.divider} />

      <View style={s.settingsSection}>
        <View style={s.settingsLabelRow}>
          <MaterialCommunityIcons name="map-outline" size={16} color="rgba(255,255,255,0.6)" />
          <Text style={s.settingsLabel}>Distance Unit</Text>
        </View>
        <View style={s.unitToggleRow}>
          <Text style={[s.unitLabel, !draftUseKm && s.unitLabelActive]}>Miles</Text>
          <Switch
            value={draftUseKm}
            onValueChange={setDraftUseKm}
            trackColor={{ false: 'rgba(255,255,255,0.15)', true: Colors.primary }}
            thumbColor={Colors.white}
            ios_backgroundColor="rgba(255,255,255,0.15)"
          />
          <Text style={[s.unitLabel, draftUseKm && s.unitLabelActive]}>Kilometres</Text>
        </View>
      </View>

      <View style={s.divider} />

      <View style={s.settingsResultRow}>
        <MaterialCommunityIcons name="briefcase-search-outline" size={15} color={Colors.primary} />
        <Text style={s.settingsResultText}>
          {draftFilteredCount} applicant{draftFilteredCount !== 1 ? 's' : ''} within {draftLabel}
        </Text>
      </View>
      <TouchableOpacity style={s.applyBtn} onPress={applySettings} activeOpacity={0.85}>
        <Text style={s.applyBtnText}>Apply Filters</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Empty: no applicants in range ─────────────────────────────────────────
  if (filteredApplicants.length === 0) {
    return (
      <View style={s.emptyScreen}>
        <StatusBar barStyle="dark-content" />
        <View style={s.emptyIconWrap}>
          <MaterialCommunityIcons name="map-marker-off-outline" size={40} color={Colors.primary} />
        </View>
        <Text style={s.emptyTitle}>No applicants nearby</Text>
        <Text style={s.emptySub}>
          There are no candidates within your current distance. Try increasing the range in filters.
        </Text>
        <TouchableOpacity style={s.refreshBtn} onPress={openSettings} activeOpacity={0.85}>
          <Text style={s.refreshBtnText}>Adjust filters</Text>
        </TouchableOpacity>
        {settingsOpen && (
          <TouchableOpacity style={s.settingsBackdrop} activeOpacity={1} onPress={closeSettings} />
        )}
        <Animated.View
          style={[s.settingsPanel, {
            paddingBottom: tabBarHeight + 16,
            transform: [{ translateY: settingsAnim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }],
          }]}
          pointerEvents={settingsOpen ? 'box-none' : 'none'}
        >
          <View style={s.panelHandle} />
          <TouchableOpacity style={s.panelCloseBtn} onPress={closeSettings} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <MaterialCommunityIcons name="chevron-down" size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
          <SettingsPanelContent />
        </Animated.View>
      </View>
    );
  }

  // ── All swiped ────────────────────────────────────────────────────────────
  if (index >= filteredApplicants.length) {
    return (
      <View style={s.emptyScreen}>
        <StatusBar barStyle="dark-content" />
        <View style={s.emptyIconWrap}>
          <MaterialCommunityIcons name="account-search-outline" size={40} color={Colors.primary} />
        </View>
        <Text style={s.emptyTitle}>No more applicants!</Text>
        <Text style={s.emptySub}>New candidates apply daily — check back soon.</Text>
        <TouchableOpacity
          style={s.refreshBtn}
          onPress={() => { setIndex(0); setLiked([]); setHistory([]); setPhotoIndex(0); }}
        >
          <Text style={s.refreshBtnText}>Refresh deck</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const applicant     = filteredApplicants[index];
  const nextApplicant = filteredApplicants[index + 1];

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <View style={s.screen} onLayout={onRootLayout}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Layer 0: next card ── */}
      {nextApplicant ? (
        <Animated.View
          style={[StyleSheet.absoluteFill, { transform: [{ scale: nextCardScale }] }]}
          pointerEvents="none"
        >
          <Image
            source={nextApplicant.photos[0]}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            fadeDuration={0}
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />
        </Animated.View>
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} pointerEvents="none" />
      )}

      {/* ── Layer 1: swipeable card ── */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFill}
          onPress={handleImageTap}
          onPressIn={() => { isDraggingRef.current = true; }}
          onPressOut={() => { isDraggingRef.current = false; }}
        >
          <ScrollView
            ref={photoScrollRef}
            horizontal
            pagingEnabled
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            style={StyleSheet.absoluteFill}
            onMomentumScrollEnd={e => {
              const offsetX = e.nativeEvent.contentOffset.x;
              const total   = applicant.photos.length;
              if (offsetX >= total * cardSize.width) {
                photoScrollRef.current?.scrollTo({ x: 0, animated: false });
                setPhotoIndex(0);
              }
            }}
          >
            {applicant.photos.map((p, i) => (
              <Image
                key={i}
                source={p}
                style={{ width: cardSize.width, height: cardSize.height }}
                resizeMode="cover"
                fadeDuration={0}
              />
            ))}
            <Image
              source={applicant.photos[0]}
              style={{ width: cardSize.width, height: cardSize.height }}
              resizeMode="cover"
              fadeDuration={0}
            />
          </ScrollView>
        </TouchableOpacity>

        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: '#10B981', opacity: likeOverlayOpacity, zIndex: 5 }]}
          pointerEvents="none"
        />
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: '#EF4444', opacity: nopeOverlayOpacity, zIndex: 5 }]}
          pointerEvents="none"
        />

        <Animated.View style={[s.stampWrap, { opacity: likeOpacity }]} pointerEvents="none">
          <SwipeLabel type="like" visible />
        </Animated.View>
        <Animated.View style={[s.stampWrap, { opacity: nopeOpacity }]} pointerEvents="none">
          <SwipeLabel type="pass" visible />
        </Animated.View>

        <LinearGradient
          colors={['rgba(15,10,30,1)', 'rgba(15,10,30,0.85)', 'rgba(15,10,30,0.3)', 'transparent']}
          style={[StyleSheet.absoluteFill, { bottom: '75%', zIndex: 3 }]}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', 'rgba(15,10,30,0.3)', 'rgba(15,10,30,0.85)', 'rgba(15,10,30,1)']}
          style={[StyleSheet.absoluteFill, { top: '70%', zIndex: 3 }]}
          pointerEvents="none"
        />

        <View
          style={[
            s.topBar,
            { paddingTop: topInset > 0 ? topInset + 8 : (Platform.OS === 'ios' ? 54 : 40) },
          ]}
          pointerEvents="box-none"
        >
          <View style={s.tabRow}>
            <TouchableOpacity style={s.iconPill} onPress={openSettings}>
              <MaterialCommunityIcons name="tune-variant" size={19} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconPill} onPress={() => navigation.navigate('subscription' as never)}>
              <MaterialCommunityIcons name="lightning-bolt" size={19} color="#A78BFA" />
            </TouchableOpacity>
          </View>
          <View style={s.dotsRow}>
            {applicant.photos.map((_, i) => (
              <View key={i} style={s.dot}>
                {i === photoIndex ? (
                  <Animated.View
                    style={[s.dotFill, {
                      width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    }]}
                  />
                ) : (
                  <View style={[s.dotFill, { width: i < photoIndex ? '100%' : '0%' }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={[s.bottomOverlay, { bottom: overlayBottom }]} pointerEvents="box-none">
          <View style={s.nameRow}>
            <View style={{ flex: 1 }}>
              <View style={s.nameRowInner}>
                <Text style={s.nameText}>{applicant.name}</Text>
                <MaterialCommunityIcons name="check-decagram" size={22} color="#60A5FA" style={{ marginTop: 2 }} />
              </View>
              <Text style={s.experienceText}>{applicant.experience}</Text>
              <View style={s.distanceRow}>
                <MaterialCommunityIcons name="map-marker-distance" size={13} color="rgba(255,255,255,0.65)" />
                <Text style={s.distanceText}>{formatDistance(applicant.distanceKm)}</Text>
              </View>
            </View>
            {!expanded && (
              <TouchableOpacity
                style={s.expandBtn}
                onPress={openPanel}
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              >
                <MaterialCommunityIcons name="chevron-up" size={22} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>
          <View style={s.applyingRow}>
            <MaterialCommunityIcons name="briefcase-outline" size={14} color="rgba(255,255,255,0.75)" />
            <Text style={s.applyingLabel}>Applying for</Text>
          </View>
          <Text style={s.roleText}>{applicant.role}</Text>
        </View>
      </Animated.View>

      {/* ── Layer 2: action buttons ── */}
      <View style={[s.actionsRow, { bottom: actionsBottom }]}>
        <TouchableOpacity style={s.btnNope} onPress={() => commitSwipe(-1)} activeOpacity={0.8}>
          <MaterialCommunityIcons name="close" size={32} color={Colors.white} />
        </TouchableOpacity>
        <PrimaryButton icon="heart" iconSize={32} onPress={() => commitSwipe(1)} style={s.btnHeart} />
      </View>

      {/* ── Layer 3: expand detail panel ── */}
      <Animated.View
        style={[s.expandPanel, { height: PANEL_HEIGHT, transform: [{ translateY: panelTranslateY }] }]}
        pointerEvents={expanded ? 'box-none' : 'none'}
      >
        <View style={s.panelHandle} />
        <TouchableOpacity
          style={s.panelCloseBtn}
          onPress={collapsePanel}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <MaterialCommunityIcons name="chevron-down" size={24} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[s.expandContent, { paddingBottom: tabBarHeight + 32 }]}
          showsVerticalScrollIndicator={false}
          bounces
          overScrollMode="always"
        >
          <Text style={s.exName}>{applicant.name}</Text>
          <Text style={s.exRole}>{applicant.role}</Text>

          <View style={s.exRow}>
            <MaterialCommunityIcons name="map-marker-distance" size={14} color="rgba(255,255,255,0.5)" />
            <Text style={s.exMuted}>{formatDistance(applicant.distanceKm)}</Text>
          </View>
          <View style={s.exRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={13} color="rgba(255,255,255,0.6)" />
            <Text style={s.exMuted}>{applicant.location}</Text>
          </View>

          <View style={s.exTags}>
            {applicant.tags.map((tag, i) => <TagBadge key={i} label={tag.label} variant={tag.variant} />)}
          </View>

          <View style={s.divider} />
          <Text style={s.exSectionTitle}>About Me</Text>
          <Text style={s.exDesc}>{applicant.bio}</Text>

          <View style={s.divider} />
          <View style={s.skillHeader}>
            <View style={s.skillIcon}>
              <MaterialCommunityIcons name="code-braces" size={13} color="#818CF8" />
            </View>
            <Text style={s.exSectionTitle}>Hard Skills</Text>
          </View>
          <View style={s.chipRow}>
            {applicant.hardSkills.map((skill, i) => <SkillChip key={i} label={skill} variant="hard" />)}
          </View>

          <View style={s.divider} />
          <View style={s.skillHeader}>
            <View style={[s.skillIcon, s.skillIconSoft]}>
              <MaterialCommunityIcons name="account-heart-outline" size={13} color="#34D399" />
            </View>
            <Text style={s.exSectionTitle}>Soft Skills</Text>
          </View>
          <View style={s.chipRow}>
            {applicant.softSkills.map((skill, i) => <SkillChip key={i} label={skill} variant="soft" />)}
          </View>

          <View style={s.divider} />
          <Text style={s.exSectionTitle}>Applicant Rating</Text>
          <View style={s.ratingRow}>
            <MaterialCommunityIcons name="star" size={22} color={Colors.warning} />
            <Text style={s.ratingScore}>{applicant.rating}</Text>
            <Text style={s.ratingLabel}>/ 5.0 · Profile score</Text>
          </View>

          <View style={s.divider} />
          <Text style={s.exSectionTitle}>Company Reviews</Text>
          {applicant.reviews.map((review, i) => (
            <View key={i} style={s.reviewCard}>
              <View style={s.reviewHeader}>
                <View style={[s.reviewAvatar, { backgroundColor: review.color }]}>
                  <Text style={s.reviewAvatarText}>{review.initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.reviewName}>{review.company}</Text>
                  <Text style={s.reviewRoleTxt}>{review.role}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 3 }}>
                  <StarRow rating={review.rating} />
                  <Text style={s.reviewDate}>{review.date}</Text>
                </View>
              </View>
              <Text style={s.reviewText}>{review.text}</Text>
            </View>
          ))}

          {/* ── View all reviews (premium) ── */}
          <TouchableOpacity style={s.viewAllRow} activeOpacity={0.85}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <MaterialCommunityIcons name="lock-outline" size={16} color={Colors.warning} />
              <Text style={s.viewAllText}>View all reviews</Text>
            </View>
            <View style={s.premiumBadge}>
              <MaterialCommunityIcons name="lightning-bolt" size={13} color="#000" />
              <Text style={s.premiumBadgeText}>Premium</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          {/* ── Report & Block ───────────────────────────────────────────── */}
          <View style={s.divider} />
          <Text style={s.exSectionTitle}>Safety</Text>
          <View style={s.safetyRow}>

            <TouchableOpacity style={s.safetyBtn} onPress={openReport} activeOpacity={0.8}>
              <View style={s.safetyIconWrap}>
                <MaterialCommunityIcons name="flag-outline" size={16} color={Colors.warning} />
              </View>
              <Text style={s.safetyBtnText}>Report</Text>
              <Text style={s.safetyBtnSub}>Flag this profile</Text>
            </TouchableOpacity>

            <View style={s.safetySep} />

            <TouchableOpacity style={s.safetyBtn} onPress={openBlock} activeOpacity={0.8}>
              <View style={[s.safetyIconWrap, s.safetyIconDanger]}>
                <MaterialCommunityIcons name="account-cancel-outline" size={16} color="#f87171" />
              </View>
              <Text style={[s.safetyBtnText, { color: '#f87171' }]}>Block</Text>
              <Text style={s.safetyBtnSub}>Hide this user</Text>
            </TouchableOpacity>

          </View>

        </ScrollView>
      </Animated.View>

      {expanded && (
        <TouchableOpacity style={s.panelBackdrop} activeOpacity={1} onPress={collapsePanel} />
      )}

      {/* Settings panel */}
      {settingsOpen && (
        <TouchableOpacity style={s.settingsBackdrop} activeOpacity={1} onPress={closeSettings} />
      )}
      <Animated.View
        style={[s.settingsPanel, {
          paddingBottom: tabBarHeight + 16,
          transform: [{ translateY: settingsAnim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }],
        }]}
        pointerEvents={settingsOpen ? 'box-none' : 'none'}
      >
        <View style={s.panelHandle} />
        <TouchableOpacity style={s.panelCloseBtn} onPress={closeSettings} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <MaterialCommunityIcons name="chevron-down" size={24} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <SettingsPanelContent />
      </Animated.View>

      {/* ── Report Modal ─────────────────────────────────────────────────── */}
      <Modal visible={modalType === 'report'} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={m.backdrop}>
          <View style={m.sheet}>
            <View style={m.sheetHandle} />

            <View style={m.sheetHeader}>
              <View style={[m.sheetIconWrap, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                <MaterialCommunityIcons name="flag-outline" size={22} color={Colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={m.sheetTitle}>Report Profile</Text>
                <Text style={m.sheetSub}>Select a reason for reporting {applicant.name}</Text>
              </View>
              <TouchableOpacity onPress={closeModal} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <MaterialCommunityIcons name="close" size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>

            <View style={m.reasonList}>
              {REPORT_REASONS.map(reason => {
                const active = selectedReason === reason.id;
                return (
                  <TouchableOpacity
                    key={reason.id}
                    style={[m.reasonRow, active && m.reasonRowActive]}
                    onPress={() => setSelectedReason(reason.id as ReportReason)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name={reason.icon as any}
                      size={18}
                      color={active ? Colors.warning : 'rgba(255,255,255,0.5)'}
                    />
                    <Text style={[m.reasonText, active && m.reasonTextActive]}>
                      {reason.label}
                    </Text>
                    <View style={[m.radioOuter, active && m.radioOuterActive]}>
                      {active && <View style={m.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[m.confirmBtn, !selectedReason && m.confirmBtnDisabled]}
              onPress={submitReport}
              activeOpacity={0.85}
              disabled={!selectedReason}
            >
              <MaterialCommunityIcons name="flag" size={15} color="#000" />
              <Text style={m.confirmBtnText}>Submit Report</Text>
            </TouchableOpacity>

            <TouchableOpacity style={m.cancelBtn} onPress={closeModal} activeOpacity={0.7}>
              <Text style={m.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Report Confirm Modal ─────────────────────────────────────────── */}
      <Modal visible={modalType === 'report_confirm'} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={m.backdrop}>
          <View style={[m.sheet, { alignItems: 'center', paddingVertical: 32 }]}>
            <View style={[m.sheetIconWrap, { backgroundColor: 'rgba(245,158,11,0.12)', width: 64, height: 64, borderRadius: 32, marginBottom: 16 }]}>
              <MaterialCommunityIcons name="check-circle-outline" size={32} color={Colors.warning} />
            </View>
            <Text style={[m.sheetTitle, { textAlign: 'center', marginBottom: 8 }]}>Report Submitted</Text>
            <Text style={[m.sheetSub, { textAlign: 'center', marginBottom: 28, paddingHorizontal: 16 }]}>
              Thank you for keeping JobSwipe safe. We'll review {applicant.name}'s profile within 24 hours.
            </Text>
            <TouchableOpacity style={[m.confirmBtn, { width: '100%' }]} onPress={afterConfirm} activeOpacity={0.85}>
              <Text style={m.confirmBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Block Modal ──────────────────────────────────────────────────── */}
      <Modal visible={modalType === 'block'} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={m.backdrop}>
          <View style={m.sheet}>
            <View style={m.sheetHandle} />

            <View style={m.sheetHeader}>
              <View style={[m.sheetIconWrap, { backgroundColor: 'rgba(248,113,113,0.12)' }]}>
                <MaterialCommunityIcons name="account-cancel-outline" size={22} color="#f87171" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={m.sheetTitle}>Block User</Text>
                <Text style={m.sheetSub}>Block {applicant.name}?</Text>
              </View>
              <TouchableOpacity onPress={closeModal} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <MaterialCommunityIcons name="close" size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>

            {/* What blocking does */}
            <View style={m.blockInfoCard}>
              {[
                { icon: 'eye-off-outline',            text: 'They will no longer appear in your swipe deck' },
                { icon: 'message-off-outline',        text: 'Any existing messages will be hidden'          },
                { icon: 'account-off-outline',        text: 'They won\'t be able to see your company profile' },
              ].map((item, i) => (
                <View key={i} style={m.blockInfoRow}>
                  <MaterialCommunityIcons name={item.icon as any} size={15} color="#f87171" />
                  <Text style={m.blockInfoText}>{item.text}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={[m.confirmBtn, m.confirmBtnDanger]} onPress={submitBlock} activeOpacity={0.85}>
              <MaterialCommunityIcons name="account-cancel" size={15} color="#fff" />
              <Text style={[m.confirmBtnText, { color: '#fff' }]}>Yes, Block User</Text>
            </TouchableOpacity>

            <TouchableOpacity style={m.cancelBtn} onPress={closeModal} activeOpacity={0.7}>
              <Text style={m.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Block Confirm Modal ──────────────────────────────────────────── */}
      <Modal visible={modalType === 'block_confirm'} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={m.backdrop}>
          <View style={[m.sheet, { alignItems: 'center', paddingVertical: 32 }]}>
            <View style={[m.sheetIconWrap, { backgroundColor: 'rgba(248,113,113,0.12)', width: 64, height: 64, borderRadius: 32, marginBottom: 16 }]}>
              <MaterialCommunityIcons name="account-cancel" size={32} color="#f87171" />
            </View>
            <Text style={[m.sheetTitle, { textAlign: 'center', marginBottom: 8 }]}>User Blocked</Text>
            <Text style={[m.sheetSub, { textAlign: 'center', marginBottom: 28, paddingHorizontal: 16 }]}>
              {applicant.name} has been blocked and will no longer appear in your deck.
            </Text>
            <TouchableOpacity style={[m.confirmBtn, m.confirmBtnDanger, { width: '100%' }]} onPress={afterConfirm} activeOpacity={0.85}>
              <Text style={[m.confirmBtnText, { color: '#fff' }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  stampWrap: { position: 'absolute', top: 90, zIndex: 20, alignSelf: 'center' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: Spacing['4'], zIndex: 10,
  },
  tabRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing['3'],
  },
  iconPill: {
    width: 38, height: 38, borderRadius: Radii.full,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  dotsRow: { flexDirection: 'row', gap: 5, paddingHorizontal: Spacing['1'] },
  dot:     { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' },
  dotFill: { height: '100%', borderRadius: 2, backgroundColor: Colors.white },
  bottomOverlay: {
    position: 'absolute', left: 0, right: 0,
    paddingHorizontal: Spacing['5'], zIndex: 10,
  },
  nameRow:      { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 },
  nameRowInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nameText: {
    fontSize: 34, fontWeight: Typography.bold, color: Colors.white, letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10,
  },
  experienceText: {
    fontSize: Typography.md, fontWeight: Typography.semibold, color: 'rgba(255,255,255,0.95)',
    marginTop: 3,
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },
  distanceRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  distanceText: {
    fontSize: Typography.sm, color: 'rgba(255,255,255,0.7)',
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  expandBtn: {
    width: 40, height: 40, borderRadius: Radii.full,
    backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  applyingRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: Spacing['3'], marginBottom: 3 },
  applyingLabel: {
    fontSize: Typography.base, color: 'rgba(255,255,255,0.9)', fontWeight: Typography.medium,
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },
  roleText: {
    fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
  actionsRow: {
    position: 'absolute', left: 0, right: 0, zIndex: 40,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing['5'],
  },
  btnNope: {
    width: 70, height: 70, backgroundColor: '#EF4444', borderRadius: Radii.full,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8,
  },
  btnHeart: {
    width: 70, height: 70, backgroundColor: Colors.success, borderRadius: Radii.full,
    ...Shadows.colored(Colors.success),
  },
  expandPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 60,
    backgroundColor: 'rgba(10,10,14,0.97)',
    borderTopLeftRadius: 22, borderTopRightRadius: 22, overflow: 'hidden',
  },
  panelBackdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 55 },
  panelHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.22)',
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  panelCloseBtn: {
    position: 'absolute', top: 10, right: Spacing['4'], zIndex: 70,
    width: 36, height: 36, borderRadius: Radii.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  expandContent: { paddingHorizontal: Spacing['5'], paddingTop: Spacing['3'] },
  exName:        { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.white, marginBottom: 4 },
  exRole:        { fontSize: Typography.lg, fontWeight: Typography.semibold, color: '#818CF8', marginBottom: Spacing['2'] },
  exRow:         { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing['2'] },
  exMuted:       { fontSize: Typography.base, color: 'rgba(255,255,255,0.55)' },
  exTags:        { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'], marginTop: Spacing['1'], marginBottom: Spacing['3'] },
  exSectionTitle:{ fontSize: Typography.sm, fontWeight: Typography.semibold, color: 'rgba(255,255,255,0.4)', marginBottom: Spacing['2'], textTransform: 'uppercase', letterSpacing: 1 },
  exDesc:        { fontSize: Typography.md, color: 'rgba(255,255,255,0.78)', lineHeight: Typography.md * 1.65, marginBottom: Spacing['2'] },
  divider:       { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: Spacing['3'] },
  skillHeader:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing['2'] },
  skillIcon:     { width: 20, height: 20, borderRadius: 6, backgroundColor: 'rgba(129,140,248,0.15)', alignItems: 'center', justifyContent: 'center' },
  skillIconSoft: { backgroundColor: 'rgba(52,211,153,0.15)' },
  chipRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing['2'] },
  skillChip:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radii.full, borderWidth: 1 },
  skillChipHard: { backgroundColor: 'rgba(129,140,248,0.10)', borderColor: 'rgba(129,140,248,0.30)' },
  skillChipSoft: { backgroundColor: 'rgba(52,211,153,0.10)',  borderColor: 'rgba(52,211,153,0.30)' },
  skillChipText:     { fontSize: Typography.sm, fontWeight: Typography.medium },
  skillChipTextHard: { color: '#A5B4FC' },
  skillChipTextSoft: { color: '#6EE7B7' },
  ratingRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing['2'] },
  ratingScore: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.white },
  ratingLabel: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.5)', marginTop: 3 },
  reviewCard:       { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radii.lg, padding: Spacing['4'], marginBottom: Spacing['3'], borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  reviewHeader:     { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing['3'], marginBottom: Spacing['3'] },
  reviewAvatar:     { width: 40, height: 40, borderRadius: Radii.full, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.white },
  reviewName:       { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.white, marginBottom: 2 },
  reviewRoleTxt:    { fontSize: Typography.sm, color: 'rgba(255,255,255,0.5)' },
  reviewDate:       { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  reviewText:       { fontSize: Typography.sm, color: 'rgba(255,255,255,0.7)', lineHeight: Typography.sm * 1.6 },
  viewAllRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: Radii.lg, borderWidth: 1, borderColor: 'rgba(245,158,11,0.35)', paddingVertical: 14, paddingHorizontal: Spacing['4'], marginBottom: Spacing['2'] },
  viewAllText:      { fontSize: Typography.md, color: Colors.white, fontWeight: Typography.medium },
  premiumBadge:     { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.warning, borderRadius: Radii.full, paddingHorizontal: 10, paddingVertical: 4 },
  premiumBadgeText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: '#000' },

  // ── Safety / Report & Block ───────────────────────────────────────────────
  safetyRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radii.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden', marginBottom: Spacing['2'],
  },
  safetyBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 16, gap: 4,
  },
  safetyIconWrap: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.10)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  safetyIconDanger: { backgroundColor: 'rgba(248,113,113,0.10)' },
  safetyBtnText:    { fontSize: 13, fontWeight: '700', color: Colors.warning },
  safetyBtnSub:     { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: '500' },
  safetySep:        { width: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 12 },

  // Empty states
  emptyScreen:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, padding: Spacing['8'] },
  emptyIconWrap:  { width: 80, height: 80, borderRadius: Radii.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing['5'] },
  emptyTitle:     { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.gray900, marginBottom: Spacing['2'], textAlign: 'center' },
  emptySub:       { fontSize: Typography.md, color: Colors.gray500, textAlign: 'center', lineHeight: 22, marginBottom: Spacing['6'] },
  refreshBtn:     { backgroundColor: Colors.primary, paddingHorizontal: Spacing['8'], paddingVertical: Spacing['3'] + 1, borderRadius: Radii.lg },
  refreshBtnText: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.white },

  // Settings panel
  settingsBackdrop:  { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 65, backgroundColor: 'rgba(0,0,0,0.5)' },
  settingsPanel:     { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 70, backgroundColor: 'rgba(10,10,14,0.98)', borderTopLeftRadius: 22, borderTopRightRadius: 22, overflow: 'hidden' },
  settingsContent:   { paddingHorizontal: Spacing['5'], paddingTop: Spacing['2'] },
  settingsTitle:     { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.white, marginBottom: Spacing['5'], marginTop: Spacing['2'] },
  settingsSection:   { marginBottom: Spacing['4'] },
  settingsLabelRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing['3'] },
  settingsLabel:     { flex: 1, fontSize: Typography.md, color: 'rgba(255,255,255,0.75)', fontWeight: Typography.medium },
  settingsValue:     { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.primary },
  settingsResultRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing['1'] },
  settingsResultText:{ fontSize: Typography.sm, color: 'rgba(255,255,255,0.5)' },
  sliderWrapper: { height: 32, justifyContent: 'center', position: 'relative', marginBottom: 16 },
  sliderTrack:   { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'visible' },
  sliderFill:    { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: Colors.primary, borderRadius: 2 },
  sliderThumb:   { position: 'absolute', top: 6, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  sliderLabels:  { flexDirection: 'row', justifyContent: 'space-between' },
  sliderMin:     { fontSize: Typography.sm, color: 'rgba(255,255,255,0.35)' },
  sliderMax:     { fontSize: Typography.sm, color: 'rgba(255,255,255,0.35)' },
  unitToggleRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing['3'] },
  unitLabel:       { fontSize: Typography.md, color: 'rgba(255,255,255,0.35)', fontWeight: Typography.medium },
  unitLabelActive: { color: Colors.white },
  applyBtn:     { marginTop: Spacing['4'], backgroundColor: Colors.primary, borderRadius: Radii.lg, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  applyBtnText: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.white, letterSpacing: 0.3 },
});

// ── Modal styles ──────────────────────────────────────────────────────────────
const m = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#13101f',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center', marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20,
  },
  sheetIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  sheetSub:   { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },

  // Reason list
  reasonList: { gap: 8, marginBottom: 20 },
  reasonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 14, paddingVertical: 13,
  },
  reasonRowActive: {
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderColor: 'rgba(245,158,11,0.35)',
  },
  reasonText:       { flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  reasonTextActive: { color: '#fff', fontWeight: '600' },
  radioOuter: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  radioOuterActive: { borderColor: Colors.warning },
  radioInner:       { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.warning },

  // Block info
  blockInfoCard: {
    backgroundColor: 'rgba(248,113,113,0.06)',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(248,113,113,0.18)',
    padding: 14, gap: 10, marginBottom: 20,
  },
  blockInfoRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  blockInfoText: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 19 },

  // Buttons
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, backgroundColor: Colors.warning,
    borderRadius: 14, paddingVertical: 14, marginBottom: 10,
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnDanger:   { backgroundColor: '#ef4444' },
  confirmBtnText:     { fontSize: 15, fontWeight: '800', color: '#000' },
  cancelBtn:          { alignItems: 'center', paddingVertical: 10 },
  cancelBtnText:      { fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
});