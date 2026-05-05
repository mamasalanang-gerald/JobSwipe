import React, { useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View, Modal } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import Svg, { Path } from 'react-native-svg';
import { Divider, Radii, SectionCard, Spacing, Typography } from '../../ui';
import { COMPANY_SIZE_OPTIONS, INDUSTRY_OPTIONS, Step, WorkEntry, EducationEntry } from './types';
import { COUNTRIES, getProvincesForCountry, getProvincesForRegion, getCitiesForProvince } from '../../../constants/locations';

type LocalUploadFile = {
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number;
};

type Props = {
  T: any;
  stepKey: Step;
  fieldLabelStyle: any;
  inputRowStyle: any;
  inputStyle: any;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setShowPassword: (value: boolean) => void;
  strengthLevel: 'weak' | 'good' | 'strong' | null;
  strengthColor: string;
  firstName: string;
  lastName: string;
  location: string;
  locationCity: string;
  locationRegion: string;
  locationProvince: string;
  locationCountry: string;
  bio: string;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setLocation: (value: string) => void;
  setLocationCity: (value: string) => void;
  setLocationRegion: (value: string) => void;
  setLocationProvince: (value: string) => void;
  setLocationCountry: (value: string) => void;
  setBio: (value: string) => void;
  resumeFile: LocalUploadFile | null;
  setResumeFile: (value: LocalUploadFile | null) => void;
  hardSkills: string[];
  softSkills: string[];
  hardSkillInput: string;
  softSkillInput: string;
  setHardSkillInput: (value: string) => void;
  setSoftSkillInput: (value: string) => void;
  addSkill: (type: 'hard' | 'soft', value?: string) => void;
  removeSkill: (type: 'hard' | 'soft', skill: string) => void;
  hardSkillSuggestions: string[];
  softSkillSuggestions: string[];
  workEntries: WorkEntry[];
  setWorkEntries: (value: WorkEntry[] | ((prev: WorkEntry[]) => WorkEntry[])) => void;
  educationEntries: EducationEntry[];
  setEducationEntries: (value: EducationEntry[] | ((prev: EducationEntry[]) => EducationEntry[])) => void;
  photoFile: LocalUploadFile | null;
  setPhotoFile: (value: LocalUploadFile | null) => void;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  twitterUrl: string;
  setLinkedinUrl: (value: string) => void;
  setGithubUrl: (value: string) => void;
  setPortfolioUrl: (value: string) => void;
  setTwitterUrl: (value: string) => void;
  companyName: string;
  companyTagline: string;
  companyDescription: string;
  companyIndustry: string;
  companySize: string;
  foundedYear: string;
  websiteUrl: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressProvince: string;
  addressCountry: string;
  addressPostal: string;
  companySocialLinks: string[];
  setCompanyName: (value: string) => void;
  setCompanyTagline: (value: string) => void;
  setCompanyDescription: (value: string) => void;
  setCompanyIndustry: (value: string) => void;
  setCompanySize: (value: string) => void;
  setFoundedYear: (value: string) => void;
  setWebsiteUrl: (value: string) => void;
  setAddressStreet: (value: string) => void;
  setAddressCity: (value: string) => void;
  setAddressState: (value: string) => void;
  setAddressProvince: (value: string) => void;
  setAddressCountry: (value: string) => void;
  setAddressPostal: (value: string) => void;
  setCompanySocialLinks: (value: string[] | ((prev: string[]) => string[])) => void;
  verificationDocs: LocalUploadFile[];
  setVerificationDocs: (value: LocalUploadFile[] | ((prev: LocalUploadFile[]) => LocalUploadFile[])) => void;
  logoFile: LocalUploadFile | null;
  setLogoFile: (value: LocalUploadFile | null) => void;
  officeImages: LocalUploadFile[];
  setOfficeImages: (value: LocalUploadFile[] | ((prev: LocalUploadFile[]) => LocalUploadFile[])) => void;
  setError: (value: string) => void;
};

export function RegisterStepContent(props: Props) {
  const {
    T,
    stepKey,
    fieldLabelStyle,
    inputRowStyle,
    inputStyle,
    password,
    confirmPassword,
    showPassword,
    setPassword,
    setConfirmPassword,
    setShowPassword,
    strengthLevel,
    strengthColor,
    firstName,
    lastName,
    location,
    locationCity,
    locationRegion,
    locationProvince,
    locationCountry,
    bio,
    setFirstName,
    setLastName,
    setLocation,
    setLocationCity,
    setLocationRegion,
    setLocationProvince,
    setLocationCountry,
    setBio,
    resumeFile,
    setResumeFile,
    hardSkills,
    softSkills,
    hardSkillInput,
    softSkillInput,
    setHardSkillInput,
    setSoftSkillInput,
    addSkill,
    removeSkill,
    hardSkillSuggestions,
    softSkillSuggestions,
    workEntries,
    setWorkEntries,
    educationEntries,
    setEducationEntries,
    photoFile,
    setPhotoFile,
    linkedinUrl,
    githubUrl,
    portfolioUrl,
    twitterUrl,
    setLinkedinUrl,
    setGithubUrl,
    setPortfolioUrl,
    setTwitterUrl,
    companyName,
    companyTagline,
    companyDescription,
    companyIndustry,
    companySize,
    foundedYear,
    websiteUrl,
    addressStreet,
    addressCity,
    addressState,
    addressProvince,
    addressCountry,
    addressPostal,
    companySocialLinks,
    setCompanyName,
    setCompanyTagline,
    setCompanyDescription,
    setCompanyIndustry,
    setCompanySize,
    setFoundedYear,
    setWebsiteUrl,
    setAddressStreet,
    setAddressCity,
    setAddressState,
    setAddressProvince,
    setAddressCountry,
    setAddressPostal,
    setCompanySocialLinks,
    verificationDocs,
    setVerificationDocs,
    logoFile,
    setLogoFile,
    officeImages,
    setOfficeImages,
    setError,
  } = props;

  switch (stepKey) {
    case 'password':
      return (
        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Registration Form">
          <View style={{ gap: Spacing['2'] }}>
            <Text style={fieldLabelStyle}>Password</Text>
            <View style={inputRowStyle}>
              <MaterialCommunityIcons name="lock-outline" size={16} color={T.textHint} />
              <TextInput
                style={[inputStyle, { flex: 1 }]}
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                placeholderTextColor={T.textHint}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoFocus
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: Spacing['1'] }}>
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
          </View>

          <Divider spacing={Spacing['4']} />

          <View style={{ gap: Spacing['2'] }}>
            <Text style={fieldLabelStyle}>Confirm password</Text>
            <View style={inputRowStyle}>
              <MaterialCommunityIcons name="lock-check-outline" size={16} color={T.textHint} />
              <TextInput
                style={inputStyle}
                placeholder="Re-enter your password"
                placeholderTextColor={T.textHint}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>
          </View>
        </SectionCard>
      );

    case 'basic':
      const isPhilippines = locationCountry === 'Philippines';
      const availableRegionsOrStates = getProvincesForCountry(locationCountry);
      const availableProvinces = isPhilippines ? getProvincesForRegion(locationRegion) : [];
      const availableCities = isPhilippines 
        ? getCitiesForProvince(locationCountry, locationProvince)
        : getCitiesForProvince(locationCountry, locationRegion);
      
      return (
        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Basic Info">
          <View style={{ flexDirection: 'row', gap: Spacing['3'] }}>
            <View style={{ flex: 1, gap: Spacing['2'] }}>
              <Text style={fieldLabelStyle}>First name *</Text>
              <View style={inputRowStyle}>
                <TextInput style={inputStyle} placeholder="John" placeholderTextColor={T.textHint} value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
              </View>
            </View>
            <View style={{ flex: 1, gap: Spacing['2'] }}>
              <Text style={fieldLabelStyle}>Last name *</Text>
              <View style={inputRowStyle}>
                <TextInput style={inputStyle} placeholder="Doe" placeholderTextColor={T.textHint} value={lastName} onChangeText={setLastName} autoCapitalize="words" />
              </View>
            </View>
          </View>

          <Divider spacing={Spacing['4']} />

          <View style={{ gap: Spacing['3'] }}>
            <Text style={fieldLabelStyle}>Location *</Text>

            <View style={{ gap: Spacing['2'] }}>
              <Text style={[fieldLabelStyle, { marginBottom: 0 }]}>Country</Text>
              <View style={[inputRowStyle, { paddingHorizontal: 0, paddingVertical: 0 }]}>
                <Picker
                  selectedValue={locationCountry}
                  onValueChange={(value) => {
                    setLocationCountry(value);
                    setLocationRegion('');
                    setLocationProvince('');
                    setLocationCity('');
                    setLocation('');
                  }}
                  style={{ flex: 1, color: T.textPrimary }}
                >
                  <Picker.Item label="Select country..." value="" />
                  {COUNTRIES.map((country) => (
                    <Picker.Item key={country} label={country} value={country} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={{ gap: Spacing['2'] }}>
              <Text style={[fieldLabelStyle, { marginBottom: 0 }]}>
                {isPhilippines ? 'Region' : locationCountry === 'United States' || locationCountry === 'Australia' ? 'State' : locationCountry === 'Canada' ? 'Province' : 'Region'}
              </Text>
              <View style={[inputRowStyle, { paddingHorizontal: 0, paddingVertical: 0 }]}>
                <Picker
                  selectedValue={locationRegion}
                  onValueChange={(value) => {
                    setLocationRegion(value);
                    setLocationProvince('');
                    setLocationCity('');
                    if (!isPhilippines && value && locationCity) {
                      setLocation(`${locationCity}, ${value}`);
                    }
                  }}
                  style={{ flex: 1, color: T.textPrimary }}
                  enabled={!!locationCountry}
                >
                  <Picker.Item label={locationCountry ? (isPhilippines ? 'Select region...' : locationCountry === 'United States' || locationCountry === 'Australia' ? 'Select state...' : locationCountry === 'Canada' ? 'Select province...' : 'Select region...') : 'Select country first'} value="" />
                  {availableRegionsOrStates.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </View>
            </View>

            {isPhilippines && (
              <View style={{ gap: Spacing['2'] }}>
                <Text style={[fieldLabelStyle, { marginBottom: 0 }]}>Province</Text>
                <View style={[inputRowStyle, { paddingHorizontal: 0, paddingVertical: 0 }]}>
                  <Picker
                    selectedValue={locationProvince}
                    onValueChange={(value) => {
                      setLocationProvince(value);
                      setLocationCity('');
                    }}
                    style={{ flex: 1, color: T.textPrimary }}
                    enabled={!!locationRegion}
                  >
                    <Picker.Item label={locationRegion ? 'Select province...' : 'Select region first'} value="" />
                    {availableProvinces.map((province) => (
                      <Picker.Item key={province} label={province} value={province} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            <View style={{ gap: Spacing['2'] }}>
              <Text style={[fieldLabelStyle, { marginBottom: 0 }]}>City</Text>
              <View style={[inputRowStyle, { paddingHorizontal: 0, paddingVertical: 0 }]}>
                <Picker
                  selectedValue={locationCity}
                  onValueChange={(value) => {
                    setLocationCity(value);
                    if (value) {
                      if (isPhilippines && locationProvince) {
                        setLocation(`${value}, ${locationProvince}`);
                      } else if (!isPhilippines && locationRegion) {
                        setLocation(`${value}, ${locationRegion}`);
                      }
                    }
                  }}
                  style={{ flex: 1, color: T.textPrimary }}
                  enabled={isPhilippines ? !!locationProvince : !!locationRegion}
                >
                  <Picker.Item 
                    label={
                      isPhilippines 
                        ? (locationProvince ? 'Select city...' : 'Select province first')
                        : (locationRegion ? 'Select city...' : (locationCountry === 'United States' || locationCountry === 'Australia' ? 'Select state first' : locationCountry === 'Canada' ? 'Select province first' : 'Select region first'))
                    } 
                    value="" 
                  />
                  {availableCities.map((city) => (
                    <Picker.Item key={city} label={city} value={city} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <Divider spacing={Spacing['4']} />

          <View style={{ gap: Spacing['2'] }}>
            <Text style={fieldLabelStyle}>Bio</Text>
            <View style={[inputRowStyle, { alignItems: 'flex-start', paddingVertical: Spacing['2'] }]}>
              <TextInput
                style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' }]}
                placeholder="Tell us about yourself..."
                placeholderTextColor={T.textHint}
                value={bio}
                onChangeText={setBio}
                multiline
                maxLength={500}
              />
            </View>
            <Text style={{ fontSize: Typography.xs, color: T.textHint, textAlign: 'right' }}>{bio.length}/500</Text>
          </View>
        </SectionCard>
      );

    case 'resume':
      return (
        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Resume Upload">
          <View style={{ gap: Spacing['3'] }}>
            <Text style={{ fontSize: Typography.sm, color: T.textSub }}>Upload your resume (PDF or Word). Max 5MB.</Text>
            <TouchableOpacity
              style={{
                borderWidth: 2,
                borderStyle: 'dashed' as any,
                borderColor: resumeFile ? T.success : T.border,
                borderRadius: Radii.lg,
                padding: Spacing['6'],
                alignItems: 'center',
                gap: Spacing['2'],
                backgroundColor: resumeFile ? T.successLight : T.surface,
              }}
              onPress={async () => {
                const result = await DocumentPicker.getDocumentAsync({
                  type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                  copyToCacheDirectory: true,
                });
                if (!result.canceled && result.assets?.[0]) {
                  const asset = result.assets[0];
                  setResumeFile({
                    uri: asset.uri,
                    name: asset.name,
                    mimeType: asset.mimeType ?? null,
                    size: asset.size,
                  });
                }
              }}
            >
              <MaterialCommunityIcons name={resumeFile ? 'file-check-outline' : 'file-upload-outline'} size={36} color={resumeFile ? T.success : T.primary} />
              <Text style={{ fontSize: Typography.base, fontWeight: Typography.semibold as any, color: resumeFile ? T.success : T.textPrimary }}>
                {resumeFile ? resumeFile.name : 'Tap to upload resume'}
              </Text>
              <Text style={{ fontSize: Typography.xs, color: T.textHint }}>PDF/DOCX - Max 5MB</Text>
            </TouchableOpacity>
            {resumeFile && (
              <TouchableOpacity onPress={() => setResumeFile(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['1'], alignSelf: 'center' }}>
                <MaterialCommunityIcons name="close-circle-outline" size={14} color={T.danger} />
                <Text style={{ fontSize: Typography.xs, color: T.danger }}>Remove file</Text>
              </TouchableOpacity>
            )}
          </View>
        </SectionCard>
      );

    case 'skills':
      return (
        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Skills">
          <View style={{ gap: Spacing['3'] }}>
            <Text style={{ fontSize: Typography.sm, color: T.textSub }}>Add your hard and soft skills separately. Suggestions now include tech, business, creative, operations, healthcare, and more.</Text>

            <View style={{ gap: Spacing['4'] }}>
              <View style={{ gap: Spacing['2'] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
                  <MaterialCommunityIcons name="hammer-wrench" size={16} color={T.primary} />
                  <Text style={{ fontSize: Typography.sm, fontWeight: Typography.semibold as any, color: T.textPrimary }}>Hard Skills</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: Spacing['2'] }}>
                  <View style={[inputRowStyle, { flex: 1 }]}>
                    <MaterialCommunityIcons name="tag-outline" size={16} color={T.textHint} />
                    <TextInput
                      style={inputStyle}
                      placeholder="Add hard skills like Excel, Nursing, SQL, Figma..."
                      placeholderTextColor={T.textHint}
                      value={hardSkillInput}
                      onChangeText={setHardSkillInput}
                      returnKeyType="done"
                      onSubmitEditing={() => addSkill('hard')}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                  <TouchableOpacity onPress={() => addSkill('hard')} style={{ backgroundColor: T.primary, borderRadius: Radii.md, paddingHorizontal: Spacing['4'], justifyContent: 'center' }}>
                    <Text style={{ color: T.white, fontWeight: Typography.semibold as any, fontSize: Typography.sm }}>Add</Text>
                  </TouchableOpacity>
                </View>
                {hardSkillSuggestions.length > 0 ? (
                  <View style={{ backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border, borderRadius: Radii.md, overflow: 'hidden' }}>
                    {hardSkillSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={suggestion}
                        onPress={() => addSkill('hard', suggestion)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingHorizontal: Spacing['3'],
                          paddingVertical: Spacing['3'],
                          borderBottomWidth: index < hardSkillSuggestions.length - 1 ? 1 : 0,
                          borderBottomColor: T.borderFaint,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
                          <MaterialCommunityIcons name="lightbulb-on-outline" size={15} color={T.primary} />
                          <Text style={{ fontSize: Typography.sm, color: T.textPrimary }}>{suggestion}</Text>
                        </View>
                        <MaterialCommunityIcons name="plus" size={16} color={T.textHint} />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
                {hardSkills.length > 0 ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'] }}>
                    {hardSkills.map((skill) => (
                      <View key={skill} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border, borderRadius: Radii.full, paddingHorizontal: Spacing['3'], paddingVertical: Spacing['1'] }}>
                        <Text style={{ fontSize: Typography.sm, color: T.primary, fontWeight: Typography.medium as any }}>{skill}</Text>
                        <TouchableOpacity onPress={() => removeSkill('hard', skill)} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
                          <MaterialCommunityIcons name="close" size={13} color={T.textHint} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={{ fontSize: Typography.xs, color: T.textHint }}>No hard skills added yet</Text>
                )}
              </View>

              <View style={{ gap: Spacing['2'] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
                  <MaterialCommunityIcons name="account-group-outline" size={16} color={T.success} />
                  <Text style={{ fontSize: Typography.sm, fontWeight: Typography.semibold as any, color: T.textPrimary }}>Soft Skills</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: Spacing['2'] }}>
                  <View style={[inputRowStyle, { flex: 1 }]}>
                    <MaterialCommunityIcons name="tag-outline" size={16} color={T.textHint} />
                    <TextInput
                      style={inputStyle}
                      placeholder="Add soft skills like Leadership, Empathy, Teamwork..."
                      placeholderTextColor={T.textHint}
                      value={softSkillInput}
                      onChangeText={setSoftSkillInput}
                      returnKeyType="done"
                      onSubmitEditing={() => addSkill('soft')}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                  <TouchableOpacity onPress={() => addSkill('soft')} style={{ backgroundColor: T.success, borderRadius: Radii.md, paddingHorizontal: Spacing['4'], justifyContent: 'center' }}>
                    <Text style={{ color: T.white, fontWeight: Typography.semibold as any, fontSize: Typography.sm }}>Add</Text>
                  </TouchableOpacity>
                </View>
                {softSkillSuggestions.length > 0 ? (
                  <View style={{ backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border, borderRadius: Radii.md, overflow: 'hidden' }}>
                    {softSkillSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={suggestion}
                        onPress={() => addSkill('soft', suggestion)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingHorizontal: Spacing['3'],
                          paddingVertical: Spacing['3'],
                          borderBottomWidth: index < softSkillSuggestions.length - 1 ? 1 : 0,
                          borderBottomColor: T.borderFaint,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
                          <MaterialCommunityIcons name="lightbulb-on-outline" size={15} color={T.success} />
                          <Text style={{ fontSize: Typography.sm, color: T.textPrimary }}>{suggestion}</Text>
                        </View>
                        <MaterialCommunityIcons name="plus" size={16} color={T.textHint} />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
                {softSkills.length > 0 ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'] }}>
                    {softSkills.map((skill) => (
                      <View key={skill} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border, borderRadius: Radii.full, paddingHorizontal: Spacing['3'], paddingVertical: Spacing['1'] }}>
                        <Text style={{ fontSize: Typography.sm, color: T.success, fontWeight: Typography.medium as any }}>{skill}</Text>
                        <TouchableOpacity onPress={() => removeSkill('soft', skill)} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
                          <MaterialCommunityIcons name="close" size={13} color={T.textHint} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={{ fontSize: Typography.xs, color: T.textHint }}>No soft skills added yet</Text>
                )}
              </View>
            </View>
          </View>
        </SectionCard>
      );

    case 'experience':
      return (
        <>
          <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Work Experience">
            {workEntries.map((entry, index) => (
              <View key={index} style={{ gap: Spacing['3'], paddingTop: index > 0 ? Spacing['4'] : 0, borderTopWidth: index > 0 ? 1 : 0, borderTopColor: T.borderFaint }}>
                {index > 0 && (
                  <TouchableOpacity onPress={() => setWorkEntries((prev) => prev.filter((_, idx) => idx !== index))} style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="minus-circle-outline" size={14} color={T.danger} />
                    <Text style={{ fontSize: Typography.xs, color: T.danger }}>Remove</Text>
                  </TouchableOpacity>
                )}
                <View style={{ gap: Spacing['2'] }}>
                  <Text style={fieldLabelStyle}>Company</Text>
                  <View style={inputRowStyle}>
                    <MaterialCommunityIcons name="office-building-outline" size={15} color={T.textHint} />
                    <TextInput style={inputStyle} placeholder="e.g. Acme Corp" placeholderTextColor={T.textHint} value={entry.company} onChangeText={(value) => setWorkEntries((prev) => prev.map((item, idx) => idx === index ? { ...item, company: value } : item))} />
                  </View>
                </View>
                <View style={{ gap: Spacing['2'] }}>
                  <Text style={fieldLabelStyle}>Position</Text>
                  <View style={inputRowStyle}>
                    <MaterialCommunityIcons name="briefcase-outline" size={15} color={T.textHint} />
                    <TextInput style={inputStyle} placeholder="e.g. Software Engineer" placeholderTextColor={T.textHint} value={entry.position} onChangeText={(value) => setWorkEntries((prev) => prev.map((item, idx) => idx === index ? { ...item, position: value } : item))} />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: Spacing['3'] }}>
                  <View style={{ flex: 1, gap: Spacing['2'] }}>
                    <Text style={fieldLabelStyle}>Start date</Text>
                    <View style={inputRowStyle}>
                      <TextInput style={inputStyle} placeholder="YYYY-MM-DD" placeholderTextColor={T.textHint} value={entry.start_date} onChangeText={(value) => setWorkEntries((prev) => prev.map((item, idx) => idx === index ? { ...item, start_date: value } : item))} />
                    </View>
                  </View>
                  <View style={{ flex: 1, gap: Spacing['2'] }}>
                    <Text style={fieldLabelStyle}>End date</Text>
                    <View style={inputRowStyle}>
                      <TextInput style={inputStyle} placeholder="Present" placeholderTextColor={T.textHint} value={entry.end_date} onChangeText={(value) => setWorkEntries((prev) => prev.map((item, idx) => idx === index ? { ...item, end_date: value } : item))} />
                    </View>
                  </View>
                </View>
                <View style={{ gap: Spacing['2'] }}>
                  <Text style={fieldLabelStyle}>Description</Text>
                  <View style={[inputRowStyle, { alignItems: 'flex-start', paddingVertical: Spacing['2'] }]}>
                    <TextInput style={[inputStyle, { minHeight: 60, textAlignVertical: 'top' }]} placeholder="Describe your role..." placeholderTextColor={T.textHint} value={entry.description} onChangeText={(value) => setWorkEntries((prev) => prev.map((item, idx) => idx === index ? { ...item, description: value } : item))} multiline maxLength={500} />
                  </View>
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={() => setWorkEntries((prev) => [...prev, { company: '', position: '', start_date: '', end_date: '', description: '' }])} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], marginTop: Spacing['3'], paddingVertical: Spacing['2'] }}>
              <MaterialCommunityIcons name="plus-circle-outline" size={16} color={T.primary} />
              <Text style={{ fontSize: Typography.sm, color: T.primary, fontWeight: Typography.medium as any }}>Add another position</Text>
            </TouchableOpacity>
          </SectionCard>

          <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Education">
            <Text style={{ fontSize: Typography.xs, color: T.textHint, marginBottom: Spacing['3'] }}>Optional but recommended</Text>
            {educationEntries.map((entry, index) => (
              <View key={index} style={{ gap: Spacing['3'], paddingTop: index > 0 ? Spacing['4'] : 0, borderTopWidth: index > 0 ? 1 : 0, borderTopColor: T.borderFaint }}>
                {index > 0 && (
                  <TouchableOpacity onPress={() => setEducationEntries((prev) => prev.filter((_, idx) => idx !== index))} style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="minus-circle-outline" size={14} color={T.danger} />
                    <Text style={{ fontSize: Typography.xs, color: T.danger }}>Remove</Text>
                  </TouchableOpacity>
                )}
                <View style={{ flexDirection: 'row', gap: Spacing['3'] }}>
                  <View style={{ flex: 1, gap: Spacing['2'] }}>
                    <Text style={fieldLabelStyle}>School</Text>
                    <View style={inputRowStyle}>
                      <TextInput style={inputStyle} placeholder="MIT" placeholderTextColor={T.textHint} value={entry.school} onChangeText={(value) => setEducationEntries((prev) => prev.map((item, idx) => idx === index ? { ...item, school: value } : item))} />
                    </View>
                  </View>
                  <View style={{ flex: 1, gap: Spacing['2'] }}>
                    <Text style={fieldLabelStyle}>Degree</Text>
                    <View style={inputRowStyle}>
                      <TextInput style={inputStyle} placeholder="B.S." placeholderTextColor={T.textHint} value={entry.degree} onChangeText={(value) => setEducationEntries((prev) => prev.map((item, idx) => idx === index ? { ...item, degree: value } : item))} />
                    </View>
                  </View>
                </View>
                <View style={{ gap: Spacing['2'] }}>
                  <Text style={fieldLabelStyle}>Field of study</Text>
                  <View style={inputRowStyle}>
                    <TextInput style={inputStyle} placeholder="Computer Science" placeholderTextColor={T.textHint} value={entry.field_of_study} onChangeText={(value) => setEducationEntries((prev) => prev.map((item, idx) => idx === index ? { ...item, field_of_study: value } : item))} />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: Spacing['3'] }}>
                  <View style={{ flex: 1, gap: Spacing['2'] }}>
                    <Text style={fieldLabelStyle}>Start</Text>
                    <View style={inputRowStyle}>
                      <TextInput style={inputStyle} placeholder="YYYY-MM-DD" placeholderTextColor={T.textHint} value={entry.start_date} onChangeText={(value) => setEducationEntries((prev) => prev.map((item, idx) => idx === index ? { ...item, start_date: value } : item))} />
                    </View>
                  </View>
                  <View style={{ flex: 1, gap: Spacing['2'] }}>
                    <Text style={fieldLabelStyle}>End</Text>
                    <View style={inputRowStyle}>
                      <TextInput style={inputStyle} placeholder="YYYY-MM-DD" placeholderTextColor={T.textHint} value={entry.end_date} onChangeText={(value) => setEducationEntries((prev) => prev.map((item, idx) => idx === index ? { ...item, end_date: value } : item))} />
                    </View>
                  </View>
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={() => setEducationEntries((prev) => [...prev, { school: '', degree: '', field_of_study: '', start_date: '', end_date: '' }])} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], marginTop: Spacing['3'], paddingVertical: Spacing['2'] }}>
              <MaterialCommunityIcons name="plus-circle-outline" size={16} color={T.primary} />
              <Text style={{ fontSize: Typography.sm, color: T.primary, fontWeight: Typography.medium as any }}>Add another education</Text>
            </TouchableOpacity>
          </SectionCard>
        </>
      );

    case 'photo':
      return (
        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Profile Photo">
          <View style={{ gap: Spacing['3'], alignItems: 'center' }}>
            <Text style={{ fontSize: Typography.sm, color: T.textSub, textAlign: 'center' }}>Add a profile photo to stand out. JPG/PNG, max 2MB. Optional.</Text>
            <TouchableOpacity
              onPress={async () => {
                const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permission.granted) {
                  setError('Permission to access photos is required.');
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: 'images',
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });
                if (!result.canceled && result.assets?.[0]) {
                  const asset = result.assets[0];
                  const name = asset.uri.split('/').pop() ?? 'photo.jpg';
                  setPhotoFile({
                    uri: asset.uri,
                    name,
                    mimeType: asset.mimeType ?? null,
                    size: asset.fileSize,
                  });
                }
              }}
              style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderStyle: 'dashed' as any, borderColor: photoFile ? T.success : T.border, backgroundColor: photoFile ? T.successLight : T.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
            >
              {photoFile ? <Image source={{ uri: photoFile.uri }} style={{ width: 100, height: 100, borderRadius: 50 }} /> : <MaterialCommunityIcons name="camera-plus-outline" size={36} color={T.primary} />}
            </TouchableOpacity>
            {photoFile ? <Text style={{ fontSize: Typography.sm, color: T.success, fontWeight: Typography.medium as any }}>{photoFile.name}</Text> : <Text style={{ fontSize: Typography.xs, color: T.textHint }}>Tap to upload</Text>}
            {photoFile && (
              <TouchableOpacity onPress={() => setPhotoFile(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons name="close-circle-outline" size={14} color={T.danger} />
                <Text style={{ fontSize: Typography.xs, color: T.danger }}>Remove photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </SectionCard>
      );

    case 'social':
      return (
        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Social Links">
          <Text style={{ fontSize: Typography.xs, color: T.textHint, marginBottom: Spacing['3'] }}>All optional</Text>
          {[
            { label: 'LinkedIn', icon: 'linkedin' as const, placeholder: 'https://linkedin.com/in/...', value: linkedinUrl, onChange: setLinkedinUrl },
            { label: 'GitHub', icon: 'github' as const, placeholder: 'https://github.com/...', value: githubUrl, onChange: setGithubUrl },
            { label: 'Portfolio', icon: 'web' as const, placeholder: 'https://yourportfolio.com', value: portfolioUrl, onChange: setPortfolioUrl },
            { label: 'Twitter', icon: 'twitter' as const, placeholder: 'https://twitter.com/...', value: twitterUrl, onChange: setTwitterUrl },
          ].map(({ label, icon, placeholder, value, onChange }, index, all) => (
            <View key={label}>
              <View style={{ gap: Spacing['2'] }}>
                <Text style={fieldLabelStyle}>{label}</Text>
                <View style={inputRowStyle}>
                  <MaterialCommunityIcons name={icon} size={16} color={T.textHint} />
                  <TextInput style={inputStyle} placeholder={placeholder} placeholderTextColor={T.textHint} value={value} onChangeText={onChange} keyboardType="url" autoCapitalize="none" autoCorrect={false} />
                </View>
              </View>
              {index < all.length - 1 && <Divider spacing={Spacing['4']} />}
            </View>
          ))}
        </SectionCard>
      );

    case 'company_details':
      return (
        <>
          <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Company Details">
            <View style={{ gap: Spacing['2'] }}>
              <Text style={fieldLabelStyle}>Company Name *</Text>
              <View style={inputRowStyle}>
                <MaterialCommunityIcons name="domain" size={16} color={T.textHint} />
                <TextInput style={inputStyle} placeholder="Acme Corporation" placeholderTextColor={T.textHint} value={companyName} onChangeText={setCompanyName} maxLength={100} />
              </View>
              <Text style={{ fontSize: Typography.xs, color: T.textHint, textAlign: 'right' }}>{companyName.length}/100</Text>
            </View>

            <Divider spacing={Spacing['4']} />

            <View style={{ gap: Spacing['2'] }}>
              <Text style={fieldLabelStyle}>Tagline</Text>
              <View style={inputRowStyle}>
                <TextInput style={inputStyle} placeholder="Building the future of..." placeholderTextColor={T.textHint} value={companyTagline} onChangeText={setCompanyTagline} maxLength={100} />
              </View>
            </View>

            <Divider spacing={Spacing['4']} />

            <View style={{ gap: Spacing['2'] }}>
              <Text style={fieldLabelStyle}>Description *</Text>
              <View style={[inputRowStyle, { alignItems: 'flex-start', paddingVertical: Spacing['2'] }]}>
                <TextInput style={[inputStyle, { minHeight: 100, textAlignVertical: 'top' }]} placeholder="Tell us about your company..." placeholderTextColor={T.textHint} value={companyDescription} onChangeText={setCompanyDescription} multiline maxLength={2000} />
              </View>
              <Text style={{ fontSize: Typography.xs, color: T.textHint, textAlign: 'right' }}>{companyDescription.length}/2000 (min 50)</Text>
            </View>
          </SectionCard>

          <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Industry & Size">
            <View style={{ gap: Spacing['2'] }}>
              <Text style={fieldLabelStyle}>Industry *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing['1'] }}>
                <View style={{ flexDirection: 'row', gap: Spacing['2'], paddingHorizontal: Spacing['1'], paddingVertical: Spacing['1'] }}>
                  {INDUSTRY_OPTIONS.map((option) => (
                    <TouchableOpacity key={option} onPress={() => setCompanyIndustry(option)} style={{ paddingHorizontal: Spacing['3'], paddingVertical: Spacing['2'], borderRadius: Radii.full, backgroundColor: companyIndustry === option ? T.primary : T.surfaceHigh, borderWidth: companyIndustry === option ? 0 : 1, borderColor: T.border }}>
                      <Text style={{ fontSize: Typography.sm, color: companyIndustry === option ? T.white : T.textSub, fontWeight: companyIndustry === option ? Typography.semibold as any : 'normal' }}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <Divider spacing={Spacing['4']} />

            <View style={{ gap: Spacing['2'] }}>
              <Text style={fieldLabelStyle}>Company Size *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'] }}>
                {COMPANY_SIZE_OPTIONS.map((option) => (
                  <TouchableOpacity key={option} onPress={() => setCompanySize(option)} style={{ paddingHorizontal: Spacing['3'], paddingVertical: Spacing['2'], borderRadius: Radii.full, backgroundColor: companySize === option ? T.primary : T.surfaceHigh, borderWidth: companySize === option ? 0 : 1, borderColor: T.border }}>
                    <Text style={{ fontSize: Typography.sm, color: companySize === option ? T.white : T.textSub, fontWeight: companySize === option ? Typography.semibold as any : 'normal' }}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Divider spacing={Spacing['4']} />

            <View style={{ flexDirection: 'row', gap: Spacing['3'] }}>
              <View style={{ flex: 1, gap: Spacing['2'] }}>
                <Text style={fieldLabelStyle}>Founded Year</Text>
                <View style={inputRowStyle}>
                  <MaterialCommunityIcons name="calendar-outline" size={16} color={T.textHint} />
                  <TextInput style={inputStyle} placeholder="2020" placeholderTextColor={T.textHint} value={foundedYear} onChangeText={setFoundedYear} keyboardType="number-pad" maxLength={4} />
                </View>
              </View>
              <View style={{ flex: 2, gap: Spacing['2'] }}>
                <Text style={fieldLabelStyle}>Website URL</Text>
                <View style={inputRowStyle}>
                  <MaterialCommunityIcons name="web" size={16} color={T.textHint} />
                  <TextInput style={inputStyle} placeholder="https://company.com" placeholderTextColor={T.textHint} value={websiteUrl} onChangeText={setWebsiteUrl} keyboardType="url" autoCapitalize="none" autoCorrect={false} />
                </View>
              </View>
            </View>
          </SectionCard>

          <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Address">
            <View style={{ gap: Spacing['3'] }}>
              <Text style={{ fontSize: Typography.xs, color: T.textHint }}>Company address (optional)</Text>

              <View style={{ gap: Spacing['2'] }}>
                <Text style={fieldLabelStyle}>Street</Text>
                <View style={inputRowStyle}>
                  <MaterialCommunityIcons name="map-marker-outline" size={16} color={T.textHint} />
                  <TextInput style={inputStyle} placeholder="123 Main St" placeholderTextColor={T.textHint} value={addressStreet} onChangeText={setAddressStreet} maxLength={200} />
                </View>
              </View>

              <View style={{ gap: Spacing['2'] }}>
                <Text style={[fieldLabelStyle, { marginBottom: 0 }]}>Country</Text>
                <View style={[inputRowStyle, { paddingHorizontal: 0, paddingVertical: 0 }]}>
                  <Picker
                    selectedValue={addressCountry}
                    onValueChange={(value) => {
                      setAddressCountry(value);
                      setAddressState('');
                      setAddressProvince('');
                      setAddressCity('');
                    }}
                    style={{ flex: 1, color: T.textPrimary }}
                  >
                    <Picker.Item label="Select country..." value="" />
                    {COUNTRIES.map((country) => (
                      <Picker.Item key={country} label={country} value={country} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={{ gap: Spacing['2'] }}>
                <Text style={[fieldLabelStyle, { marginBottom: 0 }]}>
                  {addressCountry === 'Philippines' ? 'Region' : addressCountry === 'United States' || addressCountry === 'Australia' ? 'State' : addressCountry === 'Canada' ? 'Province' : 'Region'}
                </Text>
                <View style={[inputRowStyle, { paddingHorizontal: 0, paddingVertical: 0 }]}>
                  <Picker
                    selectedValue={addressState}
                    onValueChange={(value) => {
                      setAddressState(value);
                      setAddressProvince('');
                      setAddressCity('');
                    }}
                    style={{ flex: 1, color: T.textPrimary }}
                    enabled={!!addressCountry}
                  >
                    <Picker.Item label={addressCountry ? (addressCountry === 'Philippines' ? 'Select region...' : addressCountry === 'United States' || addressCountry === 'Australia' ? 'Select state...' : addressCountry === 'Canada' ? 'Select province...' : 'Select region...') : 'Select country first'} value="" />
                    {getProvincesForCountry(addressCountry).map((item) => (
                      <Picker.Item key={item} label={item} value={item} />
                    ))}
                  </Picker>
                </View>
              </View>

              {addressCountry === 'Philippines' && (
                <View style={{ gap: Spacing['2'] }}>
                  <Text style={[fieldLabelStyle, { marginBottom: 0 }]}>Province</Text>
                  <View style={[inputRowStyle, { paddingHorizontal: 0, paddingVertical: 0 }]}>
                    <Picker
                      selectedValue={addressProvince}
                      onValueChange={(value) => {
                        setAddressProvince(value);
                        setAddressCity('');
                      }}
                      style={{ flex: 1, color: T.textPrimary }}
                      enabled={!!addressState}
                    >
                      <Picker.Item label={addressState ? 'Select province...' : 'Select region first'} value="" />
                      {getProvincesForRegion(addressState).map((province) => (
                        <Picker.Item key={province} label={province} value={province} />
                      ))}
                    </Picker>
                  </View>
                </View>
              )}

              <View style={{ gap: Spacing['2'] }}>
                <Text style={[fieldLabelStyle, { marginBottom: 0 }]}>City</Text>
                <View style={[inputRowStyle, { paddingHorizontal: 0, paddingVertical: 0 }]}>
                  <Picker
                    selectedValue={addressCity}
                    onValueChange={setAddressCity}
                    style={{ flex: 1, color: T.textPrimary }}
                    enabled={addressCountry === 'Philippines' ? !!addressProvince : !!addressState}
                  >
                    <Picker.Item 
                      label={
                        addressCountry === 'Philippines'
                          ? (addressProvince ? 'Select city...' : 'Select province first')
                          : (addressState ? 'Select city...' : (addressCountry === 'United States' || addressCountry === 'Australia' ? 'Select state first' : addressCountry === 'Canada' ? 'Select province first' : 'Select region first'))
                      } 
                      value="" 
                    />
                    {(addressCountry === 'Philippines' 
                      ? getCitiesForProvince(addressCountry, addressProvince)
                      : getCitiesForProvince(addressCountry, addressState)
                    ).map((city) => (
                      <Picker.Item key={city} label={city} value={city} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={{ gap: Spacing['2'] }}>
                <Text style={fieldLabelStyle}>Postal Code</Text>
                <View style={inputRowStyle}>
                  <TextInput style={inputStyle} placeholder="94102" placeholderTextColor={T.textHint} value={addressPostal} onChangeText={setAddressPostal} keyboardType="default" maxLength={20} />
                </View>
              </View>
            </View>
          </SectionCard>

          <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Social Links">
            <Text style={{ fontSize: Typography.xs, color: T.textHint, marginBottom: Spacing['3'] }}>Add company social media links (optional)</Text>
            {companySocialLinks.map((link, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], marginBottom: Spacing['3'] }}>
                <View style={[inputRowStyle, { flex: 1 }]}>
                  <MaterialCommunityIcons name="link-variant" size={16} color={T.textHint} />
                  <TextInput style={inputStyle} placeholder="https://..." placeholderTextColor={T.textHint} value={link} onChangeText={(value) => setCompanySocialLinks((prev) => prev.map((item, idx) => idx === index ? value : item))} keyboardType="url" autoCapitalize="none" autoCorrect={false} />
                </View>
                {index > 0 && (
                  <TouchableOpacity onPress={() => setCompanySocialLinks((prev) => prev.filter((_, idx) => idx !== index))}>
                    <MaterialCommunityIcons name="close-circle-outline" size={20} color={T.danger} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity onPress={() => setCompanySocialLinks((prev) => [...prev, ''])} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
              <MaterialCommunityIcons name="plus-circle-outline" size={16} color={T.primary} />
              <Text style={{ fontSize: Typography.sm, color: T.primary, fontWeight: Typography.medium as any }}>Add link</Text>
            </TouchableOpacity>
          </SectionCard>
        </>
      );

    case 'company_docs':
      return (
        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Verification Documents">
          <Text style={{ fontSize: Typography.sm, color: T.textSub, marginBottom: Spacing['3'] }}>
            Upload your business license, tax ID, or incorporation documents. PDF/JPG/PNG. Min 1, max 5 files.
          </Text>
          <TouchableOpacity
            style={{ borderWidth: 2, borderStyle: 'dashed' as any, borderColor: verificationDocs.length > 0 ? T.success : T.border, borderRadius: Radii.lg, padding: Spacing['5'], alignItems: 'center', gap: Spacing['2'], backgroundColor: verificationDocs.length > 0 ? T.successLight : T.surfaceHigh, opacity: verificationDocs.length >= 5 ? 0.5 : 1 }}
            onPress={async () => {
              if (verificationDocs.length >= 5) {
                setError('Maximum 5 documents allowed.');
                return;
              }
              const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/jpeg', 'image/png'], multiple: false });
              if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                setVerificationDocs((prev) => (prev.length >= 5 ? prev : [
                  ...prev,
                  {
                    uri: asset.uri,
                    name: asset.name,
                    mimeType: asset.mimeType ?? null,
                    size: asset.size,
                  },
                ]));
              }
            }}
          >
            <MaterialCommunityIcons name="file-upload-outline" size={32} color={verificationDocs.length > 0 ? T.success : T.primary} />
            <Text style={{ fontSize: Typography.sm, color: verificationDocs.length > 0 ? T.success : T.textSub, fontWeight: Typography.medium as any }}>
              {verificationDocs.length > 0 ? `${verificationDocs.length} file(s) selected` : 'Tap to upload document'}
            </Text>
            <Text style={{ fontSize: Typography.xs, color: T.textHint }}>PDF, JPG, PNG - Max 5 files</Text>
          </TouchableOpacity>
          {verificationDocs.length > 0 && (
            <View style={{ gap: Spacing['2'], marginTop: Spacing['3'] }}>
              {verificationDocs.map((doc, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], backgroundColor: T.surfaceHigh, borderRadius: Radii.md, padding: Spacing['3'] }}>
                  <MaterialCommunityIcons name="file-document-outline" size={18} color={T.primary} />
                  <Text style={{ flex: 1, fontSize: Typography.sm, color: T.textPrimary }} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  <TouchableOpacity onPress={() => setVerificationDocs((prev) => prev.filter((_, idx) => idx !== index))}>
                    <MaterialCommunityIcons name="close-circle-outline" size={18} color={T.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], marginTop: Spacing['4'], backgroundColor: T.surfaceHigh, borderRadius: Radii.md, padding: Spacing['3'] }}>
            <MaterialCommunityIcons name="information-outline" size={16} color={T.textHint} />
            <Text style={{ flex: 1, fontSize: Typography.xs, color: T.textHint, lineHeight: 18 }}>
              Submitting these documents will set your verification status to pending while our team reviews them.
            </Text>
          </View>
        </SectionCard>
      );

    case 'company_media':
      return (
        <>
          <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Company Logo">
            <Text style={{ fontSize: Typography.sm, color: T.textSub, marginBottom: Spacing['3'] }}>Upload your company logo. JPG/PNG, max 2MB. Required.</Text>
            <View style={{ alignItems: 'center', gap: Spacing['3'] }}>
              <TouchableOpacity
                onPress={async () => {
                  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (!permission.granted) {
                    setError('Permission to access photos is required.');
                    return;
                  }
                  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.8 });
                  if (!result.canceled && result.assets?.[0]) {
                    const asset = result.assets[0];
                    setLogoFile({
                      uri: asset.uri,
                      name: asset.uri.split('/').pop() ?? 'logo.jpg',
                      mimeType: asset.mimeType ?? null,
                      size: asset.fileSize,
                    });
                  }
                }}
                style={{ width: 110, height: 110, borderRadius: Radii.xl, borderWidth: 2, borderStyle: 'dashed' as any, borderColor: logoFile ? T.success : T.border, backgroundColor: logoFile ? T.successLight : T.surfaceHigh, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
              >
                {logoFile ? <Image source={{ uri: logoFile.uri }} style={{ width: 110, height: 110, borderRadius: Radii.xl }} /> : <MaterialCommunityIcons name="image-plus" size={36} color={T.primary} />}
              </TouchableOpacity>
              {logoFile ? <Text style={{ fontSize: Typography.sm, color: T.success, fontWeight: Typography.medium as any }}>{logoFile.name}</Text> : <Text style={{ fontSize: Typography.xs, color: T.textHint }}>Tap to upload logo</Text>}
              {logoFile && (
                <TouchableOpacity onPress={() => setLogoFile(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MaterialCommunityIcons name="close-circle-outline" size={14} color={T.danger} />
                  <Text style={{ fontSize: Typography.xs, color: T.danger }}>Remove logo</Text>
                </TouchableOpacity>
              )}
            </View>
          </SectionCard>

          <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Office Photos">
            <Text style={{ fontSize: Typography.sm, color: T.textSub, marginBottom: Spacing['3'] }}>Upload photos of your office space. JPG/PNG. Min 1, max 6 images. Required.</Text>
            <TouchableOpacity
              style={{ borderWidth: 2, borderStyle: 'dashed' as any, borderColor: officeImages.length > 0 ? T.success : T.border, borderRadius: Radii.lg, padding: Spacing['5'], alignItems: 'center', gap: Spacing['2'], backgroundColor: officeImages.length > 0 ? T.successLight : T.surfaceHigh, opacity: officeImages.length >= 6 ? 0.5 : 1 }}
              onPress={async () => {
                if (officeImages.length >= 6) {
                  setError('Maximum 6 office images allowed.');
                  return;
                }
                const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permission.granted) {
                  setError('Permission to access photos is required.');
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsMultipleSelection: true, quality: 0.8 });
                if (!result.canceled && result.assets?.length) {
                  setOfficeImages((prev) => {
                    const remaining = 6 - prev.length;
                    if (remaining <= 0) return prev;
                    const next = result.assets.slice(0, remaining).map((asset) => ({
                      uri: asset.uri,
                      name: asset.uri.split('/').pop() ?? 'office.jpg',
                      mimeType: asset.mimeType ?? null,
                      size: asset.fileSize,
                    }));
                    return [...prev, ...next];
                  });
                }
              }}
            >
              <MaterialCommunityIcons name="image-multiple-outline" size={32} color={officeImages.length > 0 ? T.success : T.primary} />
              <Text style={{ fontSize: Typography.sm, color: officeImages.length > 0 ? T.success : T.textSub, fontWeight: Typography.medium as any }}>
                {officeImages.length > 0 ? `${officeImages.length} photo(s) selected` : 'Tap to upload photos'}
              </Text>
              <Text style={{ fontSize: Typography.xs, color: T.textHint }}>JPG, PNG - Max 6 images</Text>
            </TouchableOpacity>
            {officeImages.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'], marginTop: Spacing['3'] }}>
                {officeImages.map((image, index) => (
                  <View key={index} style={{ position: 'relative' }}>
                    <Image source={{ uri: image.uri }} style={{ width: 80, height: 80, borderRadius: Radii.md }} />
                    <TouchableOpacity onPress={() => setOfficeImages((prev) => prev.filter((_, idx) => idx !== index))} style={{ position: 'absolute', top: -6, right: -6, backgroundColor: T.bg, borderRadius: Radii.full }}>
                      <MaterialCommunityIcons name="close-circle" size={18} color={T.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </SectionCard>
        </>
      );

    default:
      return null;
  }
}
