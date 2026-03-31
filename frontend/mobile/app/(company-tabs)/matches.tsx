import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  Image, TouchableOpacity, SafeAreaView,
} from 'react-native';

const MOCK_MATCHES = [
  {
    id: '1',
    name: 'Maria Santos',
    role: 'Frontend Developer',
    matchedDate: 'Today',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    isNew: true,
  },
  {
    id: '2',
    name: 'Pedro Lim',
    role: 'Full Stack Developer',
    matchedDate: 'Yesterday',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    isNew: false,
  },
  {
    id: '3',
    name: 'Carla Mendoza',
    role: 'Data Analyst',
    matchedDate: '2 days ago',
    avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
    isNew: false,
  },
];

export default function CompanyMatchesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* New matches row */}
      <Text style={styles.sectionTitle}>New Matches</Text>
      <FlatList
        data={MOCK_MATCHES.filter((m) => m.isNew)}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.newMatchesList}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.newMatchItem}>
            <View style={styles.newMatchAvatarWrapper}>
              <Image source={{ uri: item.avatar }} style={styles.newMatchAvatar} />
              <View style={styles.newDot} />
            </View>
            <Text style={styles.newMatchName} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No new matches yet. Keep swiping!</Text>
        }
      />

      {/* All matches list */}
      <Text style={styles.sectionTitle}>All Matches</Text>
      <FlatList
        data={MOCK_MATCHES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.matchRow}>
            <View style={styles.matchAvatarWrapper}>
              <Image source={{ uri: item.avatar }} style={styles.matchAvatar} />
              {item.isNew && <View style={styles.matchDot} />}
            </View>
            <View style={styles.matchInfo}>
              <Text style={styles.matchName}>{item.name}</Text>
              <Text style={styles.matchRole}>{item.role}</Text>
            </View>
            <View style={styles.matchMeta}>
              <Text style={styles.matchDate}>{item.matchedDate}</Text>
              <Text style={styles.messageIcon}>💬</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💼</Text>
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptySubtitle}>Swipe on applicants to find your next hire.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 8 },
  newMatchesList: { paddingBottom: 16, gap: 16 },
  newMatchItem: { alignItems: 'center', width: 72 },
  newMatchAvatarWrapper: { position: 'relative', marginBottom: 6 },
  newMatchAvatar: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 2, borderColor: '#2563EB',
  },
  newDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#16A34A', borderWidth: 2, borderColor: '#FFF',
  },
  newMatchName: { fontSize: 12, color: '#374151', fontWeight: '600', textAlign: 'center' },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  matchAvatarWrapper: { position: 'relative' },
  matchAvatar: { width: 52, height: 52, borderRadius: 26 },
  matchDot: {
    position: 'absolute', top: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#2563EB', borderWidth: 2, borderColor: '#FFF',
  },
  matchInfo: { flex: 1 },
  matchName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  matchRole: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  matchMeta: { alignItems: 'flex-end', gap: 4 },
  matchDate: { fontSize: 11, color: '#9CA3AF' },
  messageIcon: { fontSize: 18 },
  separator: { height: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
  emptyText: { fontSize: 14, color: '#9CA3AF', paddingVertical: 8 },
});