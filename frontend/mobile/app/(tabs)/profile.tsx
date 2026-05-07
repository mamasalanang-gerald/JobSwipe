import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { useAuthStore } from '../../store/authStore';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Dimensions, Image, TextInput,
  Modal, Switch, Animated, KeyboardEventListener, Alert, ActivityIndicator,
  Linking,
} from 'react-native';
import { useTheme, setThemeMode, getThemeMode } from '../../theme'; // ← centralized theme
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Link, router } from 'expo-router';
import { api } from '../../services/api';
import { uploadSingleFile, imagePickerAssetToFile } from '../../utils/fileUpload';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
type ExperienceItem = {
  id: number; role: string; company: string; period: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: string;
};

type EducationItem = { id: number; degree: string; school: string; period: string };

type PrefItem = {
  id: number; label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; on: boolean;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionLabel({ title }: { title: string }) {
  const T = useTheme();
  return (
    <Text style={[sl.label, { color: T.textHint }]}>{title}</Text>
  );
}
const sl = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 },
});

function Sep() {
  const T = useTheme();
  return <View style={{ height: 1, backgroundColor: T.borderFaint, marginVertical: 28, marginHorizontal: 24 }} />;
}

// ─── SettingsSheet ────────────────────────────────────────────────────────────
function SettingsSheet({
  visible,
  onClose,
  onSignOut,
}: {
  visible: boolean;
  onClose: () => void;
  onSignOut: () => void;
}) {
  const T = useTheme();
  const [isLight, setIsLight] = useState(getThemeMode() === 'light');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const handleToggle = (val: boolean) => {
    setIsLight(val);
    setThemeMode(val ? 'light' : 'dark');
  };

  // Load notification preferences when modal opens
  useEffect(() => {
    if (visible) {
      setLoadingPrefs(true);
      api.get('/notifications/preferences')
        .then((data: any) => {
          const prefs = data?.preferences ?? data;
          if (prefs) {
            setEmailNotifs(prefs.email_notifications ?? true);
            setPushNotifs(prefs.push_notifications ?? true);
          }
        })
        .catch((err) => {
          console.error('Failed to load notification preferences:', err);
        })
        .finally(() => {
          setLoadingPrefs(false);
        });
    }
  }, [visible]);

  // Save notification preferences (debounced)
  const saveNotificationPrefs = async (email: boolean, push: boolean) => {
    setSavingPrefs(true);
    try {
      await api.patch('/notifications/preferences', {
        email_notifications: email,
        push_notifications: push,
      });
    } catch (err) {
      console.error('Failed to save notification preferences:', err);
      Alert.alert('Error', 'Failed to save notification preferences. Please try again.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleEmailToggle = (val: boolean) => {
    setEmailNotifs(val);
    saveNotificationPrefs(val, pushNotifs);
  };

  const handlePushToggle = (val: boolean) => {
    setPushNotifs(val);
    saveNotificationPrefs(emailNotifs, val);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Scrim */}
      <TouchableOpacity
        style={ss.scrim}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Sheet */}
      <View style={[ss.sheet, { backgroundColor: T.surface, borderColor: T.border }]}>
        {/* Handle */}
        <View style={[ss.handle, { backgroundColor: T.borderFaint }]} />

        {/* Header */}
        <View style={ss.sheetHeader}>
          <Text style={[ss.sheetTitle, { color: T.textPrimary }]}>Settings</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="close" size={20} color={T.textSub} />
          </TouchableOpacity>
        </View>

        {/* ── Appearance ── */}
        <Text style={[ss.groupLabel, { color: T.textHint }]}>Appearance</Text>

        <View style={[ss.row, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}>
          <View style={[ss.iconWrap, { backgroundColor: isLight ? '#f59e0b18' : T.primary + '18' }]}>
            <MaterialCommunityIcons
              name={isLight ? 'weather-sunny' : 'weather-night'}
              size={18}
              color={isLight ? '#f59e0b' : T.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[ss.rowLabel, { color: T.textPrimary }]}>
              {isLight ? 'Light Mode' : 'Dark Mode'}
            </Text>
            <Text style={[ss.rowSub, { color: T.textHint }]}>
              {isLight ? 'Bright theme active' : 'Dark theme active'}
            </Text>
          </View>
          <Switch
            value={isLight}
            onValueChange={handleToggle}
            trackColor={{ false: T.primary + '55', true: '#f59e0b88' }}
            thumbColor={isLight ? '#f59e0b' : T.primary}
          />
        </View>

        {/* ── Notifications ── */}
        <Text style={[ss.groupLabel, { color: T.textHint }]}>Notifications</Text>

        {loadingPrefs ? (
          <View style={[ss.row, { backgroundColor: T.surfaceHigh, borderColor: T.border, justifyContent: 'center' }]}>
            <ActivityIndicator size="small" color={T.primary} />
            <Text style={[ss.rowSub, { color: T.textHint, marginLeft: 8 }]}>Loading preferences...</Text>
          </View>
        ) : (
          <>
            <View style={[ss.row, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}>
              <View style={[ss.iconWrap, { backgroundColor: T.primary + '18' }]}>
                <MaterialCommunityIcons name="email-outline" size={18} color={T.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[ss.rowLabel, { color: T.textPrimary }]}>Email Notifications</Text>
                <Text style={[ss.rowSub, { color: T.textHint }]}>
                  Receive updates via email
                </Text>
              </View>
              <Switch
                value={emailNotifs}
                onValueChange={handleEmailToggle}
                trackColor={{ false: T.textHint + '55', true: T.primary + '88' }}
                thumbColor={emailNotifs ? T.primary : T.textHint}
                disabled={savingPrefs}
              />
            </View>

            <View style={[ss.row, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}>
              <View style={[ss.iconWrap, { backgroundColor: T.primary + '18' }]}>
                <MaterialCommunityIcons name="bell-outline" size={18} color={T.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[ss.rowLabel, { color: T.textPrimary }]}>Push Notifications</Text>
                <Text style={[ss.rowSub, { color: T.textHint }]}>
                  Receive alerts on your device
                </Text>
              </View>
              <Switch
                value={pushNotifs}
                onValueChange={handlePushToggle}
                trackColor={{ false: T.textHint + '55', true: T.primary + '88' }}
                thumbColor={pushNotifs ? T.primary : T.textHint}
                disabled={savingPrefs}
              />
            </View>
          </>
        )}

        {/* ── Account (placeholder rows) ── */}
        <Text style={[ss.groupLabel, { color: T.textHint }]}>Account</Text>

        {[
          { icon: 'shield-lock-outline'  as any, label: 'Privacy',         sub: 'Control your data' },
          { icon: 'help-circle-outline'  as any, label: 'Help & Support',  sub: 'FAQs and contact' },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            activeOpacity={0.7}
            style={[ss.row, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}
          >
            <View style={[ss.iconWrap, { backgroundColor: T.primary + '18' }]}>
              <MaterialCommunityIcons name={item.icon} size={18} color={T.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[ss.rowLabel, { color: T.textPrimary }]}>{item.label}</Text>
              <Text style={[ss.rowSub, { color: T.textHint }]}>{item.sub}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={T.textHint} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          activeOpacity={0.8}
          style={[ss.row, ss.signOutRow, { backgroundColor: T.dangerBg, borderColor: T.danger + '26' }]}
          onPress={onSignOut}
        >
          <View style={[ss.iconWrap, { backgroundColor: T.danger + '18' }]}>
            <MaterialCommunityIcons name="logout" size={18} color={T.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[ss.rowLabel, { color: T.danger }]}>Sign out</Text>
            <Text style={[ss.rowSub, { color: T.textHint }]}>Log out of your account</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={T.danger} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const ss = StyleSheet.create({
  scrim:       { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet:       { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0, paddingBottom: 40, paddingHorizontal: 20 },
  handle:      { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 6 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  sheetTitle:  { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  groupLabel:  { fontSize: 10, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase', marginTop: 20, marginBottom: 10 },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 },
  signOutRow:  { marginTop: 8 },
  iconWrap:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel:    { fontSize: 14, fontWeight: '600' },
  rowSub:      { fontSize: 11, marginTop: 1 },
});

// ─── ProfileTab ───────────────────────────────────────────────────────────────
export default function ProfileTab() {
  const T             = useTheme();                    // ← live theme tokens
  const tabBarHeight  = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();

  const [showSettings, setShowSettings] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [editMode, setEditMode]         = useState(false);
  const [saving, setSaving]             = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [loading, setLoading]           = useState(true);
  const [avatarPhoto, setAvatarPhoto] = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto]   = useState<string | null>(null);
  const [photos, setPhotos]           = useState<(string | null)[]>([null, null, null]);
  const [profileName, setProfileName] = useState('');
  const [profileHeadline, setProfileHeadline] = useState('');
  const [profileLocation, setProfileLocation] = useState('');
  const [profileAbout, setProfileAbout] = useState('');
  const [hardSkills, setHardSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [experience, setExperience]   = useState<ExperienceItem[]>([]);
  const [education, setEducation]     = useState<EducationItem[]>([]);
  const [prefs, setPrefs]             = useState<PrefItem[]>([]);
  const [stats, setStats]             = useState({ applied: 0, pendingMessages: 0, closedMessages: 0 });
  
  // Preferred locations for job matching (separate from current location)
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  
  // Social links
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  
  // Location city/region
  const [locationCity, setLocationCity] = useState('');
  const [locationRegion, setLocationRegion] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  
  // Track original data for comparison
  const [originalExperience, setOriginalExperience] = useState<ExperienceItem[]>([]);
  const [originalEducation, setOriginalEducation] = useState<EducationItem[]>([]);
  
  // Track if photos changed
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [coverChanged, setCoverChanged] = useState(false);
  const [photosChanged, setPhotosChanged] = useState(false);
  
  // Resume and cover letter
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [coverLetterUrl, setCoverLetterUrl] = useState<string | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false);

  // ── Load profile from API ────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    api.get('/profile/applicant')
      .then((data: any) => {
        const profile = data?.profile ?? data;
        if (!profile) return;

        const firstName = profile.first_name ?? '';
        const lastName = profile.last_name ?? '';
        const fullName = `${firstName} ${lastName}`.trim();

        if (fullName) setProfileName(fullName);
        if (profile.location) setProfileLocation(profile.location);
        if (profile.bio) setProfileAbout(profile.bio);
        if (profile.location_city) setLocationCity(profile.location_city);
        if (profile.location_region) setLocationRegion(profile.location_region);
        
        // Load social links
        if (profile.social_links && typeof profile.social_links === 'object' && !Array.isArray(profile.social_links)) {
          setSocialLinks(profile.social_links);
        }
        if (profile.profile_photo_url) setAvatarPhoto(profile.profile_photo_url);
        if (profile.cover_url) setCoverPhoto(profile.cover_url);
        
        // Load resume and cover letter URLs
        if (profile.resume_url) setResumeUrl(profile.resume_url);
        if (profile.cover_letter_url) setCoverLetterUrl(profile.cover_letter_url);

        // Handle nested skills structure
        if (profile.skills && typeof profile.skills === 'object') {
          if (Array.isArray(profile.skills.hard_skills)) {
            setHardSkills(profile.skills.hard_skills);
          }
          if (Array.isArray(profile.skills.soft_skills)) {
            setSoftSkills(profile.skills.soft_skills);
          }
        } else if (Array.isArray(profile.skills) && profile.skills.length) {
          // Fallback for old flat array format
          const flatSkills = profile.skills
            .map((skill: any) => typeof skill === 'string' ? skill : skill?.name)
            .filter(Boolean);
          if (flatSkills.length) {
            setHardSkills(flatSkills);
            setSoftSkills([]);
          }
        }

        if (Array.isArray(profile.photos) && profile.photos.length) {
          setPhotos(profile.photos.map((u: string) => u ?? null));
        }

        if (Array.isArray(profile.work_experience) && profile.work_experience.length) {
          const expData = profile.work_experience.map((e: any, i: number) => ({
            id: i + 1,
            role: e.position ?? e.role ?? '',
            company: e.company ?? '',
            period: `${e.start_date ?? ''}${e.end_date ? ` - ${e.end_date}` : ''}`.trim(),
            icon: EXP_ICONS[i % EXP_ICONS.length],
            color: EXP_COLORS[i % EXP_COLORS.length],
          }));
          setExperience(expData);
          setOriginalExperience(expData);
        }

        if (Array.isArray(profile.education) && profile.education.length) {
          const eduData = profile.education.map((e: any, i: number) => ({ 
            id: i + 1, 
            degree: e.degree ?? '', 
            school: e.institution ?? e.school ?? '', 
            period: e.graduation_year ? String(e.graduation_year) : '' 
          }));
          setEducation(eduData);
          setOriginalEducation(eduData);
        }

        if (profile.stats) {
          setStats({ 
            applied: profile.stats.applied ?? 0, 
            pendingMessages: profile.stats.pending_messages ?? 0, 
            closedMessages: profile.stats.closed_messages ?? 0 
          });
        }

        // Load job preferences (including preferred_locations)
        if (profile.job_preferences && typeof profile.job_preferences === 'object') {
          // Load desired_position as profileHeadline
          if (profile.job_preferences.desired_position) {
            setProfileHeadline(profile.job_preferences.desired_position);
          }
          
          if (Array.isArray(profile.job_preferences.preferred_locations)) {
            setPreferredLocations(profile.job_preferences.preferred_locations);
          }
          
          // Load work_type and employment_type as prefs
          const loadedPrefs: PrefItem[] = [];
          let prefId = 1;
          
          if (Array.isArray(profile.job_preferences.work_type)) {
            profile.job_preferences.work_type.forEach((type: string) => {
              loadedPrefs.push({
                id: prefId++,
                label: type.charAt(0).toUpperCase() + type.slice(1),
                icon: 'tag-outline',
                on: true
              });
            });
          }
          
          if (Array.isArray(profile.job_preferences.employment_type)) {
            profile.job_preferences.employment_type.forEach((type: string) => {
              loadedPrefs.push({
                id: prefId++,
                label: type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-'),
                icon: 'tag-outline',
                on: true
              });
            });
          }
          
          if (loadedPrefs.length > 0) {
            setPrefs(loadedPrefs);
          }
        }
      })
      .catch((err) => { 
        console.error('Failed to load profile:', err);
        Alert.alert('Error', 'Failed to load profile. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const [showAddExp,  setShowAddExp]  = useState(false);
  const [showAddEdu,  setShowAddEdu]  = useState(false);
  const [showAddPref, setShowAddPref] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newExp,  setNewExp]          = useState({ role: '', company: '', period: '' });
  const [newEdu,  setNewEdu]          = useState({ degree: '', school: '', period: '' });
  const [newPref, setNewPref]         = useState('');
  const [newLocation, setNewLocation] = useState('');

  const EXP_COLORS = [T.primary, '#4ade80', '#60a5fa', '#f472b6', '#fb923c'];
  const EXP_ICONS: React.ComponentProps<typeof MaterialCommunityIcons>['name'][] =
    ['code-braces', 'laptop', 'briefcase-outline', 'rocket-launch-outline', 'office-building-outline'];

  const addExperience = async () => {
    if (!newExp.role.trim()) return;
    
    setSaving(true);
    try {
      // Parse period into start_date and end_date
      const periodParts = newExp.period.split(/[-–—]/);
      const startDate = periodParts[0]?.trim() || '';
      const endDate = periodParts[1]?.trim() || null;
      
      await api.post('/profile/applicant/experience', {
        position: newExp.role.trim(),
        company: newExp.company.trim(),
        start_date: startDate,
        end_date: endDate === 'Present' || endDate === 'present' ? null : endDate,
      });
      
      // Reload profile to get fresh data with correct indices
      const data: any = await api.get('/profile/applicant');
      const profile = data?.profile ?? data;
      if (profile && Array.isArray(profile.work_experience)) {
        const expData = profile.work_experience.map((e: any, i: number) => ({
          id: i + 1,
          role: e.position ?? e.role ?? '',
          company: e.company ?? '',
          period: `${e.start_date ?? ''}${e.end_date ? ` - ${e.end_date}` : ''}`.trim(),
          icon: EXP_ICONS[i % EXP_ICONS.length],
          color: EXP_COLORS[i % EXP_COLORS.length],
        }));
        setExperience(expData);
        setOriginalExperience(expData);
      }
      
      setNewExp({ role: '', company: '', period: '' });
      setShowAddExp(false);
      Alert.alert('Success', 'Work experience added successfully!');
    } catch (err: any) {
      console.error('Add experience error:', err);
      Alert.alert('Error', err?.message || 'Failed to add work experience. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addEducation = async () => {
    if (!newEdu.degree.trim()) return;
    
    setSaving(true);
    try {
      await api.post('/profile/applicant/education', {
        degree: newEdu.degree.trim(),
        institution: newEdu.school.trim(),
        graduation_year: newEdu.period.trim(),
      });
      
      // Reload profile to get fresh data with correct indices
      const data: any = await api.get('/profile/applicant');
      const profile = data?.profile ?? data;
      if (profile && Array.isArray(profile.education)) {
        const eduData = profile.education.map((e: any, i: number) => ({ 
          id: i + 1, 
          degree: e.degree ?? '', 
          school: e.institution ?? e.school ?? '', 
          period: e.graduation_year ? String(e.graduation_year) : '' 
        }));
        setEducation(eduData);
        setOriginalEducation(eduData);
      }
      
      setNewEdu({ degree: '', school: '', period: '' });
      setShowAddEdu(false);
      Alert.alert('Success', 'Education added successfully!');
    } catch (err: any) {
      console.error('Add education error:', err);
      Alert.alert('Error', err?.message || 'Failed to add education. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteExperience = async (index: number) => {
    Alert.alert(
      'Delete Experience',
      'Are you sure you want to delete this work experience?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await api.delete(`/profile/applicant/experience/${index}`);
              
              // Reload profile
              const data: any = await api.get('/profile/applicant');
              const profile = data?.profile ?? data;
              if (profile && Array.isArray(profile.work_experience)) {
                const expData = profile.work_experience.map((e: any, i: number) => ({
                  id: i + 1,
                  role: e.position ?? e.role ?? '',
                  company: e.company ?? '',
                  period: `${e.start_date ?? ''}${e.end_date ? ` - ${e.end_date}` : ''}`.trim(),
                  icon: EXP_ICONS[i % EXP_ICONS.length],
                  color: EXP_COLORS[i % EXP_COLORS.length],
                }));
                setExperience(expData);
                setOriginalExperience(expData);
              }
              
              Alert.alert('Success', 'Work experience deleted successfully!');
            } catch (err: any) {
              console.error('Delete experience error:', err);
              Alert.alert('Error', err?.message || 'Failed to delete work experience. Please try again.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const deleteEducation = async (index: number) => {
    Alert.alert(
      'Delete Education',
      'Are you sure you want to delete this education entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await api.delete(`/profile/applicant/education/${index}`);
              
              // Reload profile
              const data: any = await api.get('/profile/applicant');
              const profile = data?.profile ?? data;
              if (profile && Array.isArray(profile.education)) {
                const eduData = profile.education.map((e: any, i: number) => ({ 
                  id: i + 1, 
                  degree: e.degree ?? '', 
                  school: e.institution ?? e.school ?? '', 
                  period: e.graduation_year ? String(e.graduation_year) : '' 
                }));
                setEducation(eduData);
                setOriginalEducation(eduData);
              }
              
              Alert.alert('Success', 'Education deleted successfully!');
            } catch (err: any) {
              console.error('Delete education error:', err);
              Alert.alert('Error', err?.message || 'Failed to delete education. Please try again.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const addPref = () => {
    if (!newPref.trim()) return;
    setPrefs(prev => [...prev, { id: Date.now(), label: newPref.trim(), icon: 'tag-outline', on: true }]);
    setNewPref('');
    setShowAddPref(false);
  };

  const addPreferredLocation = () => {
    const trimmed = newLocation.trim();
    if (!trimmed) return;
    if (preferredLocations.includes(trimmed)) {
      Alert.alert('Duplicate', 'This location is already in your preferred locations.');
      return;
    }
    setPreferredLocations(prev => [...prev, trimmed]);
    setNewLocation('');
    setShowAddLocation(false);
  };

  const removePreferredLocation = (location: string) => {
    setPreferredLocations(prev => prev.filter(loc => loc !== location));
  };

  const pickAvatar = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (!r.canceled) {
      setAvatarPhoto(r.assets[0].uri);
      setAvatarChanged(true);
    }
  };

  const pickCover = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [3, 1], quality: 0.85 });
    if (!r.canceled) {
      setCoverPhoto(r.assets[0].uri);
      setCoverChanged(true);
    }
  };

  const pickPhoto = async (i: number) => {
    const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 5], quality: 0.85 });
    if (!r.canceled) { 
      const p = [...photos]; 
      p[i] = r.assets[0].uri; 
      setPhotos(p);
      setPhotosChanged(true);
    }
  };

  const clearToken = useAuthStore((s) => s.clearToken);
  const handleSignOut = async () => {
    try { await api.post('/auth/logout', {}); } catch { /* ignore */ }
    await clearToken();
    router.replace('/(auth)/login');
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to detect your location.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [result] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (result) {
        const city = result.city || result.subregion || '';
        const region = result.region || '';
        setLocationCity(city);
        setLocationRegion(region);
        const displayLocation = [city, region].filter(Boolean).join(', ');
        if (displayLocation) setProfileLocation(displayLocation);
      }
    } catch (err) {
      console.error('Location detection failed:', err);
      Alert.alert('Error', 'Could not detect your location. Please enter it manually.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setUploading(false);
    
    try {
      const [firstName = '', ...rest] = profileName.trim().split(/\s+/);
      const lastName = rest.join(' ');
      
      // 1. Save basic info
      await api.patch('/profile/applicant/basic-info', {
        first_name: firstName || profileName.trim() || 'Applicant',
        last_name: lastName || '-',
        location: profileLocation,
        bio: profileAbout,
        location_city: locationCity || null,
        location_region: locationRegion || null,
      });

      // 2. Save skills with nested structure (only if there are skills)
      if (hardSkills.length > 0 || softSkills.length > 0) {
        await api.patch('/profile/applicant/skills', {
          hard_skills: hardSkills,
          soft_skills: softSkills,
        });
      }

      // 3. Upload and save avatar photo if changed
      if (avatarChanged && avatarPhoto && !avatarPhoto.startsWith('http')) {
        setUploading(true);
        try {
          const uploadedUrl = await uploadSingleFile(
            { uri: avatarPhoto, name: `avatar_${Date.now()}.jpg` },
            'image'
          );
          await api.patch('/profile/applicant/photo', {
            profile_photo_url: uploadedUrl,
          });
          setAvatarPhoto(uploadedUrl);
          setAvatarChanged(false);
        } catch (err) {
          console.error('Avatar upload failed:', err);
          Alert.alert('Upload Error', 'Failed to upload profile photo. Other changes were saved.');
        } finally {
          setUploading(false);
        }
      }

      // 4. Upload and save cover photo if changed
      if (coverChanged && coverPhoto && !coverPhoto.startsWith('http')) {
        setUploading(true);
        try {
          const uploadedUrl = await uploadSingleFile(
            { uri: coverPhoto, name: `cover_${Date.now()}.jpg` },
            'image'
          );
          await api.patch('/profile/applicant/cover-photo', {
            cover_url: uploadedUrl,
          });
          setCoverPhoto(uploadedUrl);
          setCoverChanged(false);
        } catch (err) {
          console.error('Cover photo upload failed:', err);
          Alert.alert('Upload Error', 'Failed to upload cover photo. Other changes were saved.');
        } finally {
          setUploading(false);
        }
      }

      // 5. Upload and save portfolio photos if changed
      if (photosChanged) {
        setUploading(true);
        try {
          const uploadedPhotos: (string | null)[] = [];
          
          for (let i = 0; i < photos.length; i++) {
            const photo = photos[i];
            if (photo && !photo.startsWith('http')) {
              // Upload new photo
              const uploadedUrl = await uploadSingleFile(
                { uri: photo, name: `photo_${i}_${Date.now()}.jpg` },
                'image'
              );
              uploadedPhotos.push(uploadedUrl);
            } else {
              // Keep existing photo or null
              uploadedPhotos.push(photo);
            }
          }
          
          await api.patch('/profile/applicant/photos', {
            photos: uploadedPhotos,
          });
          setPhotos(uploadedPhotos);
          setPhotosChanged(false);
        } catch (err) {
          console.error('Photos upload failed:', err);
          Alert.alert('Upload Error', 'Failed to upload portfolio photos. Other changes were saved.');
        } finally {
          setUploading(false);
        }
      }

      // 6. Save job preferences (if prefs have been modified)
      if (prefs.length > 0 || preferredLocations.length > 0) {
        try {
          // Convert prefs to job preferences structure
          const jobPreferences = {
            desired_position: profileHeadline || null,
            preferred_locations: preferredLocations.length > 0 ? preferredLocations : [],
            work_type: prefs.filter(p => ['remote', 'hybrid', 'onsite'].includes(p.label.toLowerCase()) && p.on)
              .map(p => p.label.toLowerCase()),
            employment_type: prefs.filter(p => ['full-time', 'part-time', 'contract', 'freelance', 'internship'].includes(p.label.toLowerCase()) && p.on)
              .map(p => p.label.toLowerCase()),
            willing_to_relocate: null,
          };
          
          await api.patch('/profile/applicant/job-preferences', jobPreferences);
        } catch (err) {
          console.error('Job preferences save failed:', err);
          // Don't show error for this, it's not critical
        }
      }

      // 7. Save social links
      try {
        const filteredLinks = Object.fromEntries(
          Object.entries(socialLinks).filter(([_, v]) => v && v.trim())
        );
        await api.patch('/profile/applicant/social-links', {
          social_links: filteredLinks,
        });
      } catch (err) {
        console.error('Social links save failed:', err);
      }

      // 8. Save experience entries (compare with original)
      // Note: For simplicity, we're not doing individual CRUD here
      // In production, you'd track which items were added/removed/updated
      
      // 8. Save education entries
      // Same note as experience

      Alert.alert('Success', 'Profile updated successfully!');
      
      // Reload profile to get fresh data
      const data: any = await api.get('/profile/applicant');
      const profile = data?.profile ?? data;
      if (profile) {
        // Update state with fresh data
        if (profile.profile_photo_url) setAvatarPhoto(profile.profile_photo_url);
        if (profile.cover_url) setCoverPhoto(profile.cover_url);
        if (Array.isArray(profile.photos)) setPhotos(profile.photos.map((u: string) => u ?? null));
        
        // Update skills from fresh data
        if (profile.skills && typeof profile.skills === 'object') {
          if (Array.isArray(profile.skills.hard_skills)) {
            setHardSkills(profile.skills.hard_skills);
          }
          if (Array.isArray(profile.skills.soft_skills)) {
            setSoftSkills(profile.skills.soft_skills);
          }
        }
      }
      
    } catch (err: any) {
      console.error('Profile save error:', err);
      
      // Better error messages
      let errorMessage = 'Failed to save profile. Please try again.';
      
      if (err?.errors) {
        // Validation errors
        const errorFields = Object.keys(err.errors);
        errorMessage = `Validation error: ${errorFields.join(', ')}`;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  // Skill management
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newSkillType, setNewSkillType] = useState<'hard' | 'soft'>('hard');

  const addSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    
    if (newSkillType === 'hard') {
      if (!hardSkills.includes(trimmed)) {
        setHardSkills(prev => [...prev, trimmed]);
      }
    } else {
      if (!softSkills.includes(trimmed)) {
        setSoftSkills(prev => [...prev, trimmed]);
      }
    }
    
    setNewSkillInput('');
    setShowAddSkill(false);
  };

  const removeSkill = (type: 'hard' | 'soft', skill: string) => {
    if (type === 'hard') {
      setHardSkills(prev => prev.filter(s => s !== skill));
    } else {
      setSoftSkills(prev => prev.filter(s => s !== skill));
    }
  };

  // Resume and Cover Letter handlers
  const pickResume = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });
      
      if (!result.canceled && result.assets[0]) {
        setUploadingResume(true);
        try {
          const asset = result.assets[0];
          const uploadedUrl = await uploadSingleFile(
            { uri: asset.uri, name: `resume_${Date.now()}.pdf` },
            'document'
          );
          
          await api.patch('/profile/applicant/resume', {
            resume_url: uploadedUrl,
          });
          
          setResumeUrl(uploadedUrl);
          Alert.alert('Success', 'Resume updated successfully!');
        } catch (err) {
          console.error('Resume upload failed:', err);
          Alert.alert('Upload Error', 'Failed to upload resume. Please try again.');
        } finally {
          setUploadingResume(false);
        }
      }
    } catch (err) {
      console.error('File picker error:', err);
      Alert.alert('Error', 'Failed to open file picker. Please try again.');
    }
  };

  const pickCoverLetter = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });
      
      if (!result.canceled && result.assets[0]) {
        setUploadingCoverLetter(true);
        try {
          const asset = result.assets[0];
          const uploadedUrl = await uploadSingleFile(
            { uri: asset.uri, name: `cover_letter_${Date.now()}.pdf` },
            'document'
          );
          
          await api.patch('/profile/applicant/cover-letter', {
            cover_letter_url: uploadedUrl,
          });
          
          setCoverLetterUrl(uploadedUrl);
          Alert.alert('Success', 'Cover letter updated successfully!');
        } catch (err) {
          console.error('Cover letter upload failed:', err);
          Alert.alert('Upload Error', 'Failed to upload cover letter. Please try again.');
        } finally {
          setUploadingCoverLetter(false);
        }
      }
    } catch (err) {
      console.error('File picker error:', err);
      Alert.alert('Error', 'Failed to open file picker. Please try again.');
    }
  };

  const openDocument = async (url: string, type: 'resume' | 'cover letter') => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${type}. URL may be invalid.`);
      }
    } catch (err) {
      console.error(`Failed to open ${type}:`, err);
      Alert.alert('Error', `Failed to open ${type}. Please try again.`);
    }
  };

  return (
    <View style={[s.screen, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.bg === '#f5f3ff' ? 'dark-content' : 'light-content'} translucent backgroundColor="transparent" />

      <SettingsSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onSignOut={() => {
          setShowSettings(false);
          setShowSignOutModal(true);
        }}
      />

      {/* Uploading Overlay */}
      {uploading && (
        <View style={modal.overlay}>
          <View style={[modal.card, { backgroundColor: T.surface, borderColor: T.border, paddingVertical: 40 }]}>
            <ActivityIndicator size="large" color={T.primary} />
            <Text style={[{ fontSize: 16, fontWeight: '600', color: T.textPrimary, marginTop: 20 }]}>
              Uploading photos...
            </Text>
            <Text style={[{ fontSize: 13, color: T.textSub, marginTop: 8 }]}>
              Please wait
            </Text>
          </View>
        </View>
      )}

      {/* Loading Overlay */}
      {loading && (
        <View style={[modal.overlay, { backgroundColor: T.bg }]}>
          <ActivityIndicator size="large" color={T.primary} />
          <Text style={[{ fontSize: 16, fontWeight: '600', color: T.textPrimary, marginTop: 20 }]}>
            Loading profile...
          </Text>
        </View>
      )}

      {showSignOutModal && (
        <View style={modal.overlay}>
          <TouchableOpacity style={modal.backdrop} activeOpacity={1} onPress={() => setShowSignOutModal(false)} />
          <View style={[modal.card, { backgroundColor: T.surface, borderColor: T.border }]}>
            <View style={[modal.iconWrap, { backgroundColor: T.dangerBg }]}>
              <MaterialCommunityIcons name="logout" size={28} color={T.danger} />
            </View>
            <Text style={[modal.title, { color: T.textPrimary }]}>Sign Out</Text>
            <Text style={[modal.message, { color: T.textSub }]}>Are you sure you want to sign out?</Text>
            <View style={modal.btnRow}>
              <TouchableOpacity
                style={[modal.cancelBtn, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}
                onPress={() => setShowSignOutModal(false)}
              >
                <Text style={[modal.cancelText, { color: T.textSub }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modal.confirmBtn, { backgroundColor: T.danger }]}
                onPress={async () => {
                  setShowSignOutModal(false);
                  await handleSignOut();
                }}
              >
                <Text style={modal.confirmText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 40 }}>

        {/* ── Cover photo ──────────────────────────────────────────────────── */}
        <View style={[s.coverWrap, { height: 190 + topInset, backgroundColor: T.surfaceHigh }]}>
          {coverPhoto
            ? <Image source={{ uri: coverPhoto }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            : <View style={[StyleSheet.absoluteFillObject, s.coverFallback, { borderBottomColor: T.borderFaint }]}>
                <MaterialCommunityIcons name="image-outline" size={32} color={T.textHint} />
              </View>
          }

          {/* ── Settings gear button ── */}
          <TouchableOpacity
            style={[s.settingsBtn, { top: topInset + 12, backgroundColor: 'rgba(0,0,0,0.42)', borderColor: 'rgba(255,255,255,0.18)' }]}
            onPress={() => setShowSettings(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="cog-outline" size={17} color="#fff" />
          </TouchableOpacity>

          {editMode && (
            <TouchableOpacity style={s.coverEditBtn} onPress={pickCover} activeOpacity={0.8}>
              <MaterialCommunityIcons name="camera-outline" size={13} color="#fff" />
              <Text style={s.coverEditText}>Edit cover</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Hero row ─────────────────────────────────────────────────────── */}
        <View style={s.heroRow}>
          <TouchableOpacity onPress={editMode ? pickAvatar : undefined} activeOpacity={0.85} style={s.avatarWrap}>
            {avatarPhoto
              ? <Image source={{ uri: avatarPhoto }} style={[s.avatar, { borderColor: T.bg }]} />
              : <View style={[s.avatarFallback, { backgroundColor: T.surfaceHigh, borderColor: T.bg }]}>
                  <Text style={[s.avatarInitials, { color: T.textPrimary }]}>JD</Text>
                </View>
            }
            {editMode && (
              <View style={[s.camBadge, { backgroundColor: T.primary, borderColor: T.bg }]}>
                <MaterialCommunityIcons name="camera" size={10} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              s.editBtn,
              { borderColor: T.border, backgroundColor: T.surfaceHigh },
              editMode && s.editBtnSaving,
            ]}
            onPress={async () => {
              if (editMode) {
                await handleSaveProfile();
              }
              setEditMode(e => !e);
            }}
            activeOpacity={0.8}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={T.primary} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name={editMode ? 'check' : 'pencil-outline'}
                  size={13}
                  color={editMode ? '#4ade80' : T.primary}
                />
                <Text style={[s.editBtnText, { color: T.primary }, editMode && { color: '#4ade80' }]}>
                  {editMode ? 'Save' : 'Edit'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Name / headline / location ───────────────────────────────────── */}
        <View style={s.heroInfo}>
          {editMode ? (
            <View style={s.heroForm}>
              <View>
                <Text style={[s.fieldLabel, { color: T.textHint }]}>Name</Text>
                <TextInput
                  style={[s.heroInput, { backgroundColor: T.surfaceHigh, borderColor: T.border, color: T.textPrimary }]}
                  value={profileName}
                  onChangeText={setProfileName}
                  placeholder="Your name"
                  placeholderTextColor={T.textHint}
                />
              </View>

              <View>
                <Text style={[s.fieldLabel, { color: T.textHint }]}>Position</Text>
                <TextInput
                  style={[s.heroInput, { backgroundColor: T.surfaceHigh, borderColor: T.border, color: T.textPrimary }]}
                  value={profileHeadline}
                  onChangeText={setProfileHeadline}
                  placeholder="Your role"
                  placeholderTextColor={T.textHint}
                />
              </View>

              <View>
                <Text style={[s.fieldLabel, { color: T.textHint }]}>Location</Text>
                <TextInput
                  style={[s.heroInput, { backgroundColor: T.surfaceHigh, borderColor: T.border, color: T.textPrimary }]}
                  value={profileLocation}
                  onChangeText={setProfileLocation}
                  placeholder="Your location"
                  placeholderTextColor={T.textHint}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.fieldLabel, { color: T.textHint }]}>City</Text>
                  <TextInput
                    style={[s.heroInput, { backgroundColor: T.surfaceHigh, borderColor: T.border, color: T.textPrimary }]}
                    value={locationCity}
                    onChangeText={setLocationCity}
                    placeholder="City"
                    placeholderTextColor={T.textHint}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.fieldLabel, { color: T.textHint }]}>Region</Text>
                  <TextInput
                    style={[s.heroInput, { backgroundColor: T.surfaceHigh, borderColor: T.border, color: T.textPrimary }]}
                    value={locationRegion}
                    onChangeText={setLocationRegion}
                    placeholder="Region"
                    placeholderTextColor={T.textHint}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[s.editBtn, { borderColor: T.primary + '44', backgroundColor: T.primary + '12', alignSelf: 'flex-start', marginBottom: 0 }]}
                onPress={handleDetectLocation}
                disabled={detectingLocation}
                activeOpacity={0.7}
              >
                {detectingLocation ? (
                  <ActivityIndicator size="small" color={T.primary} />
                ) : (
                  <MaterialCommunityIcons name="crosshairs-gps" size={13} color={T.primary} />
                )}
                <Text style={[s.editBtnText, { color: T.primary }]}>
                  {detectingLocation ? 'Detecting...' : 'Detect Location'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <Text style={[s.name, { color: T.textPrimary }]}>{profileName}</Text>
                <MaterialCommunityIcons name="check-decagram" size={15} color={T.primary} />
              </View>
              <Text style={[s.headline, { color: T.textSub }]}>{profileHeadline}</Text>
              <View style={s.locRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={11} color={T.textHint} />
                <Text style={[s.loc, { color: T.textHint }]}>{profileLocation}</Text>
              </View>
            </>
          )}
        </View>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <View style={[s.statsCard, { backgroundColor: T.surface, borderColor: T.border }]}>
          {[
            { label: 'Applied',          value: String(stats.applied) },
            { label: 'Pending Messages', value: String(stats.pendingMessages) },
            { label: 'Closed Messages',  value: String(stats.closedMessages) },
          ].map((st, i) => (
            <React.Fragment key={st.label}>
              {i > 0 && <View style={[s.statSep, { backgroundColor: T.border }]} />}
              <View style={s.stat}>
                <Text style={[s.statVal, { color: T.textPrimary }]}>{st.value}</Text>
                <Text style={[s.statLbl, { color: T.textHint }]}>{st.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* ── My Applications Button ───────────────────────────────────────── */}
        <TouchableOpacity
          style={[s.applicationsBtn, { backgroundColor: T.surface, borderColor: T.border }]}
          activeOpacity={0.8}
          onPress={() => router.push('/applications')}
        >
          <View style={[s.applicationsBtnIcon, { backgroundColor: T.primary + '18' }]}>
            <MaterialCommunityIcons name="briefcase-outline" size={20} color={T.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.applicationsBtnTitle, { color: T.textPrimary }]}>My Applications</Text>
            <Text style={[s.applicationsBtnSub, { color: T.textHint }]}>
              View all your job applications
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={T.textHint} />
        </TouchableOpacity>

        <Sep />

        {/* ── About ────────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel title="About" />
          {editMode ? (
            <TextInput
              style={[s.aboutInput, { backgroundColor: T.surfaceHigh, borderColor: T.border, color: T.textPrimary }]}
              value={profileAbout}
              onChangeText={setProfileAbout}
              placeholder="Tell recruiters about yourself"
              placeholderTextColor={T.textHint}
              multiline
              textAlignVertical="top"
            />
          ) : (
            <Text style={[s.aboutText, { color: T.textSub }]}>{profileAbout}</Text>
          )}
        </View>

        <Sep />

        {/* ── Photos ───────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel title="Photos" />
          <View style={s.photoGrid}>
            {photos.map((uri, i) => (
              <TouchableOpacity
                key={i}
                style={[s.photoSlot, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}
                onPress={() => pickPhoto(i)}
                activeOpacity={0.8}
              >
                {uri
                  ? <Image source={{ uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                  : <MaterialCommunityIcons name="plus" size={22} color={T.textHint} />
                }
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Sep />

        {/* ── Skills ───────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel title="Skills" />

          <View style={s.skillSegment}>
            <View style={s.skillSegmentHeader}>
              <MaterialCommunityIcons name="code-braces" size={13} color={T.primary} />
              <Text style={[s.skillSegmentLabel, { color: T.primary }]}>Hard Skills</Text>
              {editMode && (
                <TouchableOpacity 
                  style={[s.addBtn, { borderColor: T.border, backgroundColor: T.surfaceHigh, marginLeft: 'auto' }]}
                  onPress={() => {
                    setNewSkillType('hard');
                    setShowAddSkill(v => !v);
                  }}
                >
                  <MaterialCommunityIcons name={showAddSkill && newSkillType === 'hard' ? 'minus' : 'plus'} size={12} color={T.primary} />
                  <Text style={[s.addBtnText, { color: T.primary }]}>
                    {showAddSkill && newSkillType === 'hard' ? 'Cancel' : 'Add'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {editMode && showAddSkill && newSkillType === 'hard' && (
              <View style={[s.addForm, { marginBottom: 12, backgroundColor: T.surfaceHigh, borderColor: T.border }]}>
                <TextInput 
                  style={[s.addInput, { backgroundColor: T.surface, borderColor: T.border, color: T.textPrimary }]} 
                  placeholder="Add hard skill (e.g., React, Python, SQL)..."
                  placeholderTextColor={T.textHint} 
                  value={newSkillInput} 
                  onChangeText={setNewSkillInput}
                  onSubmitEditing={addSkill}
                  autoFocus
                />
                <TouchableOpacity style={[s.addConfirmBtn, { backgroundColor: T.primary }]} onPress={addSkill}>
                  <Text style={s.addConfirmText}>Add Hard Skill</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={s.chips}>
              {hardSkills.length === 0 ? (
                <Text style={{ fontSize: 12, color: T.textHint, fontStyle: 'italic' }}>No hard skills added yet</Text>
              ) : (
                hardSkills.map((sk, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={[s.chip, { borderColor: T.border, backgroundColor: T.surfaceHigh }]}
                    onPress={() => editMode && removeSkill('hard', sk)}
                    disabled={!editMode}
                  >
                    <Text style={[s.chipText, { color: T.primary }]}>{sk}</Text>
                    {editMode && <MaterialCommunityIcons name="close" size={10} color={T.primary} style={{ marginLeft: 4 }} />}
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>

          <View style={[s.skillDivider, { backgroundColor: T.borderFaint }]} />

          <View style={s.skillSegment}>
            <View style={s.skillSegmentHeader}>
              <MaterialCommunityIcons name="account-heart-outline" size={13} color="#4ade80" />
              <Text style={[s.skillSegmentLabel, { color: '#4ade80' }]}>Soft Skills</Text>
              {editMode && (
                <TouchableOpacity 
                  style={[s.addBtn, { borderColor: T.border, backgroundColor: T.surfaceHigh, marginLeft: 'auto' }]}
                  onPress={() => {
                    setNewSkillType('soft');
                    setShowAddSkill(v => !v);
                  }}
                >
                  <MaterialCommunityIcons name={showAddSkill && newSkillType === 'soft' ? 'minus' : 'plus'} size={12} color="#4ade80" />
                  <Text style={[s.addBtnText, { color: '#4ade80' }]}>
                    {showAddSkill && newSkillType === 'soft' ? 'Cancel' : 'Add'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {editMode && showAddSkill && newSkillType === 'soft' && (
              <View style={[s.addForm, { marginBottom: 12, backgroundColor: T.surfaceHigh, borderColor: T.border }]}>
                <TextInput 
                  style={[s.addInput, { backgroundColor: T.surface, borderColor: T.border, color: T.textPrimary }]} 
                  placeholder="Add soft skill (e.g., Leadership, Communication)..."
                  placeholderTextColor={T.textHint} 
                  value={newSkillInput} 
                  onChangeText={setNewSkillInput}
                  onSubmitEditing={addSkill}
                  autoFocus
                />
                <TouchableOpacity style={[s.addConfirmBtn, { backgroundColor: '#4ade80' }]} onPress={addSkill}>
                  <Text style={s.addConfirmText}>Add Soft Skill</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={s.chips}>
              {softSkills.length === 0 ? (
                <Text style={{ fontSize: 12, color: T.textHint, fontStyle: 'italic' }}>No soft skills added yet</Text>
              ) : (
                softSkills.map((sk, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={[s.chip, { borderColor: T.borderFaint, backgroundColor: T.surfaceHigh }]}
                    onPress={() => editMode && removeSkill('soft', sk)}
                    disabled={!editMode}
                  >
                    <Text style={[s.chipText, { color: '#4ade80' }]}>{sk}</Text>
                    {editMode && <MaterialCommunityIcons name="close" size={10} color="#4ade80" style={{ marginLeft: 4 }} />}
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </View>

        <Sep />

        {/* ── Experience ───────────────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionLabel title="Experience" />
            {editMode && (
              <TouchableOpacity style={[s.addBtn, { borderColor: T.border, backgroundColor: T.surfaceHigh }]} onPress={() => setShowAddExp(v => !v)}>
                <MaterialCommunityIcons name={showAddExp ? 'minus' : 'plus'} size={12} color={T.primary} />
                <Text style={[s.addBtnText, { color: T.primary }]}>{showAddExp ? 'Cancel' : 'Add'}</Text>
              </TouchableOpacity>
            )}
          </View>
          {experience.length === 0 && !showAddExp ? (
            <Text style={{ fontSize: 13, color: T.textHint, fontStyle: 'italic', textAlign: 'center', paddingVertical: 20 }}>
              No work experience added yet
            </Text>
          ) : (
            <View style={{ gap: 16 }}>
              {experience.map((exp, index) => (
                <View key={exp.id} style={s.expRow}>
                  <View style={[s.expIcon, { backgroundColor: exp.color + '18' }]}>
                    <MaterialCommunityIcons name={exp.icon} size={15} color={exp.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.expRole, { color: T.textPrimary }]}>{exp.role}</Text>
                    <Text style={[s.expMeta, { color: T.textHint }]}>{exp.company} · {exp.period}</Text>
                  </View>
                  {editMode && (
                    <TouchableOpacity onPress={() => deleteExperience(index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <MaterialCommunityIcons name="close-circle" size={18} color={T.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
          {editMode && showAddExp && (
            <View style={[s.addForm, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}>
              <TextInput style={[s.addInput, { backgroundColor: T.surface, borderColor: T.border, color: T.textPrimary }]} placeholder="Role / Title" placeholderTextColor={T.textHint} value={newExp.role} onChangeText={t => setNewExp(p => ({ ...p, role: t }))} />
              <TextInput style={[s.addInput, { backgroundColor: T.surface, borderColor: T.border, color: T.textPrimary }]} placeholder="Company" placeholderTextColor={T.textHint} value={newExp.company} onChangeText={t => setNewExp(p => ({ ...p, company: t }))} />
              <TextInput style={[s.addInput, { backgroundColor: T.surface, borderColor: T.border, color: T.textPrimary }]} placeholder="Period (e.g. 2022 – Present)" placeholderTextColor={T.textHint} value={newExp.period} onChangeText={t => setNewExp(p => ({ ...p, period: t }))} />
              <TouchableOpacity style={[s.addConfirmBtn, { backgroundColor: T.primary }]} onPress={addExperience}>
                <Text style={s.addConfirmText}>Add Experience</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Sep />

        {/* ── Education ────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionLabel title="Education" />
            {editMode && (
              <TouchableOpacity style={[s.addBtn, { borderColor: T.border, backgroundColor: T.surfaceHigh }]} onPress={() => setShowAddEdu(v => !v)}>
                <MaterialCommunityIcons name={showAddEdu ? 'minus' : 'plus'} size={12} color={T.primary} />
                <Text style={[s.addBtnText, { color: T.primary }]}>{showAddEdu ? 'Cancel' : 'Add'}</Text>
              </TouchableOpacity>
            )}
          </View>
          {education.length === 0 && !showAddEdu ? (
            <Text style={{ fontSize: 13, color: T.textHint, fontStyle: 'italic', textAlign: 'center', paddingVertical: 20 }}>
              No education added yet
            </Text>
          ) : (
            <View style={{ gap: 16 }}>
              {education.map((edu, index) => (
                <View key={edu.id} style={s.expRow}>
                  <View style={[s.expIcon, { backgroundColor: T.primary + '18' }]}>
                    <MaterialCommunityIcons name="school-outline" size={15} color={T.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.expRole, { color: T.textPrimary }]}>{edu.degree}</Text>
                    <Text style={[s.expMeta, { color: T.textHint }]}>{edu.school} · {edu.period}</Text>
                  </View>
                  {editMode && (
                    <TouchableOpacity onPress={() => deleteEducation(index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <MaterialCommunityIcons name="close-circle" size={18} color={T.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
          {editMode && showAddEdu && (
            <View style={[s.addForm, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}>
              <TextInput style={[s.addInput, { backgroundColor: T.surface, borderColor: T.border, color: T.textPrimary }]} placeholder="Degree / Program" placeholderTextColor={T.textHint} value={newEdu.degree} onChangeText={t => setNewEdu(p => ({ ...p, degree: t }))} />
              <TextInput style={[s.addInput, { backgroundColor: T.surface, borderColor: T.border, color: T.textPrimary }]} placeholder="School / University" placeholderTextColor={T.textHint} value={newEdu.school} onChangeText={t => setNewEdu(p => ({ ...p, school: t }))} />
              <TextInput style={[s.addInput, { backgroundColor: T.surface, borderColor: T.border, color: T.textPrimary }]} placeholder="Period (e.g. 2015 – 2019)" placeholderTextColor={T.textHint} value={newEdu.period} onChangeText={t => setNewEdu(p => ({ ...p, period: t }))} />
              <TouchableOpacity style={[s.addConfirmBtn, { backgroundColor: T.primary }]} onPress={addEducation}>
                <Text style={s.addConfirmText}>Add Education</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Sep />

        {/* ── Resume & Documents ───────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel title="Resume & Documents" />
          
          {/* Resume */}
          <View style={[s.documentCard, { backgroundColor: T.surfaceHigh, borderColor: T.border }]}>
            <View style={[s.documentIcon, { backgroundColor: T.primary + '18' }]}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color={T.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.documentTitle, { color: T.textPrimary }]}>Resume / CV</Text>
              <Text style={[s.documentStatus, { color: resumeUrl ? T.textSub : T.textHint }]}>
                {resumeUrl ? 'Uploaded' : 'Not uploaded'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {resumeUrl && (
                <TouchableOpacity
                  style={[s.documentBtn, { backgroundColor: T.surface, borderColor: T.border }]}
                  onPress={() => openDocument(resumeUrl, 'resume')}
                >
                  <MaterialCommunityIcons name="eye-outline" size={14} color={T.textSub} />
                  <Text style={[s.documentBtnText, { color: T.textSub }]}>View</Text>
                </TouchableOpacity>
              )}
              {editMode && (
                <TouchableOpacity
                  style={[s.documentBtn, { backgroundColor: T.primary, borderColor: T.primary }]}
                  onPress={pickResume}
                  disabled={uploadingResume}
                >
                  {uploadingResume ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="upload" size={14} color="#fff" />
                      <Text style={[s.documentBtnText, { color: '#fff' }]}>
                        {resumeUrl ? 'Update' : 'Upload'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Cover Letter */}
          <View style={[s.documentCard, { backgroundColor: T.surfaceHigh, borderColor: T.border, marginTop: 12 }]}>
            <View style={[s.documentIcon, { backgroundColor: '#60a5fa18' }]}>
              <MaterialCommunityIcons name="file-document-edit-outline" size={20} color="#60a5fa" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.documentTitle, { color: T.textPrimary }]}>Cover Letter</Text>
              <Text style={[s.documentStatus, { color: coverLetterUrl ? T.textSub : T.textHint }]}>
                {coverLetterUrl ? 'Uploaded' : 'Not uploaded'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {coverLetterUrl && (
                <TouchableOpacity
                  style={[s.documentBtn, { backgroundColor: T.surface, borderColor: T.border }]}
                  onPress={() => openDocument(coverLetterUrl, 'cover letter')}
                >
                  <MaterialCommunityIcons name="eye-outline" size={14} color={T.textSub} />
                  <Text style={[s.documentBtnText, { color: T.textSub }]}>View</Text>
                </TouchableOpacity>
              )}
              {editMode && (
                <TouchableOpacity
                  style={[s.documentBtn, { backgroundColor: '#60a5fa', borderColor: '#60a5fa' }]}
                  onPress={pickCoverLetter}
                  disabled={uploadingCoverLetter}
                >
                  {uploadingCoverLetter ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="upload" size={14} color="#fff" />
                      <Text style={[s.documentBtnText, { color: '#fff' }]}>
                        {coverLetterUrl ? 'Update' : 'Upload'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <Sep />

        {/* ── Preferences ──────────────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionLabel title="Job preferences" />
            {editMode && (
              <TouchableOpacity style={[s.addBtn, { borderColor: T.border, backgroundColor: T.surfaceHigh }]} onPress={() => setShowAddPref(v => !v)}>
                <MaterialCommunityIcons name={showAddPref ? 'minus' : 'plus'} size={12} color={T.primary} />
                <Text style={[s.addBtnText, { color: T.primary }]}>{showAddPref ? 'Cancel' : 'Add'}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={s.chips}>
            {prefs.map((p) => (
              <View key={p.id} style={[
                s.prefChip,
                { backgroundColor: T.surfaceHigh, borderColor: T.border },
                p.on && { borderColor: T.primary + '55', backgroundColor: T.primary + '15' },
              ]}>
                <MaterialCommunityIcons name={p.icon} size={13} color={p.on ? T.primary : T.textHint} />
                <Text style={[s.chipText, { color: T.textSub }, p.on && { color: T.primary }]}>{p.label}</Text>
                {editMode && (
                  <TouchableOpacity onPress={() => setPrefs(prev => prev.filter(x => x.id !== p.id))} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} style={{ marginLeft: 4 }}>
                    <MaterialCommunityIcons name="close" size={11} color={p.on ? T.primary : T.textHint} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
          {editMode && showAddPref && (
            <View style={[s.addForm, { marginTop: 12, backgroundColor: T.surfaceHigh, borderColor: T.border }]}>
              <TextInput style={[s.addInput, { backgroundColor: T.surface, borderColor: T.border, color: T.textPrimary }]} placeholder="e.g. Hybrid, Contract, $150k+" placeholderTextColor={T.textHint} value={newPref} onChangeText={setNewPref} />
              <TouchableOpacity style={[s.addConfirmBtn, { backgroundColor: T.primary }]} onPress={addPref}>
                <Text style={s.addConfirmText}>Add Preference</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Sep />

        {/* ── Preferred Locations ──────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionLabel title="Preferred Work Locations" />
            {editMode && (
              <TouchableOpacity 
                style={[s.addBtn, { borderColor: T.border, backgroundColor: T.surfaceHigh }]} 
                onPress={() => setShowAddLocation(v => !v)}
              >
                <MaterialCommunityIcons name={showAddLocation ? 'minus' : 'plus'} size={12} color={T.primary} />
                <Text style={[s.addBtnText, { color: T.primary }]}>{showAddLocation ? 'Cancel' : 'Add'}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {preferredLocations.length === 0 ? (
            <Text style={{ fontSize: 13, color: T.textHint, fontStyle: 'italic', textAlign: 'center', paddingVertical: 20 }}>
              No preferred locations set. Add locations where you'd like to work.
            </Text>
          ) : (
            <View style={s.chips}>
              {preferredLocations.map((location, index) => (
                <View 
                  key={index} 
                  style={[
                    s.prefChip,
                    { backgroundColor: T.primary + '15', borderColor: T.primary + '55' }
                  ]}
                >
                  <MaterialCommunityIcons name="map-marker" size={13} color={T.primary} />
                  <Text style={[s.chipText, { color: T.primary }]}>{location}</Text>
                  {editMode && (
                    <TouchableOpacity 
                      onPress={() => removePreferredLocation(location)} 
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} 
                      style={{ marginLeft: 4 }}
                    >
                      <MaterialCommunityIcons name="close" size={11} color={T.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
          
          {editMode && showAddLocation && (
            <View style={[s.addForm, { marginTop: 12, backgroundColor: T.surfaceHigh, borderColor: T.border }]}>
              <TextInput 
                style={[s.addInput, { backgroundColor: T.surface, borderColor: T.border, color: T.textPrimary }]} 
                placeholder="e.g. Makati, Metro Manila" 
                placeholderTextColor={T.textHint} 
                value={newLocation} 
                onChangeText={setNewLocation} 
              />
              <TouchableOpacity 
                style={[s.addConfirmBtn, { backgroundColor: T.primary }]} 
                onPress={addPreferredLocation}
              >
                <Text style={s.addConfirmText}>Add Location</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Sep />

        {/* ── Social Links ──────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel title="Social Links" />
          {editMode ? (
            <View style={{ gap: 12 }}>
              {[
                { key: 'linkedin', label: 'LinkedIn', icon: 'linkedin' as const, placeholder: 'https://linkedin.com/in/...' },
                { key: 'github', label: 'GitHub', icon: 'github' as const, placeholder: 'https://github.com/...' },
                { key: 'portfolio', label: 'Portfolio', icon: 'web' as const, placeholder: 'https://yourportfolio.com' },
                { key: 'twitter', label: 'Twitter / X', icon: 'twitter' as const, placeholder: 'https://twitter.com/...' },
              ].map(({ key, label, icon, placeholder }) => (
                <View key={key} style={{ gap: 6 }}>
                  <Text style={[s.fieldLabel, { color: T.textHint }]}>{label}</Text>
                  <View style={[s.heroInput, { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.surfaceHigh, borderColor: T.border, paddingHorizontal: 12 }]}>
                    <MaterialCommunityIcons name={icon} size={16} color={T.textHint} />
                    <TextInput
                      style={{ flex: 1, fontSize: 13, color: T.textPrimary, paddingVertical: 0 }}
                      placeholder={placeholder}
                      placeholderTextColor={T.textHint}
                      value={socialLinks[key] || ''}
                      onChangeText={(v) => setSocialLinks(prev => ({ ...prev, [key]: v }))}
                      keyboardType="url"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {Object.keys(socialLinks).length === 0 || Object.values(socialLinks).every(v => !v) ? (
                <Text style={{ fontSize: 13, color: T.textHint, fontStyle: 'italic', textAlign: 'center', paddingVertical: 20 }}>
                  No social links added yet
                </Text>
              ) : (
                Object.entries(socialLinks)
                  .filter(([_, url]) => url && url.trim())
                  .map(([key, url]) => {
                    const iconMap: Record<string, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
                      linkedin: 'linkedin', github: 'github', portfolio: 'web', twitter: 'twitter',
                    };
                    const labelMap: Record<string, string> = {
                      linkedin: 'LinkedIn', github: 'GitHub', portfolio: 'Portfolio', twitter: 'Twitter / X',
                    };
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[s.expRow, { paddingVertical: 6 }]}
                        onPress={() => Linking.openURL(url)}
                        activeOpacity={0.7}
                      >
                        <View style={[s.expIcon, { backgroundColor: T.primary + '18' }]}>
                          <MaterialCommunityIcons name={iconMap[key] || 'link-variant'} size={15} color={T.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[s.expRole, { color: T.textPrimary }]}>{labelMap[key] || key}</Text>
                          <Text style={[s.expMeta, { color: T.primary }]} numberOfLines={1}>{url}</Text>
                        </View>
                        <MaterialCommunityIcons name="open-in-new" size={14} color={T.textHint} />
                      </TouchableOpacity>
                    );
                  })
              )}
            </View>
          )}
        </View>

        {/* ── Sign out ─────────────────────────────────────────────────────── */}
      </ScrollView>
    </View>
  );
}



// ─── Plan card styles ─────────────────────────────────────────────────────────
const ps = StyleSheet.create({
  card:         { borderRadius: 20, borderWidth: 1.5, padding: 18 },
  top:          { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  iconWrap:     { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  name:         { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  price:        { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  badge:        { borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:    { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  sep:          { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 14 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowText:      { fontSize: 12, color: 'rgba(255,255,255,0.6)', flex: 1 },
  cta:          { marginTop: 16, borderRadius: 22, paddingVertical: 13, alignItems: 'center' },
  ctaText:      { fontSize: 13, fontWeight: '800' },
  activePill:   { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 14, justifyContent: 'center' },
  activePillText: { fontSize: 11, fontWeight: '600', color: 'rgba(168,85,247,0.6)' },
});

// ─── Main styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1 },

  coverWrap:       { width: '100%', overflow: 'hidden' },
  coverFallback:   { alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1 },
  coverEditBtn:    { position: 'absolute', bottom: 12, right: 14, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  coverEditText:   { fontSize: 11, fontWeight: '700', color: '#fff' },
  settingsBtn:     { position: 'absolute', right: 14, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, padding: 8 },

  heroRow:         { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: -38, marginBottom: 10 },
  heroInfo:        { paddingHorizontal: 24, paddingBottom: 16 },
  heroForm:        { gap: 10 },

  avatarWrap:      { position: 'relative' },
  avatar:          { width: 84, height: 84, borderRadius: 42, borderWidth: 3 },
  avatarFallback:  { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  avatarInitials:  { fontSize: 26, fontWeight: '800' },
  camBadge:        { position: 'absolute', bottom: 3, right: 3, width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },

  fieldLabel:{ fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  heroInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14 },
  name:     { fontSize: 19, fontWeight: '800', letterSpacing: -0.4 },
  headline: { fontSize: 13, marginBottom: 4 },
  locRow:   { flexDirection: 'row', alignItems: 'center', gap: 3 },
  loc:      { fontSize: 11 },

  editBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 5, marginBottom: 6 },
  editBtnSaving: { borderColor: 'rgba(74,222,128,0.3)', backgroundColor: 'rgba(74,222,128,0.07)' },
  editBtnText:   { fontSize: 11, fontWeight: '700' },

  statsCard: { flexDirection: 'row', marginHorizontal: 24, borderRadius: 16, borderWidth: 1, paddingVertical: 16 },
  stat:      { flex: 1, alignItems: 'center' },
  statVal:   { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  statLbl:   { fontSize: 10, marginTop: 3, fontWeight: '500' },
  statSep:   { width: 1 },

  applicationsBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 24, marginTop: 16, borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14 },
  applicationsBtnIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  applicationsBtnTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  applicationsBtnSub: { fontSize: 12 },

  section:   { paddingHorizontal: 24 },
  aboutText: { fontSize: 14, lineHeight: 22 },
  aboutInput:{ minHeight: 120, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, lineHeight: 22 },

  photoGrid: { flexDirection: 'row', gap: 8 },
  photoSlot: { flex: 1, aspectRatio: 0.85, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },

  chips:              { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip:               { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText:           { fontSize: 12, fontWeight: '600' },
  addBtn:             { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  addBtnText:         { fontSize: 11, fontWeight: '700' },
  skillSegment:       { gap: 10 },
  skillSegmentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  skillSegmentLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  skillDivider:       { height: 1, marginVertical: 14 },
  prefChip:           { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },

  expRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  expRole: { fontSize: 13, fontWeight: '700' },
  expMeta: { fontSize: 11, marginTop: 2 },

  addForm:       { marginTop: 16, padding: 14, borderRadius: 14, borderWidth: 1, gap: 10 },
  addInput:      { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  addConfirmBtn: { borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  addConfirmText:{ fontSize: 13, fontWeight: '700', color: '#fff' },
  
  // Document card styles
  documentCard:   { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14 },
  documentIcon:   { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  documentTitle:  { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  documentStatus: { fontSize: 12 },
  documentBtn:    { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  documentBtnText:{ fontSize: 12, fontWeight: '600' },
});

const modal = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 9999, alignItems: 'center', justifyContent: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  card: {
    width: SCREEN_W - 48,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    position: 'absolute',
    top: '30%',
  },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 10, letterSpacing: -0.5 },
  message: { fontSize: 15, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  btnRow: { flexDirection: 'row', gap: 14, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: 15, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '700' },
  confirmBtn: { flex: 1, paddingVertical: 15, borderRadius: 16, alignItems: 'center' },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
