import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { BASE_CAROUSEL, GRID_JOBS, TAG_STYLES, filterJobs, type Job, type TagVariant } from '../../constants/jobs';

function TagPill({ label, variant }: { label: string; variant: TagVariant }) {
  const st = TAG_STYLES[variant];
  return (
    <View style={[s.tag, { backgroundColor: st.bg, borderColor: st.border }]}>
      <Text style={[s.tagText, { color: st.text }]}>{label}</Text>
    </View>
  );
}

function JobListCard({ job, onPress }: { job: Job; onPress: (job: Job) => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(job)}>
      <ImageBackground source={job.image} style={s.card} imageStyle={s.cardImg}>
        <View style={s.scrim} />
        <View style={s.cardTop}>
          <View style={[s.logo, { backgroundColor: job.accentColor }]}>
            <Text style={s.logoText}>{job.abbr}</Text>
          </View>
        </View>

        <View style={s.cardBody}>
          <Text style={s.role} numberOfLines={2}>{job.role}</Text>
          <Text style={s.company}>{job.company}</Text>
          <Text style={s.meta}>{job.location}</Text>
          <Text style={s.salary}>{job.salary}</Text>

          <View style={s.tagRow}>
            {job.tags.map(tag => (
              <TagPill key={`${job.id}-${tag.label}`} label={tag.label} variant={tag.variant} />
            ))}
          </View>
        </View>

        <View style={s.cardFooter}>
          <Text style={s.footerText}>{job.applicants} applied</Text>
          <Text style={s.footerText}>{job.posted}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

export default function AllJobsScreen() {
  const T = useTheme();
  const router = useRouter();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const params = useLocalSearchParams<{ filter?: string; search?: string; source?: string }>();

  const activeFilter = typeof params.filter === 'string' ? params.filter : 'All';
  const search = typeof params.search === 'string' ? params.search : '';
  const source = typeof params.source === 'string' ? params.source : 'explore';
  const jobs = source === 'top-matches'
    ? BASE_CAROUSEL
    : filterJobs(GRID_JOBS, activeFilter, search);

  const handleOpenJob = (job: Job) => {
    router.push({ pathname: '/jobs/[id]', params: { id: String(job.id) } });
  };

  const title = source === 'top-matches' ? 'Top matches' : 'All jobs';
  const subtitle = source === 'top-matches'
    ? `${jobs.length} strongest matches for you`
    : search.trim().length > 0
      ? `${jobs.length} results for "${search.trim()}"`
      : `${jobs.length} jobs`;

  return (
    <View style={[s.screen, { backgroundColor: T.bg, paddingTop: topInset }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={T.bg === '#f5f3ff' ? 'dark-content' : 'light-content'} />

      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={T.textPrimary} />
        </TouchableOpacity>
        <View style={s.headerCopy}>
          <Text style={[s.title, { color: T.textPrimary }]}>{title}</Text>
          <Text style={[s.subtitle, { color: T.textSub }]}>{subtitle}</Text>
        </View>
      </View>

      {source !== 'top-matches' && activeFilter !== 'All' && (
        <View style={[s.filterPill, { backgroundColor: T.surface, borderColor: T.borderFaint }]}>
          <MaterialCommunityIcons name="tune-variant" size={14} color={T.primary} />
          <Text style={[s.filterText, { color: T.textPrimary }]}>{activeFilter}</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: bottomInset + 24 }]}
      >
        {jobs.length === 0 ? (
          <View style={s.empty}>
            <MaterialCommunityIcons name="briefcase-search-outline" size={36} color={T.borderFaint} />
            <Text style={[s.emptyTitle, { color: T.textPrimary }]}>No matching jobs</Text>
            <Text style={[s.emptyText, { color: T.textSub }]}>Try a different search or filter from Explore.</Text>
          </View>
        ) : (
          jobs.map(job => (
            <View key={job.id} style={s.cardWrap}>
              <JobListCard job={job} onPress={handleOpenJob} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  filterPill: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 18,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: { fontSize: 12, fontWeight: '700' },
  scroll: {
    paddingHorizontal: 20,
  },
  cardWrap: {
    marginBottom: 14,
  },
  card: {
    minHeight: 180,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 18,
    justifyContent: 'space-between',
  },
  cardImg: { borderRadius: 24 },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,5,30,0.8)',
    borderRadius: 24,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  cardBody: { gap: 4 },
  role: { color: '#fff', fontSize: 19, fontWeight: '800' },
  company: { color: 'rgba(255,255,255,0.82)', fontSize: 13, fontWeight: '700' },
  meta: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  salary: { color: '#c084fc', fontSize: 14, fontWeight: '700', marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: { fontSize: 11, fontWeight: '700' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 72,
    gap: 10,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center', maxWidth: 240 },
});
