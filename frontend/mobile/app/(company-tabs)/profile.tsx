import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Image, TouchableOpacity, SafeAreaView,
} from 'react-native';

export default function CompanyProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover / Header */}
        <View style={styles.header}>
          <View style={styles.coverPlaceholder} />
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/lego/1.jpg' }}
            style={styles.logo}
          />
        </View>

        <View style={styles.body}>
          <Text style={styles.companyName}>Accenture Philippines</Text>
          <Text style={styles.industry}>Technology · Consulting · IT Services</Text>
          <Text style={styles.location}>📍 BGC, Taguig, Philippines</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>3</Text>
              <Text style={styles.statLabel}>Active Jobs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>39</Text>
              <Text style={styles.statLabel}>Total Applicants</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>5</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Company Profile</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>About Us</Text>
          <Text style={styles.about}>
            We are a global professional services company with leading capabilities in digital,
            cloud and security. We help companies grow, work and build trust.
          </Text>

          <Text style={styles.sectionTitle}>Active Job Posts</Text>
          {['Frontend Developer', 'UI/UX Designer', 'Backend Developer'].map((job) => (
            <View key={job} style={styles.jobRow}>
              <Text style={styles.jobTitle}>{job}</Text>
              <TouchableOpacity style={styles.manageBtn}>
                <Text style={styles.manageBtnText}>Manage</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.postJobBtn}>
            <Text style={styles.postJobBtnText}>+ Post a New Job</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { position: 'relative', marginBottom: 50 },
  coverPlaceholder: { width: '100%', height: 140, backgroundColor: '#2563EB' },
  logo: {
    width: 90, height: 90, borderRadius: 20,
    borderWidth: 4, borderColor: '#FFF',
    position: 'absolute', bottom: -45, left: 20,
  },
  body: { paddingHorizontal: 20, paddingTop: 8 },
  companyName: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  industry: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  location: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: '#2563EB' },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: '#E5E7EB' },
  editBtn: {
    borderWidth: 2, borderColor: '#2563EB', borderRadius: 12,
    paddingVertical: 12, alignItems: 'center', marginBottom: 24,
  },
  editBtnText: { color: '#2563EB', fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 4 },
  about: { fontSize: 14, color: '#6B7280', lineHeight: 22, marginBottom: 20 },
  jobRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 1,
  },
  jobTitle: { fontSize: 14, fontWeight: '600', color: '#374151' },
  manageBtn: {
    backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  manageBtnText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },
  postJobBtn: {
    backgroundColor: '#2563EB', padding: 16, borderRadius: 14,
    alignItems: 'center', marginTop: 8, marginBottom: 12,
  },
  postJobBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  logoutBtn: {
    backgroundColor: '#FEF2F2', padding: 14, borderRadius: 14,
    alignItems: 'center', marginBottom: 40,
  },
  logoutBtnText: { color: '#DC2626', fontWeight: '600', fontSize: 14 },
});