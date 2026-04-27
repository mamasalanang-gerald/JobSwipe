import React, { useState } from 'react';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Divider, Radii, SectionCard, Shadows, Spacer, Spacing, Typography } from '../../ui';
import type { AuthRole } from '../../../store/authStore';

type Props = {
  T: any;
  topInset: number;
  email: string;
  detectedCompany: { name: string; validCodes: string[] } | null;
  fieldLabelStyle: any;
  inputRowStyle: any;
  inputStyle: any;
  jobTitleOptions: string[];
  setToken: (token: string, role?: AuthRole | null) => Promise<void>;
  inviteCode: string;
  onBack: () => void;
};

export function HRInviteRegistrationForm({
  T,
  topInset,
  email,
  detectedCompany,
  fieldLabelStyle,
  inputRowStyle,
  inputStyle,
  jobTitleOptions,
  setToken,
  inviteCode,
  onBack,
}: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [showJobTitleDropdown, setShowJobTitleDropdown] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<{ uri: string; name: string } | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasMinLength = password.length >= 8;
  const strengthLevel =
    password.length === 0 ? null : !hasMinLength || !hasUppercase || !hasNumber ? 'weak' : password.length < 12 ? 'good' : 'strong';
  const strengthColor = strengthLevel === 'weak' ? T.danger : strengthLevel === 'good' ? T.warning : T.success;
  const resolvedTitle = jobTitle === 'Custom' ? customJobTitle.trim() : jobTitle;

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setProfilePhoto({ uri: asset.uri, name: asset.fileName ?? 'photo.jpg' });
    }
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!firstName.trim() || firstName.trim().length < 2 || firstName.trim().length > 50) {
      setFormError('First name must be 2-50 characters.');
      return;
    }
    if (!lastName.trim() || lastName.trim().length < 2 || lastName.trim().length > 50) {
      setFormError('Last name must be 2-50 characters.');
      return;
    }
    if (!resolvedTitle || resolvedTitle.length < 2 || resolvedTitle.length > 100) {
      setFormError('Job title must be 2-100 characters.');
      return;
    }
    if (!password) {
      setFormError('Please enter a password.');
      return;
    }
    if (!hasMinLength) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    if (!hasUppercase) {
      setFormError('Password must contain at least 1 uppercase letter.');
      return;
    }
    if (!hasNumber) {
      setFormError('Password must contain at least 1 number.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role: 'hr',
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          job_title: resolvedTitle,
          photo_url: profilePhoto?.uri ?? null,
          company_invite_token: inviteCode,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        setFormError(data.message || 'Registration failed. Please try again.');
        return;
      }
      await setToken(data.data.token, 'hr');
      router.replace('/(company-tabs)');
    } catch {
      setFormError('Network error. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: T.bg, paddingTop: topInset }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      <View style={{ paddingHorizontal: Spacing['5'], paddingTop: Spacing['4'], paddingBottom: Spacing['3'] }}>
        <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], alignSelf: 'flex-start' }} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={T.textSub} />
          <Text style={{ fontSize: Typography.md, color: T.textSub }}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing['4'], gap: Spacing['4'] }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {detectedCompany && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['3'], backgroundColor: T.primary + '18', borderWidth: 1, borderColor: T.primary + '33', borderRadius: Radii.lg, paddingHorizontal: Spacing['4'], paddingVertical: Spacing['3'] }}>
            <MaterialCommunityIcons name="office-building" size={20} color={T.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: Typography.sm, fontWeight: Typography.semibold as any, color: T.primary }}>
                Joining {detectedCompany.name}
              </Text>
              <Text style={{ fontSize: Typography.xs, color: T.textSub }}>HR team member via invite</Text>
            </View>
            <MaterialCommunityIcons name="check-circle" size={18} color={T.success} />
          </View>
        )}

        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }}>
          <View style={{ gap: Spacing['1'] }}>
            <Text style={{ fontSize: Typography['2xl'], fontWeight: Typography.bold as any, color: T.textPrimary, letterSpacing: -0.3 }}>
              HR registration
            </Text>
            <Text style={{ fontSize: Typography.sm, color: T.textSub, lineHeight: 20 }}>
              Finish your invite-based registration to join the company team.
            </Text>
          </View>
        </SectionCard>

        {formError ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], backgroundColor: T.dangerBg, borderWidth: 1, borderColor: T.danger + '44', borderRadius: Radii.md, paddingHorizontal: Spacing['3'], paddingVertical: Spacing['3'] }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={15} color={T.danger} />
            <Text style={{ flex: 1, color: T.danger, fontSize: Typography.base }}>{formError}</Text>
          </View>
        ) : null}

        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Personal Info">
          <View style={{ gap: Spacing['4'] }}>
            <View style={{ gap: Spacing['1'] }}>
              <Text style={fieldLabelStyle}>Email</Text>
              <View style={[inputRowStyle, { backgroundColor: T.surfaceHigh, opacity: 0.7 }]}>
                <MaterialCommunityIcons name="email-outline" size={16} color={T.textHint} />
                <Text style={[inputStyle, { color: T.textSub, flex: 1 }]}>{email}</Text>
                <MaterialCommunityIcons name="lock-outline" size={14} color={T.textHint} />
              </View>
              <Text style={{ fontSize: Typography.xs, color: T.textHint }}>Pre-filled from invite and locked</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing['3'] }}>
              <View style={{ flex: 1, gap: Spacing['2'] }}>
                <Text style={fieldLabelStyle}>First name *</Text>
                <View style={inputRowStyle}>
                  <MaterialCommunityIcons name="account-outline" size={16} color={T.textHint} />
                  <TextInput style={inputStyle} placeholder="John" placeholderTextColor={T.textHint} value={firstName} onChangeText={setFirstName} />
                </View>
              </View>
              <View style={{ flex: 1, gap: Spacing['2'] }}>
                <Text style={fieldLabelStyle}>Last name *</Text>
                <View style={inputRowStyle}>
                  <MaterialCommunityIcons name="account-outline" size={16} color={T.textHint} />
                  <TextInput style={inputStyle} placeholder="Doe" placeholderTextColor={T.textHint} value={lastName} onChangeText={setLastName} />
                </View>
              </View>
            </View>

            <Divider spacing={Spacing['1']} />

            <View style={{ gap: Spacing['2'] }}>
              <Text style={fieldLabelStyle}>Job title *</Text>
              <TouchableOpacity style={[inputRowStyle, { justifyContent: 'space-between' }]} onPress={() => setShowJobTitleDropdown((value) => !value)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], flex: 1 }}>
                  <MaterialCommunityIcons name="briefcase-outline" size={16} color={T.textHint} />
                  <Text style={{ color: resolvedTitle ? T.textPrimary : T.textHint, fontSize: Typography.md }}>
                    {resolvedTitle || 'Select or type your title'}
                  </Text>
                </View>
                <MaterialCommunityIcons name={showJobTitleDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={T.textHint} />
              </TouchableOpacity>

              {showJobTitleDropdown && (
                <View style={{ gap: Spacing['2'], backgroundColor: T.surfaceHigh, borderRadius: Radii.lg, padding: Spacing['2'] }}>
                  {jobTitleOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        setJobTitle(option);
                        setShowJobTitleDropdown(false);
                      }}
                      style={{ paddingHorizontal: Spacing['3'], paddingVertical: Spacing['3'], borderRadius: Radii.md }}
                    >
                      <Text style={{ fontSize: Typography.sm, color: T.textPrimary }}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {jobTitle === 'Custom' && (
                <View style={inputRowStyle}>
                  <MaterialCommunityIcons name="pencil-outline" size={16} color={T.textHint} />
                  <TextInput
                    style={inputStyle}
                    placeholder="Enter custom job title"
                    placeholderTextColor={T.textHint}
                    value={customJobTitle}
                    onChangeText={setCustomJobTitle}
                  />
                </View>
              )}
            </View>

            <Divider spacing={Spacing['1']} />

            <View style={{ gap: Spacing['2'] }}>
              <Text style={fieldLabelStyle}>Profile photo</Text>
              <View style={{ alignItems: 'center', gap: Spacing['2'] }}>
                <TouchableOpacity
                  onPress={pickPhoto}
                  style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: T.surfaceHigh, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 2, borderColor: profilePhoto ? T.primary : T.border }}
                >
                  {profilePhoto ? <Image source={{ uri: profilePhoto.uri }} style={{ width: 72, height: 72 }} /> : <MaterialCommunityIcons name="account" size={36} color={T.textHint} />}
                </TouchableOpacity>
                <TouchableOpacity onPress={pickPhoto} style={{ alignItems: 'center' }} activeOpacity={0.7}>
                  <Text style={{ fontSize: Typography.sm, color: T.primary, fontWeight: Typography.semibold as any }}>{profilePhoto ? 'Change photo' : 'Upload photo'}</Text>
                </TouchableOpacity>
                {profilePhoto && (
                  <TouchableOpacity onPress={() => setProfilePhoto(null)} style={{ alignItems: 'center' }} activeOpacity={0.7}>
                    <Text style={{ fontSize: Typography.xs, color: T.danger }}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </SectionCard>

        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Create Password">
          <View style={{ gap: Spacing['2'] }}>
            <Text style={fieldLabelStyle}>Password</Text>
            <View style={inputRowStyle}>
              <MaterialCommunityIcons name="lock-outline" size={16} color={T.textHint} />
              <TextInput
                style={[inputStyle, { flex: 1 }]}
                placeholder="At least 8 chars, 1 uppercase, 1 number"
                placeholderTextColor={T.textHint}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((value) => !value)}>
                <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={T.textHint} />
              </TouchableOpacity>
            </View>
            {strengthLevel && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['3'] }}>
                <View style={{ flex: 1, height: 3, backgroundColor: T.surfaceHigh, borderRadius: Radii.full, overflow: 'hidden' }}>
                  <View style={{ height: '100%', borderRadius: Radii.full, backgroundColor: strengthColor, width: strengthLevel === 'weak' ? '33%' : strengthLevel === 'good' ? '66%' : '100%' }} />
                </View>
                <Text style={{ fontSize: Typography.xs, color: strengthColor, fontWeight: Typography.semibold as any, minWidth: 36 }}>
                  {strengthLevel === 'weak' ? 'Weak' : strengthLevel === 'good' ? 'Good' : 'Strong'}
                </Text>
              </View>
            )}

            <Divider spacing={Spacing['2']} />

            <Text style={fieldLabelStyle}>Confirm password</Text>
            <View style={inputRowStyle}>
              <MaterialCommunityIcons name="lock-check-outline" size={16} color={T.textHint} />
              <TextInput
                style={[inputStyle, { flex: 1 }]}
                placeholder="Re-enter your password"
                placeholderTextColor={T.textHint}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity onPress={() => setShowConfirm((value) => !value)}>
                <MaterialCommunityIcons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={T.textHint} />
              </TouchableOpacity>
            </View>
          </View>
        </SectionCard>

        <TouchableOpacity
          style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: T.primary, borderRadius: Radii.lg, paddingVertical: Spacing['4'], opacity: submitting ? 0.6 : 1, ...Shadows.colored(T.primary) }}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={submitting}
        >
          {submitting ? (
            <MaterialCommunityIcons name="loading" size={18} color={T.white} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
              <Text style={{ color: T.white, fontSize: Typography.lg, fontWeight: Typography.semibold as any }}>Create account</Text>
              <MaterialCommunityIcons name="check" size={18} color={T.white} />
            </View>
          )}
        </TouchableOpacity>

        <Spacer size="xl" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
