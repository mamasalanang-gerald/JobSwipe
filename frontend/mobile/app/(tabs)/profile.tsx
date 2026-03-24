import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import {
  PageHeader, SectionCard, Divider, Spacer,
  AvatarCircle, StatBox, PreferenceRow,
  TextButton, TagBadge,
  Colors, Typography, Spacing, Radii, cardBase,
} from '../../components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ─── Data ────────────────────────────────────────────────────────────────────
const SKILLS: { label: string; variant: 'primary' | 'success' | 'warning' | 'neutral' }[] = [
  { label: 'React Native', variant: 'primary'  },
  { label: 'TypeScript',   variant: 'primary'  },
  { label: 'Node.js',      variant: 'success'  },
  { label: 'GraphQL',      variant: 'warning'  },
  { label: 'AWS',          variant: 'neutral'  },
  { label: 'Figma',        variant: 'neutral'  },
  { label: 'Swift',        variant: 'neutral'  },
];

const EXPERIENCE = [
  { role: 'Senior Frontend Engineer', company: 'Stripe',    period: '2022 – Present', icon: 'code-braces',  color: Colors.primary  },
  { role: 'Mobile Engineer',          company: 'Shopify',   period: '2020 – 2022',    icon: 'cellphone',    color: Colors.success  },
  { role: 'Junior Developer',         company: 'Accenture', period: '2018 – 2020',    icon: 'laptop',       color: Colors.warning  },
];

const PREFS = [
  { key: 'remote',    label: 'Remote only',        icon: 'home-outline'     },
  { key: 'relocate',  label: 'Open to relocation', icon: 'airplane' },
  { key: 'contract',  label: 'Open to contract',   icon: 'file-sign'        },
];

// ─── ProfileTab ───────────────────────────────────────────────────────────────
export default function ProfileTab() {
  const [editMode, setEditMode] = useState(false);
  const [toggles, setToggles] = useState({ remote: true, relocate: false, contract: true });

  const toggle = (key: string) =>
    setToggles(p => ({ ...p, [key]: !p[key as keyof typeof p] }));

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" />

      <PageHeader
        title="Profile"
        action
        actionIcon={editMode ? 'check' : 'pencil-outline'}
        onActionPress={() => setEditMode(e => !e)}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Avatar card ── */}
        <SectionCard>
          <View style={s.avatarRow}>
            <AvatarCircle initials="AJ" size={64} color={Colors.primary} ring ringColor={Colors.primaryMid} />
            <View style={s.avatarInfo}>
              <Text style={s.name}>Alex Johnson</Text>
              <Text style={s.headline}>Senior React Native Engineer</Text>
              <View style={s.locRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={13} color={Colors.gray400} />
                <Text style={s.locText}>San Francisco, CA</Text>
              </View>
            </View>
          </View>

          <Divider />

          {/* Profile strength */}
          <View style={s.strengthRow}>
            <Text style={s.strengthLabel}>Profile strength</Text>
            <Text style={s.strengthPct}>82%</Text>
          </View>
          <View style={s.strengthTrack}>
            <View style={[s.strengthFill, { width: '82%' }]} />
          </View>
        </SectionCard>

        {/* ── Stats ── */}
        <View style={s.statsRow}>
          <StatBox value="24" label="Applied" />
          <StatBox value="8"  label="Matches" />
          <StatBox value="3"  label="Interviews" />
        </View>

        {/* ── Salary target ── */}
        <SectionCard title="Salary target">
          <TouchableOpacity style={s.salaryRow} activeOpacity={0.8}>
            <View style={s.salaryIcon}>
              <MaterialCommunityIcons name="currency-usd" size={18} color={Colors.primary} />
            </View>
            <Text style={s.salaryText}>$120k – $160k / year</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.gray300} />
          </TouchableOpacity>
        </SectionCard>

        {/* ── Skills ── */}
        <SectionCard title="Skills" action={editMode ? () => {} : undefined} actionLabel="+ Add">
          <View style={s.skillsWrap}>
            {SKILLS.map((skill, i) => (
              <View key={i} style={s.skillWrap}>
                <TagBadge label={skill.label} variant={skill.variant} />
                {editMode && (
                  <TouchableOpacity style={s.skillRemove}>
                    <MaterialCommunityIcons name="close" size={10} color={Colors.gray400} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </SectionCard>

        {/* ── Experience ── */}
        <SectionCard title="Experience">
          {EXPERIENCE.map((exp, i) => (
            <View key={i}>
              {i > 0 && <Divider />}
              <View style={s.expRow}>
                <View style={[s.expIcon, { backgroundColor: exp.color + '18' }]}>
                  <MaterialCommunityIcons name={exp.icon as any} size={18} color={exp.color} />
                </View>
                <View style={s.expInfo}>
                  <Text style={s.expRole}>{exp.role}</Text>
                  <Text style={s.expCompany}>{exp.company}</Text>
                </View>
                <Text style={s.expPeriod}>{exp.period}</Text>
              </View>
            </View>
          ))}
        </SectionCard>

        {/* ── Preferences ── */}
        <SectionCard title="Job preferences">
          {PREFS.map((pref, i) => (
            <PreferenceRow
              key={pref.key}
              icon={pref.icon}
              label={pref.label}
              value={toggles[pref.key as keyof typeof toggles]}
              onChange={() => toggle(pref.key)}
              borderBottom={i < PREFS.length - 1}
            />
          ))}
        </SectionCard>

        {/* ── Sign out ── */}
        <TouchableOpacity style={s.signOut} activeOpacity={0.8}>
          <MaterialCommunityIcons name="logout" size={16} color={Colors.danger} />
          <Text style={s.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <Spacer size="xl" />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing['4'], gap: Spacing['3'] },

  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing['4'], marginBottom: Spacing['4'] },
  avatarInfo: { flex: 1 },
  name: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.gray900, marginBottom: 2 },
  headline: { fontSize: Typography.base, color: Colors.gray500, marginBottom: 5 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locText: { fontSize: Typography.sm, color: Colors.gray400 },

  strengthRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing['2'] },
  strengthLabel: { fontSize: Typography.sm, color: Colors.gray400 },
  strengthPct: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.primary },
  strengthTrack: { height: 5, backgroundColor: Colors.primaryLight, borderRadius: Radii.full, overflow: 'hidden' },
  strengthFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: Radii.full },

  statsRow: { flexDirection: 'row', gap: Spacing['3'] },

  salaryRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing['3'],
    backgroundColor: Colors.primaryLight, borderRadius: Radii.md, padding: Spacing['4'],
  },
  salaryIcon: {
    width: 32, height: 32, borderRadius: Radii.sm,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
  },
  salaryText: { flex: 1, fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.primaryDark },

  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'] },
  skillWrap: { position: 'relative' },
  skillRemove: {
    position: 'absolute', top: -4, right: -4,
    width: 14, height: 14, borderRadius: Radii.full,
    backgroundColor: Colors.gray200, alignItems: 'center', justifyContent: 'center',
  },

  expRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing['3'], paddingVertical: Spacing['3'] },
  expIcon: { width: 40, height: 40, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center' },
  expInfo: { flex: 1 },
  expRole: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.gray900 },
  expCompany: { fontSize: Typography.base, color: Colors.gray500, marginTop: 1 },
  expPeriod: { fontSize: Typography.xs, color: Colors.gray400 },

  signOut: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing['2'], paddingVertical: Spacing['4'],
    borderRadius: Radii.lg, backgroundColor: Colors.dangerLight,
    borderWidth: 1, borderColor: Colors.dangerMid,
  },
  signOutText: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.danger },
});