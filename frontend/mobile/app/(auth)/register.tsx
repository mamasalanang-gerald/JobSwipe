import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ExpoLinking from 'expo-linking';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
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

type LocalUploadFile = {
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number;
};



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
  const [resumeFile, setResumeFile] = useState<LocalUploadFile | null>(null);
  const [hardSkills, setHardSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [hardSkillInput, setHardSkillInput] = useState('');
  const [softSkillInput, setSoftSkillInput] = useState('');
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([{ company: '', position: '', start_date: '', end_date: '', description: '' }]);
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([{ school: '', degree: '', field_of_study: '', start_date: '', end_date: '' }]);
  const [photoFile, setPhotoFile] = useState<LocalUploadFile | null>(null);
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
  const [verificationDocs, setVerificationDocs] = useState<LocalUploadFile[]>([]);
  const [logoFile, setLogoFile] = useState<LocalUploadFile | null>(null);
  const [officeImages, setOfficeImages] = useState<LocalUploadFile[]>([]);

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
  const [pendingAuthRole, setPendingAuthRole] = useState<'applicant' | 'hr' | 'company_admin' | null>(null);

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

  const IMAGE_MIME_BY_EXTENSION: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
  };

  const DOCUMENT_MIME_BY_EXTENSION: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };

  const getFileExtension = (value: string): string => {
    const cleanValue = value.split('?')[0];
    const fileName = cleanValue.split('/').pop() ?? cleanValue;
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
  };

  const inferMimeType = (file: LocalUploadFile, uploadType: 'image' | 'document'): string => {
    if (file.mimeType) return file.mimeType;

    const extension = getFileExtension(file.name) || getFileExtension(file.uri);
    if (uploadType === 'image') return IMAGE_MIME_BY_EXTENSION[extension] ?? 'image/jpeg';
    return DOCUMENT_MIME_BY_EXTENSION[extension] ?? 'application/pdf';
  };

  const isImageLikeFile = (file: LocalUploadFile): boolean => {
    if (file.mimeType?.startsWith('image/')) return true;
    const extension = getFileExtension(file.name) || getFileExtension(file.uri);
    return ['jpg', 'jpeg', 'png', 'webp'].includes(extension);
  };

  const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

  const isSupportedImageFile = (file: LocalUploadFile): boolean => {
    const extension = getFileExtension(file.name) || getFileExtension(file.uri);
    const normalizedMimeType = (file.mimeType ?? '').toLowerCase();

    const hasSupportedExtension = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(extension);
    const hasSupportedMime = normalizedMimeType === '' || IMAGE_MIME_TYPES.has(normalizedMimeType);

    return hasSupportedExtension && hasSupportedMime;
  };

  const uploadSingleFile = async (file: LocalUploadFile, uploadType: 'image' | 'document'): Promise<string> => {
    if (uploadType === 'image' && !isSupportedImageFile(file)) {
      throw new Error('Unsupported image format. Please use JPG, PNG, WEBP, or HEIC.');
    }

    const fileName = file.name || `upload.${uploadType === 'image' ? 'jpg' : 'pdf'}`;
    const fileType = inferMimeType(file, uploadType);

    const localFileResponse = await fetch(file.uri);
    const localFileBlob = await localFileResponse.blob();
    const fileSize = typeof file.size === 'number' && file.size > 0 ? file.size : localFileBlob.size;

    if (!fileSize || fileSize < 1) {
      throw new Error('Selected file appears empty. Please choose another file.');
    }

    const uploadMeta = await api.post('/files/upload-url', {
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      upload_type: uploadType,
    }) as { upload_url: string; public_url: string };

    const uploadResponse = await fetch(uploadMeta.upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': fileType },
      body: localFileBlob,
    });

    if (!uploadResponse.ok) {
      throw new Error('Unable to upload file to storage.');
    }

    await api.post('/files/confirm-upload', { file_url: uploadMeta.public_url });
    return uploadMeta.public_url;
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
      setLoading(true);
      try {
        setPendingAuthRole('applicant');
        await api.post('/auth/register', { email, password, role, company_invite_token: null });
        setError('');
        setOtpCode('');
        setOtpSent(true);
      } catch (err: any) {
        setError(err?.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const registrationRole: 'hr' | 'company_admin' = isInvitedHR ? 'hr' : 'company_admin';
      setPendingAuthRole(registrationRole);
      const data = await api.post('/auth/register', {
        email,
        password,
        role: registrationRole,
        company_invite_token: inviteCode || null,
      }) as { token?: string; user?: { role?: string } };

      // Some flows (e.g. magic-link verified invites) return a token immediately.
      if (data?.token) {
        const nextRole: 'hr' | 'company_admin' = data.user?.role === 'company_admin'
          ? 'company_admin'
          : data.user?.role === 'hr'
            ? 'hr'
            : registrationRole;
        await setToken(data.token, nextRole);

        if (nextRole === 'company_admin') {
          await completeCompanyOnboarding();
          // Wait for MongoDB to propagate the changes before navigating
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        router.replace('/(company-tabs)/index');
        return;
      }

      // Standard API flow: registration sends OTP and verify-email returns token.
      setError('');
      setOtpCode('');
      setOtpSent(true);
    } catch (err: any) {
      setError(err?.message || 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < totalSteps - 1) setCurrentStep((value) => value + 1);
    else handleSubmit();
  };

  const completeApplicantOnboarding = async () => {
    const resumeUrl = resumeFile ? await uploadSingleFile(resumeFile, 'document') : null;
    const profilePhotoUrl = photoFile ? await uploadSingleFile(photoFile, 'image') : null;

    const stepPayloads = [
      { step: 1, step_data: { first_name: firstName, last_name: lastName, location, location_city: locationCity || null, location_region: locationRegion || null, bio: bio || null } },
      { step: 2, step_data: { resume_url: resumeUrl } },
      { step: 3, step_data: { skills: [...hardSkills, ...softSkills] } },
      { step: 4, step_data: { work_experience: normalizedWorkEntries, education: normalizedEducationEntries } },
      { step: 5, step_data: { profile_photo_url: profilePhotoUrl } },
      { step: 6, step_data: { social_links: normalizedSocialLinks } },
    ];

    for (const payload of stepPayloads) {
      await api.post('/profile/onboarding/complete-step', payload);
    }
  };

  const completeCompanyOnboarding = async () => {
    const onboardingStatus = await api.get('/profile/onboarding/status') as { onboarding_step?: number | string };
    const rawStep = onboardingStatus?.onboarding_step;
    const currentStep = rawStep === 'completed'
      ? 4
      : typeof rawStep === 'number'
        ? rawStep
        : Number.parseInt(String(rawStep ?? '1'), 10) || 1;

    if (currentStep <= 1) {
      await api.post('/profile/onboarding/complete-step', {
        step: 1,
        step_data: {
          company_name: companyName,
          tagline: companyTagline || null,
          description: companyDescription,
          industry: companyIndustry,
          company_size: companySize,
          founded_year: foundedYear ? parseInt(foundedYear, 10) : null,
          website_url: websiteUrl || null,
          address: {
            street: addressStreet || null,
            city: addressCity || null,
            state: (addressCountry === 'Philippines' ? (addressProvince || addressState) : addressState) || null,
            region: addressState || null,
            province: addressProvince || null,
            country: addressCountry || null,
            postal_code: addressPostal || null,
          },
          social_links: companySocialLinks.filter(Boolean),
        },
      });
    }

    if (currentStep <= 2) {
      const verificationDocumentUrls = await Promise.all(
        verificationDocs.map((file) => uploadSingleFile(file, isImageLikeFile(file) ? 'image' : 'document'))
      );
      await api.post('/profile/onboarding/complete-step', {
        step: 2,
        step_data: { verification_documents: verificationDocumentUrls },
      });
    }

    if (currentStep <= 3) {
      const logoUrl = logoFile ? await uploadSingleFile(logoFile, 'image') : null;
      const officeImageUrls = await Promise.all(
        officeImages.map((file) => uploadSingleFile(file, 'image'))
      );
      await api.post('/profile/onboarding/complete-step', {
        step: 3,
        step_data: {
          logo_url: logoUrl,
          office_images: officeImageUrls,
        },
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit code sent to your email.');
      setErrorTimestamp(Date.now());
      return;
    }

    setOtpLoading(true);
    try {
      const data = await api.post('/auth/verify-email', { email, code: otpCode.trim() }) as { token?: string; user?: { role?: string } };
      const token = data?.token;
      if (!token) {
        setError('Verification succeeded, but no session token was returned.');
        setErrorTimestamp(Date.now());
        return;
      }
      const fallbackCompanyRole: 'hr' | 'company_admin' = isInvitedHR ? 'hr' : 'company_admin';
      const resolvedRole = data.user?.role === 'company_admin'
        ? 'company_admin'
        : data.user?.role === 'hr'
          ? 'hr'
          : pendingAuthRole === 'company_admin'
            ? 'company_admin'
            : pendingAuthRole === 'hr'
              ? 'hr'
              : role === 'hr'
                ? fallbackCompanyRole
                : 'applicant';
      await setToken(token, resolvedRole);

      if (resolvedRole === 'applicant') {
        try { await completeApplicantOnboarding(); } catch { /* account verified, continue */ }
        router.replace('/(tabs)');
      } else {
        if (resolvedRole === 'company_admin') {
          await completeCompanyOnboarding();
          // Wait for MongoDB to propagate the changes before navigating
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        router.replace('/(company-tabs)/index');
      }
    } catch (err: any) {
      setError(err?.message || 'Could not complete verification. Please try again.');
      setErrorTimestamp(Date.now());
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await api.post('/auth/resend-verification', { email });
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Could not resend the verification code. Please try again.');
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
    setPendingAuthRole(null);
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
        onVerify={async () => {
          if (!inviteCode.trim()) {
            setInviteError('Please enter your invite code.');
            return;
          }
          try {
            const data = await api.post('/company/invites/validate', { email, token: inviteCode.trim() }) as { company_name: string; role: string; valid: boolean };
            if (data.valid) {
              setDetectedCompany({ name: data.company_name, validCodes: [] });
              setIsInvitedHR(true);
              setShowInvitePrompt(false);
              setEmailDone(true);
            } else {
              setInviteError('Invalid invite code. Please check with your company admin.');
            }
          } catch {
            setInviteError('Invalid invite code. Please check with your company admin.');
          }
        }}
        onRequestInvite={() => {
          setInviteError('');
          alert(`Contact your ${detectedCompany ? detectedCompany.name : 'company'} admin to receive an invite link to your work email.`);
        }}
      />
    );
  }

  if (otpSent) {
    return (
      <RegisterOtpVerificationScreen
        T={T}
        topInset={topInset}
        email={email}
        code={otpCode}
        error={error}
        errorTimestamp={errorTimestamp}
        helperMessage={undefined}
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
        onOtpSent={() => {
          setError('');
          setOtpCode('');
          setIsInvitedHR(false);
          setOtpSent(true);
        }}
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
