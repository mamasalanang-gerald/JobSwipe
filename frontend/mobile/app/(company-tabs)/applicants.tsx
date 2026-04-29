import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { useTheme } from '../../theme';

const SEED_PRIMARY = '#a855f7';

export type JobPost = {
  id: number;
  title: string;
  dept: string;
  description: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  applicants: number;
  status: 'open' | 'paused';
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryHidden?: boolean;
  workType?: 'remote' | 'onsite' | 'hybrid';
  location?: string;
  skills?: { name: string; type: 'hard' | 'soft' }[];
  interviewMessage?: string;
};

export const INITIAL_JOBS: JobPost[] = [
  {
    id: 1,
    title: 'Frontend Developer',
    dept: 'Engineering',
    description: 'Build responsive and interactive user interfaces using React, TypeScript, and modern web technologies.',
    icon: 'code-braces',
    color: SEED_PRIMARY,
    applicants: 24,
    status: 'open',
    workType: 'remote',
    salaryMin: 50000,
    salaryMax: 80000,
    salaryHidden: false,
    location: 'Quezon City, Metro Manila, Philippines',
    skills: [
      { name: 'React', type: 'hard' },
      { name: 'TypeScript', type: 'hard' },
      { name: 'Communication', type: 'soft' },
    ],
    interviewMessage: "Hi! We're excited about your profile. We'd love to set up a quick screening call.",
  },
  {
    id: 2,
    title: 'UI/UX Designer',
    dept: 'Design',
    description: 'Create beautiful, intuitive designs and user experiences for digital products and applications.',
    icon: 'pencil-ruler',
    color: '#4ade80',
    applicants: 18,
    status: 'open',
    workType: 'hybrid',
    salaryMin: 45000,
    salaryMax: 70000,
    salaryHidden: false,
    location: 'Makati, Metro Manila, Philippines',
    skills: [
      { name: 'Figma', type: 'hard' },
      { name: 'Creativity', type: 'soft' },
    ],
    interviewMessage: "Thanks for applying! Let's chat about your design process.",
  },
  {
    id: 3,
    title: 'Backend Developer',
    dept: 'Engineering',
    description: 'Develop robust backend systems and APIs using Laravel, Node.js, or Python for scalable applications.',
    icon: 'server-outline',
    color: '#60a5fa',
    applicants: 11,
    status: 'paused',
    workType: 'onsite',
    salaryMin: 55000,
    salaryMax: 90000,
    salaryHidden: true,
    location: 'Taguig, Metro Manila, Philippines',
    skills: [
      { name: 'Laravel', type: 'hard' },
      { name: 'Node.js', type: 'hard' },
      { name: 'Problem Solving', type: 'soft' },
    ],
  },
];

type Filter = 'all' | 'open' | 'paused';

// ─── Shared job store (so matches.tsx can read updated jobs) ──────────────────
// In a real app this would be a context/store. For now we export a mutable ref.
export let SHARED_JOBS: JobPost[] = [...INITIAL_JOBS];
export const setSharedJobs = (jobs: JobPost[]) => { SHARED_JOBS = jobs; };

export default function JobPostingsScreen() {
  const T = useTheme();
  const tabBarHeight = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();
  const router = useRouter();

  const [jobs, setJobs] = useState<JobPost[]>(INITIAL_JOBS);
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = jobs.filter((j) => (filter === 'all' ? true : j.status === filter));

  const updateJobs = (updater: (prev: JobPost[]) => JobPost[]) => {
    setJobs((prev) => {
      const next = updater(prev);
      setSharedJobs(next);
      return next;
    });
  };

  const toggleStatus = (id: number) => {
    updateJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: j.status === 'open' ? 'paused' : 'open' } : j))
    );
  };

  const removeJob = (id: number) => {
    updateJobs((prev) => prev.filter((j) => j.id !== id));
    if (selected === id) setSelected(null);
  };

  const openCount = jobs.filter((j) => j.status === 'open').length;
  const totalApps = jobs.reduce((a, j) => a + j.applicants, 0);

  return (
    <View style={[s.screen, { paddingTop: topInset, backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.bg === '#f5f3ff' ? 'dark-content' : 'light-content'} />

      <View style={s.header}>
        <View>
          <Text style={[s.headerTitle, { color: T.textPrimary }]}>Job Posts</Text>
          <Text style={[s.headerSub, { color: T.textHint }]}>{openCount} active · {totalApps} total applicants</Text>
        </View>
        <TouchableOpacity
          style={[s.addBtn, { borderColor: T.border, backgroundColor: T.surfaceHigh }]}
          onPress={() => router.push('/(company-tabs)/CreateJobScreen' as any)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={14} color={T.primary} />
          <Text style={[s.addBtnText, { color: T.primary }]}>New Post</Text>
        </TouchableOpacity>
      </View>

      <View style={s.filterRow}>
        {(['all', 'open', 'paused'] as Filter[]).map((f) => {
          const active = filter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[
                s.filterChip,
                { backgroundColor: T.surfaceHigh, borderColor: T.border },
                active && { backgroundColor: T.primary + '18', borderColor: T.primary + '55' },
              ]}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[s.filterChipText, { color: active ? T.primary : T.textHint }]}>
                {f === 'all' ? 'All' : f === 'open' ? 'Open' : 'Paused'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: tabBarHeight + 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <MaterialCommunityIcons name="briefcase-off-outline" size={40} color={T.textHint} />
            <Text style={[s.emptyText, { color: T.textSub }]}>No job posts yet</Text>
            <Text style={[s.emptyHint, { color: T.textHint }]}>Tap "New Post" to add your first one</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selected === item.id;
          return (
            <TouchableOpacity
              style={[
                s.card,
                { backgroundColor: T.surface, borderColor: T.border },
                isSelected && { borderColor: T.primary + '66', backgroundColor: T.surfaceHigh },
              ]}
              onPress={() => setSelected(isSelected ? null : item.id)}
              activeOpacity={0.85}
            >
              <View style={s.cardTop}>
                <View style={[s.iconWrap, { backgroundColor: item.color + '18' }]}>
                  <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.cardTitle, { color: T.textPrimary }]}>{item.title}</Text>
                  <Text style={[s.cardDept, { color: T.textHint }]}>{item.dept}</Text>
                </View>
                <View style={[s.statusPill, item.status === 'open' ? s.statusOpen : { backgroundColor: T.borderFaint }]}>
                  <Text style={[s.statusText, { color: item.status === 'open' ? '#4ade80' : T.textHint }]}>
                    {item.status === 'open' ? 'Open' : 'Paused'}
                  </Text>
                </View>
              </View>

              <View style={s.cardStats}>
                <View style={s.statItem}>
                  <MaterialCommunityIcons name="account-group-outline" size={13} color={T.textHint} />
                  <Text style={[s.statText, { color: T.textHint }]}>{item.applicants} applicants</Text>
                </View>
                <View style={[s.statDot, { backgroundColor: T.textHint }]} />
                <View style={s.statItem}>
                  <MaterialCommunityIcons name="briefcase-outline" size={13} color={T.textHint} />
                  <Text style={[s.statText, { color: T.textHint }]}>{item.dept}</Text>
                </View>
                {item.workType && (
                  <>
                    <View style={[s.statDot, { backgroundColor: T.textHint }]} />
                    <View style={s.statItem}>
                      <MaterialCommunityIcons
                        name={item.workType === 'remote' ? 'home-outline' : item.workType === 'hybrid' ? 'office-building-outline' : 'map-marker-outline'}
                        size={13}
                        color={T.textHint}
                      />
                      <Text style={[s.statText, { color: T.textHint }]}>
                        {item.workType.charAt(0).toUpperCase() + item.workType.slice(1)}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {isSelected && (
                <View style={s.cardActions}>
                  <View style={[s.divider, { backgroundColor: T.borderFaint }]} />

                  {/* ── Actions Row ── */}
                  <View style={s.actionsRow}>
                    {/* View Job Post */}
                    <TouchableOpacity
                      style={s.actionBtn}
                      onPress={() =>
                        router.push({
                          pathname: '/(company-tabs)/job-applicants' as any,
                          params: { jobId: String(item.id) },
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="briefcase-eye-outline" size={15} color={T.primary} />
                      <Text style={[s.actionText, { color: T.primary }]}>View Job Post</Text>
                    </TouchableOpacity>

                    {/* Pause / Reopen */}
                    <TouchableOpacity style={s.actionBtn} onPress={() => toggleStatus(item.id)} activeOpacity={0.8}>
                      <MaterialCommunityIcons
                        name={item.status === 'open' ? 'pause-circle-outline' : 'play-circle-outline'}
                        size={15}
                        color={item.status === 'open' ? T.textHint : '#4ade80'}
                      />
                      <Text style={[s.actionText, { color: item.status === 'open' ? T.textHint : '#4ade80' }]}>
                        {item.status === 'open' ? 'Pause' : 'Reopen'}
                      </Text>
                    </TouchableOpacity>

                    {/* Delete */}
                    <TouchableOpacity style={s.actionBtn} onPress={() => removeJob(item.id)} activeOpacity={0.8}>
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
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  addBtnText: { fontSize: 12, fontWeight: '700' },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterChipText: { fontSize: 12, fontWeight: '600' },
  card: { borderRadius: 18, borderWidth: 1, padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitle: { fontSize: 14, fontWeight: '800' },
  cardDept: { fontSize: 11, marginTop: 2 },
  statusPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  statusOpen: { backgroundColor: 'rgba(74,222,128,0.1)' },
  statusText: { fontSize: 10, fontWeight: '700' },
  cardStats: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 11 },
  statDot: { width: 3, height: 3, borderRadius: 2 },
  cardActions: { marginTop: 12 },
  divider: { height: 1, marginBottom: 12 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700' },
  emptyHint: { fontSize: 13 },
});