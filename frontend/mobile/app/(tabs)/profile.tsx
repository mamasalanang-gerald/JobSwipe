import React, { useState, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Dimensions, Image, TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:          '#0f0a1e',
  surface:     '#16102a',
  surfaceHigh: '#1e1535',
  border:      'rgba(255,255,255,0.07)',
  primary:     '#a855f7',
  danger:      '#f87171',
  dangerBg:    'rgba(239,68,68,0.08)',
  textPrimary: '#ffffff',
  textSub:     'rgba(255,255,255,0.5)',
  textHint:    'rgba(255,255,255,0.28)',
  gold:        '#f59e0b',
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const HARD_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python',
  'AWS', 'GraphQL', 'Figma',
];

const SOFT_SKILLS = [
  'Leadership', 'Communication', 'Problem Solving',
  'Teamwork', 'Adaptability',
];

type ExperienceItem = {
  id: number; role: string; company: string; period: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: string;
};

type EducationItem = {
  id: number; degree: string; school: string; period: string;
};

type PrefItem = {
  id: number; label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; on: boolean;
};

const INITIAL_EXPERIENCE: ExperienceItem[] = [
  { id: 1, role: 'Senior Developer',    company: 'Tech Company', period: '2021 – Present', icon: 'code-braces', color: T.primary   },
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


// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionLabel({ title }: { title: string }) {
  return <Text style={sl.label}>{title}</Text>;
}
const sl = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 },
});

function Sep() {
  return <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 28, marginHorizontal: 24 }} />;
}

// ─── ProfileTab ───────────────────────────────────────────────────────────────
export default function ProfileTab() {
  const tabBarHeight      = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();

  const [editMode, setEditMode]         = useState(false);
  const [avatarPhoto, setAvatarPhoto]   = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto]     = useState<string | null>(null);
  const [photos, setPhotos]             = useState<(string | null)[]>([null, null, null]);

  // Editable sections
  const [experience, setExperience] = useState<ExperienceItem[]>(INITIAL_EXPERIENCE);
  const [education, setEducation]   = useState<EducationItem[]>(INITIAL_EDUCATION);
  const [prefs, setPrefs]           = useState<PrefItem[]>(INITIAL_PREFS);

  // Inline add forms
  const [showAddExp,  setShowAddExp]  = useState(false);
  const [showAddEdu,  setShowAddEdu]  = useState(false);
  const [showAddPref, setShowAddPref] = useState(false);

  const [newExp,  setNewExp]  = useState({ role: '', company: '', period: '' });
  const [newEdu,  setNewEdu]  = useState({ degree: '', school: '', period: '' });
  const [newPref, setNewPref] = useState('');

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
    <View style={s.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 40 }}>

        {/* ── Cover photo ──────────────────────────────────────────────────── */}
        <View style={[s.coverWrap, { height: 190 + topInset }]}>
          {coverPhoto
            ? <Image source={{ uri: coverPhoto }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            : <View style={[StyleSheet.absoluteFillObject, s.coverFallback]}>
                <MaterialCommunityIcons name="image-outline" size={32} color="rgba(255,255,255,0.12)" />
              </View>
          }
          {editMode && (
            <TouchableOpacity style={s.coverEditBtn} onPress={pickCover} activeOpacity={0.8}>
              <MaterialCommunityIcons name="camera-outline" size={13} color="#fff" />
              <Text style={s.coverEditText}>Edit cover</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Hero row: avatar overlaps cover ──────────────────────────────── */}
        <View style={s.heroRow}>
          <TouchableOpacity onPress={editMode ? pickAvatar : undefined} activeOpacity={0.85} style={s.avatarWrap}>
            {avatarPhoto
              ? <Image source={{ uri: avatarPhoto }} style={s.avatar} />
              : <View style={s.avatarFallback}><Text style={s.avatarInitials}>JD</Text></View>
            }
            {editMode && (
              <View style={s.camBadge}>
                <MaterialCommunityIcons name="camera" size={10} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.editBtn, editMode && s.editBtnSaving]}
            onPress={() => setEditMode(e => !e)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={editMode ? 'check' : 'pencil-outline'}
              size={13}
              color={editMode ? '#4ade80' : T.primary}
            />
            <Text style={[s.editBtnText, editMode && { color: '#4ade80' }]}>
              {editMode ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Name / headline / location ───────────────────────────────────── */}
        <View style={s.heroInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <Text style={s.name}>John Doe</Text>
            <MaterialCommunityIcons name="check-decagram" size={15} color={T.primary} />
          </View>
          <Text style={s.headline}>Full Stack Developer</Text>
          <View style={s.locRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={11} color={T.textHint} />
            <Text style={s.loc}>San Francisco, CA</Text>
          </View>
        </View>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <View style={s.statsCard}>
          {[
            { label: 'Applied',          value: '12' },
            { label: 'Pending Messages', value: '4'  },
            { label: 'Closed Messages',  value: '1'  },
          ].map((st, i) => (
            <React.Fragment key={st.label}>
              {i > 0 && <View style={s.statSep} />}
              <View style={s.stat}>
                <Text style={s.statVal}>{st.value}</Text>
                <Text style={s.statLbl}>{st.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <Sep />

        {/* ── About ────────────────────────────────────────────────────────── */}
        <View style={s.section}>
          <SectionLabel title="About" />
          <Text style={s.aboutText}>
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
              <TouchableOpacity key={i} style={s.photoSlot} onPress={() => pickPhoto(i)} activeOpacity={0.8}>
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
              <TouchableOpacity style={s.addBtn}>
                <MaterialCommunityIcons name="plus" size={12} color={T.primary} />
                <Text style={s.addBtnText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Hard Skills */}
          <View style={s.skillSegment}>
            <View style={s.skillSegmentHeader}>
              <MaterialCommunityIcons name="code-braces" size={13} color={T.primary} />
              <Text style={s.skillSegmentLabel}>Hard Skills</Text>
            </View>
            <View style={s.chips}>
              {HARD_SKILLS.map((sk, i) => (
                <View key={i} style={[s.chip, s.chipHard]}>
                  <Text style={[s.chipText, { color: T.primary }]}>{sk}</Text>
                  {editMode && (
                    <MaterialCommunityIcons name="close" size={10} color={T.primary} style={{ marginLeft: 4 }} />
                  )}
                </View>
              ))}
            </View>
          </View>

          <View style={s.skillDivider} />

          {/* Soft Skills */}
          <View style={s.skillSegment}>
            <View style={s.skillSegmentHeader}>
              <MaterialCommunityIcons name="account-heart-outline" size={13} color="#4ade80" />
              <Text style={[s.skillSegmentLabel, { color: '#4ade80' }]}>Soft Skills</Text>
            </View>
            <View style={s.chips}>
              {SOFT_SKILLS.map((sk, i) => (
                <View key={i} style={[s.chip, s.chipSoft]}>
                  <Text style={[s.chipText, { color: '#4ade80' }]}>{sk}</Text>
                  {editMode && (
                    <MaterialCommunityIcons name="close" size={10} color="#4ade80" style={{ marginLeft: 4 }} />
                  )}
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
              <TouchableOpacity style={s.addBtn} onPress={() => setShowAddExp(v => !v)}>
                <MaterialCommunityIcons name={showAddExp ? 'minus' : 'plus'} size={12} color={T.primary} />
                <Text style={s.addBtnText}>{showAddExp ? 'Cancel' : 'Add'}</Text>
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
                  <Text style={s.expRole}>{exp.role}</Text>
                  <Text style={s.expMeta}>{exp.company} · {exp.period}</Text>
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
            <View style={s.addForm}>
              <TextInput style={s.addInput} placeholder="Role / Title" placeholderTextColor={T.textHint} value={newExp.role} onChangeText={t => setNewExp(p => ({ ...p, role: t }))} />
              <TextInput style={s.addInput} placeholder="Company" placeholderTextColor={T.textHint} value={newExp.company} onChangeText={t => setNewExp(p => ({ ...p, company: t }))} />
              <TextInput style={s.addInput} placeholder="Period (e.g. 2022 – Present)" placeholderTextColor={T.textHint} value={newExp.period} onChangeText={t => setNewExp(p => ({ ...p, period: t }))} />
              <TouchableOpacity style={s.addConfirmBtn} onPress={addExperience}>
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
              <TouchableOpacity style={s.addBtn} onPress={() => setShowAddEdu(v => !v)}>
                <MaterialCommunityIcons name={showAddEdu ? 'minus' : 'plus'} size={12} color={T.primary} />
                <Text style={s.addBtnText}>{showAddEdu ? 'Cancel' : 'Add'}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ gap: 16 }}>
            {education.map((edu) => (
              <View key={edu.id} style={s.expRow}>
                <View style={[s.expIcon, { backgroundColor: 'rgba(168,85,247,0.12)' }]}>
                  <MaterialCommunityIcons name="school-outline" size={15} color={T.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.expRole}>{edu.degree}</Text>
                  <Text style={s.expMeta}>{edu.school} · {edu.period}</Text>
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
            <View style={s.addForm}>
              <TextInput style={s.addInput} placeholder="Degree / Program" placeholderTextColor={T.textHint} value={newEdu.degree} onChangeText={t => setNewEdu(p => ({ ...p, degree: t }))} />
              <TextInput style={s.addInput} placeholder="School / University" placeholderTextColor={T.textHint} value={newEdu.school} onChangeText={t => setNewEdu(p => ({ ...p, school: t }))} />
              <TextInput style={s.addInput} placeholder="Period (e.g. 2015 – 2019)" placeholderTextColor={T.textHint} value={newEdu.period} onChangeText={t => setNewEdu(p => ({ ...p, period: t }))} />
              <TouchableOpacity style={s.addConfirmBtn} onPress={addEducation}>
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
              <TouchableOpacity style={s.addBtn} onPress={() => setShowAddPref(v => !v)}>
                <MaterialCommunityIcons name={showAddPref ? 'minus' : 'plus'} size={12} color={T.primary} />
                <Text style={s.addBtnText}>{showAddPref ? 'Cancel' : 'Add'}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={s.chips}>
            {prefs.map((p) => (
              <View key={p.id} style={[s.prefChip, p.on && s.prefChipOn]}>
                <MaterialCommunityIcons name={p.icon} size={13} color={p.on ? T.primary : T.textHint} />
                <Text style={[s.chipText, p.on && { color: T.primary }]}>{p.label}</Text>
                {editMode && (
                  <TouchableOpacity onPress={() => setPrefs(prev => prev.filter(x => x.id !== p.id))} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} style={{ marginLeft: 4 }}>
                    <MaterialCommunityIcons name="close" size={11} color={p.on ? T.primary : T.textHint} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
          {editMode && showAddPref && (
            <View style={[s.addForm, { marginTop: 12 }]}>
              <TextInput style={s.addInput} placeholder="e.g. Hybrid, Contract, $150k+" placeholderTextColor={T.textHint} value={newPref} onChangeText={setNewPref} />
              <TouchableOpacity style={s.addConfirmBtn} onPress={addPref}>
                <Text style={s.addConfirmText}>Add Preference</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Sign out ─────────────────────────────────────────────────────── */}
        <TouchableOpacity style={s.signOut} activeOpacity={0.8}>
          <MaterialCommunityIcons name="logout" size={14} color={T.danger} />
          <Text style={s.signOutText}>Sign out</Text>
        </TouchableOpacity>

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
  screen: { flex: 1, backgroundColor: T.bg },

  // Cover photo
  coverWrap: {
    width: '100%',
    backgroundColor: '#1a1035',
    overflow: 'hidden',
  },
  coverFallback: {
    alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  coverEditBtn: {
    position: 'absolute', bottom: 12, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  coverEditText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  // Hero row (avatar + edit button)
  heroRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -38,
    marginBottom: 10,
  },
  heroInfo: {
    paddingHorizontal: 24, paddingBottom: 16,
  },

  // Avatar
  avatarWrap:     { position: 'relative' },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    borderWidth: 3, borderColor: T.bg,
  },
  avatarFallback: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: '#2d1b69',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: T.bg,
  },
  avatarInitials: { fontSize: 26, fontWeight: '800', color: '#fff' },
  camBadge: {
    position: 'absolute', bottom: 3, right: 3,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: T.primary, borderWidth: 2, borderColor: T.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  name:     { fontSize: 19, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  headline: { fontSize: 13, color: T.textSub, marginBottom: 4 },
  locRow:   { flexDirection: 'row', alignItems: 'center', gap: 3 },
  loc:      { fontSize: 11, color: T.textHint },
  editBtn:  {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.28)',
    borderRadius: 20, paddingHorizontal: 11, paddingVertical: 5,
    backgroundColor: 'rgba(168,85,247,0.08)',
    marginBottom: 6,
  },
  editBtnSaving:  { borderColor: 'rgba(74,222,128,0.3)', backgroundColor: 'rgba(74,222,128,0.07)' },
  editBtnText:    { fontSize: 11, fontWeight: '700', color: T.primary },

  // Stats
  statsCard: {
    flexDirection: 'row', marginHorizontal: 24,
    backgroundColor: T.surface, borderRadius: 16,
    borderWidth: 1, borderColor: T.border, paddingVertical: 16,
  },
  stat:    { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  statLbl: { fontSize: 10, color: T.textHint, marginTop: 3, fontWeight: '500' },
  statSep: { width: 1, backgroundColor: T.border },

  // Sections
  section: { paddingHorizontal: 24 },
  aboutText: { fontSize: 14, color: T.textSub, lineHeight: 22 },

  // Photos
  photoGrid: { flexDirection: 'row', gap: 8 },
  photoSlot: {
    flex: 1, aspectRatio: 0.85, borderRadius: 14,
    backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },

  // Skills
  chips:     { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border },
  chipHard:  { borderColor: 'rgba(168,85,247,0.35)', backgroundColor: 'rgba(168,85,247,0.09)' },
  chipSoft:  { borderColor: 'rgba(74,222,128,0.3)', backgroundColor: 'rgba(74,222,128,0.07)' },
  chipText:  { fontSize: 12, fontWeight: '600', color: T.textSub },
  addBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(168,85,247,0.28)', backgroundColor: 'rgba(168,85,247,0.08)' },
  addBtnText:{ fontSize: 11, fontWeight: '700', color: T.primary },
  skillSegment:       { gap: 10 },
  skillSegmentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  skillSegmentLabel:  { fontSize: 11, fontWeight: '700', color: T.primary, letterSpacing: 0.4 },
  skillDivider:       { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 14 },

  // Preferences
  prefChip:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border },
  prefChipOn: { borderColor: 'rgba(168,85,247,0.35)', backgroundColor: 'rgba(168,85,247,0.09)' },

  // Experience
  expRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  expRole: { fontSize: 13, fontWeight: '700', color: '#fff' },
  expMeta: { fontSize: 11, color: T.textHint, marginTop: 2 },


  // Sign out
  signOut: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, marginHorizontal: 24, marginTop: 28,
    paddingVertical: 13, borderRadius: 13,
    backgroundColor: T.dangerBg, borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)',
  },
  signOutText: { fontSize: 13, fontWeight: '700', color: T.danger },

  // Add forms
  addForm: {
    marginTop: 16, padding: 14, borderRadius: 14,
    backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border, gap: 10,
  },
  addInput: {
    backgroundColor: T.surface, borderRadius: 10, borderWidth: 1, borderColor: T.border,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, color: T.textPrimary,
  },
  addConfirmBtn: {
    backgroundColor: T.primary, borderRadius: 10,
    paddingVertical: 11, alignItems: 'center',
  },
  addConfirmText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});