import { Link } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { Radii, SectionCard, Shadows, Spacer, Spacing, Typography } from '../../ui';
import type { Role } from './types';

const GOOGLE_ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  <path fill="none" d="M0 0h48v48H0z"/>
</svg>
`;

function GoogleIcon() {
  return <SvgXml xml={GOOGLE_ICON_SVG} width={18} height={18} />;
}

type Props = {
  T: any;
  topInset: number;
  role: Role;
  email: string;
  error: string;
  googleLoading?: boolean;
  fieldLabelStyle: any;
  inputRowStyle: any;
  inputStyle: any;
  onBack: () => void;
  onChangeEmail: (value: string) => void;
  onContinue: () => void;
  onGoogleRegister: () => void;
  onInviteCode: () => void;
};

export function RegisterEmailGate({
  T,
  topInset,
  role,
  email,
  error,
  googleLoading = false,
  fieldLabelStyle,
  inputRowStyle,
  inputStyle,
  onBack,
  onChangeEmail,
  onContinue,
  onGoogleRegister,
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

        {role === 'applicant' && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['3'] }}>
              <View style={{ flex: 1, height: 1, backgroundColor: T.border }} />
              <Text style={{ fontSize: Typography.sm, color: T.textHint }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: T.border }} />
            </View>

            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: Spacing['2'],
                borderWidth: 1.5,
                borderColor: T.border,
                borderRadius: Radii.lg,
                paddingVertical: Spacing['4'],
                backgroundColor: T.surface,
                opacity: googleLoading ? 0.7 : 1,
              }}
              onPress={onGoogleRegister}
              activeOpacity={0.85}
              disabled={googleLoading}
            >
              <GoogleIcon />
              <Text style={{ fontSize: Typography.md, fontWeight: Typography.semibold as any, color: T.textPrimary }}>
                {googleLoading ? 'Opening Google...' : 'Register with Google'}
              </Text>
            </TouchableOpacity>
          </>
        )}

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