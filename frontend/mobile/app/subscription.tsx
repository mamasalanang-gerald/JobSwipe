import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, Platform, StatusBar, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const { width: SW } = Dimensions.get('window');

const T = {
  gold:     '#f59e0b',
  plat:     '#cbd5e1',
  primary:  '#a855f7',
  bg:       '#0D0D1A',
  textHint: 'rgba(255,255,255,0.28)',
};

type PlanKey = 'free' | 'gold_monthly' | 'gold_yearly' | 'plat_monthly' | 'plat_yearly';
type Plan = {
  key: PlanKey; tier: 'free' | 'gold' | 'platinum';
  name: string; billing: string; price: string | null; billed: string | null;
  badge: string | null; saving: string | null;
  color: string; border: string; bg: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  features: string[]; locked: string[];
  ctaLabel: string | null; ctaTextColor: string;
};

const PLANS: Plan[] = [
  {
    key: 'free', tier: 'free', name: 'Free', billing: 'Forever',
    price: null, billed: null, badge: null, saving: null,
    color: T.primary, border: 'rgba(168,85,247,0.3)', bg: 'rgba(168,85,247,0.05)',
    icon: 'star-outline',
    features: ['10 applications / month', 'Basic job matching'],
    locked: ['See who liked you', 'Priority results', 'Advanced insights', 'Career coach'],
    ctaLabel: null, ctaTextColor: '#fff',
  },
  {
    key: 'gold_monthly', tier: 'gold', name: 'Gold', billing: 'Monthly',
    price: '$15.99', billed: 'Billed monthly', badge: 'POPULAR', saving: null,
    color: T.gold, border: 'rgba(245,158,11,0.35)', bg: 'rgba(245,158,11,0.05)',
    icon: 'lightning-bolt',
    features: ['Unlimited applications', 'Advanced matching', 'See who liked you', 'Priority results'],
    locked: ['Advanced insights', 'Career coach'],
    ctaLabel: 'Upgrade to Gold', ctaTextColor: '#fff',
  },
  {
    key: 'gold_yearly', tier: 'gold', name: 'Gold', billing: 'Yearly',
    price: '$7.99', billed: 'Billed $95.88 / year', badge: 'BEST VALUE', saving: 'Save 50%',
    color: T.gold, border: 'rgba(245,158,11,0.35)', bg: 'rgba(245,158,11,0.05)',
    icon: 'lightning-bolt',
    features: ['Unlimited applications', 'Advanced matching', 'See who liked you', 'Priority results'],
    locked: ['Advanced insights', 'Career coach'],
    ctaLabel: 'Upgrade to Gold', ctaTextColor: '#fff',
  },
  {
    key: 'plat_monthly', tier: 'platinum', name: 'Platinum', billing: 'Monthly',
    price: '$29.99', billed: 'Billed monthly', badge: null, saving: null,
    color: T.plat, border: 'rgba(203,213,225,0.3)', bg: 'rgba(148,163,184,0.05)',
    icon: 'diamond-stone',
    features: ['Everything in Gold', 'Advanced insights', 'Dedicated career coach', 'AI-powered matching'],
    locked: [], ctaLabel: 'Upgrade to Platinum', ctaTextColor: '#0f172a',
  },
  {
    key: 'plat_yearly', tier: 'platinum', name: 'Platinum', billing: 'Yearly',
    price: '$19.99', billed: 'Billed $239.88 / year', badge: 'BEST DEAL', saving: 'Save 33%',
    color: T.plat, border: 'rgba(203,213,225,0.3)', bg: 'rgba(148,163,184,0.05)',
    icon: 'diamond-stone',
    features: ['Everything in Gold', 'Advanced insights', 'Dedicated career coach', 'AI-powered matching'],
    locked: [], ctaLabel: 'Upgrade to Platinum', ctaTextColor: '#0f172a',
  },
];

const INITIAL_INDEX = 0;
const CARD_W = SW - 64;

export default function SubscriptionScreen() {
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const [selectedKey, setSelectedKey] = useState<PlanKey>('free');  
  const [activeDot, setActiveDot]     = useState(0);
  const scaleAnim    = useRef(new Animated.Value(1)).current;
  const flatRef      = useRef<FlatList<Plan>>(null);
  const isReadyRef   = useRef(false);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const paddingTop = topInset > 0 ? topInset : Platform.OS === 'ios' ? 54 : 40;
  const safeBottom = bottomInset > 0 ? bottomInset : 16;
  const selectedPlan = PLANS.find(p => p.key === selectedKey)!;

  const handleSubscribe = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start(() => console.log('Subscribe:', selectedKey));
  };

  const onMomentumScrollEnd = (e: any) => {
    const i = Math.max(0, Math.min(
      PLANS.length - 1,
      Math.round(e.nativeEvent.contentOffset.x / (CARD_W + 16)),
    ));
    setActiveDot(i);
    setSelectedKey(PLANS[i].key);
  };

  const goTo = (i: number) => {
    flatRef.current?.scrollToIndex({ index: i, animated: true });
    setActiveDot(i);
    setSelectedKey(PLANS[i].key);
  };

  const onFlatListLayout = () => {
    if (isReadyRef.current) return;
    isReadyRef.current = true;
    flatRef.current?.scrollToIndex({ index: INITIAL_INDEX, animated: false });
    setTimeout(() => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = setInterval(() => {
        setActiveDot(prev => {
          const next = (prev + 1) % PLANS.length;
          flatRef.current?.scrollToIndex({ index: next, animated: true });
          setSelectedKey(PLANS[next].key);
          return next;
        });
      }, 4000);
    }, 600);
  };

  React.useEffect(() => () => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
  }, []);

  const ctaColors: [string, string] =
    selectedPlan.tier === 'platinum' ? ['#cbd5e1', '#94a3b8'] :
    selectedPlan.tier === 'gold'     ? ['#f59e0b', '#d97706'] :
                                       ['#a855f7', '#7c3aed'];
  const ctaIconColor = selectedPlan.tier === 'platinum' ? '#0f172a' : '#fff';

  const renderCard = ({ item }: { item: Plan }) => (
    <View style={[pc.card, { width: CARD_W, borderColor: item.border, backgroundColor: item.bg }]}>
      <View style={pc.top}>
        <View style={[pc.iconWrap, { backgroundColor: item.color + '22' }]}>
          <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[pc.name, { color: item.color }]}>{item.name}</Text>
          <Text style={pc.billing}>{item.billing}</Text>
        </View>
        {item.badge && (
          <View style={[pc.badge, { backgroundColor: item.color + '18', borderColor: item.color + '40' }]}>
            <Text style={[pc.badgeText, { color: item.color }]}>{item.badge}</Text>
          </View>
        )}
      </View>

      <View style={pc.priceRow}>
        <Text style={[pc.price, { color: item.color }]}>{item.price ?? 'Free'}</Text>
        {item.price && <Text style={pc.pricePeriod}> / mo</Text>}
        {item.saving && <Text style={pc.saving}>{'  '}{item.saving}</Text>}
      </View>
      <Text style={pc.billed}>{item.billed ?? ' '}</Text>

      <View style={pc.sep} />

      <View style={{ gap: 10 }}>
        {item.features.map((f, i) => (
          <View key={`inc-${i}`} style={pc.row}>
            <MaterialCommunityIcons name="check-circle" size={14} color={item.color} />
            <Text style={pc.rowText}>{f}</Text>
          </View>
        ))}
        {item.locked.map((f, i) => (
          <View key={`lock-${i}`} style={pc.row}>
            <MaterialCommunityIcons name="lock-outline" size={14} color={T.textHint} />
            <Text style={[pc.rowText, { color: T.textHint }]}>{f}</Text>
          </View>
        ))}
      </View>

      {item.tier === 'free' && (
        <View style={pc.currentPill}>
          <MaterialCommunityIcons name="check-circle" size={12} color={T.primary} />
          <Text style={pc.currentText}>Current plan</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[s.screen, { paddingTop, paddingBottom: safeBottom }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#0D0D1A', '#13102B', '#0D0D1A']} style={StyleSheet.absoluteFill} />
      <View style={s.glowBlob} pointerEvents="none" />

      {/* Close */}
      <TouchableOpacity
        style={s.closeBtn}
        onPress={() => router.back()}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      >
        <MaterialCommunityIcons name="close" size={20} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      {/* ── Centered hero ── */}
      <View style={s.heroWrap}>
        <View style={s.heroRing}>
          <LinearGradient colors={['#818CF8', '#6366F1']} style={s.heroGradient}>
            <MaterialCommunityIcons name="lightning-bolt" size={28} color="#fff" />
          </LinearGradient>
        </View>
        <Text style={s.heroTitle}>JobSwipe Pro</Text>
        <Text style={s.heroSub}>Land your dream job faster with tools{'\n'}that give you the edge.</Text>
      </View>

      {/* ── Cards carousel — flex:1 fills remaining space ── */}
      <View style={s.carouselWrap}>
        <FlatList<Plan>
          ref={flatRef}
          data={PLANS}
          renderItem={renderCard}
          keyExtractor={item => item.key}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_W + 16}
          snapToAlignment="center"
          decelerationRate="fast"
          onMomentumScrollEnd={onMomentumScrollEnd}
          contentContainerStyle={{ paddingHorizontal: (SW - CARD_W) / 2, gap: 16 }}
          getItemLayout={(_, i) => ({ length: CARD_W + 16, offset: (CARD_W + 16) * i, index: i })}
          onLayout={onFlatListLayout}
          style={{ flex: 1 }}
        />
      </View>

      {/* ── Dots ── */}
      <View style={s.dotsRow}>
        {PLANS.map((plan, i) => (
          <TouchableOpacity key={plan.key} onPress={() => goTo(i)}>
            <View style={[s.dot, {
              backgroundColor: activeDot === i ? plan.color : 'rgba(255,255,255,0.15)',
              width: activeDot === i ? 20 : 6,
            }]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Selected label ── */}
      <Text style={s.selectedLabel}>
        {selectedPlan.tier === 'free'
          ? 'You are on the Free plan'
          : `${selectedPlan.name} · ${selectedPlan.billing} — ${selectedPlan.price}/mo`}
      </Text>

      {/* ── CTA — only show for paid plans ── */}
      {selectedPlan.tier !== 'free' && (  
        <Animated.View style={[s.ctaWrap, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity style={s.ctaBtn} onPress={handleSubscribe} activeOpacity={0.9}>
            <LinearGradient
              colors={ctaColors}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.ctaGradient}
            >
              <MaterialCommunityIcons
                name={selectedPlan.tier === 'platinum' ? 'diamond-stone' : 'lightning-bolt'}
                size={18} color={ctaIconColor}
              />
              <Text style={[s.ctaText, { color: ctaIconColor }]}>
                {selectedPlan.ctaLabel} · {selectedPlan.price}/mo
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── Legal ── */}
      <Text style={s.legal}>
        Cancel anytime · Renews automatically · Terms & Privacy apply
      </Text>
    </View>
  );
}

// ─── Card styles ──────────────────────────────────────────────────────────────
const pc = StyleSheet.create({
  card:     { borderRadius: 20, borderWidth: 1.5, padding: 20 },
  top:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  name:     { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  billing:  { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  badge:    { borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:{ fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 2 },
  price:    { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  pricePeriod: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 5 },
  saving:   { fontSize: 12, fontWeight: '700', color: '#34D399', marginBottom: 5 },
  billed:   { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 16 },
  sep:      { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginBottom: 16 },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText:  { fontSize: 13, color: 'rgba(255,255,255,0.7)', flex: 1 },
  currentPill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, justifyContent: 'center' },
  currentText: { fontSize: 11, fontWeight: '600', color: 'rgba(168,85,247,0.6)' },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0D0D1A' },
  glowBlob: {
    position: 'absolute', width: SW * 0.9, height: SW * 0.9,
    borderRadius: SW * 0.45, top: -SW * 0.25, alignSelf: 'center',
    backgroundColor: '#6366F1', opacity: 0.13,
  },
  closeBtn: {
    position: 'absolute', right: 20, top: 60, zIndex: 20,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Hero — centered, compact
  heroWrap: { alignItems: 'center', paddingTop: 12, paddingBottom: 20, paddingHorizontal: 24 },
  heroRing: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.4)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  heroGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  heroTitle:    { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 6 },
  heroSub:      { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 20 },

  // Carousel fills the leftover space between hero and bottom controls
  carouselWrap: { flex: 1, overflow: 'hidden' },

  // Dots
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14, marginBottom: 4 },
  dot:     { height: 6, borderRadius: 3 },

  selectedLabel: {
    textAlign: 'center', fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4, marginBottom: 10, paddingHorizontal: 20,
  },

  // CTA
  ctaWrap:        { paddingHorizontal: 20, marginBottom: 6 },
  ctaBtn:         { borderRadius: 16, overflow: 'hidden' },
  ctaGradient:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  ctaText:        { fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  ctaDisabled:    { backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 16, alignItems: 'center' },
  ctaDisabledText:{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: '600' },

  legal: {
    fontSize: 10, color: 'rgba(255,255,255,0.2)',
    textAlign: 'center', lineHeight: 14,
    paddingHorizontal: 24, marginBottom: 2,
  },
});