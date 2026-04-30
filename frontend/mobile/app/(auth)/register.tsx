import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ExpoLinking from 'expo-linking';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme';
import { Divider, Radii, SectionCard, Shadows, Spacer, Spacing, Typography } from '../../components/ui';
import { RegisterEmailGate } from '../../components/auth/register/RegisterEmailGate';
import { HRInviteRegistrationForm } from '../../components/auth/register/HRInviteRegistrationForm';
import { RegisterInviteCodeScreen } from '../../components/auth/register/RegisterInviteCodeScreen';
import { RegisterRoleSplash } from '../../components/auth/register/RegisterRoleSplash';
import { RegisterStepContent } from '../../components/auth/register/RegisterStepContent';
import { RegisterStepProgressBar } from '../../components/auth/register/RegisterStepProgressBar';
import { RegisterOtpVerificationScreen } from '../../components/auth/register/RegisterOtpVerificationScreen';
import { APPLICANT_STEPS, HARD_SKILL_SUGGESTIONS, HR_STEPS, JOB_TITLE_OPTIONS, Role, SOFT_SKILL_SUGGESTIONS, STEP_LABELS, WorkEntry, EducationEntry } from '../../components/auth/register/types';

const MOCK_COMPANIES: Record<string, { name: string; validCodes: string[] }> = {
  'google.com': { name: 'Google', validCodes: ['GOOGLE-2024', 'GOOG-HR-01'] },
  'microsoft.com': { name: 'Microsoft', validCodes: ['MS-INVITE-99', 'MSFT-HR-01'] },
  'apple.com': { name: 'Apple', validCodes: ['APPLE-HR-2024', 'APL-INVITE'] },
};

const INVITE_CODE_EMAIL_MAP: Record<string, { email: string; domain: string }> = {
  'GOOGLE-2024': { email: 'newhr@google.com', domain: 'google.com' },
  'GOOG-HR-01': { email: 'recruit@google.com', domain: 'google.com' },
  'MS-INVITE-99': { email: 'newhr@microsoft.com', domain: 'microsoft.com' },
  'MSFT-HR-01': { email: 'hr@microsoft.com', domain: 'microsoft.com' },
  'APPLE-HR-2024': { email: 'newhr@apple.com', domain: 'apple.com' },
  'APL-INVITE': { email: 'recruit@apple.com', domain: 'apple.com' },
};

const getCompanyFromEmail = (email: string) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? MOCK_COMPANIES[domain] ?? null : null;
};

const getInfoFromInviteCode = (code: string): { email: string; company: { name: string; validCodes: string[] } } | null => {
  const entry = INVITE_CODE_EMAIL_MAP[code.trim().toUpperCase()];
  if (!entry) return null;
  const company = MOCK_COMPANIES[entry.domain] ?? null;
  return company ? { email: entry.email, company } : null;
};

const MOCK_APPLICANT_OTP = true;
const MOCK_APPLICANT_OTP_CODE = '123456';
const MOCK_APPLICANT_OTP_TOKEN = 'mock-applicant-otp-token';

export default function RegisterScreen() {
  const T = useTheme();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const setToken = useAuthStore((s) => s.setToken);
  const GOOGLE_OAUTH_REDIRECT_ENDPOINT = 'http://localhost:8000/api/v1/auth/google/redirect';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('applicant');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationRegion, setLocationRegion] = useState('');
  const [locationProvince, setLocationProvince] = useState('');
  const [locationCountry, setLocationCountry] = useState('');
  const [bio, setBio] = useState('');
  const [resumeFile, setResumeFile] = useState<{ uri: string; name: string } | null>(null);
  const [hardSkills, setHardSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [hardSkillInput, setHardSkillInput] = useState('');
  const [softSkillInput, setSoftSkillInput] = useState('');
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([{ company: '', position: '', start_date: '', end_date: '', description: '' }]);
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([{ school: '', degree: '', field_of_study: '', start_date: '', end_date: '' }]);
  const [photoFile, setPhotoFile] = useState<{ uri: string; name: string } | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [companyTagline, setCompanyTagline] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [foundedYear, setFoundedYear] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressProvince, setAddressProvince] = useState('');
  const [addressCountry, setAddressCountry] = useState('');
  const [addressPostal, setAddressPostal] = useState('');
  const [companySocialLinks, setCompanySocialLinks] = useState<string[]>(['']);
  const [verificationDocs, setVerificationDocs] = useState<{ uri: string; name: string }[]>([]);
  const [logoFile, setLogoFile] = useState<{ uri: string; name: string } | null>(null);
  const [officeImages, setOfficeImages] = useState<{ uri: string; name: string }[]>([]);

  const [roleSelected, setRoleSelected] = useState(false);
  const [emailDone, setEmailDone] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorTimestamp, setErrorTimestamp] = useState<number>(0);
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
  const strengthLevel =
    password.length === 0 ? null : !hasMinLength || !hasUppercase || !hasNumber ? 'weak' : password.length < 12 ? 'good' : 'strong';
  const strengthColor = strengthLevel === 'weak' ? T.danger : strengthLevel === 'good' ? T.warning : T.success;

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

  const addSkill = (type: 'hard' | 'soft', value?: string) => {
    const currentInput = type === 'hard' ? hardSkillInput : softSkillInput;
    const currentSkills = type === 'hard' ? hardSkills : softSkills;
    const setCurrentSkills = type === 'hard' ? setHardSkills : setSoftSkills;
    const setCurrentInput = type === 'hard' ? setHardSkillInput : setSoftSkillInput;
    const trimmed = (value ?? currentInput).trim();
    const normalized = trimmed.toLowerCase();
    if (trimmed && !currentSkills.some((skill) => skill.toLowerCase() === normalized)) {
      setCurrentSkills((prev) => [...prev, trimmed]);
    }
    setCurrentInput('');
  };

  const removeSkill = (type: 'hard' | 'soft', skill: string) => {
    const setCurrentSkills = type === 'hard' ? setHardSkills : setSoftSkills;
    setCurrentSkills((prev) => prev.filter((item) => item !== skill));
  };

  const getFilteredSkillSuggestions = (type: 'hard' | 'soft', input: string, selectedSkills: string[]) =>
    input.trim()
      ? (type === 'hard' ? HARD_SKILL_SUGGESTIONS : SOFT_SKILL_SUGGESTIONS).filter((skill) => {
        const normalizedSkill = skill.toLowerCase();
        const normalizedInput = input.trim().toLowerCase();
        return normalizedSkill.includes(normalizedInput) && !selectedSkills.some((selectedSkill) => selectedSkill.toLowerCase() === normalizedSkill);
      }).slice(0, 6)
      : [];

  const hardSkillSuggestions = getFilteredSkillSuggestions('hard', hardSkillInput, hardSkills);
  const softSkillSuggestions = getFilteredSkillSuggestions('soft', softSkillInput, softSkills);
  const normalizedWorkEntries = workEntries.filter((entry) =>
    [entry.company, entry.position, entry.start_date, entry.end_date, entry.description].some((value) => value.trim() !== '')
  );
  const normalizedEducationEntries = educationEntries.filter((entry) =>
    [entry.school, entry.degree, entry.field_of_study, entry.start_date, entry.end_date].some((value) => value.trim() !== '')
  );
  const normalizedSocialLinks = {
    ...(linkedinUrl.trim().startsWith('https://') ? { linkedin: linkedinUrl.trim() } : {}),
    ...(githubUrl.trim().startsWith('https://') ? { github: githubUrl.trim() } : {}),
    ...(portfolioUrl.trim().startsWith('https://') ? { portfolio: portfolioUrl.trim() } : {}),
  };

  useEffect(() => {
    const completeGoogleAuth = async (url: string | null) => {
      if (!url || !url.startsWith('jobapp://')) return;

      const { hostname, queryParams } = ExpoLinking.parse(url);
      if (hostname !== 'auth') return;

      const token = typeof queryParams?.token === 'string'
        ? queryParams.token
        : typeof queryParams?.auth_token === 'string'
          ? queryParams.auth_token
          : null;
      const oauthError = typeof queryParams?.error === 'string' ? queryParams.error : null;
      const oauthMessage = typeof queryParams?.message === 'string' ? queryParams.message : null;

      if (oauthError) {
        setError(oauthMessage || 'Google sign-up could not be completed.');
        setGoogleLoading(false);
        return;
      }

      if (!token) return;

      setError('');
      setGoogleLoading(false);
      await setToken(token, 'applicant');
      router.replace('/(tabs)');
    };

    completeGoogleAuth(ExpoLinking.getLinkingURL());

    const subscription = ExpoLinking.addEventListener('url', ({ url }) => {
      void completeGoogleAuth(url);
    });

    return () => subscription.remove();
  }, [setToken]);

  const validateCurrentStep = () => {
    setError('');
    if (stepKey === 'password') {
      if (!password || !confirmPassword) return setError('Please fill in all fields.'), false;
      if (password !== confirmPassword) return setError('Passwords do not match.'), false;
      if (!hasMinLength) return setError('Password must be at least 8 characters.'), false;
      if (!hasUppercase) return setError('Password must contain at least 1 uppercase letter.'), false;
      if (!hasNumber) return setError('Password must contain at least 1 number.'), false;
    }
    if (stepKey === 'basic' && (!firstName || !lastName || !location)) return setError('First name, last name, and location are required.'), false;
    if (stepKey === 'resume' && !resumeFile) return setError('Please upload your resume before continuing.'), false;
    if (stepKey === 'skills' && hardSkills.length + softSkills.length === 0) return setError('Please add at least one hard or soft skill.'), false;
    if (stepKey === 'company_details') {
      if (!companyName) return setError('Company name is required.'), false;
      if (companyName.length < 2 || companyName.length > 100) return setError('Company name must be 2-100 characters.'), false;
      if (!companyDescription) return setError('Company description is required.'), false;
      if (companyDescription.length < 50 || companyDescription.length > 2000) return setError('Description must be 50-2000 characters.'), false;
      if (!companyIndustry) return setError('Please select an industry.'), false;
      if (!companySize) return setError('Please select a company size.'), false;
    }
    if (stepKey === 'company_docs' && verificationDocs.length === 0) return setError('Please upload at least one verification document.'), false;
    if (stepKey === 'company_media') {
      if (!logoFile) return setError('Please upload a company logo.'), false;
      if (officeImages.length === 0) return setError('Please upload at least one office image.'), false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (role === 'applicant') {
      if (MOCK_APPLICANT_OTP) {
        setError('');
        setOtpCode('');
        setOtpSent(true);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            role,
          }),
        });
        const data = await response.json();

        if (!data.success) {
          setError(data.message || 'Registration failed. Please try again.');
          return;
        }

        setError('');
        setOtpCode('');
        setOtpSent(true);
        return;
      } catch {
        setError('Could not connect to server. Please try again.');
        return;
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role,
          first_name: firstName,
          last_name: lastName,
          location,
          location_city: locationCity,
          location_region: locationRegion,
          bio,
          skills: [...hardSkills, ...softSkills],
          resume_url: resumeFile?.uri ?? null,
          photo_url: photoFile?.uri ?? null,
          linkedin_url: linkedinUrl,
          github_url: githubUrl,
          portfolio_url: portfolioUrl,
          twitter_url: twitterUrl,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.message || 'Registration failed. Please try again.');
        setCurrentStep(0);
        return;
      }

      const token = data.data.token;

      if (role === 'hr') {
        await fetch('http://localhost:8000/api/v1/profile/onboarding/step/1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            company_name: companyName,
            tagline: companyTagline,
            description: companyDescription,
            industry: companyIndustry,
            company_size: companySize,
            founded_year: foundedYear ? parseInt(foundedYear) : null,
            website_url: websiteUrl || null,
            address: {
              street: addressStreet,
              city: addressCity,
              state: addressState,
              country: addressCountry,
              postal_code: addressPostal,
            },
            social_links: companySocialLinks.filter(Boolean),
          }),
        });

        if (verificationDocs.length > 0) {
          const formData2 = new FormData();
          verificationDocs.forEach((doc) => {
            formData2.append('verification_documents', { uri: doc.uri, name: doc.name, type: 'application/octet-stream' } as any);
          });
          await fetch('http://localhost:8000/api/v1/profile/onboarding/step/2', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData2,
          });
        }

        const formData3 = new FormData();
        if (logoFile) formData3.append('logo_url', { uri: logoFile.uri, name: logoFile.name, type: 'image/jpeg' } as any);
        officeImages.forEach((image) => {
          formData3.append('office_images', { uri: image.uri, name: image.name, type: 'image/jpeg' } as any);
        });
        await fetch('http://localhost:8000/api/v1/profile/onboarding/step/3', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData3,
        });
      }

      await setToken(token, role);
      router.replace(role === 'hr' ? '/(company-tabs)' : '/(tabs)');
    } catch {
      setError('Could not connect to server. Please try again.');
      setCurrentStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < totalSteps - 1) setCurrentStep((value) => value + 1);
    else handleSubmit();
  };

  const completeApplicantOnboarding = async (token: string) => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const stepPayloads = [
      {
        step: 1,
        step_data: {
          first_name: firstName,
          last_name: lastName,
          location,
          location_city: locationCity || null,
          location_region: locationRegion || null,
          bio: bio || null,
        },
      },
      {
        step: 2,
        step_data: {
          resume_url: resumeFile?.uri ?? null,
        },
      },
      {
        step: 3,
        step_data: {
          skills: [...hardSkills, ...softSkills],
        },
      },
      {
        step: 4,
        step_data: {
          work_experience: normalizedWorkEntries,
          education: normalizedEducationEntries,
        },
      },
      {
        step: 5,
        step_data: {
          profile_photo_url: photoFile?.uri ?? null,
        },
      },
      {
        step: 6,
        step_data: {
          social_links: normalizedSocialLinks,
        },
      },
    ];

    for (const payload of stepPayloads) {
      const response = await fetch('http://localhost:8000/api/v1/profile/onboarding/complete-step', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Could not complete applicant onboarding.');
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit code sent to your email.');
      setErrorTimestamp(Date.now());
      return;
    }

    if (MOCK_APPLICANT_OTP) {
      if (otpCode.trim() !== MOCK_APPLICANT_OTP_CODE) {
        setError('Invalid test OTP. Use the temporary testing code.');
        setErrorTimestamp(Date.now());
        return;
      }

      setError('');
      await setToken(MOCK_APPLICANT_OTP_TOKEN, 'applicant');
      router.replace('/(tabs)');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: otpCode.trim(),
        }),
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Verification failed. Please try again.');
        setErrorTimestamp(Date.now());
        return;
      }

      const token = data?.data?.token;
      if (!token) {
        setError('Verification succeeded, but no session token was returned.');
        setErrorTimestamp(Date.now());
        return;
      }

      await setToken(token, 'applicant');
      try {
        await completeApplicantOnboarding(token);
      } catch {
        // The account is already created and verified at this point.
      }
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not complete verification. Please try again.';
      setError(message);
      setErrorTimestamp(Date.now());
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (MOCK_APPLICANT_OTP) {
      setError('');
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Could not resend the verification code.');
        return;
      }

      setError('');
    } catch {
      setError('Could not resend the verification code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const response = await fetch(GOOGLE_OAUTH_REDIRECT_ENDPOINT);
      const data = await response.json();
      const redirectUrl = data?.data?.redirect_url;

      if (!data?.success || !redirectUrl) {
        setError(data?.message || 'Could not start Google registration. Please try again.');
        return;
      }

      const canOpen = await ExpoLinking.canOpenURL(redirectUrl);
      if (!canOpen) {
        setError('Google registration is not available on this device.');
        return;
      }

      await ExpoLinking.openURL(redirectUrl);
    } catch {
      setError('Could not start Google registration. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const resetForm = () => {
    setEmailDone(false);
    setOtpSent(false);
    setOtpCode('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setRole('applicant');
    setFirstName('');
    setLastName('');
    setLocation('');
    setLocationCity('');
    setLocationRegion('');
    setLocationProvince('');
    setLocationCountry('');
    setBio('');
    setResumeFile(null);
    setHardSkills([]);
    setSoftSkills([]);
    setHardSkillInput('');
    setSoftSkillInput('');
    setWorkEntries([{ company: '', position: '', start_date: '', end_date: '', description: '' }]);
    setEducationEntries([{ school: '', degree: '', field_of_study: '', start_date: '', end_date: '' }]);
    setPhotoFile(null);
    setLinkedinUrl('');
    setGithubUrl('');
    setPortfolioUrl('');
    setTwitterUrl('');
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
    setAddressProvince('');
    setAddressCountry('');
    setAddressPostal('');
    setCompanySocialLinks(['']);
    setVerificationDocs([]);
    setLogoFile(null);
    setOfficeImages([]);
    setCurrentStep(0);
    setGoogleLoading(false);
    setOtpLoading(false);
    setResendLoading(false);
    setError('');
    setDetectedCompany(null);
    setShowInvitePrompt(false);
    setInviteCode('');
    setInviteError('');
    setIsInvitedHR(false);
  };

  if (!roleSelected) {
    return <RegisterRoleSplash T={T} topInset={topInset} bottomInset={bottomInset} role={role} setRole={setRole} onContinue={() => setRoleSelected(true)} />;
  }

  if (showInvitePrompt) {
    return (
      <RegisterInviteCodeScreen
        T={T}
        topInset={topInset}
        inviteCode={inviteCode}
        inviteError={inviteError}
        detectedCompany={detectedCompany}
        fieldLabelStyle={fieldLabelStyle}
        inputRowStyle={inputRowStyle}
        inputStyle={inputStyle}
        onBack={() => {
          setShowInvitePrompt(false);
          setInviteCode('');
          setInviteError('');
        }}
        onChangeInviteCode={(value) => {
          setInviteCode(value);
          setInviteError('');
        }}
        onVerify={() => {
          if (!inviteCode.trim()) {
            setInviteError('Please enter your invite code.');
            return;
          }
          const inviteInfo = getInfoFromInviteCode(inviteCode.trim());
          if (inviteInfo) {
            setEmail(inviteInfo.email);
            setDetectedCompany(inviteInfo.company);
            setIsInvitedHR(true);
            setShowInvitePrompt(false);
            setEmailDone(true);
            return;
          }
          if (detectedCompany && detectedCompany.validCodes.includes(inviteCode.trim().toUpperCase())) {
            setIsInvitedHR(true);
            setShowInvitePrompt(false);
            setEmailDone(true);
            return;
          }
          setInviteError('Invalid invite code. Please check with your company admin.');
        }}
        onRequestInvite={() => {
          setInviteError('');
          alert(`Contact your ${detectedCompany ? detectedCompany.name : 'company'} admin to receive an invite link to your work email.`);
        }}
      />
    );
  }

  if (isInvitedHR && emailDone) {
    return (
      <HRInviteRegistrationForm
        T={T}
        topInset={topInset}
        email={email}
        detectedCompany={detectedCompany}
        fieldLabelStyle={fieldLabelStyle}
        inputRowStyle={inputRowStyle}
        inputStyle={inputStyle}
        jobTitleOptions={JOB_TITLE_OPTIONS}
        setToken={setToken}
        inviteCode={inviteCode}
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

  if (role === 'applicant' && otpSent) {
    return (
      <RegisterOtpVerificationScreen
        T={T}
        topInset={topInset}
        email={email}
        code={otpCode}
        error={error}
        errorTimestamp={errorTimestamp}
        helperMessage={MOCK_APPLICANT_OTP ? `Temporary OTP testing mode is enabled. Use code ${MOCK_APPLICANT_OTP_CODE}. No email or verification API call will be made.` : undefined}
        verifying={otpLoading}
        resending={resendLoading}
        fieldLabelStyle={fieldLabelStyle}
        inputRowStyle={inputRowStyle}
        inputStyle={inputStyle}
        onBack={() => {
          setOtpSent(false);
          setOtpCode('');
          setError('');
        }}
        onChangeCode={setOtpCode}
        onVerify={() => {
          void handleVerifyOtp();
        }}
        onResend={() => {
          void handleResendOtp();
        }}
      />
    );
  }

  if (!emailDone) {
    return (
      <RegisterEmailGate
        T={T}
        topInset={topInset}
        role={role}
        email={email}
        error={error}
        googleLoading={googleLoading}
        fieldLabelStyle={fieldLabelStyle}
        inputRowStyle={inputRowStyle}
        inputStyle={inputStyle}
        onBack={() => {
          resetForm();
          setRoleSelected(false);
        }}
        onChangeEmail={setEmail}
        onGoogleRegister={() => {
          void handleGoogleRegister();
        }}
        onContinue={() => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!email) {
            setError('Please enter your email address.');
            return;
          }
          if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
          }
          setError('');
          const company = getCompanyFromEmail(email);
          if (company) {
            setError(`The domain @${email.split('@')[1]} is already in use by ${company.name}. Please register via invite code or use a different email.`);
            return;
          }
          setEmailDone(true);
        }}
        onInviteCode={() => {
          setError('');
          setEmail('');
          setShowInvitePrompt(true);
        }}
      />
    );
  }

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: T.bg, paddingTop: topInset }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />

      <View style={{ paddingHorizontal: Spacing['5'], paddingTop: Spacing['4'], paddingBottom: Spacing['5'] }}>
        <TouchableOpacity
          onPress={() => {
            if (currentStep === 0) {
              setError('');
              setEmailDone(false);
            } else {
              setError('');
              setCurrentStep((value) => value - 1);
            }
          }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], alignSelf: 'flex-start' }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={T.textSub} />
          <Text style={{ fontSize: Typography.md, color: T.textSub }}>Back</Text>
        </TouchableOpacity>
      </View>

      {totalSteps > 1 && <RegisterStepProgressBar T={T} currentStep={currentStep} totalSteps={totalSteps} progress={progress} steps={steps} stepKey={stepKey} stepLabels={STEP_LABELS} />}

      <ScrollView contentContainerStyle={{ padding: Spacing['4'], gap: Spacing['3'] }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], backgroundColor: T.dangerBg, borderWidth: 1, borderColor: T.danger + '44', borderRadius: Radii.md, paddingHorizontal: Spacing['3'], paddingVertical: Spacing['3'] }}>
            <MaterialCommunityIcons name="alert-circle-outline" size={15} color={T.danger} />
            <Text style={{ flex: 1, color: T.danger, fontSize: Typography.base }}>{error}</Text>
          </View>
        ) : null}

        <RegisterStepContent
          T={T}
          stepKey={stepKey}
          fieldLabelStyle={fieldLabelStyle}
          inputRowStyle={inputRowStyle}
          inputStyle={inputStyle}
          password={password}
          confirmPassword={confirmPassword}
          showPassword={showPassword}
          setPassword={setPassword}
          setConfirmPassword={setConfirmPassword}
          setShowPassword={setShowPassword}
          strengthLevel={strengthLevel}
          strengthColor={strengthColor}
          firstName={firstName}
          lastName={lastName}
          location={location}
          locationCity={locationCity}
          locationRegion={locationRegion}
          locationProvince={locationProvince}
          locationCountry={locationCountry}
          bio={bio}
          setFirstName={setFirstName}
          setLastName={setLastName}
          setLocation={setLocation}
          setLocationCity={setLocationCity}
          setLocationRegion={setLocationRegion}
          setLocationProvince={setLocationProvince}
          setLocationCountry={setLocationCountry}
          setBio={setBio}
          resumeFile={resumeFile}
          setResumeFile={setResumeFile}
          hardSkills={hardSkills}
          softSkills={softSkills}
          hardSkillInput={hardSkillInput}
          softSkillInput={softSkillInput}
          setHardSkillInput={setHardSkillInput}
          setSoftSkillInput={setSoftSkillInput}
          addSkill={addSkill}
          removeSkill={removeSkill}
          hardSkillSuggestions={hardSkillSuggestions}
          softSkillSuggestions={softSkillSuggestions}
          workEntries={workEntries}
          setWorkEntries={setWorkEntries}
          educationEntries={educationEntries}
          setEducationEntries={setEducationEntries}
          photoFile={photoFile}
          setPhotoFile={setPhotoFile}
          linkedinUrl={linkedinUrl}
          githubUrl={githubUrl}
          portfolioUrl={portfolioUrl}
          twitterUrl={twitterUrl}
          setLinkedinUrl={setLinkedinUrl}
          setGithubUrl={setGithubUrl}
          setPortfolioUrl={setPortfolioUrl}
          setTwitterUrl={setTwitterUrl}
          companyName={companyName}
          companyTagline={companyTagline}
          companyDescription={companyDescription}
          companyIndustry={companyIndustry}
          companySize={companySize}
          foundedYear={foundedYear}
          websiteUrl={websiteUrl}
          addressStreet={addressStreet}
          addressCity={addressCity}
          addressState={addressState}
          addressProvince={addressProvince}
          addressCountry={addressCountry}
          addressPostal={addressPostal}
          companySocialLinks={companySocialLinks}
          setCompanyName={setCompanyName}
          setCompanyTagline={setCompanyTagline}
          setCompanyDescription={setCompanyDescription}
          setCompanyIndustry={setCompanyIndustry}
          setCompanySize={setCompanySize}
          setFoundedYear={setFoundedYear}
          setWebsiteUrl={setWebsiteUrl}
          setAddressStreet={setAddressStreet}
          setAddressCity={setAddressCity}
          setAddressState={setAddressState}
          setAddressProvince={setAddressProvince}
          setAddressCountry={setAddressCountry}
          setAddressPostal={setAddressPostal}
          setCompanySocialLinks={setCompanySocialLinks}
          verificationDocs={verificationDocs}
          setVerificationDocs={setVerificationDocs}
          logoFile={logoFile}
          setLogoFile={setLogoFile}
          officeImages={officeImages}
          setOfficeImages={setOfficeImages}
          setError={setError}
        />

        <View style={{ flexDirection: 'row', gap: Spacing['3'] }}>
          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: T.primary, borderRadius: Radii.lg, paddingVertical: Spacing['4'], opacity: loading ? 0.6 : 1, ...Shadows.colored(T.primary) }}
            onPress={handleNext}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={T.white} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['2'] }}>
                <Text style={{ color: T.white, fontSize: Typography.lg, fontWeight: Typography.semibold as any }}>
                  {isLastStep ? 'Create account' : 'Continue'}
                </Text>
                <MaterialCommunityIcons name={isLastStep ? 'check' : 'arrow-right'} size={18} color={T.white} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {['photo', 'social'].includes(stepKey) && !isLastStep && (
          <TouchableOpacity onPress={() => setCurrentStep((value) => value + 1)} style={{ alignItems: 'center', paddingVertical: Spacing['1'] }}>
            <Text style={{ fontSize: Typography.sm, color: T.textHint }}>Skip for now</Text>
          </TouchableOpacity>
        )}

        <SectionCard style={{ backgroundColor: T.surface, borderRadius: Radii.lg }}>
          <View style={{ gap: Spacing['2'] }}>
            <Text style={{ fontSize: Typography.sm, fontWeight: Typography.semibold as any, color: T.textPrimary }}>
              Registration overview
            </Text>
            <Text style={{ fontSize: Typography.sm, color: T.textSub, lineHeight: 20 }}>
              {role === 'applicant'
                ? 'Applicant onboarding is now split into smaller sections: registration, basic info, resume, skills, experience, photo, and social links.'
                : 'Company onboarding is now split into registration, company details, verification documents, and media uploads.'}
            </Text>
          </View>
        </SectionCard>

        <Divider spacing={Spacing['2']} />

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing['2'] }}>
          <Text style={{ fontSize: Typography.sm, color: T.textSub }}>Already have an account?</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={{ fontSize: Typography.sm, color: T.primary, fontWeight: Typography.semibold as any }}>Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <Spacer size="xl" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
