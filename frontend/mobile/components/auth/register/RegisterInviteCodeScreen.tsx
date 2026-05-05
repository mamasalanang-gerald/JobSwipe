import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Radii, SectionCard, Shadows, Spacer, Spacing, Typography } from '../../ui';

type CompanyInfo = { name: string; validCodes: string[] } | null;

type Props = {
  T: any;
  topInset: number;
  inviteCode: string;
  inviteError: string;
  detectedCompany: CompanyInfo;
  fieldLabelStyle: any;
  inputRowStyle: any;
  inputStyle: any;
  autoDetected?: boolean;
  userEmail?: string;
  onBack: () => void;
  onChangeInviteCode: (value: string) => void;
  onVerify: () => void;
  onRequestInvite: () => void;
};

export function RegisterInviteCodeScreen({
  T,
  topInset,
  inviteCode,
  inviteError,
  detectedCompany,
  fieldLabelStyle,
  inputRowStyle,
  inputStyle,
  autoDetected = false,
  userEmail = '',
  onBack,
  onChangeInviteCode,
  onVerify,
  onRequestInvite,
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

      <ScrollView contentContainerStyle={{ padding: Spacing['4'], gap: Spacing['4'] }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {autoDetected && detectedCompany ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: Spacing['2'], backgroundColor: T.primary + '15', borderWidth: 1, borderColor: T.primary + '44', borderRadius: Radii.md, paddingHorizontal: Spacing['3'], paddingVertical: Spacing['3'] }}>
            <MaterialCommunityIcons name="information-outline" size={18} color={T.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: T.textPrimary, fontSize: Typography.sm, fontWeight: Typography.semibold as any }}>
                Almost Done!
              </Text>
              <Text style={{ color: T.textSub, fontSize: Typography.xs, marginTop: 4, lineHeight: 18 }}>
                Your registration form is complete. We detected that {detectedCompany.name} already exists. Enter your invite code below to finalize joining the team.
              </Text>
            </View>
          </View>
        ) : null}

        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }}>
          <View style={{ alignItems: 'center', gap: Spacing['3'], paddingVertical: Spacing['2'] }}>
            <View style={{ width: 56, height: 56, borderRadius: Radii.xl, backgroundColor: T.primary + '18', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="office-building" size={28} color={T.primary} />
            </View>
            <Text style={{ fontSize: Typography.lg, fontWeight: Typography.bold as any, color: T.textPrimary, textAlign: 'center' }}>
              {autoDetected ? `Verify Your Access to ${detectedCompany?.name || 'Company'}` : 'Join with an invite code'}
            </Text>
            <Text style={{ fontSize: Typography.sm, color: T.textSub, textAlign: 'center', lineHeight: 20 }}>
              {autoDetected 
                ? `You've completed your registration form. To finalize joining ${detectedCompany?.name || 'this company'} as an HR member, please enter the invite code provided by your company administrator.`
                : 'Enter the code from your company admin. We\'ll use it to verify your company and work email.'}
            </Text>
          </View>
        </SectionCard>

        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Finalize Registration">
          <View style={{ gap: Spacing['2'] }}>
            <Text style={fieldLabelStyle}>Company invite token</Text>
            <View style={inputRowStyle}>
              <MaterialCommunityIcons name="ticket-outline" size={16} color={T.textHint} />
              <TextInput
                style={inputStyle}
                placeholder="e.g. COMPANY-HR-2024"
                placeholderTextColor={T.textHint}
                value={inviteCode}
                onChangeText={onChangeInviteCode}
                autoCapitalize="characters"
                autoFocus={!autoDetected}
              />
            </View>
            {autoDetected && (
              <Text style={{ fontSize: Typography.xs, color: T.textHint, lineHeight: 16 }}>
                Enter the invite code from your {detectedCompany?.name || 'company'} administrator to complete your registration and join the team.
              </Text>
            )}
            {inviteError ? <Text style={{ fontSize: Typography.xs, color: T.danger }}>{inviteError}</Text> : null}
          </View>
        </SectionCard>

        <TouchableOpacity
          style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: T.primary, borderRadius: Radii.lg, paddingVertical: Spacing['4'], ...Shadows.colored(T.primary) }}
          onPress={onVerify}
          activeOpacity={0.85}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
            <Text style={{ color: T.white, fontSize: Typography.lg, fontWeight: Typography.semibold as any }}>
              {autoDetected ? 'Complete Registration' : 'Verify & Continue'}
            </Text>
            <MaterialCommunityIcons name="check-circle" size={18} color={T.white} />
          </View>
        </TouchableOpacity>

        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }}>
          <View style={{ gap: Spacing['3'] }}>
            <Text style={{ fontSize: Typography.sm, fontWeight: Typography.semibold as any, color: T.textPrimary }}>
              {autoDetected ? 'Need an invite code?' : 'Don\'t have an invite code?'}
            </Text>
            <Text style={{ fontSize: Typography.sm, color: T.textSub, lineHeight: 20 }}>
              {autoDetected 
                ? `Your company administrator can provide you with an invite code. Contact them to request access to join ${detectedCompany?.name || 'the company'} as an HR team member.`
                : `Ask your company admin to send you an invite link, or contact ${detectedCompany ? detectedCompany.name : 'your company'}'s HR team to get access.`}
            </Text>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing['2'], borderWidth: 1, borderColor: T.primary, borderRadius: Radii.lg, paddingVertical: Spacing['3'] }}
              onPress={onRequestInvite}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="email-arrow-right-outline" size={16} color={T.primary} />
              <Text style={{ fontSize: Typography.sm, color: T.primary, fontWeight: Typography.semibold as any }}>
                {autoDetected ? 'Request invite code' : 'Request an invite link'}
              </Text>
            </TouchableOpacity>
          </View>
        </SectionCard>

        <Spacer size="xl" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
