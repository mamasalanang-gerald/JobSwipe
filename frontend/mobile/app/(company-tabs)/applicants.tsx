import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, SafeAreaView,
} from 'react-native';

const POSTED_JOBS = [
  {
    id: '1',
    title: 'Frontend Developer',
    applicantCount: 12,
    newApplicants: 3,
    status: 'Active',
  },
  {
    id: '2',
    title: 'UI/UX Designer',
    applicantCount: 7,
    newApplicants: 1,
    status: 'Active',
  },
  {
    id: '3',
    title: 'Backend Developer',
    applicantCount: 20,
    newApplicants: 0,
    status: 'Closed',
  },
];

export default function ApplicantsScreen() {
  const [selectedJob, setSelectedJob] = useState(POSTED_JOBS[0].id);

  const selectedJobData = POSTED_JOBS.find((j) => j.id === selectedJob);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.sectionTitle}>Your Job Posts</Text>

      {/* Job selector */}
      <FlatList
        data={POSTED_JOBS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.jobList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.jobChip, selectedJob === item.id && styles.jobChipActive]}
            onPress={() => setSelectedJob(item.id)}
          >
            <Text style={[styles.jobChipText, selectedJob === item.id && styles.jobChipTextActive]}>
              {item.title}
            </Text>
            {item.newApplicants > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.newApplicants}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      {selectedJobData && (
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            {selectedJobData.applicantCount} total applicants
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: selectedJobData.status === 'Active' ? '#DCFCE7' : '#FEE2E2' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: selectedJobData.status === 'Active' ? '#16A34A' : '#DC2626' }
            ]}>
              {selectedJobData.status}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Applicants</Text>
      <Text style={styles.hint}>Go to Home to swipe through applicants for this role.</Text>

      <TouchableOpacity style={styles.goSwipeBtn}>
        <Text style={styles.goSwipeBtnText}>Start Swiping Applicants →</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 8 },
  jobList: { paddingBottom: 12, gap: 8 },
  jobChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
  },
  jobChipActive: { backgroundColor: '#2563EB' },
  jobChipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  jobChipTextActive: { color: '#FFF' },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  hint: { fontSize: 14, color: '#9CA3AF', marginBottom: 16 },
  goSwipeBtn: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  goSwipeBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});