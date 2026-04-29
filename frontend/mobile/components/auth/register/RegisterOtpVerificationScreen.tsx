import React, { useEffect, useRef } from 'react';
import { Animated, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Radii, SectionCard, Shadows, Spacer, Spacing, Typography } from '../../ui';

type Props = {
  T: any;
  topInset: number;
  email: string;
  code: string;
  error: string;
  helperMessage?: string;
  verifying: boolean;
  resending: boolean;
  inputRowStyle: any;
  inputStyle: any;
  fieldLabelStyle: any;
  onBack: () => void;
  onChangeCode: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  errorTimestamp?: number; // Add this to track when error occurs
};

export function RegisterOtpVerificationScreen({
  T,
  topInset,
  email,
  code,
  error,
  helperMessage,
  verifying,
  resending,
  inputRowStyle,
  inputStyle,
  fieldLabelStyle,
  onBack,
  onChangeCode,
  onVerify,
  onResend,
  errorTimestamp,
}: Props) {
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const [showErrorState, setShowErrorState] = React.useState(false);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Trigger shake animation and red color whenever errorTimestamp changes (new error)
    if (error && errorTimestamp) {
      // Show error state
      setShowErrorState(true);
      
      // Reset position
      shakeAnimation.setValue(0);
      
      // Shake animation sequence
      Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      // Clear any existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      // Reset error state after 3 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setShowErrorState(false);
      }, 3000);
    }

    // Cleanup timeout on unmount
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [errorTimestamp, error, shakeAnimation]);

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
              Verify your email
            </Text>
            <Text style={{ fontSize: Typography.sm, color: T.textSub, lineHeight: 20 }}>
              We sent a 6-digit verification code to <Text style={{ color: T.textPrimary, fontWeight: Typography.semibold as any }}>{email}</Text>.
            </Text>
          </View>
        </SectionCard>

        {error ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], backgroundColor: T.dangerBg, borderWidth: 1, borderColor: T.danger + '44', borderRadius: Radii.md, paddingHorizontal: Spacing['3'], paddingVertical: Spacing['3'] }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={15} color={T.danger} />
            <Text style={{ flex: 1, color: T.danger, fontSize: Typography.base }}>{error}</Text>
          </View>
        ) : null}

        {helperMessage ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], backgroundColor: T.warningLight, borderWidth: 1, borderColor: T.warning + '44', borderRadius: Radii.md, paddingHorizontal: Spacing['3'], paddingVertical: Spacing['3'] }}>
            <MaterialCommunityIcons name="flask-outline" size={15} color={T.warning} />
            <Text style={{ flex: 1, color: T.textSub, fontSize: Typography.base }}>{helperMessage}</Text>
          </View>
        ) : null}

        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Verification Code">
          <View style={{ gap: Spacing['3'] }}>
            <Text style={fieldLabelStyle}>6-digit OTP</Text>

            {/* OTP grid cells */}
            <Animated.View style={{ position: 'relative', transform: [{ translateX: shakeAnimation }] }}>
              <View style={{ flexDirection: 'row', gap: Spacing['2'], justifyContent: 'space-between' }}>
                {Array.from({ length: 6 }).map((_, i) => {
                  const digit = code[i];
                  const isFocused = code.length === i || (code.length === 6 && i === 5);
                  const hasError = showErrorState;
                  return (
                    <View
                      key={i}
                      style={{
                        flex: 1,
                        aspectRatio: 0.85,
                        borderRadius: Radii.md,
                        borderWidth: isFocused ? 2 : 1.5,
                        borderColor: hasError ? T.danger : (isFocused ? T.primary : digit ? T.primary + '66' : T.border),
                        backgroundColor: hasError ? T.danger + '0d' : (digit ? T.primary + '0d' : T.bg),
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {digit ? (
                        <Text style={{ fontSize: 22, fontWeight: '700', color: hasError ? T.danger : T.textPrimary, letterSpacing: 0 }}>
                          {digit}
                        </Text>
                      ) : (
                        <View style={{ width: 16, height: 2.5, borderRadius: 2, backgroundColor: hasError ? T.danger : (isFocused ? T.primary : T.border) }} />
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Hidden full-width input that captures keypresses */}
              <TextInput
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0 }}
                value={code}
                onChangeText={(value) => onChangeCode(value.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                autoFocus
                maxLength={6}
                caretHidden
              />
            </Animated.View>

            <Text style={{ fontSize: Typography.xs, color: T.textHint }}>
              Enter the code from your email to finish creating your applicant account.
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
            opacity: verifying ? 0.7 : 1,
            ...Shadows.colored(T.primary),
          }}
          onPress={onVerify}
          activeOpacity={0.85}
          disabled={verifying}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
            <Text style={{ color: T.white, fontSize: Typography.lg, fontWeight: Typography.semibold as any }}>
              {verifying ? 'Verifying...' : 'Verify and create account'}
            </Text>
            <MaterialCommunityIcons name="check" size={18} color={T.white} />
          </View>
        </TouchableOpacity>

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
            opacity: resending ? 0.7 : 1,
          }}
          onPress={onResend}
          activeOpacity={0.85}
          disabled={resending}
        >
          <MaterialCommunityIcons name="email-fast-outline" size={18} color={T.textPrimary} />
          <Text style={{ fontSize: Typography.md, fontWeight: Typography.semibold as any, color: T.textPrimary }}>
            {resending ? 'Sending new code...' : 'Resend code'}
          </Text>
        </TouchableOpacity>

        <Spacer size="xl" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}