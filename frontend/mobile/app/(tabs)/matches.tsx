import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Dimensions,
} from 'react-native';
import {
  PageHeader, SegmentControl, SectionCard, Divider,
  StatusPill, CountBadge, CompanyLogo,
  Colors, Typography, Spacing, Radii,
} from '../../components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── Data ─────────────────────────────────────────────────────────────────────
// Set to empty to show the empty state, or populate to show matches
const NEW_MATCHES: {
  id: number; abbr: string; color: string;
  company: string; role: string; isNew: boolean;
}[] = [];

type Status = 'applied' | 'screening' | 'interview' | 'offer';

const PIPELINE: {
  id: number; abbr: string; color: string;
  company: string; role: string; status: Status;
  lastMsg: string; time: string; unread: number;
}[] = [
  {
    id: 10, abbr: 'IL', color: Colors.warning, company: 'InnovateLabs', role: 'Product Designer',
    lastMsg: "Hi Alex! We loved your portfolio — available for a call this week?",
    time: '2m', unread: 2, status: 'screening',
  },
  {
    id: 11, abbr: 'PW', color: Colors.rose, company: 'Pixel Works', role: 'iOS Engineer',
    lastMsg: "Moving you to the technical interview stage 🎉",
    time: '1h', unread: 1, status: 'interview',
  },
  {
    id: 12, abbr: 'TF', color: Colors.primary, company: 'TechFlow Inc', role: 'Sr. RN Engineer',
    lastMsg: "Thanks for applying! We'll review and get back to you soon.",
    time: '3h', unread: 0, status: 'applied',
  },
  {
    id: 13, abbr: 'DS', color: Colors.success, company: 'DataStream', role: 'ML Engineer',
    lastMsg: "We'd like to extend a formal offer — congratulations!",
    time: 'Yesterday', unread: 0, status: 'offer',
  },
];

const PIPELINE_STAGES: { key: Status; label: string; icon: string; bg: string; text: string }[] = [
  { key: 'applied',   label: 'Applied',   icon: 'send-outline',           bg: Colors.gray100,      text: Colors.gray500     },
  { key: 'screening', label: 'Screening', icon: 'account-search-outline', bg: Colors.warningLight,  text: '#9A3412'          },
  { key: 'interview', label: 'Interview', icon: 'video-outline',          bg: Colors.primaryLight,  text: Colors.primaryDark },
  { key: 'offer',     label: 'Offer 🎉',  icon: 'star-outline',           bg: Colors.successLight,  text: '#166534'          },
];

// ─── Ghost Card (blurred placeholder card in empty state) ─────────────────────
function GhostCard({
  style,
  avatarColor,
  rotate,
  translateX,
  translateY,
  blur,
}: {
  style?: any;
  avatarColor: string;
  rotate: string;
  translateX: number;
  translateY: number;
  blur?: boolean;
}) {
  return (
    <View
      style={[
        s.ghostCard,
        {
          transform: [
            { rotate },
            { translateX },
            { translateY },
          ],
          opacity: blur ? 0.45 : 0.85,
        },
        style,
      ]}
    >
      {/* Fake photo area */}
      <View style={[s.ghostPhoto, { backgroundColor: avatarColor + '33' }]}>
        <MaterialCommunityIcons name="account" size={48} color={avatarColor + '55'} />
      </View>
      {/* Fake name line */}
      <View style={s.ghostMeta}>
        <View style={[s.ghostLine, { width: 80 }]} />
        <View style={[s.ghostLine, { width: 50, marginTop: 6 }]} />
      </View>
    </View>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyMatchesState() {
  return (
    <View style={s.emptyWrap}>
      {/* Stacked ghost cards */}
      <View style={s.ghostStack}>
        {/* Back card */}
        <GhostCard
          avatarColor="#7c3aed"
          rotate="8deg"
          translateX={40}
          translateY={10}
          blur
        />
        {/* Front card */}
        <GhostCard
          avatarColor="#a855f7"
          rotate="-4deg"
          translateX={-10}
          translateY={0}
        />
        {/* Lightning bolt badge */}
        <View style={s.boltBadge}>
          <MaterialCommunityIcons name="lightning-bolt" size={18} color="#fff" />
        </View>
      </View>

      {/* Text */}
      <Text style={s.emptyTitle}>Oops! Your profile hasn't{'\n'}received any likes yet.</Text>
      <Text style={s.emptySub}>
        Consider completing it or boosting your profile to attract more attention and likes.
      </Text>

      {/* CTA */}
      <TouchableOpacity style={s.boostBtn} activeOpacity={0.85}>
        <View style={s.boostIconWrap}>
          <MaterialCommunityIcons name="rocket-launch" size={16} color="#fff" />
        </View>
        <Text style={s.boostBtnText}>Boost Me</Text>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.7}>
        <Text style={s.editProfileText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── MatchesTab ───────────────────────────────────────────────────────────────
export default function MatchesTab() {
  const [activeTab, setActiveTab] = useState('matches');

  const tabBarHeight = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();
  const totalUnread = PIPELINE.reduce((a, m) => a + m.unread, 0);

  const hasMatches = NEW_MATCHES.length > 0;

  const segOptions = [
    { key: 'matches',  label: 'Matches',  badge: NEW_MATCHES.length },
    { key: 'messages', label: 'Messages', badge: totalUnread },
  ];

  return (
    <View style={[s.screen, { paddingTop: topInset }]}>
      <StatusBar barStyle="dark-content" />

      <PageHeader title="Matches" action actionIcon="filter-variant" onActionPress={() => {}} />

      <SegmentControl options={segOptions} active={activeTab} onSelect={setActiveTab} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: tabBarHeight + 16 }]}
      >
        {/* ── MATCHES TAB ── */}
        {activeTab === 'matches' && (
          hasMatches ? (
            // ── Has matches — original layout ──────────────────────────────
            <>
              <SectionCard title="New matches">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={s.newMatchRow}>
                    {NEW_MATCHES.map(m => (
                      <TouchableOpacity key={m.id} style={s.newMatchItem} activeOpacity={0.8}>
                        <View style={{ position: 'relative' }}>
                          <View style={[s.avatarCircle, { backgroundColor: m.color }]}>
                            <Text style={s.avatarText}>{m.abbr}</Text>
                          </View>
                          {m.isNew && (
                            <View style={s.newDot}>
                              <MaterialCommunityIcons name="lightning-bolt" size={9} color="#fff" />
                            </View>
                          )}
                        </View>
                        <Text style={s.newMatchCompany} numberOfLines={1}>{m.company}</Text>
                        <Text style={s.newMatchRole} numberOfLines={1}>{m.role}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </SectionCard>

              <SectionCard title="Your pipeline">
                {PIPELINE_STAGES.map((stage, si) => {
                  const stageJobs = PIPELINE.filter(p => p.status === stage.key);
                  if (!stageJobs.length) return null;
                  return (
                    <View key={stage.key}>
                      {si > 0 && <Divider />}
                      <View style={s.stageHeader}>
                        <View style={[s.stagePill, { backgroundColor: stage.bg }]}>
                          <MaterialCommunityIcons name={stage.icon as any} size={13} color={stage.text} />
                          <Text style={[s.stagePillText, { color: stage.text }]}>{stage.label}</Text>
                        </View>
                        <Text style={s.stageCount}>{stageJobs.length}</Text>
                      </View>
                      {stageJobs.map(job => (
                        <TouchableOpacity key={job.id} style={s.pipelineRow} activeOpacity={0.8}>
                          <CompanyLogo abbr={job.abbr} color={job.color} size="sm" />
                          <View style={s.pipelineInfo}>
                            <Text style={s.pipelineCompany}>{job.company}</Text>
                            <Text style={s.pipelineRole}>{job.role}</Text>
                          </View>
                          <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.gray300} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                })}
              </SectionCard>
            </>
          ) : (
            // ── Empty state ─────────────────────────────────────────────────
            <EmptyMatchesState />
          )
        )}

        {/* ── MESSAGES TAB ── */}
        {activeTab === 'messages' && (
          <SectionCard title="Recent conversations">
            {PIPELINE.map((msg, i) => (
              <View key={msg.id}>
                {i > 0 && <Divider spacing={Spacing['2']} />}
                <TouchableOpacity style={s.msgRow} activeOpacity={0.85}>
                  <View style={{ position: 'relative' }}>
                    <CompanyLogo abbr={msg.abbr} color={msg.color} size="md" />
                    {msg.unread > 0 && <CountBadge count={msg.unread} />}
                  </View>
                  <View style={s.msgBody}>
                    <View style={s.msgTopRow}>
                      <Text style={s.msgCompany}>{msg.company}</Text>
                      <Text style={s.msgTime}>{msg.time}</Text>
                    </View>
                    <Text style={s.msgRole}>{msg.role}</Text>
                    <Text style={s.msgPreview} numberOfLines={1}>{msg.lastMsg}</Text>
                    <StatusPill status={msg.status} />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </SectionCard>
        )}

        <View style={{ height: Spacing['6'] }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing['4'], gap: Spacing['3'] },

  // ── Empty state ────────────────────────────────────────────────────────────
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 32,
  },

  ghostStack: {
    width: SCREEN_WIDTH - 64,
    height: 220,
    marginBottom: 32,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ghostCard: {
    position: 'absolute',
    width: 140,
    height: 190,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    overflow: 'hidden',
  },
  ghostPhoto: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostMeta: {
    padding: 12,
    backgroundColor: '#fff',
  },
  ghostLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },

  boltBadge: {
    position: 'absolute',
    top: 14,
    left: '28%' as any,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.gray900,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.gray400,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 32,
  },

  boostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1a1035',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginBottom: 16,
    width: '100%' as any,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  boostIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boostBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  editProfileText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray900,
    textDecorationLine: 'underline',
  },

  // ── Avatar (fallback if AvatarCircle not available) ────────────────────────
  avatarCircle: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  // ── New matches ────────────────────────────────────────────────────────────
  newMatchRow: { flexDirection: 'row', gap: Spacing['4'], paddingBottom: Spacing['2'] },
  newMatchItem: { alignItems: 'center', width: 70 },
  newDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 18, height: 18, borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  newMatchCompany: {
    fontSize: Typography.xs, fontWeight: Typography.semibold,
    color: Colors.gray900, textAlign: 'center', marginTop: 6,
  },
  newMatchRole: { fontSize: 10, color: Colors.gray400, textAlign: 'center', marginTop: 1 },

  // ── Pipeline ───────────────────────────────────────────────────────────────
  stageHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing['2'],
  },
  stagePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing['3'], paddingVertical: 4, borderRadius: Radii.sm,
  },
  stagePillText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  stageCount: { fontSize: Typography.xs, color: Colors.gray400, fontWeight: Typography.semibold },

  pipelineRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing['3'], paddingVertical: Spacing['3'],
  },
  pipelineInfo: { flex: 1 },
  pipelineCompany: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.gray900 },
  pipelineRole: { fontSize: Typography.sm, color: Colors.gray400, marginTop: 1 },

  // ── Messages ───────────────────────────────────────────────────────────────
  msgRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: Spacing['3'], paddingVertical: Spacing['2'],
  },
  msgBody: { flex: 1 },
  msgTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  msgCompany: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.gray900 },
  msgTime: { fontSize: Typography.xs, color: Colors.gray400 },
  msgRole: { fontSize: Typography.sm, color: Colors.gray400, marginBottom: 4 },
  msgPreview: { fontSize: Typography.base, color: Colors.gray500, lineHeight: 18, marginBottom: Spacing['2'] },
});