import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radii } from '../../components/ui';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────────────────────────────

interface ItsAJobModalProps {
  visible: boolean;
  /** Company that liked the user */
  company: string;
  position: string;
  salary: string;
  /** Optional company logo image — falls back to emoji placeholder */
  companyLogo?: ImageSourcePropType;
  /** User avatar image — falls back to initials */
  userAvatar?: ImageSourcePropType;
  userInitial?: string;
  matchPercent?: number;
  fontsLoaded?: boolean;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

// ─── Confetti particle ───────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  Colors.primary,       // indigo
  '#A78BFA',            // violet
  Colors.success,       // emerald
  '#34D399',            // teal-green
  '#F59E0B',            // amber
  '#60A5FA',            // blue
  '#F472B6',            // pink
];

// ─── Main component ──────────────────────────────────────────────────────────

export default function ItsAJobModal({
  visible,
  company,
  position,
  salary,
  companyLogo,
  userAvatar,
  userInitial = 'U',
  matchPercent,
  fontsLoaded = false,
  onSendMessage,
  onKeepSwiping,
}: ItsAJobModalProps) {
  const { top: topInset } = useSafeAreaInsets();

  // ── Entrance animations ────────────────────────────────────────────────────
  const backdropAnim    = useRef(new Animated.Value(0)).current;
  const scaleAnim       = useRef(new Animated.Value(0.75)).current;
  const translateYAnim  = useRef(new Animated.Value(40)).current;
  const avatarLeftAnim  = useRef(new Animated.Value(-60)).current;
  const avatarRightAnim = useRef(new Animated.Value(60)).current;
  const heartAnim       = useRef(new Animated.Value(0)).current;
  const contentAnim     = useRef(new Animated.Value(0)).current;
  const pulseAnim       = useRef(new Animated.Value(1)).current;
  const ring1Anim       = useRef(new Animated.Value(0.4)).current;
  const ring2Anim       = useRef(new Animated.Value(0.4)).current;

  // Confetti pieces — each is an Animated.Value pair [x, y, rotate, opacity]
  const confettiPieces = useRef(
    Array.from({ length: 18 }, () => ({
      x:       new Animated.Value(SW / 2),
      y:       new Animated.Value(SH * 0.35),
      rotate:  new Animated.Value(0),
      opacity: new Animated.Value(1),
      color:   CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      targetX: (Math.random() - 0.5) * SW * 1.4,
      targetY: -SH * 0.4 - Math.random() * SH * 0.3,
      rot:     (Math.random() - 0.5) * 720,
    }))
  ).current;

  useEffect(() => {
    if (!visible) return;

    // Reset
    backdropAnim.setValue(0);
    scaleAnim.setValue(0.75);
    translateYAnim.setValue(40);
    avatarLeftAnim.setValue(-80);
    avatarRightAnim.setValue(80);
    heartAnim.setValue(0);
    contentAnim.setValue(0);
    confettiPieces.forEach(p => {
      p.x.setValue(SW / 2);
      p.y.setValue(SH * 0.35);
      p.rotate.setValue(0);
      p.opacity.setValue(1);
      // Re-randomise target so each play looks different
      p.targetX = (Math.random() - 0.5) * SW * 1.5;
      p.targetY = -SH * 0.35 - Math.random() * SH * 0.25;
      p.rot     = (Math.random() - 0.5) * 600;
      p.color   = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    });

    // Backdrop fade
    Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();

    // Card spring in
    Animated.parallel([
      Animated.spring(scaleAnim,      { toValue: 1, bounciness: 10, useNativeDriver: true }),
      Animated.spring(translateYAnim, { toValue: 0, bounciness: 10, useNativeDriver: true }),
    ]).start();

    // Avatars slide in from sides
    Animated.parallel([
      Animated.spring(avatarLeftAnim,  { toValue: 0, bounciness: 14, delay: 120, useNativeDriver: true }),
      Animated.spring(avatarRightAnim, { toValue: 0, bounciness: 14, delay: 200, useNativeDriver: true }),
    ]).start();

    // Heart badge pop
    Animated.spring(heartAnim, { toValue: 1, bounciness: 20, delay: 420, useNativeDriver: true }).start();

    // Fade up text + buttons
    Animated.timing(contentAnim, { toValue: 1, duration: 360, delay: 480, useNativeDriver: true }).start();

    // Confetti burst
    const confettiAnims = confettiPieces.map(p =>
      Animated.parallel([
        Animated.timing(p.x,       { toValue: SW / 2 + p.targetX, duration: 1200, delay: Math.random() * 200, useNativeDriver: true }),
        Animated.timing(p.y,       { toValue: SH * 0.35 + p.targetY, duration: 1200, delay: Math.random() * 200, useNativeDriver: true }),
        Animated.timing(p.rotate,  { toValue: p.rot, duration: 1200, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(p.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(p.opacity, { toValue: 0, duration: 600, delay: 400, useNativeDriver: true }),
        ]),
      ])
    );
    Animated.stagger(30, confettiAnims).start();

    // Ring pulse loop
    const pulseCycle = () => {
      Animated.sequence([
        Animated.timing(ring1Anim, { toValue: 0.9, duration: 1500, useNativeDriver: true }),
        Animated.timing(ring1Anim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
      ]).start(pulseCycle);
    };
    const pulseCycle2 = () => {
      Animated.sequence([
        Animated.timing(ring2Anim, { toValue: 0.9, duration: 1500, delay: 750, useNativeDriver: true }),
        Animated.timing(ring2Anim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
      ]).start(pulseCycle2);
    };
    pulseCycle();
    pulseCycle2();

    // Dot pulse
    const dotPulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.55, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 750, useNativeDriver: true }),
      ]).start(dotPulse);
    };
    dotPulse();
  }, [visible]);

  if (!visible) return null;

  const contentOpacityAndY = {
    opacity: contentAnim,
    transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <StatusBar barStyle="light-content" />

      {/* ── Backdrop ── */}
      <Animated.View style={[StyleSheet.absoluteFill, s.backdrop, { opacity: backdropAnim }]} />

      {/* ── Confetti ── */}
      {confettiPieces.map((p, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[
            s.confettiPiece,
            { backgroundColor: p.color },
            {
              opacity: p.opacity,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { rotate: p.rotate.interpolate({ inputRange: [-720, 720], outputRange: ['-720deg', '720deg'] }) },
              ],
            },
          ]}
        />
      ))}

      {/* ── Glow rings ── */}
      <Animated.View style={[s.ring, s.ring1, { opacity: ring1Anim }]} pointerEvents="none" />
      <Animated.View style={[s.ring, s.ring2, { opacity: ring2Anim }]} pointerEvents="none" />

      {/* ── Card ── */}
      <Animated.View
        style={[
          s.card,
          { transform: [{ scale: scaleAnim }, { translateY: translateYAnim }] },
        ]}
      >
        {/* Match title */}
        <Animated.View style={contentOpacityAndY}>
          <Text style={[s.title, fontsLoaded && { fontFamily: 'FullPack', fontWeight: undefined }]}>
            It's a Match!
          </Text>
        </Animated.View>

        {/* Actions */}
        <Animated.View style={[s.actions, contentOpacityAndY]}>
          <TouchableOpacity style={s.btnPrimary} onPress={onSendMessage} activeOpacity={0.88}>
            <MaterialCommunityIcons name="message-text-outline" size={18} color={Colors.white} style={s.btnIcon} />
            <Text style={s.btnPrimaryText}>Send a message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={onKeepSwiping} activeOpacity={0.75}>
            <Text style={s.btnSecondaryText}>Keep swiping</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const CARD_WIDTH  = Math.min(SW - 40, 360);
const RING_SIZE_1 = 280;
const RING_SIZE_2 = 200;

const s = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(5,3,15,0.92)',
  },

  // Confetti
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 5,
    borderRadius: 1,
    left: -4,
    top: -2.5,
  },

  // Rings
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'center',
    top: SH / 2 - RING_SIZE_1 / 2,
  },
  ring1: {
    width: RING_SIZE_1,
    height: RING_SIZE_1,
    borderColor: 'rgba(99,102,241,0.25)',
  },
  ring2: {
    width: RING_SIZE_2,
    height: RING_SIZE_2,
    top: SH / 2 - RING_SIZE_2 / 2,
    borderColor: 'rgba(16,185,129,0.18)',
  },

  // Card
  card: {
    position: 'absolute',
    left: (SW - CARD_WIDTH) / 2,
    top: SH * 0.1,
    width: CARD_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 32,
  },

  // Avatars
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: 'rgba(5,3,15,0.92)',
    overflow: 'hidden',
    backgroundColor: '#1a1030',
  },
  avatarLeft: {
    zIndex: 2,
    marginRight: -20,
  },
  avatarRight: {
    zIndex: 1,
    marginLeft: -20,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 30,
    fontWeight: Typography.bold,
    color: Colors.white,
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1540',
  },
  heartBadge: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success,
    borderWidth: 2.5,
    borderColor: 'rgba(5,3,15,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    left: CARD_WIDTH / 2 - 28 - 16,  // horizontally centred between avatars
  },

  // Text
  eyebrow: {
    fontSize: 11,
    fontWeight: Typography.medium,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 12,
    // Gradient text workaround: use a solid fallback, or use MaskedView for true gradient text
  },
  subtitle: {
    fontSize: Typography.md,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },

  // Job chip
  jobChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(99,102,241,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.28)',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    maxWidth: '100%',
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  chipText: {
    fontSize: 12,
    fontWeight: Typography.semibold,
    color: '#A78BFA',
    flexShrink: 1,
  },

  // Match
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
  },
  matchText: {
    fontSize: Typography.sm,
    color: Colors.warning,
    fontWeight: Typography.semibold,
  },

  // Actions
  actions: {
    width: '100%',
    gap: 10,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radii.lg,
    paddingVertical: 15,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  btnIcon: { marginRight: 2 },
  btnPrimaryText: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.white,
    letterSpacing: 0.2,
  },
  btnSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  btnSecondaryText: {
    fontSize: Typography.md,
    fontWeight: Typography.medium,
    color: 'rgba(255,255,255,0.45)',
  },
});