import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import {
  PageHeader, SegmentControl, SectionCard, Divider, AvatarCircle,
  StatusPill, CountBadge, CompanyLogo,
  Colors, Typography, Spacing, Radii, cardBase,
} from '../../components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ─── Data ────────────────────────────────────────────────────────────────────
const NEW_MATCHES = [
  { id: 1, abbr: 'TF', color: Colors.primary,  company: 'TechFlow',    role: 'Sr. RN Engineer', isNew: true  },
  { id: 2, abbr: 'DS', color: Colors.success,  company: 'DataStream',  role: 'ML Engineer',     isNew: true  },
  { id: 3, abbr: 'CP', color: Colors.sky,       company: 'CloudPeak',   role: 'Backend Eng.',    isNew: false },
  { id: 4, abbr: 'NA', color: Colors.violet,    company: 'Nexus AI',    role: 'AI PM',           isNew: false },
];

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

// ─── MatchesTab ───────────────────────────────────────────────────────────────
export default function MatchesTab() {
  const [activeTab, setActiveTab] = useState('matches');

  const totalUnread = PIPELINE.reduce((a, m) => a + m.unread, 0);

  const segOptions = [
    { key: 'matches',  label: 'Matches',  badge: NEW_MATCHES.length },
    { key: 'messages', label: 'Messages', badge: totalUnread },
  ];

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" />

      <PageHeader title="Matches" action actionIcon="filter-variant" onActionPress={() => {}} />

      <SegmentControl options={segOptions} active={activeTab} onSelect={setActiveTab} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── MATCHES TAB ── */}
        {activeTab === 'matches' && (
          <>
            {/* New matches row */}
            <SectionCard title="New matches">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={s.newMatchRow}>
                  {NEW_MATCHES.map(m => (
                    <TouchableOpacity key={m.id} style={s.newMatchItem} activeOpacity={0.8}>
                      <View style={{ position: 'relative' }}>
                        <AvatarCircle
                          initials={m.abbr}
                          size={56}
                          color={m.color}
                          ring={m.isNew}
                          ringColor={Colors.primary}
                        />
                        {m.isNew && (
                          <View style={s.newDot}>
                            <MaterialCommunityIcons name="lightning-bolt" size={9} color={Colors.white} />
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

            {/* Pipeline by stage */}
            <SectionCard title="Your pipeline">
              {PIPELINE_STAGES.map((stage, si) => {
                const stageJobs = PIPELINE.filter(p => p.status === stage.key);
                if (!stageJobs.length) return null;
                return (
                  <View key={stage.key}>
                    {si > 0 && <Divider />}
                    {/* Stage header */}
                    <View style={s.stageHeader}>
                      <View style={[s.stagePill, { backgroundColor: stage.bg }]}>
                        <MaterialCommunityIcons name={stage.icon as any} size={13} color={stage.text} />
                        <Text style={[s.stagePillText, { color: stage.text }]}>{stage.label}</Text>
                      </View>
                      <Text style={s.stageCount}>{stageJobs.length}</Text>
                    </View>
                    {/* Stage jobs */}
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
        )}

        {/* ── MESSAGES TAB ── */}
        {activeTab === 'messages' && (
          <SectionCard title="Recent conversations">
            {PIPELINE.map((msg, i) => (
              <View key={msg.id}>
                {i > 0 && <Divider spacing={Spacing['2']} />}
                <TouchableOpacity style={s.msgRow} activeOpacity={0.85}>
                  {/* Avatar with unread badge */}
                  <View style={{ position: 'relative' }}>
                    <CompanyLogo abbr={msg.abbr} color={msg.color} size="md" />
                    {msg.unread > 0 && <CountBadge count={msg.unread} />}
                  </View>

                  {/* Message body */}
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

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing['4'], gap: Spacing['3'] },

  newMatchRow: { flexDirection: 'row', gap: Spacing['4'], paddingBottom: Spacing['2'] },
  newMatchItem: { alignItems: 'center', width: 70 },
  newDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 18, height: 18, borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  newMatchCompany: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.gray900, textAlign: 'center', marginTop: 6 },
  newMatchRole:    { fontSize: 10, color: Colors.gray400, textAlign: 'center', marginTop: 1 },

  stageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing['2'] },
  stagePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing['3'], paddingVertical: 4, borderRadius: Radii.sm },
  stagePillText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  stageCount: { fontSize: Typography.xs, color: Colors.gray400, fontWeight: Typography.semibold },

  pipelineRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing['3'], paddingVertical: Spacing['3'] },
  pipelineInfo: { flex: 1 },
  pipelineCompany: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.gray900 },
  pipelineRole: { fontSize: Typography.sm, color: Colors.gray400, marginTop: 1 },

  msgRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing['3'], paddingVertical: Spacing['2'] },
  msgBody: { flex: 1 },
  msgTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  msgCompany: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.gray900 },
  msgTime: { fontSize: Typography.xs, color: Colors.gray400 },
  msgRole: { fontSize: Typography.sm, color: Colors.gray400, marginBottom: 4 },
  msgPreview: { fontSize: Typography.base, color: Colors.gray500, lineHeight: 18, marginBottom: Spacing['2'] },
});