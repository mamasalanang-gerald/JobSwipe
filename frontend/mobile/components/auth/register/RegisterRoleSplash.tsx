import { Link } from 'expo-router';
import React from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Radii, Shadows, Spacing, Typography } from '../../ui';
import type { Role } from './types';

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
  return (
    <View style={{ flex: 1, backgroundColor: T.bg, paddingTop: topInset }}>
      <StatusBar barStyle="light-content" />
      <View
        style={{
          flex: 1,
          paddingHorizontal: Spacing['5'],
          justifyContent: 'space-between',
          paddingBottom: Math.max(Spacing['8'], bottomInset + Spacing['4']),
        }}
      >
        <View style={{ alignItems: 'center', paddingTop: Spacing['12'] }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: Radii.xl,
              backgroundColor: T.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: Spacing['5'],
              ...Shadows.colored(T.primary),
            }}
          >
            <Text style={{ color: T.white, fontSize: 36, fontWeight: Typography.bold as any }}>J</Text>
          </View>
          <Text
            style={{
              fontSize: Typography['3xl'],
              fontWeight: Typography.bold as any,
              color: T.textPrimary,
              letterSpacing: -0.5,
              textAlign: 'center',
            }}
          >
            Welcome to JobSwipe
          </Text>
          <Text
            style={{
              fontSize: Typography.md,
              color: T.textSub,
              marginTop: Spacing['2'],
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            Let's get you set up. First, tell us{'\n'}who you are.
          </Text>
        </View>

        <View style={{ gap: Spacing['4'] }}>
          {[
            {
              key: 'applicant' as Role,
              title: 'Job Seeker',
              desc: 'Browse job listings, swipe to apply,\nand land your next role.',
              IconComp: ApplicantIcon,
              accent: T.primary,
            },
            {
              key: 'hr' as Role,
              title: 'HR / Company',
              desc: 'Post openings, review applicants,\nand build your dream team.',
              IconComp: HRIcon,
              accent: T.pink,
            },
          ].map(({ key, title, desc, IconComp, accent }) => {
            const active = role === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setRole(key)}
                activeOpacity={0.85}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing['4'],
                  backgroundColor: active ? T.surfaceHigh : T.surface,
                  borderWidth: active ? 2 : 1,
                  borderColor: active ? accent : T.border,
                  borderRadius: Radii.xl,
                  padding: Spacing['5'],
                  ...Shadows.colored(active ? accent : 'transparent'),
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: Radii.lg,
                    backgroundColor: active ? accent + '22' : T.surfaceHigh,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconComp color={active ? accent : T.textHint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: Typography.lg,
                      fontWeight: Typography.bold as any,
                      color: active ? accent : T.textPrimary,
                      marginBottom: 3,
                    }}
                  >
                    {title}
                  </Text>
                  <Text style={{ fontSize: Typography.sm, color: T.textSub, lineHeight: 19 }}>{desc}</Text>
                </View>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: Radii.full,
                    backgroundColor: active ? accent : T.surfaceHigh,
                    borderWidth: active ? 0 : 1.5,
                    borderColor: T.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {active && <MaterialCommunityIcons name="check" size={14} color={T.white} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ gap: Spacing['4'] }}>
          <TouchableOpacity
            onPress={onContinue}
            activeOpacity={0.85}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: T.primary,
              borderRadius: Radii.lg,
              paddingVertical: Spacing['4'],
              ...Shadows.colored(T.primary),
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
              <Text style={{ color: T.white, fontSize: Typography.lg, fontWeight: Typography.semibold as any }}>
                Continue as {role === 'applicant' ? 'Job Seeker' : 'HR / Company'}
              </Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={T.white} />
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing['2'] }}>
            <Text style={{ fontSize: Typography.sm, color: T.textSub }}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: Typography.sm, color: T.primary, fontWeight: Typography.semibold as any }}>
                  Sign in
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}
