import { Link } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Radii, SectionCard, Shadows, Spacer, Spacing, Typography } from '../../ui';
import type { Role } from './types';

type Props = {
  T: any;
  topInset: number;
  role: Role;
  email: string;
  error: string;
  fieldLabelStyle: any;
  inputRowStyle: any;
  inputStyle: any;
  onBack: () => void;
  onChangeEmail: (value: string) => void;
  onContinue: () => void;
  onInviteCode: () => void;
};

export function RegisterEmailGate({
  T,
  topInset,
  role,
  email,
  error,
  fieldLabelStyle,
  inputRowStyle,
  inputStyle,
  onBack,
  onChangeEmail,
  onContinue,
  onInviteCode,
}: Props) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: T.bg, paddingTop: topInset }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      <View style={{ paddingHorizontal: Spacing['5'], paddingTop: Spacing['4'], paddingBottom: Spacing['5'] }}>
        <TouchableOpacity
          onPress={onBack}
          style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], alignSelf: 'flex-start' }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={T.textSub} />
          <Text style={{ fontSize: Typography.md, color: T.textSub }}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing['4'], gap: Spacing['3'] }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }}>
          <View style={{ gap: Spacing['2'] }}>
            <Text style={{ fontSize: Typography['2xl'], fontWeight: Typography.bold as any, color: T.textPrimary, letterSpacing: -0.3 }}>
              Create your account
            </Text>
            <Text style={{ fontSize: Typography.sm, color: T.textSub, lineHeight: 20 }}>
              {role === 'applicant'
                ? 'Start with your email, then we’ll guide you through each applicant onboarding step.'
                : 'Use your work email to create a company account, or join an existing company with an invite code.'}
            </Text>
          </View>
        </SectionCard>

        {error ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], backgroundColor: T.dangerBg, borderWidth: 1, borderColor: T.danger + '44', borderRadius: Radii.md, paddingHorizontal: Spacing['3'], paddingVertical: Spacing['3'] }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={15} color={T.danger} />
            <Text style={{ flex: 1, color: T.danger, fontSize: Typography.base }}>{error}</Text>
          </View>
        ) : null}

        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Registration Form">
          <View style={{ gap: Spacing['2'] }}>
            <Text style={fieldLabelStyle}>Email address</Text>
            <View style={inputRowStyle}>
              <MaterialCommunityIcons name="email-outline" size={16} color={T.textHint} />
              <TextInput
                style={inputStyle}
                placeholder={role === 'hr' ? 'admin@company.com' : 'your.email@example.com'}
                placeholderTextColor={T.textHint}
                value={email}
                onChangeText={onChangeEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus
              />
            </View>
            <Text style={{ fontSize: Typography.xs, color: T.textHint }}>
              {role === 'hr' ? 'Use your work email to create a company account.' : "We'll send a verification code to this address."}
            </Text>
          </View>
        </SectionCard>

        <TouchableOpacity
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: T.primary,
            borderRadius: Radii.lg,
            paddingVertical: Spacing['4'],
            ...Shadows.colored(T.primary),
          }}
          onPress={onContinue}
          activeOpacity={0.85}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
            <Text style={{ color: T.white, fontSize: Typography.lg, fontWeight: Typography.semibold as any }}>Continue</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color={T.white} />
          </View>
        </TouchableOpacity>

        {role === 'hr' && (
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: Spacing['2'],
              borderWidth: 1.5,
              borderColor: T.primary,
              borderRadius: Radii.lg,
              paddingVertical: Spacing['4'],
              backgroundColor: T.surface,
            }}
            onPress={onInviteCode}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="ticket-confirmation-outline" size={18} color={T.primary} />
            <Text style={{ fontSize: Typography.md, fontWeight: Typography.semibold as any, color: T.primary }}>
              Register via Invite Code
            </Text>
          </TouchableOpacity>
        )}

        <Text style={{ fontSize: Typography.xs, color: T.textHint, textAlign: 'center', lineHeight: 18 }}>
          By continuing, you agree to our <Text style={{ color: T.primary, fontWeight: Typography.medium as any }}>Terms of Service</Text> and{' '}
          <Text style={{ color: T.primary, fontWeight: Typography.medium as any }}>Privacy Policy</Text>.
        </Text>

        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing['2'] }}>
            <Text style={{ fontSize: Typography.md, color: T.textSub }}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={{ fontSize: Typography.md, color: T.primary, fontWeight: Typography.semibold as any }}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </SectionCard>

        <Spacer size="xl" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
