import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import {
  PageHeader, SearchBar, FilterChips, SectionCard,
  JobCardHeader, JobCardPosition, JobCardLocation, JobCardTags, JobCardMatchBar,
  TextButton, OutlineButton,
  TagBadge,
  Colors, Typography, Spacing, Radii, Shadows, cardBase,
} from '../../components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ─── Data ────────────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Remote', 'Hybrid', 'On-site', 'Startup', 'Enterprise'];

const JOBS = [
  {
    id: 1, company: 'TechFlow Inc', abbr: 'TF', logoColor: Colors.primary,
    rating: 4.8, position: 'Senior React Native Engineer', salary: '$120k – $150k',
    location: 'San Francisco · Remote',
    tags: [{ label: 'Remote', variant: 'primary' as const }, { label: 'Full-time', variant: 'success' as const }],
    match: 92, posted: '2h ago', applicants: 34,
  },
  {
    id: 2, company: 'InnovateLabs', abbr: 'IL', logoColor: Colors.warning,
    rating: 4.6, position: 'Product Designer', salary: '$100k – $130k',
    location: 'New York · Hybrid',
    tags: [{ label: 'Hybrid', variant: 'primary' as const }, { label: 'Full-time', variant: 'success' as const }],
    match: 78, posted: '5h ago', applicants: 61,
  },
  {
    id: 3, company: 'DataStream', abbr: 'DS', logoColor: Colors.success,
    rating: 4.9, position: 'ML Engineer', salary: '$140k – $180k',
    location: 'Boston · On-site',
    tags: [{ label: 'On-site', variant: 'warning' as const }, { label: 'Full-time', variant: 'success' as const }],
    match: 85, posted: '1d ago', applicants: 22,
  },
  {
    id: 4, company: 'CloudPeak', abbr: 'CP', logoColor: Colors.sky,
    rating: 4.7, position: 'Backend Engineer', salary: '$110k – $140k',
    location: 'Austin · Remote',
    tags: [{ label: 'Remote', variant: 'primary' as const }, { label: 'Contract', variant: 'warning' as const }],
    match: 88, posted: '3h ago', applicants: 15,
  },
  {
    id: 5, company: 'Nexus AI', abbr: 'NA', logoColor: Colors.violet,
    rating: 4.5, position: 'AI Product Manager', salary: '$130k – $160k',
    location: 'Seattle · Hybrid',
    tags: [{ label: 'Hybrid', variant: 'primary' as const }, { label: 'Full-time', variant: 'success' as const }],
    match: 74, posted: '2d ago', applicants: 89,
  },
  {
    id: 6, company: 'Pixel Works', abbr: 'PW', logoColor: Colors.rose,
    rating: 4.6, position: 'iOS Engineer', salary: '$115k – $145k',
    location: 'Los Angeles · Remote',
    tags: [{ label: 'Remote', variant: 'primary' as const }, { label: 'Full-time', variant: 'success' as const }],
    match: 81, posted: '6h ago', applicants: 44,
  },
] as const;

// ─── JobsTab ─────────────────────────────────────────────────────────────────
export default function JobsTab() {
  const tabBarHeight = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [savedIds, setSavedIds] = useState<number[]>([2, 5]);

  const toggleSave = (id: number) =>
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const filtered = JOBS.filter(j => {
    const matchesFilter =
      activeFilter === 'All' ||
      j.tags.some(t => t.label === activeFilter) ||
      j.location.includes(activeFilter);
    const matchesSearch =
      j.position.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={[s.screen, { paddingTop: topInset }]}>
      <StatusBar barStyle="dark-content" />

      <PageHeader
        title="Browse Jobs"
        subtitle={`${JOBS.length} opportunities`}
        action
        actionIcon="tune-variant"
        onActionPress={() => {}}
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search roles, companies..."
        onClear={() => setSearch('')}
      />

      <FilterChips
        options={FILTERS}
        active={activeFilter}
        onSelect={setActiveFilter}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.list, { paddingBottom: tabBarHeight + 16 }]}>
        {filtered.length === 0 && (
          <View style={s.noResults}>
            <MaterialCommunityIcons name="magnify-close" size={32} color={Colors.gray300} />
            <Text style={s.noResultsText}>No results for "{search}"</Text>
          </View>
        )}

        {filtered.map(job => {
          const isSaved = savedIds.includes(job.id);
          return (
            <View key={job.id} style={s.card}>
              {/* Header row — company + save button */}
              <View style={s.cardTopRow}>
                <View style={{ flex: 1 }}>
                  <JobCardHeader
                    company={job.company}
                    abbr={job.abbr}
                    logoColor={job.logoColor}
                    rating={job.rating}
                    onInfo={() => {}}
                  />
                </View>
                {/* save btn sits outside header to avoid layout conflict */}
                <OutlineButton
                  icon={isSaved ? 'bookmark' : 'bookmark-outline'}
                  iconColor={isSaved ? Colors.primary : Colors.gray300}
                  onPress={() => toggleSave(job.id)}
                  style={s.saveBtn}
                />
              </View>

              <JobCardPosition position={job.position} salary={job.salary} />
              <JobCardLocation location={job.location} />
              <JobCardTags tags={job.tags as any} />

              {/* Applicants count */}
              <View style={s.metaRow}>
                <MaterialCommunityIcons name="account-group-outline" size={13} color={Colors.gray400} />
                <Text style={s.metaText}>{job.applicants} applied · {job.posted}</Text>
              </View>

              <JobCardMatchBar percent={job.match} />

              {/* CTA row */}
              <View style={s.ctaRow}>
                <TouchableOpacity style={s.applyBtn} activeOpacity={0.8}>
                  <Text style={s.applyBtnText}>Quick Apply</Text>
                  <MaterialCommunityIcons name="arrow-right" size={15} color={Colors.white} />
                </TouchableOpacity>
                <TextButton label="Details" icon="chevron-right" onPress={() => {}} />
              </View>
            </View>
          );
        })}

        <View style={{ height: Spacing['5'] }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },

  list: { paddingHorizontal: Spacing['4'], gap: Spacing['3'] },

  card: {
    ...cardBase,
    borderRadius: Radii.xl,
    padding: Spacing['4'] + 2,
  },

  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start' },

  saveBtn: {
    width: 34, height: 34, borderRadius: Radii.md,
    marginTop: 2, marginLeft: Spacing['2'],
  },

  metaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginBottom: Spacing['2'],
  },
  metaText: { fontSize: Typography.xs, color: Colors.gray400 },

  noResults: {
    alignItems: 'center', paddingTop: 60, gap: Spacing['3'],
  },
  noResultsText: { fontSize: Typography.md, color: Colors.gray400 },

  ctaRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing['3'], marginTop: Spacing['4'],
  },
  applyBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing['2'], backgroundColor: Colors.primary,
    borderRadius: Radii.md, paddingVertical: Spacing['3'],
    ...Shadows.colored(Colors.primary),
  },
  applyBtnText: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.white },
});