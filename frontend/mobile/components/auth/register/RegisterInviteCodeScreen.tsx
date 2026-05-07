import { Platform, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, Keyboard } from 'react-native';
import React, { useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Radii, Shadows, Spacing, Typography } from '../../ui';

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
  userEmail: string;
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
  userEmail,
  onBack,
  onChangeInviteCode,
  onVerify,
  onRequestInvite,
}: Props) {
  useEffect(() => {
    return () => {
      Keyboard.dismiss();
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: T.bg, paddingTop: topInset }}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={{ paddingHorizontal: Spacing['5'], paddingTop: Spacing['4'], paddingBottom: Spacing['3'] }}>
        <TouchableOpacity
          onPress={onBack}
          style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], alignSelf: 'flex-start' }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={T.textSub} />
          <Text style={{ fontSize: Typography.md, color: T.textSub }}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ 
          paddingHorizontal: Spacing['5'], 
          paddingBottom: Spacing['8'],
          flexGrow: 1,
          justifyContent: 'center'
        }} 
        keyboardShouldPersistTaps="handled" 
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content Card */}
        <View style={{ 
          backgroundColor: T.surface, 
          borderRadius: Radii.xl, 
          padding: Spacing['6'],
          ...Shadows.lg
        }}>
          {/* Icon & Title */}
          <View style={{ alignItems: 'center', marginBottom: Spacing['6'] }}>
            <View style={{ 
              width: 72, 
              height: 72, 
              borderRadius: Radii.full, 
              backgroundColor: T.primary + '18', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: Spacing['4']
            }}>
              <MaterialCommunityIcons name="office-building" size={36} color={T.primary} />
            </View>
            
            <Text style={{ 
              fontSize: Typography.xl, 
              fontWeight: Typography.bold as any, 
              color: T.textPrimary, 
              textAlign: 'center',
              marginBottom: Spacing['2']
            }}>
              {autoDetected ? `Join ${detectedCompany?.name || 'Company'}` : 'Enter Invite Code'}
            </Text>
            
            <Text style={{ 
              fontSize: Typography.sm, 
              color: T.textSub, 
              textAlign: 'center', 
              lineHeight: 20 
            }}>
              {autoDetected 
                ? `Enter your invite code to complete registration and join the team`
                : 'Enter the code from your company admin to verify your access'}
            </Text>
          </View>

          {/* Input Section */}
          <View style={{ marginBottom: Spacing['5'] }}>
            <Text style={[fieldLabelStyle, { marginBottom: Spacing['2'] }]}>
              Invite Code
            </Text>
            <View style={inputRowStyle}>
              <MaterialCommunityIcons name="ticket-outline" size={20} color={T.textHint} />
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
            {inviteError ? (
              <Text style={{ 
                fontSize: Typography.xs, 
                color: T.danger, 
                marginTop: Spacing['2'] 
              }}>
                {inviteError}
              </Text>
            ) : null}
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={{ 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: T.primary, 
              borderRadius: Radii.lg, 
              paddingVertical: Spacing['4'],
              marginBottom: Spacing['4'],
              ...Shadows.colored(T.primary) 
            }}
            onPress={onVerify}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
              <Text style={{ 
                color: T.white, 
                fontSize: Typography.md, 
                fontWeight: Typography.semibold as any 
              }}>
                {autoDetected ? 'Complete Registration' : 'Verify & Continue'}
              </Text>
              <MaterialCommunityIcons name="check-circle" size={20} color={T.white} />
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginVertical: Spacing['4'] 
          }}>
            <View style={{ flex: 1, height: 1, backgroundColor: T.border }} />
            <Text style={{ 
              marginHorizontal: Spacing['3'], 
              fontSize: Typography.xs, 
              color: T.textHint 
            }}>
              OR
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: T.border }} />
          </View>

          {/* Request Invite Section */}
          <View style={{ alignItems: 'center' }}>
            <Text style={{ 
              fontSize: Typography.sm, 
              color: T.textSub, 
              textAlign: 'center',
              marginBottom: Spacing['3'],
              lineHeight: 20
            }}>
              Don't have an invite code? Contact your company administrator to request access.
            </Text>
            
            <TouchableOpacity
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: Spacing['2'], 
                borderWidth: 1.5, 
                borderColor: T.primary, 
                borderRadius: Radii.lg, 
                paddingVertical: Spacing['3'],
                paddingHorizontal: Spacing['4'],
                minWidth: 200
              }}
              onPress={onRequestInvite}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="email-arrow-right-outline" size={18} color={T.primary} />
              <Text style={{ 
                fontSize: Typography.sm, 
                color: T.primary, 
                fontWeight: Typography.semibold as any 
              }}>
                Request Invite
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
