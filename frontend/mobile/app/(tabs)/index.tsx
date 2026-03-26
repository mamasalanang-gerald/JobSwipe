import React, { useState, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  SwipeLabel,
  MatchBadge,
  TagBadge,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
  SuperButton,
  Colors,
  Typography,
  Spacing,
  Radii,
  Shadows,
} from '../../components/ui';

const { width: SW, height: SH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SW * 0.28;

// ── Layout constants at module level — never change, never move with the card ──
const ACTIONS_BOTTOM = Platform.OS === 'ios' ? 72 : 100;
const ACTIONS_HEIGHT = 80;
const OVERLAY_BOTTOM = ACTIONS_BOTTOM + ACTIONS_HEIGHT + 8;  // company info strip
const BADGE_BOTTOM   = OVERLAY_BOTTOM + 92;                  // match badge sits here
const PANEL_HEIGHT   = SH * 0.62;
const BOTTOM_NAV     = Platform.OS === 'ios' ? 84 : 64;      // tab bar clearance

const JOBS = [
  {
    id: 1,
    company: 'TechFlow Inc',
    logoColor: Colors.primary,
    rating: 4.8,
    position: 'Senior React Native Engineer',
    salary: '$120k - $150k / yr',
    location: 'San Francisco, CA · Remote',
    tags: [
      { label: 'Remote',    variant: 'primary'  as const },
      { label: 'Full-time', variant: 'success'  as const },
      { label: 'Startup',   variant: 'warning'  as const },
    ],
    description: 'Build cutting-edge mobile experiences for 2M+ users. Lead a team of 4 engineers shipping weekly releases. You will own the entire mobile stack and work closely with design and product.',
    matchPercent: 92,
    photos: [
      require('../assets/images/accenture.jpg'),
      require('../assets/images/accenture2.jpg'),
      require('../assets/images/accenture3.jpg'),
    ],
    lookingFor: 'React Native · TypeScript · 5+ yrs',
  },
  {
    id: 2,
    company: 'Alorica',
    logoColor: Colors.warning,
    rating: 4.6,
    position: 'Product Designer',
    salary: '$100k - $130k / yr',
    location: 'New York, NY · Hybrid',
    tags: [
      { label: 'Hybrid',    variant: 'primary' as const },
      { label: 'Full-time', variant: 'success' as const },
      { label: 'Scaleup',   variant: 'neutral' as const },
    ],
    description: 'Design beautiful interfaces for next-gen SaaS products. Work with a world-class design system team. Own end-to-end product design from research to delivery.',
    matchPercent: 78,
    photos: [
      require('../assets/images/alorica.jpg'),
      require('../assets/images/alorica2.jpg'),
      require('../assets/images/alorica3.jpg'),
    ],
    lookingFor: 'Figma · UX Research · 3+ yrs',
  },
  {
    id: 3,
    company: 'Socia',
    logoColor: Colors.success,
    rating: 4.9,
    position: 'ML Engineer',
    salary: '$140k - $180k / yr',
    location: 'Boston, MA · On-site',
    tags: [
      { label: 'On-site',    variant: 'warning' as const },
      { label: 'Full-time',  variant: 'success' as const },
      { label: 'Enterprise', variant: 'neutral' as const },
    ],
    description: 'Lead machine learning initiatives for Fortune 500 clients. Publish research and own the ML roadmap. Work with petabyte-scale datasets and cutting-edge model architectures.',
    matchPercent: 85,
    photos: [
      require('../assets/images/socia.png'),
      require('../assets/images/socia2.jpg'),
      require('../assets/images/socia3.jpg'),
    ],
    lookingFor: 'Python · PyTorch · MLOps · 4+ yrs',
  },
] as const;

export default function HomeTab() {
  const tabBarHeight = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();
  // Dynamic bottom positions — keep buttons above tab bar on all devices
  const actionsBottom  = tabBarHeight + 20;
  const overlayBottom  = actionsBottom + ACTIONS_HEIGHT + 8;
  const badgeBottom    = overlayBottom + 92;

  const [index, setIndex]           = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [liked, setLiked]           = useState<number[]>([]);
  const [expanded, setExpanded]     = useState(false);
  const [history, setHistory]       = useState<{ id: number; dir: number }[]>([]);
  const [cardSize, setCardSize]     = useState({ width: SW, height: SH });
  const [topBarHeight, setTopBarHeight] = useState(0);

  const position   = useRef(new Animated.ValueXY()).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  const onCardLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setCardSize({ width, height });
  };

  const likeOpacity        = position.x.interpolate({ inputRange: [0, 80],              outputRange: [0, 1],       extrapolate: 'clamp' });
  const nopeOpacity        = position.x.interpolate({ inputRange: [-80, 0],             outputRange: [1, 0],       extrapolate: 'clamp' });
  const rotate             = position.x.interpolate({ inputRange: [-SW, 0, SW],         outputRange: ['-18deg', '0deg', '18deg'] });
  const likeOverlayOpacity = position.x.interpolate({ inputRange: [0, SWIPE_THRESHOLD], outputRange: [0, 0.45],    extrapolate: 'clamp' });
  const nopeOverlayOpacity = position.x.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0],outputRange: [0.45, 0],    extrapolate: 'clamp' });
  const nextCardScale      = position.x.interpolate({ inputRange: [-SW, 0, SW],         outputRange: [1, 0.93, 1], extrapolate: 'clamp' });
  const panelTranslateY    = expandAnim.interpolate({ inputRange: [0, 1],               outputRange: [PANEL_HEIGHT, 0] });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_e, { dx, dy }) => !expanded && Math.abs(dx) > Math.abs(dy),
      onMoveShouldSetPanResponder:  (_e, { dx, dy }) => !expanded && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5,
      onPanResponderMove:    (_e, { dx, dy }) => position.setValue({ x: dx, y: dy * 0.25 }),
      onPanResponderRelease: (_e, { dx, vx }) => {
        if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(vx) > 0.6) commitSwipe(dx > 0 ? 1 : -1);
        else resetCard();
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
      if (dir > 0) setLiked(prev => [...prev, JOBS[index].id]);
      setHistory(prev => [...prev, { id: JOBS[index].id, dir }]);
      setPhotoIndex(0);
      setIndex(i => i + 1);
    });
  };

  const resetCard    = () => Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
  const collapsePanel = () => {
    setExpanded(false);
    Animated.timing(expandAnim, { toValue: 0, duration: 250, useNativeDriver: false }).start();
  };
  const openPanel = () => {
    setExpanded(true);
    Animated.spring(expandAnim, { toValue: 1, bounciness: 3, useNativeDriver: false }).start();
  };
  const undo = () => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setLiked(l => l.filter(id => id !== last.id));
    setPhotoIndex(0);
    collapsePanel();
    setIndex(i => Math.max(0, i - 1));
  };
  const handleImageTap = (evt: any) => {
    if (expanded) return;
    const x     = evt.nativeEvent.locationX;
    const total = JOBS[index].photos.length;
    if (x < SW * 0.35)      setPhotoIndex(p => (p === 0 ? total - 1 : p - 1));
    else if (x > SW * 0.65) setPhotoIndex(p => (p === total - 1 ? 0 : p + 1));
  };

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (index >= JOBS.length) {
    return (
      <View style={s.emptyScreen}>
        <StatusBar barStyle="dark-content" />
        <View style={s.emptyIconWrap}>
          <MaterialCommunityIcons name="rocket-launch-outline" size={40} color={Colors.primary} />
        </View>
        <Text style={s.emptyTitle}>You're all caught up!</Text>
        <Text style={s.emptySub}>New jobs are added daily — check back soon.</Text>
        <TouchableOpacity
          style={s.refreshBtn}
          onPress={() => { setIndex(0); setLiked([]); setHistory([]); setPhotoIndex(0); }}
        >
          <Text style={s.refreshBtnText}>Refresh deck</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const job     = JOBS[index];
  const nextJob = JOBS[index + 1];
  const photo   = job.photos[photoIndex];

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <View style={s.screen} onLayout={onCardLayout}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Layer 0 — next card peek */}
      {nextJob ? (
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: nextCardScale }] }]} pointerEvents="none">
          <Image source={nextJob.photos[0]} style={{ width: cardSize.width, height: cardSize.height }} resizeMode="cover" fadeDuration={0} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
        </Animated.View>
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} pointerEvents="none" />
      )}

      {/* Layer 1 — swipeable card */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity activeOpacity={1} style={StyleSheet.absoluteFill} onPress={handleImageTap}>
          <Image source={photo} style={{ width: cardSize.width, height: cardSize.height }} resizeMode="cover" fadeDuration={0} />
        </TouchableOpacity>

        {/* Colour tints */}
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#10B981', opacity: likeOverlayOpacity, zIndex: 5 }]} pointerEvents="none" />
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#EF4444', opacity: nopeOverlayOpacity, zIndex: 5 }]} pointerEvents="none" />


        {/* Stamps */}
        <Animated.View style={[s.stampWrap, { right: Spacing['5'], opacity: likeOpacity }]} pointerEvents="none"><SwipeLabel type="like" visible /></Animated.View>
        <Animated.View style={[s.stampWrap, { left:  Spacing['5'], opacity: nopeOpacity }]} pointerEvents="none"><SwipeLabel type="pass" visible /></Animated.View>

        {/* Top bar */}
        <View style={[s.topBar, { paddingTop: topInset > 0 ? topInset + 8 : (Platform.OS === 'ios' ? 54 : 40) }]} pointerEvents="box-none" onLayout={e => setTopBarHeight(e.nativeEvent.layout.height)}>
          <View style={s.tabRow}>
            <TouchableOpacity style={s.iconPill}><MaterialCommunityIcons name="tune-variant"   size={19} color={Colors.white} /></TouchableOpacity>
            <View style={s.tabPills}>
              <View style={[s.tabPill, s.tabPillActive]}><Text style={s.tabTextActive}>For You</Text></View>
              <TouchableOpacity style={s.tabPill}><Text style={s.tabText}>Saved</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={s.iconPill}><MaterialCommunityIcons name="lightning-bolt" size={19} color="#A78BFA"      /></TouchableOpacity>
          </View>
          <View style={s.dotsRow}>
            {job.photos.map((_, i) => <View key={i} style={[s.dot, i === photoIndex && s.dotActive]} />)}
          </View>
        </View>

        {/* Gradient scrim for text legibility */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.75)']}
          style={[StyleSheet.absoluteFill, { top: '45%', zIndex: 3 }]}
          pointerEvents="none"
        />

        {/* Company info strip */}
        <View style={[s.bottomOverlay, { bottom: overlayBottom }]} pointerEvents="box-none">
          <View style={s.nameRow}>
            <View style={{ flex: 1 }}>
              <View style={s.companyNameRow}>
                <Text style={s.companyName}>{job.company}</Text>
                <MaterialCommunityIcons name="check-decagram" size={22} color="#60A5FA" style={s.verifiedIcon} />
              </View>
              <View style={s.verifiedRow}>
                <Text style={s.salaryInline}>{job.salary}</Text>
              </View>
            </View>
            {!expanded && (
              <TouchableOpacity style={s.expandBtn} onPress={openPanel} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
                <MaterialCommunityIcons name="chevron-up" size={22} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>
          <View style={s.lookingRow}>
            <MaterialCommunityIcons name="magnify" size={14} color="rgba(255,255,255,0.75)" />
            <Text style={s.lookingLabel}>Looking for</Text>
          </View>
          <Text style={s.positionText}>{job.position}</Text>
        </View>
      </Animated.View>
      {/* END layer 1 */}

      {/*
    
      {/* Layer 2 — Action buttons */}
      <View style={[s.actionsRow, { bottom: actionsBottom }]}>
        <TouchableOpacity style={s.btnDark} onPress={() => commitSwipe(-1)} activeOpacity={0.8}>
          <MaterialCommunityIcons name="close" size={32} color={Colors.white} />
        </TouchableOpacity>
        <PrimaryButton   icon="heart" iconSize={32} onPress={() => commitSwipe(1)}  style={s.btnHeart} />
      </View>

      {/*
        Layer 3 — Expand panel (bottom sheet)
        ======================================
        Completely outside the swipeable card so it's never constrained
        by the card's height or overflow. Height = 62 % of screen.

        ScrollView paddingBottom = BOTTOM_NAV + 32 so the last item
        always scrolls fully clear of the tab bar.
      */}
      <Animated.View
        style={[s.expandPanel, { height: PANEL_HEIGHT, transform: [{ translateY: panelTranslateY }] }]}
        pointerEvents={expanded ? 'box-none' : 'none'}
      >
        <View style={s.panelHandle} />

        <TouchableOpacity style={s.panelCloseBtn} onPress={collapsePanel} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <MaterialCommunityIcons name="chevron-down" size={24} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[s.expandContent, { paddingBottom: tabBarHeight + 32 }]}
          showsVerticalScrollIndicator={false}
          bounces
          overScrollMode="always"
        >
          <Text style={s.exRole}>{job.position}</Text>
          <Text style={s.exSalary}>{job.salary}</Text>

          <View style={s.exLocRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={13} color="rgba(255,255,255,0.6)" />
            <Text style={s.exLoc}>{job.location}</Text>
          </View>

          <View style={s.exTags}>
            {job.tags.map((tag, i) => <TagBadge key={i} label={tag.label} variant={tag.variant} />)}
          </View>

          <View style={s.exDivider} />
          <Text style={s.exSectionTitle}>About the role</Text>
          <Text style={s.exDesc}>{job.description}</Text>

          <View style={s.exDivider} />
          <Text style={s.exSectionTitle}>Requirements</Text>
          <View style={s.exMetaRow}>
            <MaterialCommunityIcons name="briefcase-outline" size={14} color="rgba(255,255,255,0.5)" />
            <Text style={s.exMeta}>{job.lookingFor}</Text>
          </View>

          <View style={s.exDivider} />
          <Text style={s.exSectionTitle}>Company rating</Text>
          <View style={s.exMetaRow}>
            <MaterialCommunityIcons name="star" size={14} color={Colors.warning} />
            <Text style={s.exMeta}>{job.rating} · Glassdoor</Text>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Tap outside panel to close */}
      {expanded && (
        <TouchableOpacity style={s.panelBackdrop} activeOpacity={1} onPress={collapsePanel} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },

  
  stampWrap: { position: 'absolute', top: 90, zIndex: 20 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: Spacing['4'],
    zIndex: 10,
  },
  tabRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing['3'] },
  iconPill: {
    width: 38, height: 38, borderRadius: Radii.full,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  tabPills: {
    flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: Radii.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    padding: 3, gap: 2,
  },
  tabPill:       { paddingHorizontal: Spacing['4'], paddingVertical: 7, borderRadius: Radii.full },
  tabPillActive: { backgroundColor: Colors.white },
  tabText:       { fontSize: Typography.base, fontWeight: Typography.medium, color: 'rgba(255,255,255,0.7)' },
  tabTextActive: { fontSize: Typography.base, fontWeight: Typography.bold,   color: Colors.gray900 },

  dotsRow:  { flexDirection: 'row', gap: 5, paddingHorizontal: Spacing['1'] },
  dot:      { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive:{ backgroundColor: Colors.white },

  bottomOverlay: { position: 'absolute', left: 0, right: 0, paddingHorizontal: Spacing['5'], zIndex: 10 },
  nameRow:       { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 },
  companyNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  companyName: {
    fontSize: 34, fontWeight: Typography.bold, color: Colors.white, letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10,
  },
  verifiedIcon: { marginTop: 2 },
  verifiedRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  salaryInline: {
    fontSize: Typography.md, fontWeight: Typography.semibold, color: 'rgba(255,255,255,0.95)',
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },
  expandBtn: {
    width: 40, height: 40, borderRadius: Radii.full,
    backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  lookingRow:   { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: Spacing['3'], marginBottom: 3 },
  lookingLabel: {
    fontSize: Typography.base, color: 'rgba(255,255,255,0.9)', fontWeight: Typography.medium,
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },
  positionText: {
    fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },



  actionsRow: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing['5'], zIndex: 40,
  },
  btnDark: {
    width: 70, height: 70,
    backgroundColor: '#EF4444',
    borderWidth: 0, borderColor: 'transparent', borderRadius: Radii.full,
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  btnSm:   {},
  btnHeart:{ width: 70, height: 70, backgroundColor: Colors.success, borderRadius: Radii.full, ...Shadows.colored(Colors.success) },

  // Expand panel
  expandPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,10,14,0.97)',
    zIndex: 60,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  panelBackdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 55 },
  panelHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  panelCloseBtn: {
    position: 'absolute', top: 10, right: Spacing['4'],
    width: 36, height: 36, borderRadius: Radii.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center', zIndex: 70,
  },
  expandContent: { paddingHorizontal: Spacing['5'], paddingTop: Spacing['3'] },

  exRole:        { fontSize: Typography['2xl'], fontWeight: Typography.bold,    color: Colors.white,             marginBottom: 4 },
  exSalary:      { fontSize: Typography.lg,    fontWeight: Typography.semibold, color: '#818CF8',                marginBottom: Spacing['3'] },
  exLocRow:      { flexDirection: 'row', alignItems: 'center', gap: 4,          marginBottom: Spacing['3'] },
  exLoc:         { fontSize: Typography.base,  color: 'rgba(255,255,255,0.6)' },
  exTags:        { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'],   marginBottom: Spacing['4'] },
  exDivider:     { height: 1, backgroundColor: 'rgba(255,255,255,0.1)',          marginBottom: Spacing['3'], marginTop: Spacing['1'] },
  exSectionTitle:{ fontSize: Typography.sm,    fontWeight: Typography.semibold, color: 'rgba(255,255,255,0.4)', marginBottom: Spacing['2'], textTransform: 'uppercase', letterSpacing: 1 },
  exDesc:        { fontSize: Typography.md,    color: 'rgba(255,255,255,0.78)', lineHeight: Typography.md * 1.65, marginBottom: Spacing['2'] },
  exMetaRow:     { flexDirection: 'row', alignItems: 'center', gap: 6,          marginBottom: Spacing['2'] },
  exMeta:        { fontSize: Typography.md,    color: 'rgba(255,255,255,0.7)' },

  emptyScreen:   { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, padding: Spacing['8'] },
  emptyIconWrap: { width: 80, height: 80, borderRadius: Radii.full, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing['5'] },
  emptyTitle:    { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.gray900, marginBottom: Spacing['2'], textAlign: 'center' },
  emptySub:      { fontSize: Typography.md, color: Colors.gray500, textAlign: 'center', lineHeight: 22, marginBottom: Spacing['6'] },
  refreshBtn:    { backgroundColor: Colors.primary, paddingHorizontal: Spacing['8'], paddingVertical: Spacing['3'] + 1, borderRadius: Radii.lg },
  refreshBtnText:{ fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.white },
});