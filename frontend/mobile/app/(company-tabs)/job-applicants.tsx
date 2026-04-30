import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { useTheme } from '../../theme';
import { SHARED_JOBS, setSharedJobs, JobPost } from './applicants';

type WorkType = 'remote' | 'onsite' | 'hybrid';

export default function JobDetailScreen() {
  const T = useTheme();
  const router = useRouter();
  const tabBarHeight = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();
  const params = useLocalSearchParams<{ jobId?: string }>();

  const jobId = params.jobId ? Number(params.jobId) : null;
  const job = SHARED_JOBS.find((j) => j.id === jobId) ?? null;

  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable fields
  const [title, setTitle] = useState(job?.title ?? '');
  const [dept, setDept] = useState(job?.dept ?? '');
  const [description, setDescription] = useState(job?.description ?? '');
  const [location, setLocation] = useState(job?.location ?? '');
  const [workType, setWorkType] = useState<WorkType>(job?.workType ?? 'remote');
  const [salaryMin, setSalaryMin] = useState(String(job?.salaryMin ?? ''));
  const [salaryMax, setSalaryMax] = useState(String(job?.salaryMax ?? ''));
  const [salaryHidden, setSalaryHidden] = useState(job?.salaryHidden ?? false);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<{ name: string; type: 'hard' | 'soft' }[]>(job?.skills ?? []);
  const [skillType, setSkillType] = useState<'hard' | 'soft'>('hard');
  const [interviewMessage, setInterviewMessage] = useState(job?.interviewMessage ?? '');

  if (!job) {
    return (
      <View style={[s.screen, { backgroundColor: T.bg, paddingTop: topInset }]}>
        <View style={s.notFound}>
          <MaterialCommunityIcons name="briefcase-off-outline" size={44} color={T.textHint} />
          <Text style={[s.notFoundText, { color: T.textSub }]}>Job post not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { borderColor: T.border }]}>
            <Text style={[s.backBtnText, { color: T.primary }]}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleSave = () => {
    const updatedJob: JobPost = {
      ...job,
      title: title.trim() || job.title,
      dept: dept.trim() || job.dept,
      description: description.trim() || job.description,
      location: location.trim(),
      workType,
      salaryMin: salaryMin ? Number(salaryMin) : null,
      salaryMax: salaryMax ? Number(salaryMax) : null,
      salaryHidden,
      skills,
      interviewMessage: interviewMessage.trim(),
    };
    const updated = SHARED_JOBS.map((j) => (j.id === job.id ? updatedJob : j));
    setSharedJobs(updated);
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const addSkill = () => {
    const name = skillInput.trim();
    if (!name) return;
    setSkills((prev) => [...prev, { name, type: skillType }]);
    setSkillInput('');
  };

  const removeSkill = (idx: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== idx));
  };

  const workTypes: { key: WorkType; label: string; icon: string }[] = [
    { key: 'remote', label: 'Remote', icon: 'home-outline' },
    { key: 'hybrid', label: 'Hybrid', icon: 'office-building-outline' },
    { key: 'onsite', label: 'On-site', icon: 'map-marker-outline' },
  ];

  const WORK_TYPE_COLOR: Record<WorkType, string> = {
    remote: '#60a5fa',
    hybrid: '#f59e0b',
    onsite: '#4ade80',
  };

  const currentColor = WORK_TYPE_COLOR[workType];

  return (
    <View style={[s.screen, { backgroundColor: T.bg, paddingTop: topInset }]}>
      <StatusBar barStyle={T.bg === '#f5f3ff' ? 'dark-content' : 'light-content'} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backRow} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={T.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[s.headerTitle, { color: T.textPrimary }]} numberOfLines={1}>
            {isEditing ? 'Edit Job Post' : 'Job Post'}
          </Text>
          <Text style={[s.headerSub, { color: T.textHint }]}>
            {job.dept} · {job.applicants} applicants
          </Text>
        </View>
        {saved && (
          <View style={[s.savedBadge, { backgroundColor: '#4ade8022' }]}>
            <MaterialCommunityIcons name="check-circle-outline" size={13} color="#4ade80" />
            <Text style={s.savedText}>Saved</Text>
          </View>
        )}
        {!isEditing ? (
          <TouchableOpacity
            style={[s.editBtn, { borderColor: T.border, backgroundColor: T.surfaceHigh }]}
            onPress={() => setIsEditing(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="pencil-outline" size={14} color={T.primary} />
            <Text style={[s.editBtnText, { color: T.primary }]}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.editActions}>
            <TouchableOpacity
              style={[s.cancelBtn, { borderColor: T.border }]}
              onPress={() => {
                // Reset fields to current saved values
                setTitle(job.title);
                setDept(job.dept);
                setDescription(job.description);
                setLocation(job.location ?? '');
                setWorkType(job.workType ?? 'remote');
                setSalaryMin(String(job.salaryMin ?? ''));
                setSalaryMax(String(job.salaryMax ?? ''));
                setSalaryHidden(job.salaryHidden ?? false);
                setSkills(job.skills ?? []);
                setInterviewMessage(job.interviewMessage ?? '');
                setIsEditing(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={[s.cancelBtnText, { color: T.textSub }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.saveBtn, { backgroundColor: T.primary }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="content-save-outline" size={13} color="#fff" />
              <Text style={s.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: tabBarHeight + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Job Icon + Status Banner ── */}
        <View style={[s.heroBanner, { backgroundColor: job.color + '12', borderColor: job.color + '30' }]}>
          <View style={[s.heroIcon, { backgroundColor: job.color + '22' }]}>
            <MaterialCommunityIcons name={job.icon} size={28} color={job.color} />
          </View>
          <View style={{ flex: 1 }}>
            {isEditing ? (
              <>
                <TextInput
                  style={[s.titleInput, { color: T.textPrimary, borderColor: T.border, backgroundColor: T.surface }]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Job title"
                  placeholderTextColor={T.textHint}
                />
                <TextInput
                  style={[s.deptInput, { color: T.textSub, borderColor: T.border, backgroundColor: T.surface }]}
                  value={dept}
                  onChangeText={setDept}
                  placeholder="Department"
                  placeholderTextColor={T.textHint}
                />
              </>
            ) : (
              <>
                <Text style={[s.heroTitle, { color: T.textPrimary }]}>{job.title}</Text>
                <Text style={[s.heroDept, { color: T.textSub }]}>{job.dept}</Text>
              </>
            )}
          </View>
          <View style={[s.statusBadge, job.status === 'open' ? s.statusOpen : { backgroundColor: T.borderFaint }]}>
            <View style={[s.statusDot, { backgroundColor: job.status === 'open' ? '#4ade80' : T.textHint }]} />
            <Text style={[s.statusLabel, { color: job.status === 'open' ? '#4ade80' : T.textHint }]}>
              {job.status === 'open' ? 'Open' : 'Paused'}
            </Text>
          </View>
        </View>

        {/* ── Quick Stats ── */}
        <View style={s.statsRow}>
          <View style={[s.statBox, { backgroundColor: T.surface, borderColor: T.border }]}>
            <MaterialCommunityIcons name="account-group-outline" size={16} color={T.primary} />
            <Text style={[s.statVal, { color: T.textPrimary }]}>{job.applicants}</Text>
            <Text style={[s.statLbl, { color: T.textHint }]}>Applicants</Text>
          </View>
          <View style={[s.statBox, { backgroundColor: T.surface, borderColor: T.border }]}>
            <MaterialCommunityIcons
              name={workType === 'remote' ? 'home-outline' : workType === 'hybrid' ? 'office-building-outline' : 'map-marker-outline'}
              size={16}
              color={WORK_TYPE_COLOR[workType]}
            />
            <Text style={[s.statVal, { color: T.textPrimary, fontSize: 12 }]}>
              {workType.charAt(0).toUpperCase() + workType.slice(1)}
            </Text>
            <Text style={[s.statLbl, { color: T.textHint }]}>Work Type</Text>
          </View>
          <View style={[s.statBox, { backgroundColor: T.surface, borderColor: T.border }]}>
            <MaterialCommunityIcons name="currency-usd" size={16} color="#f59e0b" />
            <Text style={[s.statVal, { color: T.textPrimary, fontSize: 11 }]} numberOfLines={1}>
              {salaryHidden
                ? 'Hidden'
                : salaryMin && salaryMax
                ? `${Number(salaryMin) / 1000}k–${Number(salaryMax) / 1000}k`
                : 'N/A'}
            </Text>
            <Text style={[s.statLbl, { color: T.textHint }]}>Salary</Text>
          </View>
        </View>

        {/* ── Description ── */}
        <Section title="Description" icon="text-box-outline" T={T}>
          {isEditing ? (
            <TextInput
              style={[s.textArea, { color: T.textPrimary, borderColor: T.border, backgroundColor: T.surface }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the role…"
              placeholderTextColor={T.textHint}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          ) : (
            <Text style={[s.bodyText, { color: T.textPrimary }]}>{description || '—'}</Text>
          )}
        </Section>

        {/* ── Location ── */}
        <Section title="Location" icon="map-marker-outline" T={T}>
          {isEditing ? (
            <TextInput
              style={[s.fieldInput, { color: T.textPrimary, borderColor: T.border, backgroundColor: T.surface }]}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Quezon City, Metro Manila"
              placeholderTextColor={T.textHint}
            />
          ) : (
            <Text style={[s.bodyText, { color: T.textPrimary }]}>{location || '—'}</Text>
          )}
        </Section>

        {/* ── Work Type ── */}
        <Section title="Work Type" icon="laptop" T={T}>
          <View style={s.workTypeRow}>
            {workTypes.map((wt) => {
              const active = workType === wt.key;
              const c = WORK_TYPE_COLOR[wt.key];
              return (
                <TouchableOpacity
                  key={wt.key}
                  style={[
                    s.workTypeChip,
                    { borderColor: T.border, backgroundColor: T.surface },
                    active && { borderColor: c + '66', backgroundColor: c + '18' },
                    !isEditing && !active && s.workTypeChipDisabled,
                  ]}
                  onPress={() => isEditing && setWorkType(wt.key)}
                  activeOpacity={isEditing ? 0.8 : 1}
                >
                  <MaterialCommunityIcons name={wt.icon as any} size={14} color={active ? c : T.textHint} />
                  <Text style={[s.workTypeText, { color: active ? c : T.textHint }]}>{wt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* ── Salary ── */}
        <Section title="Salary" icon="currency-usd" T={T}>
          {isEditing ? (
            <>
              <View style={s.salaryRow}>
                <View style={s.salaryField}>
                  <Text style={[s.salaryLabel, { color: T.textHint }]}>Min</Text>
                  <TextInput
                    style={[s.fieldInput, { color: T.textPrimary, borderColor: T.border, backgroundColor: T.surface }]}
                    value={salaryMin}
                    onChangeText={setSalaryMin}
                    placeholder="50000"
                    placeholderTextColor={T.textHint}
                    keyboardType="numeric"
                  />
                </View>
                <MaterialCommunityIcons name="minus" size={14} color={T.textHint} style={{ marginTop: 24 }} />
                <View style={s.salaryField}>
                  <Text style={[s.salaryLabel, { color: T.textHint }]}>Max</Text>
                  <TextInput
                    style={[s.fieldInput, { color: T.textPrimary, borderColor: T.border, backgroundColor: T.surface }]}
                    value={salaryMax}
                    onChangeText={setSalaryMax}
                    placeholder="80000"
                    placeholderTextColor={T.textHint}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={s.switchRow}>
                <Text style={[s.switchLabel, { color: T.textSub }]}>Hide salary from applicants</Text>
                <Switch
                  value={salaryHidden}
                  onValueChange={setSalaryHidden}
                  trackColor={{ false: T.borderFaint, true: T.primary + '88' }}
                  thumbColor={salaryHidden ? T.primary : T.textHint}
                />
              </View>
            </>
          ) : (
            <Text style={[s.bodyText, { color: T.textPrimary }]}>
              {salaryHidden
                ? 'Hidden from applicants'
                : salaryMin && salaryMax
                ? `₱${Number(salaryMin).toLocaleString()} – ₱${Number(salaryMax).toLocaleString()} / year`
                : 'Not specified'}
            </Text>
          )}
        </Section>

        {/* ── Skills ── */}
        <Section title="Required Skills" icon="tag-multiple-outline" T={T}>
          <View style={s.skillsWrap}>
            {skills.map((sk, i) => (
              <View
                key={i}
                style={[
                  s.skillChip,
                  {
                    backgroundColor: sk.type === 'hard' ? T.primary + '18' : '#f59e0b18',
                    borderColor: sk.type === 'hard' ? T.primary + '40' : '#f59e0b40',
                  },
                ]}
              >
                <Text style={[s.skillChipText, { color: sk.type === 'hard' ? T.primary : '#f59e0b' }]}>
                  {sk.name}
                </Text>
                <Text style={[s.skillTypeBadge, { color: sk.type === 'hard' ? T.primary : '#f59e0b', opacity: 0.6 }]}>
                  {sk.type}
                </Text>
                {isEditing && (
                  <TouchableOpacity onPress={() => removeSkill(i)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                    <MaterialCommunityIcons name="close" size={11} color={T.textHint} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {skills.length === 0 && (
              <Text style={[s.bodyText, { color: T.textHint }]}>No skills added yet</Text>
            )}
          </View>
          {isEditing && (
            <View style={s.addSkillRow}>
              <TextInput
                style={[s.skillInput, { color: T.textPrimary, borderColor: T.border, backgroundColor: T.surface }]}
                value={skillInput}
                onChangeText={setSkillInput}
                placeholder="Add a skill…"
                placeholderTextColor={T.textHint}
                onSubmitEditing={addSkill}
                returnKeyType="done"
              />
              <View style={s.skillTypeToggle}>
                {(['hard', 'soft'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      s.skillTypeBtn,
                      { borderColor: T.border, backgroundColor: T.surface },
                      skillType === t && { backgroundColor: T.primary + '22', borderColor: T.primary + '55' },
                    ]}
                    onPress={() => setSkillType(t)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.skillTypeBtnText, { color: skillType === t ? T.primary : T.textHint }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[s.addSkillBtn, { backgroundColor: T.primary }]}
                onPress={addSkill}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="plus" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </Section>

        {/* ── Interview Message ── */}
        <Section title="Interview Invitation Message" icon="message-text-outline" T={T}>
          {isEditing ? (
            <TextInput
              style={[s.textArea, { color: T.textPrimary, borderColor: T.border, backgroundColor: T.surface }]}
              value={interviewMessage}
              onChangeText={setInterviewMessage}
              placeholder="e.g. Hi! We loved your profile. Let's set up a call…"
              placeholderTextColor={T.textHint}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          ) : (
            <View style={[s.messageBox, { backgroundColor: T.primary + '0D', borderColor: T.primary + '30' }]}>
              <MaterialCommunityIcons name="format-quote-open" size={16} color={T.primary} style={{ opacity: 0.6 }} />
              <Text style={[s.bodyText, { color: T.textPrimary, flex: 1 }]}>
                {interviewMessage || 'No interview message set.'}
              </Text>
            </View>
          )}
        </Section>

        {/* ── Save button at bottom (edit mode) ── */}
        {isEditing && (
          <TouchableOpacity
            style={[s.saveBottomBtn, { backgroundColor: T.primary }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="content-save-outline" size={18} color="#fff" />
            <Text style={s.saveBottomBtnText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title, icon, T, children,
}: {
  title: string; icon: string; T: any; children: React.ReactNode;
}) {
  return (
    <View style={[sc.wrap, { backgroundColor: T.surface, borderColor: T.border }]}>
      <View style={sc.titleRow}>
        <MaterialCommunityIcons name={icon as any} size={14} color={T.textHint} />
        <Text style={[sc.title, { color: T.textHint }]}>{title.toUpperCase()}</Text>
      </View>
      {children}
    </View>
  );
}

const sc = StyleSheet.create({
  wrap: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  title: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12,
  },
  backRow: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  headerSub: { fontSize: 12, marginTop: 1 },

  savedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  savedText: { fontSize: 11, color: '#4ade80', fontWeight: '700' },

  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
  },
  editBtnText: { fontSize: 12, fontWeight: '700' },
  editActions: { flexDirection: 'row', gap: 6 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  cancelBtnText: { fontSize: 12, fontWeight: '600' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  saveBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  heroBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 12,
  },
  heroIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heroTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  heroDept: { fontSize: 12, marginTop: 3 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusOpen: { backgroundColor: 'rgba(74,222,128,0.1)' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 10, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statBox: { flex: 1, borderRadius: 14, borderWidth: 1, alignItems: 'center', paddingVertical: 12, gap: 3 },
  statVal: { fontSize: 15, fontWeight: '900', letterSpacing: -0.3 },
  statLbl: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },

  bodyText: { fontSize: 13, lineHeight: 21 },

  fieldInput: {
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 13,
  },
  titleInput: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
    fontSize: 15, fontWeight: '700', marginBottom: 5,
  },
  deptInput: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
    fontSize: 12,
  },
  textArea: {
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, minHeight: 90,
  },

  workTypeRow: { flexDirection: 'row', gap: 8 },
  workTypeChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 9, borderRadius: 12, borderWidth: 1,
  },
  workTypeChipDisabled: { opacity: 0.4 },
  workTypeText: { fontSize: 12, fontWeight: '600' },

  salaryRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 10 },
  salaryField: { flex: 1 },
  salaryLabel: { fontSize: 11, fontWeight: '600', marginBottom: 5 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  switchLabel: { fontSize: 13 },

  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 10 },
  skillChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1,
  },
  skillChipText: { fontSize: 12, fontWeight: '600' },
  skillTypeBadge: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  addSkillRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  skillInput: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13 },
  skillTypeToggle: { flexDirection: 'row', gap: 4 },
  skillTypeBtn: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 9, borderWidth: 1 },
  skillTypeBtnText: { fontSize: 11, fontWeight: '600' },
  addSkillBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  messageBox: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },

  saveBottomBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 20, paddingVertical: 16, marginTop: 8,
  },
  saveBottomBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, fontWeight: '600' },
  backBtn: { paddingHorizontal: 20, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  backBtnText: { fontSize: 14, fontWeight: '600' },
});