import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useState, useRef } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme';
import {
  PageHeader,
  SectionCard,
  Divider,
  Spacer,
  Colors,
  Typography,
  Spacing,
  Radii,
  Shadows,
} from '../../components/ui';

type Role = 'applicant' | 'hr';

// ─── Step type ────────────────────────────────────────────────────────────────
type Step =
  | 'email'            // Step 0: Email (+ Google sign-up)
  | 'password'         // Step 1: Password
  | 'basic'            // Step 2: Basic Info (applicant)
  | 'resume'           // Step 3: Resume Upload
  | 'skills'           // Step 4: Skills
  | 'experience'       // Step 5: Experience & Education
  | 'photo'            // Step 6: Profile Photo
  | 'social'           // Step 7: Social Links
  | 'company_details'  // Company Step 1: Company Details
  | 'company_docs'     // Company Step 2: Verification Documents
  | 'company_media';   // Company Step 3: Logo & Office Images

const APPLICANT_STEPS: Step[] = ['password', 'basic', 'resume', 'skills', 'experience', 'photo', 'social'];
const HR_STEPS: Step[]        = ['password', 'company_details', 'company_docs', 'company_media'];

const STEP_LABELS: Record<Step, string> = {
  email:           'Email',
  password:        'Password',
  basic:           'Basic Info',
  resume:          'Resume',
  skills:          'Skills',
  experience:      'Experience',
  photo:           'Photo',
  social:          'Links',
  company_details: 'Company',
  company_docs:    'Verification',
  company_media:   'Media',
};

const INDUSTRY_OPTIONS = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail',
  'Manufacturing', 'Consulting', 'Marketing', 'Real Estate', 'Other',
];

const COMPANY_SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

// ─── Icon components ──────────────────────────────────────────────────────────
function ApplicantIcon({ active, color }: { active: boolean; color: string }) {
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

// ─── Work Experience entry ────────────────────────────────────────────────────
type WorkEntry = {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
};

type EducationEntry = {
  school: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
};




// ─── HR Invite Registration Form Component ────────────────────────────────────
function HRInviteRegistrationForm({
  T, topInset, email, detectedCompany,
  fieldLabelStyle, inputRowStyle, inputStyle,
  JOB_TITLE_OPTIONS, loading, error,
  setError, setLoading, setToken, inviteCode, onBack,
}: {
  T: any; topInset: number; email: string;
  detectedCompany: { name: string; validCodes: string[] } | null;
  fieldLabelStyle: any; inputRowStyle: any; inputStyle: any;
  JOB_TITLE_OPTIONS: string[]; loading: boolean; error: string;
  setError: (e: string) => void; setLoading: (v: boolean) => void;
  setToken: (t: string) => void; inviteCode: string;
  onBack: () => void;
}) {
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

  const hasUppercase  = /[A-Z]/.test(password);
  const hasNumber     = /[0-9]/.test(password);
  const hasMinLength  = password.length >= 8;
  const strengthLevel = password.length === 0 ? null
    : (!hasMinLength || !hasUppercase || !hasNumber) ? 'weak'
    : password.length < 12 ? 'good' : 'strong';
  const strengthColor = strengthLevel === 'weak' ? T.danger
    : strengthLevel === 'good' ? T.warning : T.success;
  const resolvedTitle = jobTitle === 'Custom' ? customJobTitle.trim() : jobTitle;

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setProfilePhoto({ uri: asset.uri, name: asset.fileName ?? 'photo.jpg' });
    }
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!firstName.trim() || firstName.trim().length < 2 || firstName.trim().length > 50) {
      setFormError('First name must be 2–50 characters.'); return;
    }
    if (!lastName.trim() || lastName.trim().length < 2 || lastName.trim().length > 50) {
      setFormError('Last name must be 2–50 characters.'); return;
    }
    if (!resolvedTitle || resolvedTitle.length < 2 || resolvedTitle.length > 100) {
      setFormError('Job title must be 2–100 characters.'); return;
    }
    if (!password) { setFormError('Please enter a password.'); return; }
    if (!hasMinLength) { setFormError('Password must be at least 8 characters.'); return; }
    if (!hasUppercase) { setFormError('Password must contain at least 1 uppercase letter.'); return; }
    if (!hasNumber)    { setFormError('Password must contain at least 1 number.'); return; }
    if (password !== confirmPassword) { setFormError('Passwords do not match.'); return; }
    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, password, role: 'hr',
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          job_title: resolvedTitle,
          photo_url: profilePhoto?.uri ?? null,
          company_invite_token: inviteCode,
        }),
      });
      const data = await response.json();
      if (!data.success) { setFormError(data.message || 'Registration failed. Please try again.'); return; }
      setToken(data.data.token);
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
        {/* Company badge */}
        {detectedCompany && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['3'], backgroundColor: T.primary + '18', borderWidth: 1, borderColor: T.primary + '33', borderRadius: Radii.lg, paddingHorizontal: Spacing['4'], paddingVertical: Spacing['3'] }}>
            <MaterialCommunityIcons name="office-building" size={20} color={T.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: Typography.sm, fontWeight: Typography.semibold as any, color: T.primary }}>Joining {detectedCompany.name}</Text>
              <Text style={{ fontSize: Typography.xs, color: T.textSub }}>HR team member via invite</Text>
            </View>
            <MaterialCommunityIcons name="check-circle" size={18} color={T.success} />
          </View>
        )}
        <View style={{ gap: Spacing['1'] }}>
          <Text style={{ fontSize: Typography['2xl'], fontWeight: Typography.bold as any, color: T.textPrimary, letterSpacing: -0.3 }}>Set up your profile</Text>
          <Text style={{ fontSize: Typography.sm, color: T.textSub, lineHeight: 20 }}>Complete your HR account to get started.</Text>
        </View>
        {formError ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], backgroundColor: T.dangerBg, borderWidth: 1, borderColor: T.danger + '44', borderRadius: Radii.md, paddingHorizontal: Spacing['3'], paddingVertical: Spacing['3'] }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={15} color={T.danger} />
            <Text style={{ flex: 1, color: T.danger, fontSize: Typography.base }}>{formError}</Text>
          </View>
        ) : null}

        {/* Personal Info */}
        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Personal Info">
          <View style={{ gap: Spacing['4'] }}>
            {/* Email locked */}
            <View style={{ gap: Spacing['1'] }}>
              <Text style={fieldLabelStyle}>Email</Text>
              <View style={[inputRowStyle, { backgroundColor: T.surfaceHigh, opacity: 0.7 }]}>
                <MaterialCommunityIcons name="email-outline" size={16} color={T.textHint} />
                <Text style={[inputStyle, { color: T.textSub, flex: 1 }]}>{email}</Text>
                <MaterialCommunityIcons name="lock-outline" size={14} color={T.textHint} />
              </View>
              <Text style={{ fontSize: Typography.xs, color: T.textHint }}>Pre-filled from invite · cannot be changed</Text>
            </View>
            {/* First name */}
            <View style={{ gap: Spacing['1'] }}>
              <Text style={fieldLabelStyle}>First name <Text style={{ color: T.danger }}>*</Text></Text>
              <View style={inputRowStyle}>
                <MaterialCommunityIcons name="account-outline" size={16} color={T.textHint} />
                <TextInput style={inputStyle} placeholder="John" placeholderTextColor={T.textHint} value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
              </View>
            </View>
            {/* Last name */}
            <View style={{ gap: Spacing['1'] }}>
              <Text style={fieldLabelStyle}>Last name <Text style={{ color: T.danger }}>*</Text></Text>
              <View style={inputRowStyle}>
                <MaterialCommunityIcons name="account-outline" size={16} color={T.textHint} />
                <TextInput style={inputStyle} placeholder="Doe" placeholderTextColor={T.textHint} value={lastName} onChangeText={setLastName} autoCapitalize="words" />
              </View>
            </View>
            {/* Job title combo-select */}
            <View style={{ gap: Spacing['1'] }}>
              <Text style={fieldLabelStyle}>Job title <Text style={{ color: T.danger }}>*</Text></Text>
              <TouchableOpacity style={[inputRowStyle, { justifyContent: 'space-between' }]} onPress={() => setShowJobTitleDropdown(v => !v)} activeOpacity={0.8}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], flex: 1 }}>
                  <MaterialCommunityIcons name="briefcase-outline" size={16} color={T.textHint} />
                  <Text style={[inputStyle, { color: jobTitle ? T.textPrimary : T.textHint }]}>{jobTitle || 'Select or type your title'}</Text>
                </View>
                <MaterialCommunityIcons name={showJobTitleDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={T.textHint} />
              </TouchableOpacity>
              {showJobTitleDropdown && (
                <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: Radii.md, overflow: 'hidden', marginTop: Spacing['1'] }}>
                  {JOB_TITLE_OPTIONS.map((opt, i) => (
                    <TouchableOpacity key={opt} onPress={() => { setJobTitle(opt); setShowJobTitleDropdown(false); }} style={{ paddingHorizontal: Spacing['4'], paddingVertical: Spacing['3'], borderBottomWidth: i === JOB_TITLE_OPTIONS.length - 1 ? 0 : 1, borderBottomColor: T.border, backgroundColor: jobTitle === opt ? T.primary + '15' : 'transparent' }} activeOpacity={0.7}>
                      <Text style={{ fontSize: Typography.sm, color: jobTitle === opt ? T.primary : T.textPrimary, fontWeight: jobTitle === opt ? Typography.semibold as any : Typography.normal as any }}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {jobTitle === 'Custom' && (
                <View style={[inputRowStyle, { marginTop: Spacing['2'] }]}>
                  <MaterialCommunityIcons name="pencil-outline" size={16} color={T.textHint} />
                  <TextInput style={inputStyle} placeholder="Type your job title" placeholderTextColor={T.textHint} value={customJobTitle} onChangeText={setCustomJobTitle} autoFocus />
                </View>
              )}
            </View>
          </View>
        </SectionCard>

        {/* Profile Photo */}
        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Profile Photo (Optional)">
          <View style={{ gap: Spacing['3'] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['4'] }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: T.surfaceHigh, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 2, borderColor: profilePhoto ? T.primary : T.border }}>
                {profilePhoto ? <Image source={{ uri: profilePhoto.uri }} style={{ width: 72, height: 72 }} /> : <MaterialCommunityIcons name="account" size={36} color={T.textHint} />}
              </View>
              <View style={{ flex: 1, gap: Spacing['2'] }}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing['2'], backgroundColor: T.primary + '18', borderWidth: 1, borderColor: T.primary + '44', borderRadius: Radii.md, paddingVertical: Spacing['3'] }} onPress={pickPhoto} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="camera-outline" size={16} color={T.primary} />
                  <Text style={{ fontSize: Typography.sm, color: T.primary, fontWeight: Typography.semibold as any }}>{profilePhoto ? 'Change photo' : 'Upload photo'}</Text>
                </TouchableOpacity>
                {profilePhoto && <TouchableOpacity onPress={() => setProfilePhoto(null)} style={{ alignItems: 'center' }} activeOpacity={0.7}><Text style={{ fontSize: Typography.xs, color: T.danger }}>Remove</Text></TouchableOpacity>}
              </View>
            </View>
            <Text style={{ fontSize: Typography.xs, color: T.textHint }}>JPG/PNG · max 2MB</Text>
          </View>
        </SectionCard>

        {/* Password */}
        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Set Password">
          <View style={{ gap: Spacing['4'] }}>
            <View style={{ gap: Spacing['1'] }}>
              <Text style={fieldLabelStyle}>Password <Text style={{ color: T.danger }}>*</Text></Text>
              <View style={inputRowStyle}>
                <MaterialCommunityIcons name="lock-outline" size={16} color={T.textHint} />
                <TextInput style={[inputStyle, { flex: 1 }]} placeholder="••••••••" placeholderTextColor={T.textHint} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} activeOpacity={0.7}><MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={T.textHint} /></TouchableOpacity>
              </View>
              {password.length > 0 && (
                <View style={{ gap: Spacing['1'], marginTop: Spacing['1'] }}>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: T.border, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: strengthLevel === 'weak' ? '33%' : strengthLevel === 'good' ? '66%' : '100%', backgroundColor: strengthColor, borderRadius: 2 }} />
                  </View>
                  <Text style={{ fontSize: Typography.xs, color: strengthColor, textTransform: 'capitalize' }}>{strengthLevel}</Text>
                </View>
              )}
              <Text style={{ fontSize: Typography.xs, color: T.textHint }}>Min 8 chars · 1 uppercase · 1 number</Text>
            </View>
            <View style={{ gap: Spacing['1'] }}>
              <Text style={fieldLabelStyle}>Confirm password <Text style={{ color: T.danger }}>*</Text></Text>
              <View style={inputRowStyle}>
                <MaterialCommunityIcons name="lock-check-outline" size={16} color={T.textHint} />
                <TextInput style={[inputStyle, { flex: 1 }]} placeholder="••••••••" placeholderTextColor={T.textHint} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirm} />
                <TouchableOpacity onPress={() => setShowConfirm(v => !v)} activeOpacity={0.7}><MaterialCommunityIcons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={T.textHint} /></TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && (
                <Text style={{ fontSize: Typography.xs, color: password === confirmPassword ? T.success : T.danger }}>
                  {password === confirmPassword ? '✓ Passwords match' : 'Passwords do not match'}
                </Text>
              )}
            </View>
          </View>
        </SectionCard>

        {/* Submit */}
        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: T.primary, borderRadius: Radii.lg, paddingVertical: Spacing['4'], opacity: submitting ? 0.6 : 1, ...Shadows.colored(T.primary) }} onPress={handleSubmit} activeOpacity={0.85} disabled={submitting}>
          {submitting ? <ActivityIndicator color={T.white} /> : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
              <Text style={{ color: T.white, fontSize: Typography.lg, fontWeight: Typography.semibold as any }}>Create account</Text>
              <MaterialCommunityIcons name="check" size={18} color={T.white} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={{ fontSize: Typography.xs, color: T.textHint, textAlign: 'center', lineHeight: 18 }}>
          By continuing, you agree to our <Text style={{ color: T.primary, fontWeight: Typography.medium as any }}>Terms of Service</Text>{' '}and{' '}<Text style={{ color: T.primary, fontWeight: Typography.medium as any }}>Privacy Policy</Text>.
        </Text>
        <Spacer size="xl" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const T = useTheme();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const setToken = useAuthStore((s) => s.setToken);

  // Account
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole]                 = useState<Role>('applicant');



const MOCK_COMPANIES: Record<string, { name: string; validCodes: string[] }> = {
  'google.com':    { name: 'Google',    validCodes: ['GOOGLE-2024', 'GOOG-HR-01'] },
  'microsoft.com': { name: 'Microsoft', validCodes: ['MS-INVITE-99', 'MSFT-HR-01'] },
  'apple.com':     { name: 'Apple',     validCodes: ['APPLE-HR-2024', 'APL-INVITE'] },
};

// Maps invite code → the pre-assigned email address for that invite
const INVITE_CODE_EMAIL_MAP: Record<string, { email: string; domain: string }> = {
  'GOOGLE-2024':    { email: 'newhr@google.com',    domain: 'google.com' },
  'GOOG-HR-01':     { email: 'recruit@google.com',  domain: 'google.com' },
  'MS-INVITE-99':   { email: 'newhr@microsoft.com', domain: 'microsoft.com' },
  'MSFT-HR-01':     { email: 'hr@microsoft.com',    domain: 'microsoft.com' },
  'APPLE-HR-2024':  { email: 'newhr@apple.com',     domain: 'apple.com' },
  'APL-INVITE':     { email: 'recruit@apple.com',   domain: 'apple.com' },
};

const getCompanyFromEmail = (email: string) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? MOCK_COMPANIES[domain] ?? null : null;
};

const getInfoFromInviteCode = (code: string): { email: string; company: { name: string; validCodes: string[] } } | null => {
  const entry = INVITE_CODE_EMAIL_MAP[code.trim().toUpperCase()];
  if (!entry) return null;
  const company = MOCK_COMPANIES[entry.domain] ?? null;
  if (!company) return null;
  return { email: entry.email, company };
};


  // Step 1 – Basic Info
  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [location, setLocation]         = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationRegion, setLocationRegion] = useState('');
  const [bio, setBio]                   = useState('');

  // Step 2 – Resume
  const [resumeFile, setResumeFile]     = useState<{ uri: string; name: string } | null>(null);

  // Step 3 – Skills
  const [skills, setSkills]             = useState<string[]>([]);
  const [skillInput, setSkillInput]     = useState('');

  // Step 4 – Experience & Education
  const [workEntries, setWorkEntries]   = useState<WorkEntry[]>([
    { company: '', position: '', start_date: '', end_date: '', description: '' },
  ]);
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([
    { school: '', degree: '', field_of_study: '', start_date: '', end_date: '' },
  ]);

  // Step 5 – Photo
  const [photoFile, setPhotoFile]       = useState<{ uri: string; name: string } | null>(null);

  // Step 6 – Social
  const [linkedinUrl, setLinkedinUrl]   = useState('');
  const [githubUrl, setGithubUrl]       = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [twitterUrl, setTwitterUrl]     = useState('');

  // Company Step 1 – Company Details
  const [companyName, setCompanyName]         = useState('');
  const [companyTagline, setCompanyTagline]   = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companySize, setCompanySize]         = useState('');
  const [foundedYear, setFoundedYear]         = useState('');
  const [websiteUrl, setWebsiteUrl]           = useState('');
  const [addressStreet, setAddressStreet]     = useState('');
  const [addressCity, setAddressCity]         = useState('');
  const [addressState, setAddressState]       = useState('');
  const [addressCountry, setAddressCountry]   = useState('');
  const [addressPostal, setAddressPostal]     = useState('');
  const [companySocialLinks, setCompanySocialLinks] = useState<string[]>(['']);

  // Company Step 2 – Verification Documents
  const [verificationDocs, setVerificationDocs] = useState<{ uri: string; name: string }[]>([]);

  // Company Step 3 – Media
  const [logoFile, setLogoFile]           = useState<{ uri: string; name: string } | null>(null);
  const [officeImages, setOfficeImages]   = useState<{ uri: string; name: string }[]>([]);

  // UI state
  const [roleSelected, setRoleSelected] = useState(false);
  const [emailDone, setEmailDone] = useState(false);
  const [currentStep, setCurrentStep]   = useState(0);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [detectedCompany, setDetectedCompany] = useState<{ name: string; validCodes: string[] } | null>(null);
  const [showInvitePrompt, setShowInvitePrompt] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [isInvitedHR, setIsInvitedHR] = useState(false);

  const steps = role === 'applicant' ? APPLICANT_STEPS : HR_STEPS;
  const stepKey = steps[currentStep];
  const totalSteps = steps.length;
  const progress = (currentStep + 1) / totalSteps;

  const hasUppercase = /[A-Z]/.test(password);
const hasNumber = /[0-9]/.test(password);
const hasMinLength = password.length >= 8;

const strengthLevel = password.length === 0 ? null
  : !hasMinLength ? 'weak'
  : !hasUppercase || !hasNumber ? 'weak'
  : password.length < 12 ? 'good'
  : 'strong';
  const strengthColor = strengthLevel === 'weak' ? T.danger
    : strengthLevel === 'good' ? T.warning
    : T.success;

  // ── Validation per step ────────────────────────────────────────────────────
  const validateCurrentStep = (): boolean => {
    setError('');
    if (stepKey === 'password') {
      if (!password || !confirmPassword) { setError('Please fill in all fields.'); return false; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return false; }
      if (!hasMinLength) { setError('Password must be at least 8 characters.'); return false; }
      if (!hasUppercase) { setError('Password must contain at least 1 uppercase letter.'); return false; }
      if (!hasNumber)    { setError('Password must contain at least 1 number.'); return false; }
    }
    if (stepKey === 'basic') {
      if (!firstName || !lastName || !location) { setError('First name, last name, and location are required.'); return false; }
    }
    if (stepKey === 'skills') {
      if (skills.length === 0) { setError('Please add at least one skill.'); return false; }
    }
    if (stepKey === 'company_details') {
      if (!companyName) { setError('Company name is required.'); return false; }
      if (companyName.length < 2 || companyName.length > 100) { setError('Company name must be 2–100 characters.'); return false; }
      if (!companyDescription) { setError('Company description is required.'); return false; }
      if (companyDescription.length < 50 || companyDescription.length > 2000) { setError('Description must be 50–2000 characters.'); return false; }
      if (!companyIndustry) { setError('Please select an industry.'); return false; }
      if (!companySize) { setError('Please select a company size.'); return false; }
    }
    if (stepKey === 'company_docs') {
      if (verificationDocs.length === 0) { setError('Please upload at least one verification document.'); return false; }
    }
    if (stepKey === 'company_media') {
      if (!logoFile) { setError('Please upload a company logo.'); return false; }
      if (officeImages.length === 0) { setError('Please upload at least one office image.'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < totalSteps - 1) {
      setCurrentStep(c => c + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
  if (currentStep > 0) {
    setError('');
    setCurrentStep(c => c - 1);
  }
};

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => setSkills(prev => prev.filter(s => s !== skill));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Step 1: Register account
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, password, role,
          first_name: firstName, last_name: lastName,
          location, location_city: locationCity, location_region: locationRegion,
          bio, skills,
          resume_url: resumeFile?.uri ?? null,
          photo_url: photoFile?.uri ?? null,
          linkedin_url: linkedinUrl, github_url: githubUrl,
          portfolio_url: portfolioUrl, twitter_url: twitterUrl,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || 'Registration failed. Please try again.');
        setCurrentStep(0);
        return;
      }

      const token = data.data.token;

      // If HR role, submit company onboarding steps
      if (role === 'hr') {
        // Onboarding Step 1: Company Details
        const step1Body = JSON.stringify({
          company_name: companyName,
          tagline: companyTagline,
          description: companyDescription,
          industry: companyIndustry,
          company_size: companySize,
          founded_year: foundedYear ? parseInt(foundedYear) : null,
          website_url: websiteUrl || null,
          address: {
            street: addressStreet, city: addressCity,
            state: addressState, country: addressCountry,
            postal_code: addressPostal,
          },
          social_links: companySocialLinks.filter(Boolean),
        });
        await fetch('http://localhost:8000/api/v1/profile/onboarding/step/1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: step1Body,
        });

        // Onboarding Step 2: Verification Documents
        if (verificationDocs.length > 0) {
          const formData2 = new FormData();
          verificationDocs.forEach((doc, i) => {
            formData2.append('verification_documents', { uri: doc.uri, name: doc.name, type: 'application/octet-stream' } as any);
          });
          await fetch('http://localhost:8000/api/v1/profile/onboarding/step/2', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData2,
          });
        }

        // Onboarding Step 3: Media
        const formData3 = new FormData();
        if (logoFile) formData3.append('logo_url', { uri: logoFile.uri, name: logoFile.name, type: 'image/jpeg' } as any);
        officeImages.forEach((img) => {
          formData3.append('office_images', { uri: img.uri, name: img.name, type: 'image/jpeg' } as any);
        });
        await fetch('http://localhost:8000/api/v1/profile/onboarding/step/3', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData3,
        });
      }

      setToken(token);
      router.replace(role === 'hr' ? '/(company-tabs)' : '/(tabs)');
    } catch {
      setError('Could not connect to server. Please try again.');
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  // ── Styles (dynamic) ───────────────────────────────────────────────────────
  const inputRowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing['2'],
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing['3'],
  };

  const inputStyle = {
    flex: 1,
    paddingVertical: Spacing['3'],
    fontSize: Typography.md,
    color: T.textPrimary,
  };

  const fieldLabelStyle = {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold as any,
    color: T.textSub,
    letterSpacing: 0.2,
    marginBottom: Spacing['2'],
  };
 // ── Reset Form ───────────────────────────────────────────────────────
const resetForm = () => {
  // Account
  setEmailDone(false);
  setEmail('');
  setPassword('');
  setConfirmPassword('');
  setShowPassword(false);
  setRole('applicant');

  // Basic Info
  setFirstName('');
  setLastName('');
  setLocation('');
  setLocationCity('');
  setLocationRegion('');
  setBio('');

  // Resume
  setResumeFile(null);

  // Skills
  setSkills([]);
  setSkillInput('');

  // Experience & Education
  setWorkEntries([{ company: '', position: '', start_date: '', end_date: '', description: '' }]);
  setEducationEntries([{ school: '', degree: '', field_of_study: '', start_date: '', end_date: '' }]);

  // Photo
  setPhotoFile(null);

  // Social
  setLinkedinUrl('');
  setGithubUrl('');
  setPortfolioUrl('');
  setTwitterUrl('');

  // Company Details
  setCompanyName('');
  setCompanyTagline('');
  setCompanyDescription('');
  setCompanyIndustry('');
  setCompanySize('');
  setFoundedYear('');
  setWebsiteUrl('');
  setAddressStreet('');
  setAddressCity('');
  setAddressState('');
  setAddressCountry('');
  setAddressPostal('');
  setCompanySocialLinks(['']);

  // Company Docs & Media
  setVerificationDocs([]);
  setLogoFile(null);
  setOfficeImages([]);

  // UI
  setCurrentStep(0);
  setError('');


  // Reset Company Detection & Invite State
  setDetectedCompany(null);
  setShowInvitePrompt(false);
  setInviteCode('');
  setInviteError('');
  setIsInvitedHR(false);
};

  // ── Role splash screen ────────────────────────────────────────────────────
  const RoleSplash = () => (
    <View style={{ flex: 1, backgroundColor: T.bg, paddingTop: topInset }}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, paddingHorizontal: Spacing['5'], justifyContent: 'space-between', paddingBottom: Math.max(Spacing['8'], bottomInset + Spacing['4'])}}>

        {/* Top: Brand */}
        <View style={{ alignItems: 'center', paddingTop: Spacing['12'] }}>
          <View style={{
            width: 72, height: 72, borderRadius: Radii.xl,
            backgroundColor: T.primary,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: Spacing['5'],
            ...Shadows.colored(T.primary),
          }}>
            <Text style={{ color: T.white, fontSize: 36, fontWeight: Typography.bold as any }}>J</Text>
          </View>
          <Text style={{ fontSize: Typography['3xl'], fontWeight: Typography.bold as any, color: T.textPrimary, letterSpacing: -0.5, textAlign: 'center' }}>
            Welcome to JobSwipe
          </Text>
          <Text style={{ fontSize: Typography.md, color: T.textSub, marginTop: Spacing['2'], textAlign: 'center', lineHeight: 22 }}>
            Let's get you set up. First, tell us{'\n'}who you are.
          </Text>
        </View>

        {/* Middle: Role cards */}
        <View style={{ gap: Spacing['4'] }}>
          {([
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
          ]).map(({ key, title, desc, IconComp, accent }) => {
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
                <View style={{
                  width: 56, height: 56, borderRadius: Radii.lg,
                  backgroundColor: active ? accent + '22' : T.surfaceHigh,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconComp active={active} color={active ? accent : T.textHint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: Typography.lg, fontWeight: Typography.bold as any, color: active ? accent : T.textPrimary, marginBottom: 3 }}>
                    {title}
                  </Text>
                  <Text style={{ fontSize: Typography.sm, color: T.textSub, lineHeight: 19 }}>
                    {desc}
                  </Text>
                </View>
                <View style={{
                  width: 24, height: 24, borderRadius: Radii.full,
                  backgroundColor: active ? accent : T.surfaceHigh,
                  borderWidth: active ? 0 : 1.5,
                  borderColor: T.border,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {active && <MaterialCommunityIcons name="check" size={14} color={T.white} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom: CTA */}
        <View style={{ gap: Spacing['4'] }}>
          <TouchableOpacity
            onPress={() => setRoleSelected(true)}
            activeOpacity={0.85}
            style={{
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: T.primary, borderRadius: Radii.lg,
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
                <Text style={{ fontSize: Typography.sm, color: T.primary, fontWeight: Typography.semibold as any }}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

      </View>
    </View>
  );

  // ── Step progress bar ──────────────────────────────────────────────────────
  const StepProgressBar = () => (
    <View style={{ paddingHorizontal: Spacing['4'], paddingTop: Spacing['4'], paddingBottom: Spacing['3'], gap: Spacing['2'] }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: Typography.xs, color: T.textHint }}>
          Step {currentStep + 1} of {totalSteps}
        </Text>
        <Text style={{ fontSize: Typography.xs, color: T.primary, fontWeight: Typography.semibold as any }}>
          {STEP_LABELS[stepKey]}
        </Text>
      </View>
      <View style={{ height: 4, backgroundColor: T.surfaceHigh, borderRadius: Radii.full, overflow: 'hidden' }}>
        <View style={{ height: '100%', borderRadius: Radii.full, backgroundColor: T.primary, width: `${progress * 100}%` }} />
      </View>
      {/* Step dots */}
      <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center', marginTop: Spacing['1'], marginBottom: Spacing["8"] }}>
        {steps.map((s, i) => (
          <View
            key={s}
            style={{
              width: i === currentStep ? 20 : 6,
              height: 6,
              borderRadius: Radii.full,
              backgroundColor: i < currentStep ? T.primary : i === currentStep ? T.primary : T.surfaceHigh,
              opacity: i < currentStep ? 0.5 : 1,
            }}
          />
        ))}
      </View>
    </View>
  );

  // ── Render step content ────────────────────────────────────────────────────
  const renderStep = () => {
    switch (stepKey) {

      // ── Email ────────────────────────────────────────────────────────────
      case 'email':
        return (
          <>
            <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="What's your email?">
              <View style={{ gap: Spacing['2'] }}>
                <Text style={fieldLabelStyle}>Email address</Text>
                <View style={inputRowStyle}>
                  <MaterialCommunityIcons name="email-outline" size={16} color={T.textHint} />
                  <TextInput
                    style={inputStyle}
                    placeholder="your.email@example.com"
                    placeholderTextColor={T.textHint}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                </View>
                <Text style={{ fontSize: Typography.xs, color: T.textHint }}>We'll send a verification code to this address</Text>
              </View>
            </SectionCard>

            {/* OR divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['3'] }}>
              <View style={{ flex: 1, height: 1, backgroundColor: T.borderFaint }} />
              <Text style={{ fontSize: Typography.sm, color: T.textHint }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: T.borderFaint }} />
            </View>

            {/* Google sign-up */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => { /* TODO: hook up Google OAuth */ }}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: Spacing['3'],
                backgroundColor: T.surface,
                borderWidth: 1, borderColor: T.border,
                borderRadius: Radii.lg,
                paddingVertical: Spacing['4'],
              }}
            >
              {/* Google "G" logo in SVG */}
              <Svg width="18" height="18" viewBox="0 0 48 48">
                <Path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.08-6.08C34.52 3.1 29.57 1 24 1 14.82 1 7.07 6.48 3.6 14.23l7.1 5.52C12.4 13.6 17.74 9.5 24 9.5z"/>
                <Path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.68c-.55 2.96-2.2 5.47-4.68 7.15l7.18 5.57C43.18 37.6 46.52 31.55 46.52 24.5z"/>
                <Path fill="#FBBC05" d="M10.7 28.25A14.6 14.6 0 0 1 9.5 24c0-1.48.26-2.91.7-4.25l-7.1-5.52A23.94 23.94 0 0 0 0 24c0 3.86.92 7.5 2.55 10.73l8.15-6.48z"/>
                <Path fill="#34A853" d="M24 47c5.57 0 10.25-1.84 13.66-5l-7.18-5.57C28.7 37.8 26.47 38.5 24 38.5c-6.26 0-11.6-4.1-13.3-9.75l-8.15 6.48C6.07 42.52 14.43 47 24 47z"/>
              </Svg>
              <Text style={{ fontSize: Typography.md, fontWeight: Typography.semibold as any, color: T.textPrimary }}>
                Continue with Google
              </Text>
            </TouchableOpacity>
          </>
        );

      // ── Password ─────────────────────────────────────────────────────────
      case 'password':
        return (
          <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Create a password">
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

      // ── Step 1: Basic Info ───────────────────────────────────────────────
      case 'basic':
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

            <View style={{ gap: Spacing['2'] }}>
              <Text style={fieldLabelStyle}>Location *</Text>
              <View style={inputRowStyle}>
                <MaterialCommunityIcons name="map-marker-outline" size={16} color={T.textHint} />
                <TextInput style={inputStyle} placeholder="San Francisco, CA" placeholderTextColor={T.textHint} value={location} onChangeText={setLocation} />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing['3'], marginTop: Spacing['3'] }}>
              <View style={{ flex: 1, gap: Spacing['2'] }}>
                <Text style={fieldLabelStyle}>City</Text>
                <View style={inputRowStyle}>
                  <TextInput style={inputStyle} placeholder="San Francisco" placeholderTextColor={T.textHint} value={locationCity} onChangeText={setLocationCity} />
                </View>
              </View>
              <View style={{ flex: 1, gap: Spacing['2'] }}>
                <Text style={fieldLabelStyle}>Region / State</Text>
                <View style={inputRowStyle}>
                  <TextInput style={inputStyle} placeholder="California" placeholderTextColor={T.textHint} value={locationRegion} onChangeText={setLocationRegion} />
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

      // ── Step 2: Resume ───────────────────────────────────────────────────
      case 'resume':
        return (
          <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Resume Upload">
            <View style={{ gap: Spacing['3'] }}>
              <Text style={{ fontSize: Typography.sm, color: T.textSub }}>
                Upload your resume (PDF or Word). Max 5MB.
              </Text>
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
                    type: [
                      'application/pdf',
                      'application/msword',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    ],
                    copyToCacheDirectory: true,
                  });
                  if (!result.canceled && result.assets?.[0]) {
                    const asset = result.assets[0];
                    setResumeFile({ uri: asset.uri, name: asset.name });
                  }
                }}
              >
                <MaterialCommunityIcons
                  name={resumeFile ? 'file-check-outline' : 'file-upload-outline'}
                  size={36}
                  color={resumeFile ? T.success : T.primary}
                />
                <Text style={{ fontSize: Typography.base, fontWeight: Typography.semibold as any, color: resumeFile ? T.success : T.textPrimary }}>
                  {resumeFile ? resumeFile.name : 'Tap to upload resume'}
                </Text>
                <Text style={{ fontSize: Typography.xs, color: T.textHint }}>PDF/DOC/DOCX · Max 5MB</Text>
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

      // ── Step 3: Skills ───────────────────────────────────────────────────
      case 'skills':
        return (
          <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Skills">
            <View style={{ gap: Spacing['3'] }}>
              <Text style={{ fontSize: Typography.sm, color: T.textSub }}>Add at least one skill. Type and press Enter or tap Add.</Text>
              <View style={{ flexDirection: 'row', gap: Spacing['2'] }}>
                <View style={[inputRowStyle, { flex: 1 }]}>
                  <MaterialCommunityIcons name="tag-outline" size={16} color={T.textHint} />
                  <TextInput
                    style={inputStyle}
                    placeholder="Add your skills..."
                    placeholderTextColor={T.textHint}
                    value={skillInput}
                    onChangeText={setSkillInput}
                    returnKeyType="done"
                    onSubmitEditing={addSkill}
                  />
                </View>
                <TouchableOpacity
                  onPress={addSkill}
                  style={{ backgroundColor: T.primary, borderRadius: Radii.md, paddingHorizontal: Spacing['4'], justifyContent: 'center' }}
                >
                  <Text style={{ color: T.white, fontWeight: Typography.semibold as any, fontSize: Typography.sm }}>Add</Text>
                </TouchableOpacity>
              </View>
              {skills.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'] }}>
                  {skills.map(skill => (
                    <View
                      key={skill}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border, borderRadius: Radii.full, paddingHorizontal: Spacing['3'], paddingVertical: Spacing['1'] }}
                    >
                      <Text style={{ fontSize: Typography.sm, color: T.primary, fontWeight: Typography.medium as any }}>{skill}</Text>
                      <TouchableOpacity onPress={() => removeSkill(skill)} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
                        <MaterialCommunityIcons name="close" size={13} color={T.textHint} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              {skills.length === 0 && (
                <Text style={{ fontSize: Typography.xs, color: T.textHint, textAlign: 'center', paddingVertical: Spacing['2'] }}>No skills added yet</Text>
              )}
            </View>
          </SectionCard>
        );

      // ── Step 4: Experience & Education ───────────────────────────────────
      case 'experience':
        return (
          <>
            {/* Work Experience */}
            <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Work Experience">
              {workEntries.map((entry, i) => (
                <View key={i} style={{ gap: Spacing['3'], paddingTop: i > 0 ? Spacing['4'] : 0, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: T.borderFaint }}>
                  {i > 0 && (
                    <TouchableOpacity
                      onPress={() => setWorkEntries(prev => prev.filter((_, idx) => idx !== i))}
                      style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    >
                      <MaterialCommunityIcons name="minus-circle-outline" size={14} color={T.danger} />
                      <Text style={{ fontSize: Typography.xs, color: T.danger }}>Remove</Text>
                    </TouchableOpacity>
                  )}
                  <View style={{ gap: Spacing['2'] }}>
                    <Text style={fieldLabelStyle}>Company</Text>
                    <View style={inputRowStyle}>
                      <MaterialCommunityIcons name="office-building-outline" size={15} color={T.textHint} />
                      <TextInput style={inputStyle} placeholder="e.g. Acme Corp" placeholderTextColor={T.textHint} value={entry.company} onChangeText={v => setWorkEntries(prev => prev.map((e, idx) => idx === i ? { ...e, company: v } : e))} />
                    </View>
                  </View>
                  <View style={{ gap: Spacing['2'] }}>
                    <Text style={fieldLabelStyle}>Position</Text>
                    <View style={inputRowStyle}>
                      <MaterialCommunityIcons name="briefcase-outline" size={15} color={T.textHint} />
                      <TextInput style={inputStyle} placeholder="e.g. Software Engineer" placeholderTextColor={T.textHint} value={entry.position} onChangeText={v => setWorkEntries(prev => prev.map((e, idx) => idx === i ? { ...e, position: v } : e))} />
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: Spacing['3'] }}>
                    <View style={{ flex: 1, gap: Spacing['2'] }}>
                      <Text style={fieldLabelStyle}>Start date</Text>
                      <View style={inputRowStyle}>
                        <TextInput style={inputStyle} placeholder="YYYY-MM-DD" placeholderTextColor={T.textHint} value={entry.start_date} onChangeText={v => setWorkEntries(prev => prev.map((e, idx) => idx === i ? { ...e, start_date: v } : e))} />
                      </View>
                    </View>
                    <View style={{ flex: 1, gap: Spacing['2'] }}>
                      <Text style={fieldLabelStyle}>End date</Text>
                      <View style={inputRowStyle}>
                        <TextInput style={inputStyle} placeholder="Present" placeholderTextColor={T.textHint} value={entry.end_date} onChangeText={v => setWorkEntries(prev => prev.map((e, idx) => idx === i ? { ...e, end_date: v } : e))} />
                      </View>
                    </View>
                  </View>
                  <View style={{ gap: Spacing['2'] }}>
                    <Text style={fieldLabelStyle}>Description</Text>
                    <View style={[inputRowStyle, { alignItems: 'flex-start', paddingVertical: Spacing['2'] }]}>
                      <TextInput style={[inputStyle, { minHeight: 60, textAlignVertical: 'top' }]} placeholder="Describe your role..." placeholderTextColor={T.textHint} value={entry.description} onChangeText={v => setWorkEntries(prev => prev.map((e, idx) => idx === i ? { ...e, description: v } : e))} multiline maxLength={500} />
                    </View>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => setWorkEntries(prev => [...prev, { company: '', position: '', start_date: '', end_date: '', description: '' }])}
                style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], marginTop: Spacing['3'], paddingVertical: Spacing['2'] }}
              >
                <MaterialCommunityIcons name="plus-circle-outline" size={16} color={T.primary} />
                <Text style={{ fontSize: Typography.sm, color: T.primary, fontWeight: Typography.medium as any }}>Add another position</Text>
              </TouchableOpacity>
            </SectionCard>

            {/* Education */}
            <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Education">
              <Text style={{ fontSize: Typography.xs, color: T.textHint, marginBottom: Spacing['3'] }}>Both are optional but recommended</Text>
              {educationEntries.map((entry, i) => (
                <View key={i} style={{ gap: Spacing['3'], paddingTop: i > 0 ? Spacing['4'] : 0, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: T.borderFaint }}>
                  {i > 0 && (
                    <TouchableOpacity onPress={() => setEducationEntries(prev => prev.filter((_, idx) => idx !== i))} style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MaterialCommunityIcons name="minus-circle-outline" size={14} color={T.danger} />
                      <Text style={{ fontSize: Typography.xs, color: T.danger }}>Remove</Text>
                    </TouchableOpacity>
                  )}
                  <View style={{ flexDirection: 'row', gap: Spacing['3'] }}>
                    <View style={{ flex: 1, gap: Spacing['2'] }}>
                      <Text style={fieldLabelStyle}>School</Text>
                      <View style={inputRowStyle}>
                        <TextInput style={inputStyle} placeholder="MIT" placeholderTextColor={T.textHint} value={entry.school} onChangeText={v => setEducationEntries(prev => prev.map((e, idx) => idx === i ? { ...e, school: v } : e))} />
                      </View>
                    </View>
                    <View style={{ flex: 1, gap: Spacing['2'] }}>
                      <Text style={fieldLabelStyle}>Degree</Text>
                      <View style={inputRowStyle}>
                        <TextInput style={inputStyle} placeholder="B.S." placeholderTextColor={T.textHint} value={entry.degree} onChangeText={v => setEducationEntries(prev => prev.map((e, idx) => idx === i ? { ...e, degree: v } : e))} />
                      </View>
                    </View>
                  </View>
                  <View style={{ gap: Spacing['2'] }}>
                    <Text style={fieldLabelStyle}>Field of Study</Text>
                    <View style={inputRowStyle}>
                      <TextInput style={inputStyle} placeholder="Computer Science" placeholderTextColor={T.textHint} value={entry.field_of_study} onChangeText={v => setEducationEntries(prev => prev.map((e, idx) => idx === i ? { ...e, field_of_study: v } : e))} />
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: Spacing['3'] }}>
                    <View style={{ flex: 1, gap: Spacing['2'] }}>
                      <Text style={fieldLabelStyle}>Start</Text>
                      <View style={inputRowStyle}>
                        <TextInput style={inputStyle} placeholder="YYYY-MM-DD" placeholderTextColor={T.textHint} value={entry.start_date} onChangeText={v => setEducationEntries(prev => prev.map((e, idx) => idx === i ? { ...e, start_date: v } : e))} />
                      </View>
                    </View>
                    <View style={{ flex: 1, gap: Spacing['2'] }}>
                      <Text style={fieldLabelStyle}>End</Text>
                      <View style={inputRowStyle}>
                        <TextInput style={inputStyle} placeholder="YYYY-MM-DD" placeholderTextColor={T.textHint} value={entry.end_date} onChangeText={v => setEducationEntries(prev => prev.map((e, idx) => idx === i ? { ...e, end_date: v } : e))} />
                      </View>
                    </View>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => setEducationEntries(prev => [...prev, { school: '', degree: '', field_of_study: '', start_date: '', end_date: '' }])}
                style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], marginTop: Spacing['3'], paddingVertical: Spacing['2'] }}
              >
                <MaterialCommunityIcons name="plus-circle-outline" size={16} color={T.primary} />
                <Text style={{ fontSize: Typography.sm, color: T.primary, fontWeight: Typography.medium as any }}>Add another education</Text>
              </TouchableOpacity>
            </SectionCard>
          </>
        );

      // ── Step 5: Profile Photo ────────────────────────────────────────────
      case 'photo':
        return (
          <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Profile Photo">
            <View style={{ gap: Spacing['3'], alignItems: 'center' }}>
              <Text style={{ fontSize: Typography.sm, color: T.textSub, textAlign: 'center' }}>
                Add a profile photo to stand out. JPG/PNG, max 2MB. Optional.
              </Text>
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
                    setPhotoFile({ uri: asset.uri, name });
                  }
                }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  borderWidth: 2,
                  borderStyle: 'dashed' as any,
                  borderColor: photoFile ? T.success : T.border,
                  backgroundColor: photoFile ? T.successLight : T.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {photoFile ? (
                  <Image
                    source={{ uri: photoFile.uri }}
                    style={{ width: 100, height: 100, borderRadius: 50 }}
                  />
                ) : (
                  <MaterialCommunityIcons name="camera-plus-outline" size={36} color={T.primary} />
                )}
              </TouchableOpacity>
              {photoFile
                ? <Text style={{ fontSize: Typography.sm, color: T.success, fontWeight: Typography.medium as any }}>{photoFile.name}</Text>
                : <Text style={{ fontSize: Typography.xs, color: T.textHint }}>Tap to upload</Text>
              }
              {photoFile && (
                <TouchableOpacity onPress={() => setPhotoFile(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MaterialCommunityIcons name="close-circle-outline" size={14} color={T.danger} />
                  <Text style={{ fontSize: Typography.xs, color: T.danger }}>Remove photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </SectionCard>
        );

      // ── Step 6: Social Links ─────────────────────────────────────────────
      case 'social':
        return (
          <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Social Links">
            <Text style={{ fontSize: Typography.xs, color: T.textHint, marginBottom: Spacing['3'] }}>All optional</Text>
            {[
              { label: 'LinkedIn', icon: 'linkedin' as const, placeholder: 'https://linkedin.com/in/...', value: linkedinUrl, onChange: setLinkedinUrl },
              { label: 'GitHub',   icon: 'github'   as const, placeholder: 'https://github.com/...',    value: githubUrl,   onChange: setGithubUrl   },
              { label: 'Portfolio',icon: 'web'       as const, placeholder: 'https://yourportfolio.com', value: portfolioUrl,onChange: setPortfolioUrl },
              { label: 'Twitter',  icon: 'twitter'  as const, placeholder: 'https://twitter.com/...',   value: twitterUrl,  onChange: setTwitterUrl  },
            ].map(({ label, icon, placeholder, value, onChange }, i, arr) => (
              <View key={label}>
                <View style={{ gap: Spacing['2'] }}>
                  <Text style={fieldLabelStyle}>{label}</Text>
                  <View style={inputRowStyle}>
                    <MaterialCommunityIcons name={icon} size={16} color={T.textHint} />
                    <TextInput
                      style={inputStyle}
                      placeholder={placeholder}
                      placeholderTextColor={T.textHint}
                      value={value}
                      onChangeText={onChange}
                      keyboardType="url"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>
                {i < arr.length - 1 && <Divider spacing={Spacing['4']} />}
              </View>
            ))}
          </SectionCard>
        );

      // ── Company Step 1: Company Details ─────────────────────────────────
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
                  <TextInput
                    style={[inputStyle, { minHeight: 100, textAlignVertical: 'top' }]}
                    placeholder="Tell us about your company..."
                    placeholderTextColor={T.textHint}
                    value={companyDescription}
                    onChangeText={setCompanyDescription}
                    multiline
                    maxLength={2000}
                  />
                </View>
                <Text style={{ fontSize: Typography.xs, color: T.textHint, textAlign: 'right' }}>{companyDescription.length}/2000 (min 50)</Text>
              </View>
            </SectionCard>

            <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Industry & Size">
              <View style={{ gap: Spacing['2'] }}>
                <Text style={fieldLabelStyle}>Industry *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing['1'] }}>
                  <View style={{ flexDirection: 'row', gap: Spacing['2'], paddingHorizontal: Spacing['1'], paddingVertical: Spacing['1'] }}>
                    {INDUSTRY_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => setCompanyIndustry(opt)}
                        style={{
                          paddingHorizontal: Spacing['3'], paddingVertical: Spacing['2'],
                          borderRadius: Radii.full,
                          backgroundColor: companyIndustry === opt ? T.primary : T.surfaceHigh,
                          borderWidth: companyIndustry === opt ? 0 : 1,
                          borderColor: T.border,
                        }}
                      >
                        <Text style={{ fontSize: Typography.sm, color: companyIndustry === opt ? T.white : T.textSub, fontWeight: companyIndustry === opt ? Typography.semibold as any : 'normal' }}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <Divider spacing={Spacing['4']} />

              <View style={{ gap: Spacing['2'] }}>
                <Text style={fieldLabelStyle}>Company Size *</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'] }}>
                  {COMPANY_SIZE_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => setCompanySize(opt)}
                      style={{
                        paddingHorizontal: Spacing['3'], paddingVertical: Spacing['2'],
                        borderRadius: Radii.full,
                        backgroundColor: companySize === opt ? T.primary : T.surfaceHigh,
                        borderWidth: companySize === opt ? 0 : 1,
                        borderColor: T.border,
                      }}
                    >
                      <Text style={{ fontSize: Typography.sm, color: companySize === opt ? T.white : T.textSub, fontWeight: companySize === opt ? Typography.semibold as any : 'normal' }}>
                        {opt}
                      </Text>
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
              <Text style={{ fontSize: Typography.xs, color: T.textHint, marginBottom: Spacing['3'] }}>All address fields are optional</Text>
              <View style={{ gap: Spacing['3'] }}>
                <View style={{ gap: Spacing['2'] }}>
                  <Text style={fieldLabelStyle}>Street</Text>
                  <View style={inputRowStyle}>
                    <MaterialCommunityIcons name="map-marker-outline" size={16} color={T.textHint} />
                    <TextInput style={inputStyle} placeholder="123 Main St" placeholderTextColor={T.textHint} value={addressStreet} onChangeText={setAddressStreet} maxLength={200} />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: Spacing['3'] }}>
                  <View style={{ flex: 1, gap: Spacing['2'] }}>
                    <Text style={fieldLabelStyle}>City</Text>
                    <View style={inputRowStyle}>
                      <TextInput style={inputStyle} placeholder="San Francisco" placeholderTextColor={T.textHint} value={addressCity} onChangeText={setAddressCity} maxLength={100} />
                    </View>
                  </View>
                  <View style={{ flex: 1, gap: Spacing['2'] }}>
                    <Text style={fieldLabelStyle}>State</Text>
                    <View style={inputRowStyle}>
                      <TextInput style={inputStyle} placeholder="California" placeholderTextColor={T.textHint} value={addressState} onChangeText={setAddressState} maxLength={100} />
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: Spacing['3'] }}>
                  <View style={{ flex: 2, gap: Spacing['2'] }}>
                    <Text style={fieldLabelStyle}>Country</Text>
                    <View style={inputRowStyle}>
                      <TextInput style={inputStyle} placeholder="United States" placeholderTextColor={T.textHint} value={addressCountry} onChangeText={setAddressCountry} maxLength={100} />
                    </View>
                  </View>
                  <View style={{ flex: 1, gap: Spacing['2'] }}>
                    <Text style={fieldLabelStyle}>Postal Code</Text>
                    <View style={inputRowStyle}>
                      <TextInput style={inputStyle} placeholder="94102" placeholderTextColor={T.textHint} value={addressPostal} onChangeText={setAddressPostal} keyboardType="number-pad" maxLength={20} />
                    </View>
                  </View>
                </View>
              </View>
            </SectionCard>

            <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Social Links">
              <Text style={{ fontSize: Typography.xs, color: T.textHint, marginBottom: Spacing['3'] }}>Add company social media links (optional)</Text>
              {companySocialLinks.map((link, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], marginBottom: Spacing['3'] }}>
                  <View style={[inputRowStyle, { flex: 1 }]}>
                    <MaterialCommunityIcons name="link-variant" size={16} color={T.textHint} />
                    <TextInput
                      style={inputStyle}
                      placeholder="https://..."
                      placeholderTextColor={T.textHint}
                      value={link}
                      onChangeText={v => setCompanySocialLinks(prev => prev.map((l, idx) => idx === i ? v : l))}
                      keyboardType="url"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {i > 0 && (
                    <TouchableOpacity onPress={() => setCompanySocialLinks(prev => prev.filter((_, idx) => idx !== i))}>
                      <MaterialCommunityIcons name="close-circle-outline" size={20} color={T.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity
                onPress={() => setCompanySocialLinks(prev => [...prev, ''])}
                style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}
              >
                <MaterialCommunityIcons name="plus-circle-outline" size={16} color={T.primary} />
                <Text style={{ fontSize: Typography.sm, color: T.primary, fontWeight: Typography.medium as any }}>Add link</Text>
              </TouchableOpacity>
            </SectionCard>
          </>
        );

      // ── Company Step 2: Verification Documents ───────────────────────────
      case 'company_docs':
        return (
          <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Verification Documents">
            <Text style={{ fontSize: Typography.sm, color: T.textSub, marginBottom: Spacing['3'] }}>
              Upload your business license, tax ID, or incorporation documents. PDF/JPG/PNG. Min 1, max 5 files.
            </Text>
            <TouchableOpacity
              style={{
                borderWidth: 2, borderStyle: 'dashed' as any,
                borderColor: verificationDocs.length > 0 ? T.success : T.border,
                borderRadius: Radii.lg, padding: Spacing['5'],
                alignItems: 'center', gap: Spacing['2'],
                backgroundColor: verificationDocs.length > 0 ? T.successLight : T.surfaceHigh,
                opacity: verificationDocs.length >= 5 ? 0.5 : 1,
              }}
              onPress={async () => {
            if (verificationDocs.length >= 5) { setError('Maximum 5 documents allowed.'); return; }
            const result = await DocumentPicker.getDocumentAsync({
              type: ['application/pdf', 'image/jpeg', 'image/png'],
               multiple: false,
            });
           if (!result.canceled && result.assets?.[0]) {
             const asset = result.assets[0];
               setVerificationDocs(prev => {
                 if (prev.length >= 5) return prev;
                 return [...prev, { uri: asset.uri, name: asset.name }];
               });
  }
}}
            >
              <MaterialCommunityIcons name="file-upload-outline" size={32} color={verificationDocs.length > 0 ? T.success : T.primary} />
              <Text style={{ fontSize: Typography.sm, color: verificationDocs.length > 0 ? T.success : T.textSub, fontWeight: Typography.medium as any }}>
                {verificationDocs.length > 0 ? `${verificationDocs.length} file(s) selected` : 'Tap to upload document'}
              </Text>
              <Text style={{ fontSize: Typography.xs, color: T.textHint }}>PDF, JPG, PNG • Max 5 files</Text>
            </TouchableOpacity>
            {verificationDocs.length > 0 && (
              <View style={{ gap: Spacing['2'], marginTop: Spacing['3'] }}>
                {verificationDocs.map((doc, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], backgroundColor: T.surfaceHigh, borderRadius: Radii.md, padding: Spacing['3'] }}>
                    <MaterialCommunityIcons name="file-document-outline" size={18} color={T.primary} />
                    <Text style={{ flex: 1, fontSize: Typography.sm, color: T.textPrimary }} numberOfLines={1}>{doc.name}</Text>
                    <TouchableOpacity onPress={() => setVerificationDocs(prev => prev.filter((_, idx) => idx !== i))}>
                      <MaterialCommunityIcons name="close-circle-outline" size={18} color={T.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], marginTop: Spacing['4'], backgroundColor: T.surfaceHigh, borderRadius: Radii.md, padding: Spacing['3'] }}>
              <MaterialCommunityIcons name="information-outline" size={16} color={T.textHint} />
              <Text style={{ flex: 1, fontSize: Typography.xs, color: T.textHint, lineHeight: 18 }}>
                Submitting these documents will set your verification status to "pending" while our team reviews them.
              </Text>
            </View>
          </SectionCard>
        );

      // ── Company Step 3: Media ────────────────────────────────────────────
      case 'company_media':
        return (
          <>
            <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Company Logo">
              <Text style={{ fontSize: Typography.sm, color: T.textSub, marginBottom: Spacing['3'] }}>
                Upload your company logo. JPG/PNG, max 2MB. Required.
              </Text>
              <View style={{ alignItems: 'center', gap: Spacing['3'] }}>
                <TouchableOpacity
                  onPress={async () => {
                    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (!permission.granted) { setError('Permission to access photos is required.'); return; }
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.8,
                    });
                    if (!result.canceled && result.assets?.[0]) {
                      const asset = result.assets[0];
                      setLogoFile({ uri: asset.uri, name: asset.uri.split('/').pop() ?? 'logo.jpg' });
                    }
                  }}
                  style={{
                    width: 110, height: 110, borderRadius: Radii.xl,
                    borderWidth: 2, borderStyle: 'dashed' as any,
                    borderColor: logoFile ? T.success : T.border,
                    backgroundColor: logoFile ? T.successLight : T.surfaceHigh,
                    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  }}
                >
                  {logoFile
                    ? <Image source={{ uri: logoFile.uri }} style={{ width: 110, height: 110, borderRadius: Radii.xl }} />
                    : <MaterialCommunityIcons name="image-plus" size={36} color={T.primary} />
                  }
                </TouchableOpacity>
                {logoFile
                  ? <Text style={{ fontSize: Typography.sm, color: T.success, fontWeight: Typography.medium as any }}>{logoFile.name}</Text>
                  : <Text style={{ fontSize: Typography.xs, color: T.textHint }}>Tap to upload logo</Text>
                }
                {logoFile && (
                  <TouchableOpacity onPress={() => setLogoFile(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="close-circle-outline" size={14} color={T.danger} />
                    <Text style={{ fontSize: Typography.xs, color: T.danger }}>Remove logo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </SectionCard>

            <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Office Photos">
              <Text style={{ fontSize: Typography.sm, color: T.textSub, marginBottom: Spacing['3'] }}>
                Upload photos of your office space. JPG/PNG. Min 1, max 6 images. Required.
              </Text>
              <TouchableOpacity
                style={{
                  borderWidth: 2, borderStyle: 'dashed' as any,
                  borderColor: officeImages.length > 0 ? T.success : T.border,
                  borderRadius: Radii.lg, padding: Spacing['5'],
                  alignItems: 'center', gap: Spacing['2'],
                  backgroundColor: officeImages.length > 0 ? T.successLight : T.surfaceHigh,
                  opacity: officeImages.length >= 6 ? 0.5 : 1,
                }}
                onPress={async () => {
                  if (officeImages.length >= 6) { setError('Maximum 6 office images allowed.'); return; }
                  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (!permission.granted) { setError('Permission to access photos is required.'); return; }
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: 'images', allowsMultipleSelection: true, quality: 0.8,
                  });
                  if (!result.canceled && result.assets?.length) {
                    setOfficeImages(prev => {
                    const remaining = 6 - prev.length;
                    if (remaining <= 0) return prev;
                    const newImages = result.assets.slice(0, remaining).map(a => ({
                    uri: a.uri, name: a.uri.split('/').pop() ?? 'office.jpg',
              }));
    return [...prev, ...newImages];
  });
}
                }}
              >
                <MaterialCommunityIcons name="image-multiple-outline" size={32} color={officeImages.length > 0 ? T.success : T.primary} />
                <Text style={{ fontSize: Typography.sm, color: officeImages.length > 0 ? T.success : T.textSub, fontWeight: Typography.medium as any }}>
                  {officeImages.length > 0 ? `${officeImages.length} photo(s) selected` : 'Tap to upload photos'}
                </Text>
                <Text style={{ fontSize: Typography.xs, color: T.textHint }}>JPG, PNG • Max 6 images</Text>
              </TouchableOpacity>
              {officeImages.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'], marginTop: Spacing['3'] }}>
                  {officeImages.map((img, i) => (
                    <View key={i} style={{ position: 'relative' }}>
                      <Image source={{ uri: img.uri }} style={{ width: 80, height: 80, borderRadius: Radii.md }} />
                      <TouchableOpacity
                        onPress={() => setOfficeImages(prev => prev.filter((_, idx) => idx !== i))}
                        style={{ position: 'absolute', top: -6, right: -6, backgroundColor: T.bg, borderRadius: Radii.full }}
                      >
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
  };

  const isLastStep = currentStep === totalSteps - 1;

  // Show role splash before the multi-step form
  if (!roleSelected) return <RoleSplash />;

  // Invite prompt must be checked before !emailDone (emailDone is still false when invite prompt shows)
  if (showInvitePrompt) return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: T.bg, paddingTop: topInset }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      <View style={{ paddingHorizontal: Spacing['5'], paddingTop: Spacing['4'], paddingBottom: Spacing['5'] }}>
        <TouchableOpacity
          onPress={() => { setShowInvitePrompt(false); setInviteCode(''); setInviteError(''); }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], alignSelf: 'flex-start' }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={T.textSub} />
          <Text style={{ fontSize: Typography.md, color: T.textSub }}>Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing['4'], gap: Spacing['4'] }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }}>
          <View style={{ alignItems: 'center', gap: Spacing['3'], paddingVertical: Spacing['2'] }}>
            <View style={{ width: 56, height: 56, borderRadius: Radii.xl, backgroundColor: T.primary ?? T.surfaceHigh, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="office-building" size={28} color={T.primary} />
            </View>
            <Text style={{ fontSize: Typography.lg, fontWeight: Typography.bold as any, color: T.textPrimary, textAlign: 'center' }}>
              Register with an invite code
            </Text>
            <Text style={{ fontSize: Typography.sm, color: T.textSub, textAlign: 'center', lineHeight: 20 }}>
              Enter your invite code below. Your email and company will be determined from the code.
            </Text>
          </View>
        </SectionCard>
        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="Enter Invite Code">
          <View style={{ gap: Spacing['2'] }}>
            <Text style={fieldLabelStyle}>Invite code</Text>
            <View style={inputRowStyle}>
              <MaterialCommunityIcons name="ticket-outline" size={16} color={T.textHint} />
              <TextInput
                style={inputStyle}
                placeholder="e.g. COMPANY-HR-2024"
                placeholderTextColor={T.textHint}
                value={inviteCode}
                onChangeText={(t) => { setInviteCode(t); setInviteError(''); }}
                autoCapitalize="characters"
                autoFocus
              />
            </View>
            {inviteError ? <Text style={{ fontSize: Typography.xs, color: T.danger }}>{inviteError}</Text> : null}
          </View>
        </SectionCard>
        <TouchableOpacity
          style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: T.primary, borderRadius: Radii.lg, paddingVertical: Spacing['4'], ...Shadows.colored(T.primary) }}
          onPress={() => {
            if (!inviteCode.trim()) { setInviteError('Please enter your invite code.'); return; }
            const inviteInfo = getInfoFromInviteCode(inviteCode.trim());
            if (inviteInfo) {
              // Populate email and company from the invite code — overrides anything the user typed
              setEmail(inviteInfo.email);
              setDetectedCompany(inviteInfo.company);
              setIsInvitedHR(true);
              setShowInvitePrompt(false);
              setEmailDone(true);
            } else if (detectedCompany && detectedCompany.validCodes.includes(inviteCode.trim().toUpperCase())) {
              // Fallback: email was already typed and matches a known company
              setIsInvitedHR(true);
              setShowInvitePrompt(false);
              setEmailDone(true);
            } else {
              setInviteError('Invalid invite code. Please check with your company admin.');
            }
          }}
          activeOpacity={0.85}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
            <Text style={{ color: T.white, fontSize: Typography.lg, fontWeight: Typography.semibold as any }}>Verify & Continue</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color={T.white} />
          </View>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['3'] }}>
          <View style={{ flex: 1, height: 1, backgroundColor: T.border }} />
          <Text style={{ fontSize: Typography.xs, color: T.textHint }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: T.border }} />
        </View>
        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }}>
          <View style={{ gap: Spacing['3'] }}>
            <Text style={{ fontSize: Typography.sm, fontWeight: Typography.semibold as any, color: T.textPrimary }}>Don't have an invite code?</Text>
            <Text style={{ fontSize: Typography.sm, color: T.textSub, lineHeight: 20 }}>
              Ask your company admin to send you an affiliate invite link, or contact {detectedCompany ? detectedCompany.name : 'your company'}'s HR team to get access.
            </Text>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing['2'], borderWidth: 1, borderColor: T.primary, borderRadius: Radii.lg, paddingVertical: Spacing['3'] }}
              onPress={() => { setInviteError(''); alert(`Contact your ${detectedCompany ? detectedCompany.name : 'company'} admin to receive an invite link to your work email.`); }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="email-arrow-right-outline" size={16} color={T.primary} />
              <Text style={{ fontSize: Typography.sm, color: T.primary, fontWeight: Typography.semibold as any }}>Request an invite link</Text>
            </TouchableOpacity>
          </View>
        </SectionCard>
        <Spacer size="xl" />
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // HR invited form — shown after invite code verified
  if (isInvitedHR && emailDone) {
    const JOB_TITLE_OPTIONS = [
      'HR Manager', 'Recruiter', 'Talent Acquisition Specialist',
      'HR Director', 'Recruitment Manager', 'Talent Partner',
      'People Operations Manager', 'Custom',
    ];
    return (
      <HRInviteRegistrationForm
        T={T} topInset={topInset} email={email}
        detectedCompany={detectedCompany}
        fieldLabelStyle={fieldLabelStyle}
        inputRowStyle={inputRowStyle}
        inputStyle={inputStyle}
        JOB_TITLE_OPTIONS={JOB_TITLE_OPTIONS}
        loading={loading} error={error}
        setError={setError} setLoading={setLoading}
        setToken={setToken} inviteCode={inviteCode}
        onBack={() => {
          setEmailDone(false);
          setIsInvitedHR(false);
          setInviteCode('');
          setInviteError('');
          setShowInvitePrompt(false);
        }}
      />
    );
  }

if (!emailDone) 
  
  
  
  return (
  <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: T.bg, paddingTop: topInset }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <StatusBar barStyle="light-content" />
    <View style={{ paddingHorizontal: Spacing['5'], paddingTop: Spacing['4'], paddingBottom: Spacing['5'] }}>
      <TouchableOpacity
        onPress={() => { resetForm(); setRoleSelected(false); }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], alignSelf: 'flex-start' }}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="arrow-left" size={20} color={T.textSub} />
        <Text style={{ fontSize: Typography.md, color: T.textSub }}>Back</Text>
      </TouchableOpacity>
    </View>
    <ScrollView
      contentContainerStyle={{ padding: Spacing['4'], gap: Spacing['3'] }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {error ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], backgroundColor: T.dangerBg, borderWidth: 1, borderColor: T.danger + '44', borderRadius: Radii.md, paddingHorizontal: Spacing['3'], paddingVertical: Spacing['3'] }}>
          <MaterialCommunityIcons name="alert-circle-outline" size={15} color={T.danger} />
          <Text style={{ flex: 1, color: T.danger, fontSize: Typography.base }}>{error}</Text>
        </View>
      ) : null}

      {/* Reuse the email step JSX from renderStep, or inline it here */}
      <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }} title="What's your email?">
  <View style={{ gap: Spacing['2'] }}>
    <Text style={fieldLabelStyle}>Email address</Text>
    <View style={inputRowStyle}>
      <MaterialCommunityIcons name="email-outline" size={16} color={T.textHint} />
      <TextInput
        style={inputStyle}
        placeholder="you@example.com"
        placeholderTextColor={T.textHint}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoFocus
      />
    </View>
  </View>
</SectionCard>

      <TouchableOpacity
        style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: T.primary, borderRadius: Radii.lg, paddingVertical: Spacing['4'], ...Shadows.colored(T.primary) }}
        onPress={() => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!email) { setError('Please enter your email address.'); return; }
          if (!emailRegex.test(email)) { setError('Please enter a valid email address.'); return; }
          setError('');
          const company = getCompanyFromEmail(email);
          if (company) {
            setError(`The domain @${email.split('@')[1]} is already in use by ${company.name}. Please register via invite code or use a different email.`);
            return;
          }
          setEmailDone(true);
        }}
        activeOpacity={0.85}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
          <Text style={{ color: T.white, fontSize: Typography.lg, fontWeight: Typography.semibold as any }}>Continue</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color={T.white} />
        </View>
      </TouchableOpacity>

      {/* Register via Invite — for HR users joining an existing company */}
      {role === 'hr' && (
        <TouchableOpacity
          style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: Spacing['2'], borderWidth: 1.5, borderColor: T.primary, borderRadius: Radii.lg, paddingVertical: Spacing['4'] }}
          onPress={() => {
            setError('');
            setEmail('');
            setShowInvitePrompt(true);
          }}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="ticket-confirmation-outline" size={18} color={T.primary} />
          <Text style={{ fontSize: Typography.md, fontWeight: Typography.semibold as any, color: T.primary }}>
            Register via Invite Code
          </Text>
        </TouchableOpacity>
      )}

      {/* Terms */}
      <Text style={{ fontSize: Typography.xs, color: T.textHint, textAlign: 'center', lineHeight: 18 }}>
        By continuing, you agree to our{' '}
        <Text style={{ color: T.primary, fontWeight: Typography.medium as any }}>Terms of Service</Text>
        {' '}and{' '}
        <Text style={{ color: T.primary, fontWeight: Typography.medium as any }}>Privacy Policy</Text>.
      </Text>

      {/* Sign in link */}
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: T.bg, paddingTop: topInset }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />

      {/* Brand header (only on email step) — above progress bar */}
      <View style={{ paddingHorizontal: Spacing['5'], paddingTop: Spacing['4'], paddingBottom: Spacing['5'] }}>
  <TouchableOpacity
   onPress={() => {
  if (currentStep === 0) {
    setError('');
    setEmailDone(false); 
  } else {
    handleBack();
  }
}}
    style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], alignSelf: 'flex-start' }}
    activeOpacity={0.7}
  >
    <MaterialCommunityIcons name="arrow-left" size={20} color={T.textSub} />
    <Text style={{ fontSize: Typography.md, color: T.textSub }}>Back</Text>
  </TouchableOpacity>
</View>
      {/* Progress bar (hidden on account step for cleanliness if only 1 step for HR) */}
      {totalSteps > 1 && <StepProgressBar />}

      <ScrollView
        contentContainerStyle={{ padding: Spacing['4'], gap: Spacing['3'] }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* Error banner */}
        {error ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], backgroundColor: T.dangerBg, borderWidth: 1, borderColor: T.danger + '44', borderRadius: Radii.md, paddingHorizontal: Spacing['3'], paddingVertical: Spacing['3'] }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={15} color={T.danger} />
            <Text style={{ flex: 1, color: T.danger, fontSize: Typography.base }}>{error}</Text>
          </View>
        ) : null}

        {/* Step content */}
        {renderStep()}

        {/* Navigation buttons */}
        <View style={{ flexDirection: 'row', gap: Spacing['3'] }}>
          
          <TouchableOpacity
            style={{ flex: currentStep > 0 ? 2 : 1, alignItems: 'center', justifyContent: 'center', backgroundColor: T.primary, borderRadius: Radii.lg, paddingVertical: Spacing['4'], opacity: loading ? 0.6 : 1, ...Shadows.colored(T.primary) }}
            onPress={handleNext}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={T.white} />
              : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
                  <Text style={{ color: T.white, fontSize: Typography.lg, fontWeight: Typography.semibold as any }}>
                    {isLastStep ? 'Create account' : 'Continue'}
                  </Text>
                  <MaterialCommunityIcons name={isLastStep ? 'check' : 'arrow-right'} size={18} color={T.white} />
                </View>
              )
            }
          </TouchableOpacity>
        </View>

        {/* Skip link for optional steps (resume, photo, social) */}
        {['resume', 'photo', 'social'].includes(stepKey) && !isLastStep && (
          <TouchableOpacity onPress={() => setCurrentStep(c => c + 1)} style={{ alignItems: 'center', paddingVertical: Spacing['1'] }}>
            <Text style={{ fontSize: Typography.sm, color: T.textHint }}>Skip for now</Text>
          </TouchableOpacity>
        )}

        {/* Terms (only on email step) */}
        {stepKey === 'email' && (
          <Text style={{ fontSize: Typography.xs, color: T.textHint, textAlign: 'center', lineHeight: 18 }}>
            By continuing, you agree to our{' '}
            <Text style={{ color: T.primary, fontWeight: Typography.medium as any }}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={{ color: T.primary, fontWeight: Typography.medium as any }}>Privacy Policy</Text>.
          </Text>
        )}

        {/* Sign in link (only on email step) */}
        {stepKey === 'email' && (
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
        )}

        <Spacer size="xl" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}