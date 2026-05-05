import { Link } from 'expo-router';
import { StatusBar, Text, TouchableOpacity, View, Animated, Easing, Platform, KeyboardAvoidingView } from 'react-native';
import { useRef, useEffect } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Role } from './types';

// ─── Animated Orb ─────────────────────────────────────────────────────────────
function Orb({
  size,
  color,
  style,
  opacity,
  delay = 0,
}: {
  size: number;
  color: string;
  style?: object;
  opacity: number;
  delay?: number;
}) {
  const xy = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const hasStarted = useRef(false);

  useEffect(() => {
    // Only start animation once
    if (hasStarted.current) return;
    hasStarted.current = true;

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(xy, {
            toValue: { x: 14, y: 20 },
            duration: 4500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(xy, {
            toValue: { x: 0, y: 0 },
            duration: 4500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(scale, {
            toValue: 1.1,
            duration: 4500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 4500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [xy, scale, delay]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [
            { translateX: xy.x },
            { translateY: xy.y },
            { scale },
          ],
        },
        style,
      ]}
    />
  );
}

function ApplicantIcon({ color }: { color: string }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function HRIcon({ color }: { color: string }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="6" width="18" height="14" rx="2" stroke={color} strokeWidth="1.8" />
      <Path d="M3 10h18" stroke={color} strokeWidth="1.8" />
      <Path d="M8 6V4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M16 6V4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="9" cy="15" r="1.5" fill={color} />
      <Circle cx="15" cy="15" r="1.5" fill={color} />
    </Svg>
  );
}

type Props = {
  T: any;
  topInset: number;
  bottomInset: number;
  role: Role;
  setRole: (role: Role) => void;
  onContinue: () => void;
};

export function RegisterRoleSplash({ T, topInset, bottomInset, role, setRole, onContinue }: Props) {
  // Entrance animations
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-24)).current;
  const sheetSlide = useRef(new Animated.Value(80)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Only animate once on mount
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 700,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroSlide, {
        toValue: 0,
        duration: 700,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheetSlide, {
        toValue: 0,
        duration: 700,
        delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, {
        toValue: 1,
        duration: 500,
        delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroOpacity, heroSlide, sheetSlide, sheetOpacity]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0D0520', overflow: 'hidden' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Orbs ──────────────────────────────────────────────────────── */}
      <Orb size={320} color="#7C3AED" opacity={0.5} delay={0} style={{ top: -120, left: -80 }} />
      <Orb size={240} color="#EC4899" opacity={0.4} delay={500} style={{ top: -60, right: -80 }} />
      <Orb size={160} color="#A855F7" opacity={0.3} delay={1000} style={{ top: 220, left: 40 }} />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          paddingTop: topInset + 40,
          paddingHorizontal: 28,
          opacity: heroOpacity,
          transform: [{ translateY: heroSlide }],
        }}
      >
        {/* Logo */}
        <View style={{ marginBottom: 32 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>J</Text>
          </View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: 2.5,
              textTransform: 'uppercase',
            }}
          >
            JobSwipe
          </Text>
        </View>

        {/* Headline */}
        <Text
          style={{
            fontSize: 42,
            fontWeight: '800',
            color: '#fff',
            lineHeight: 46,
            letterSpacing: -1.5,
            marginBottom: 12,
          }}
        >
          Start your{'\n'}
          <Text style={{ color: '#C084FC' }}>journey.</Text>
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 22,
          }}
        >
          First, tell us who you are.
        </Text>
      </Animated.View>

      {/* ── Sheet ─────────────────────────────────────────────────────── */}
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingHorizontal: 28,
            paddingTop: 28,
            paddingBottom: Math.max(bottomInset, 24) + 8,
            maxHeight: '70%', // Limit sheet height so hero content is visible
            transform: [{ translateY: sheetSlide }],
            opacity: sheetOpacity,
          }}
        >
          {/* Drag handle */}
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#E5E7EB',
              alignSelf: 'center',
              marginBottom: 28,
            }}
          />

          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: '#111827',
              letterSpacing: -0.5,
              marginBottom: 24,
            }}
          >
            Choose your role
          </Text>

          {/* Role options */}
          <View style={{ gap: 12, marginBottom: 24 }}>
            {[
              {
                key: 'applicant' as Role,
                title: 'Job Seeker',
                desc: 'Browse listings, swipe to apply, land your next role.',
                IconComp: ApplicantIcon,
              },
              {
                key: 'hr' as Role,
                title: 'HR / Company',
                desc: 'Post openings, review applicants, build your team.',
                IconComp: HRIcon,
              },
            ].map(({ key, title, desc, IconComp }) => {
              const active = role === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setRole(key)}
                  activeOpacity={0.85}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    backgroundColor: active ? '#FBFAFF' : '#F9FAFB',
                    borderWidth: active ? 1.5 : 1,
                    borderColor: active ? '#7C3AED' : '#F3F4F6',
                    borderRadius: 16,
                    padding: 16,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: active ? '#7C3AED22' : '#F3F4F6',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComp color={active ? '#7C3AED' : '#9CA3AF'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: active ? '#7C3AED' : '#111827',
                        marginBottom: 2,
                      }}
                    >
                      {title}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#6B7280', lineHeight: 18 }}>{desc}</Text>
                  </View>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: active ? '#7C3AED' : '#F3F4F6',
                      borderWidth: active ? 0 : 1.5,
                      borderColor: '#E5E7EB',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {active && <MaterialCommunityIcons name="check" size={13} color="#fff" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CTA button */}
          <TouchableOpacity onPress={onContinue} activeOpacity={0.88}>
            <View
              style={{
                height: 56,
                borderRadius: 16,
                backgroundColor: '#7C3AED',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '700',
                  letterSpacing: -0.3,
                }}
              >
                Continue as {role === 'applicant' ? 'Job Seeker' : 'HR / Company'}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18 }}>→</Text>
            </View>
          </TouchableOpacity>

          {/* Sign-in link */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 5,
              marginTop: 20,
            }}
          >
            <Text style={{ fontSize: 13, color: '#9CA3AF' }}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 4, right: 10 }}>
                <Text style={{ fontSize: 13, color: '#7C3AED', fontWeight: '700' }}>Sign in →</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}
