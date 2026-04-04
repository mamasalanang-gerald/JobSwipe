import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, SafeAreaView, StatusBar, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';

// ─── Theme — matches profile.tsx ─────────────────────────────────────────────
const T = {
  bg:          '#0f0a1e',
  surface:     '#16102a',
  surfaceHigh: '#1e1535',
  border:      'rgba(255,255,255,0.07)',
  primary:     '#a855f7',
  pink:        '#e91e8c',
  danger:      '#f87171',
  dangerBg:    'rgba(239,68,68,0.08)',
  textPrimary: '#ffffff',
  textSub:     'rgba(255,255,255,0.5)',
  textHint:    'rgba(255,255,255,0.28)',
};

// ─── Shared job data (mirrors profile.tsx) ────────────────────────────────────
export type JobPost = {
  id: number;
  title: string;
  dept: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  applicants: number;
  status: 'open' | 'paused';
};

export const INITIAL_JOBS: JobPost[] = [
  { id: 1, title: 'Frontend Developer', dept: 'Engineering', icon: 'code-braces',    color: T.primary,  applicants: 24, status: 'open'   },
  { id: 2, title: 'UI/UX Designer',     dept: 'Design',      icon: 'pencil-ruler',   color: '#4ade80',  applicants: 18, status: 'open'   },
  { id: 3, title: 'Backend Developer',  dept: 'Engineering', icon: 'server-outline', color: '#60a5fa',  applicants: 11, status: 'paused' },
];

type Filter = 'all' | 'open' | 'paused';

export default function JobPostingsScreen() {
  const tabBarHeight      = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();

  const [jobs, setJobs]         = useState<JobPost[]>(INITIAL_JOBS);
  const [filter, setFilter]     = useState<Filter>('all');
  const [showAdd, setShowAdd]   = useState(false);
  const [newJob, setNewJob]     = useState({ title: '', dept: '' });
  const [selected, setSelected] = useState<number | null>(null);

  const JOB_COLORS = [T.primary, '#4ade80', '#60a5fa', '#f472b6', '#fb923c'];
  const JOB_ICONS: React.ComponentProps<typeof MaterialCommunityIcons>['name'][] = [
    'code-braces', 'pencil-ruler', 'server-outline', 'chart-line', 'account-group-outline',
  ];

  const filtered = jobs.filter(j => filter === 'all' ? true : j.status === filter);

  const addJob = () => {
    if (!newJob.title.trim()) return;
    const idx = jobs.length % JOB_COLORS.length;
    setJobs(prev => [...prev, {
      id: Date.now(),
      title: newJob.title,
      dept: newJob.dept || 'General',
      icon: JOB_ICONS[idx],
      color: JOB_COLORS[idx],
      applicants: 0,
      status: 'open',
    }]);
    setNewJob({ title: '', dept: '' });
    setShowAdd(false);
  };

  const toggleStatus = (id: number) => {
    setJobs(prev => prev.map(j =>
      j.id === id ? { ...j, status: j.status === 'open' ? 'paused' : 'open' } : j
    ));
  };

  const removeJob = (id: number) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    if (selected === id) setSelected(null);
  };

  const openCount   = jobs.filter(j => j.status === 'open').length;
  const totalApps   = jobs.reduce((a, j) => a + j.applicants, 0);

  return (
    <View style={[s.screen, { paddingTop: topInset }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Job Posts</Text>
          <Text style={s.headerSub}>{openCount} active · {totalApps} total applicants</Text>
        </View>
        <TouchableOpacity
          style={[s.addBtn, showAdd && s.addBtnCancel]}
          onPress={() => setShowAdd(v => !v)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={showAdd ? 'close' : 'plus'}
            size={14}
            color={showAdd ? T.danger : T.primary}
          />
          <Text style={[s.addBtnText, showAdd && { color: T.danger }]}>
            {showAdd ? 'Cancel' : 'New Post'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Add Job Form ── */}
      {showAdd && (
        <View style={s.addForm}>
          <TextInput
            style={s.addInput}
            placeholder="Job Title  e.g. React Native Developer"
            placeholderTextColor={T.textHint}
            value={newJob.title}
            onChangeText={t => setNewJob(p => ({ ...p, title: t }))}
          />
          <TextInput
            style={s.addInput}
            placeholder="Department  e.g. Engineering, Design"
            placeholderTextColor={T.textHint}
            value={newJob.dept}
            onChangeText={t => setNewJob(p => ({ ...p, dept: t }))}
          />
          <TouchableOpacity style={s.postBtn} onPress={addJob} activeOpacity={0.85}>
            <MaterialCommunityIcons name="briefcase-plus-outline" size={15} color="#fff" />
            <Text style={s.postBtnText}>Post Job</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Filter chips ── */}
      <View style={s.filterRow}>
        {(['all', 'open', 'paused'] as Filter[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[s.filterChip, filter === f && s.filterChipActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            <Text style={[s.filterChipText, filter === f && s.filterChipTextActive]}>
              {f === 'all' ? 'All' : f === 'open' ? '🟢 Open' : '⏸ Paused'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Job Cards ── */}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: tabBarHeight + 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <MaterialCommunityIcons name="briefcase-off-outline" size={40} color={T.textHint} />
            <Text style={s.emptyText}>No job posts yet</Text>
            <Text style={s.emptyHint}>Tap "New Post" to add your first one</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selected === item.id;
          return (
            <TouchableOpacity
              style={[s.card, isSelected && s.cardSelected]}
              onPress={() => setSelected(isSelected ? null : item.id)}
              activeOpacity={0.85}
            >
              {/* Top row */}
              <View style={s.cardTop}>
                <View style={[s.iconWrap, { backgroundColor: item.color + '18' }]}>
                  <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{item.title}</Text>
                  <Text style={s.cardDept}>{item.dept}</Text>
                </View>
                <View style={[
                  s.statusPill,
                  item.status === 'open' ? s.statusOpen : s.statusPaused,
                ]}>
                  <Text style={[
                    s.statusText,
                    { color: item.status === 'open' ? '#4ade80' : T.textHint },
                  ]}>
                    {item.status === 'open' ? 'Open' : 'Paused'}
                  </Text>
                </View>
              </View>

              {/* Stats row */}
              <View style={s.cardStats}>
                <View style={s.statItem}>
                  <MaterialCommunityIcons name="account-group-outline" size={13} color={T.textHint} />
                  <Text style={s.statText}>{item.applicants} applicants</Text>
                </View>
                <View style={s.statDot} />
                <View style={s.statItem}>
                  <MaterialCommunityIcons name="briefcase-outline" size={13} color={T.textHint} />
                  <Text style={s.statText}>{item.dept}</Text>
                </View>
              </View>

              {/* Expanded actions */}
              {isSelected && (
                <View style={s.cardActions}>
                  <View style={s.divider} />
                  <View style={s.actionsRow}>

                    <TouchableOpacity
                      style={s.actionBtn}
                      onPress={() => toggleStatus(item.id)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons
                        name={item.status === 'open' ? 'pause-circle-outline' : 'play-circle-outline'}
                        size={15}
                        color={item.status === 'open' ? T.textHint : '#4ade80'}
                      />
                      <Text style={[s.actionText, { color: item.status === 'open' ? T.textHint : '#4ade80' }]}>
                        {item.status === 'open' ? 'Pause' : 'Reopen'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={s.actionBtn} activeOpacity={0.8}>
                      <MaterialCommunityIcons name="account-search-outline" size={15} color={T.primary} />
                      <Text style={[s.actionText, { color: T.primary }]}>View Applicants</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={s.actionBtn}
                      onPress={() => removeJob(item.id)}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={15} color={T.danger} />
                      <Text style={[s.actionText, { color: T.danger }]}>Delete</Text>
                    </TouchableOpacity>

                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: T.bg },

  // Header
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle:  { fontSize: 22, fontWeight: '800', color: T.textPrimary, letterSpacing: -0.5 },
  headerSub:    { fontSize: 12, color: T.textHint, marginTop: 2 },

  // Add button
  addBtn:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)', backgroundColor: 'rgba(168,85,247,0.08)' },
  addBtnCancel: { borderColor: 'rgba(248,113,113,0.3)', backgroundColor: 'rgba(248,113,113,0.08)' },
  addBtnText:   { fontSize: 12, fontWeight: '700', color: T.primary },

  // Add form
  addForm:      { marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 16, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, gap: 10 },
  addInput:     { backgroundColor: T.bg, borderRadius: 10, borderWidth: 1, borderColor: T.border, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: T.textPrimary },
  postBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: T.primary, borderRadius: 10, paddingVertical: 12 },
  postBtnText:  { fontSize: 13, fontWeight: '700', color: '#fff' },

  // Filter chips
  filterRow:          { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 4 },
  filterChip:         { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: T.surfaceHigh, borderWidth: 1, borderColor: T.border },
  filterChipActive:   { backgroundColor: 'rgba(233,30,140,0.12)', borderColor: 'rgba(233,30,140,0.35)' },
  filterChipText:     { fontSize: 12, fontWeight: '600', color: T.textHint },
  filterChipTextActive: { color: '#e91e8c' },

  // Cards
  card:         { backgroundColor: T.surface, borderRadius: 18, borderWidth: 1, borderColor: T.border, padding: 16 },
  cardSelected: { borderColor: 'rgba(168,85,247,0.4)', backgroundColor: '#1a1230' },
  cardTop:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap:     { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitle:    { fontSize: 14, fontWeight: '800', color: T.textPrimary },
  cardDept:     { fontSize: 11, color: T.textHint, marginTop: 2 },

  // Status pill
  statusPill:   { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  statusOpen:   { backgroundColor: 'rgba(74,222,128,0.1)' },
  statusPaused: { backgroundColor: 'rgba(255,255,255,0.06)' },
  statusText:   { fontSize: 10, fontWeight: '700' },

  // Stats
  cardStats:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  statItem:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText:     { fontSize: 11, color: T.textHint },
  statDot:      { width: 3, height: 3, borderRadius: 2, backgroundColor: T.textHint },

  // Expanded actions
  cardActions:  { marginTop: 12 },
  divider:      { height: 1, backgroundColor: T.border, marginBottom: 12 },
  actionsRow:   { flexDirection: 'row', justifyContent: 'space-around' },
  actionBtn:    { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText:   { fontSize: 12, fontWeight: '600' },

  // Empty
  empty:        { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyText:    { fontSize: 16, fontWeight: '700', color: T.textSub },
  emptyHint:    { fontSize: 13, color: T.textHint },
});