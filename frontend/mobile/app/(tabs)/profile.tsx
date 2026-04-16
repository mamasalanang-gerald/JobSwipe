import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Dimensions, Image, TextInput,
  Modal, Switch, Animated, KeyboardEventListener
} from 'react-native';
import { useTheme, setThemeMode, getThemeMode } from '../../theme'; // ← centralized theme
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Link, router } from 'expo-router';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────
const HARD_SKILLS = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'GraphQL', 'Figma'];
const SOFT_SKILLS = ['Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Adaptability'];

type ExperienceItem = {
  id: number; role: string; company: string; period: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: string;
};

type EducationItem = { id: number; degree: string; school: string; period: string };

type PrefItem = {
  id: number; label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; on: boolean;
};

const INITIAL_EXPERIENCE: ExperienceItem[] = [
  { id: 1, role: 'Senior Developer',    company: 'Tech Company', period: '2021 – Present', icon: 'code-braces', color: '#a855f7' },
  { id: 2, role: 'Full Stack Developer', company: 'Startup Inc',  period: '2019 – 2021',   icon: 'laptop',      color: '#4ade80' },
];

const INITIAL_EDUCATION: EducationItem[] = [
  { id: 1, degree: 'BS Computer Science', school: 'University of California', period: '2015 – 2019' },
];

const INITIAL_PREFS: PrefItem[] = [
  { id: 1, label: 'Remote',    icon: 'home-outline',      on: true },
  { id: 2, label: 'Full-time', icon: 'briefcase-outline', on: true },
  { id: 3, label: '$120k+',    icon: 'currency-usd',      on: true },
];

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
function SettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const T = useTheme();
  const [isLight, setIsLight] = useState(getThemeMode() === 'light');

  const handleToggle = (val: boolean) => {
    setIsLight(val);
    setThemeMode(val ? 'light' : 'dark');
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

        {/* ── Account (placeholder rows) ── */}
        <Text style={[ss.groupLabel, { color: T.textHint }]}>Account</Text>

        {[
          { icon: 'bell-outline'         as any, label: 'Notifications',   sub: 'Manage alerts' },
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
  const [editMode, setEditMode]         = useState(false);
  const [avatarPhoto, setAvatarPhoto] = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto]   = useState<string | null>(null);
  const [photos, setPhotos]           = useState<(string | null)[]>([null, null, null]);
  const [experience, setExperience]   = useState<ExperienceItem[]>(INITIAL_EXPERIENCE);
  const [education, setEducation]     = useState<EducationItem[]>(INITIAL_EDUCATION);
  const [prefs, setPrefs]             = useState<PrefItem[]>(INITIAL_PREFS);

  const [showAddExp,  setShowAddExp]  = useState(false);
  const [showAddEdu,  setShowAddEdu]  = useState(false);
  const [showAddPref, setShowAddPref] = useState(false);
  const [newExp,  setNewExp]          = useState({ role: '', company: '', period: '' });
  const [newEdu,  setNewEdu]          = useState({ degree: '', school: '', period: '' });
  const [newPref, setNewPref]         = useState('');

  const EXP_COLORS = [T.primary, '#4ade80', '#60a5fa', '#f472b6', '#fb923c'];
  const EXP_ICONS: React.ComponentProps<typeof MaterialCommunityIcons>['name'][] =
    ['code-braces', 'laptop', 'briefcase-outline', 'rocket-launch-outline', 'office-building-outline'];

  const addExperience = () => {
    if (!newExp.role.trim()) return;
    const idx = experience.length % EXP_COLORS.length;
    setExperience(prev => [...prev, { id: Date.now(), ...newExp, icon: EXP_ICONS[idx], color: EXP_COLORS[idx] }]);
    setNewExp({ role: '', company: '', period: '' });
    setShowAddExp(false);
  };

  const addEducation = () => {
    if (!newEdu.degree.trim()) return;
    setEducation(prev => [...prev, { id: Date.now(), ...newEdu }]);
    setNewEdu({ degree: '', school: '', period: '' });
    setShowAddEdu(false);
  };

  const addPref = () => {
    if (!newPref.trim()) return;
    setPrefs(prev => [...prev, { id: Date.now(), label: newPref.trim(), icon: 'tag-outline', on: true }]);
    setNewPref('');
    setShowAddPref(false);
  };

  const pickAvatar = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (!r.canceled) setAvatarPhoto(r.assets[0].uri);
  };

  const pickCover = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [3, 1], quality: 0.85 });
    if (!r.canceled) setCoverPhoto(r.assets[0].uri);
  };

  const pickPhoto = async (i: number) => {
    const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 5], quality: 0.85 });
    if (!r.canceled) { const p = [...photos]; p[i] = r.assets[0].uri; setPhotos(p); }
  };

  return (
    <View style={[s.screen, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.bg === '#f5f3ff' ? 'dark-content' : 'light-content'} translucent backgroundColor="transparent" />

      <SettingsSheet visible={showSettings} onClose={() => setShowSettings(false)} />

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
            style={[s.settingsBtn, { backgroundColor: 'rgba(0,0,0,0.42)', borderColor: 'rgba(255,255,255,0.18)' }]}
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
            onPress={() => setEditMode(e => !e)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={editMode ? 'check' : 'pencil-outline'}
              size={13}
              color={editMode ? '#4ade80' : T.primary}
            />
            <Text style={[s.editBtnText, { color: T.primary }, editMode && { color: '#4ade80' }]}>
              {editMode ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Name / headline / location ───────────────────────────────────── */}
        <View style={s.heroInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <Text style={[s.name, { color: T.textPrimary }]}>John Doe</Text>
            <MaterialCommunityIcons name="check-decagram" size={15} color={T.primary} />
          </View>
          <Text style={[s.headline, { color: T.textSub }]}>Full Stack Developer</Text>
          <View style={s.locRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={11} color={T.textHint} />
            <Text style={[s.loc, { color: T.textHint }]}>San Francisco, CA</Text>
          </View>
        </View>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <View style={[s.statsCard, { backgroundColor: T.surface, borderColor: T.border }]}>
          {[
            { label: 'Applied',          value: '12' },
            { label: 'Pending Messages', value: '4'  },
            { label: 'Closed Messages',  value: '1'  },
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

        <Sep />

        {/* ── About ────────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel title="About" />
          <Text style={[s.aboutText, { color: T.textSub }]}>
            Passionate developer with expertise in building modern web applications.
            Strong background in React, Node.js, and cloud technologies.
          </Text>
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionLabel title="Skills" />
            {editMode && (
              <TouchableOpacity style={[s.addBtn, { borderColor: T.border, backgroundColor: T.surfaceHigh }]}>
                <MaterialCommunityIcons name="plus" size={12} color={T.primary} />
                <Text style={[s.addBtnText, { color: T.primary }]}>Add</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={s.skillSegment}>
            <View style={s.skillSegmentHeader}>
              <MaterialCommunityIcons name="code-braces" size={13} color={T.primary} />
              <Text style={[s.skillSegmentLabel, { color: T.primary }]}>Hard Skills</Text>
            </View>
            <View style={s.chips}>
              {HARD_SKILLS.map((sk, i) => (
                <View key={i} style={[s.chip, { borderColor: T.border, backgroundColor: T.surfaceHigh }]}>
                  <Text style={[s.chipText, { color: T.primary }]}>{sk}</Text>
                  {editMode && <MaterialCommunityIcons name="close" size={10} color={T.primary} style={{ marginLeft: 4 }} />}
                </View>
              ))}
            </View>
          </View>

          <View style={[s.skillDivider, { backgroundColor: T.borderFaint }]} />

          <View style={s.skillSegment}>
            <View style={s.skillSegmentHeader}>
              <MaterialCommunityIcons name="account-heart-outline" size={13} color="#4ade80" />
              <Text style={[s.skillSegmentLabel, { color: '#4ade80' }]}>Soft Skills</Text>
            </View>
            <View style={s.chips}>
              {SOFT_SKILLS.map((sk, i) => (
                <View key={i} style={[s.chip, { borderColor: T.borderFaint, backgroundColor: T.surfaceHigh }]}>
                  <Text style={[s.chipText, { color: '#4ade80' }]}>{sk}</Text>
                  {editMode && <MaterialCommunityIcons name="close" size={10} color="#4ade80" style={{ marginLeft: 4 }} />}
                </View>
              ))}
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
          <View style={{ gap: 16 }}>
            {experience.map((exp) => (
              <View key={exp.id} style={s.expRow}>
                <View style={[s.expIcon, { backgroundColor: exp.color + '18' }]}>
                  <MaterialCommunityIcons name={exp.icon} size={15} color={exp.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.expRole, { color: T.textPrimary }]}>{exp.role}</Text>
                  <Text style={[s.expMeta, { color: T.textHint }]}>{exp.company} · {exp.period}</Text>
                </View>
                {editMode && (
                  <TouchableOpacity onPress={() => setExperience(prev => prev.filter(e => e.id !== exp.id))} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialCommunityIcons name="close-circle" size={18} color={T.danger} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
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
          <View style={{ gap: 16 }}>
            {education.map((edu) => (
              <View key={edu.id} style={s.expRow}>
                <View style={[s.expIcon, { backgroundColor: T.primary + '18' }]}>
                  <MaterialCommunityIcons name="school-outline" size={15} color={T.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.expRole, { color: T.textPrimary }]}>{edu.degree}</Text>
                  <Text style={[s.expMeta, { color: T.textHint }]}>{edu.school} · {edu.period}</Text>
                </View>
                {editMode && (
                  <TouchableOpacity onPress={() => setEducation(prev => prev.filter(e => e.id !== edu.id))} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialCommunityIcons name="close-circle" size={18} color={T.danger} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
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

        {/* ── Sign out ─────────────────────────────────────────────────────── */}
        <TouchableOpacity 
          style={[s.signOut, { backgroundColor: T.dangerBg, borderColor: T.danger + '26' }]}
          onPress={handleSignOut} 
          activeOpacity={0.8}>
          <MaterialCommunityIcons name="logout" size={14} color={T.danger} />
          <Text style={[s.signOutText, { color: T.danger }]}>Sign out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const handleSignOut = async () => {
  await new Promise((r) => setTimeout(r, 600));
  router.replace('/(auth)/login');
  alert('Signed out!');
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
  settingsBtn:     { position: 'absolute', top: 12, right: 14, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  heroRow:         { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: -38, marginBottom: 10 },
  heroInfo:        { paddingHorizontal: 24, paddingBottom: 16 },

  avatarWrap:      { position: 'relative' },
  avatar:          { width: 84, height: 84, borderRadius: 42, borderWidth: 3 },
  avatarFallback:  { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  avatarInitials:  { fontSize: 26, fontWeight: '800' },
  camBadge:        { position: 'absolute', bottom: 3, right: 3, width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },

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

  section:   { paddingHorizontal: 24 },
  aboutText: { fontSize: 14, lineHeight: 22 },

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

  signOut:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginHorizontal: 24, marginTop: 28, paddingVertical: 13, borderRadius: 13, borderWidth: 1 },
  signOutText: { fontSize: 13, fontWeight: '700' },

  addForm:       { marginTop: 16, padding: 14, borderRadius: 14, borderWidth: 1, gap: 10 },
  addInput:      { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  addConfirmBtn: { borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  addConfirmText:{ fontSize: 13, fontWeight: '700', color: '#fff' },
});