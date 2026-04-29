import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Dimensions, TextInput, Image,
  Keyboard, KeyboardEvent, BackHandler, Modal, Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { useTheme } from '../../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── Data ─────────────────────────────────────────────────────────────────────
const NEW_MATCHES: {
  id: string; name: string; role: string;
  avatar: string; isNew: boolean;
}[] = [
  { id: '1', name: 'Maria Santos', role: 'Frontend Dev',  avatar: 'https://randomuser.me/api/portraits/women/44.jpg', isNew: true },
  { id: '2', name: 'Pedro Lim',    role: 'Full Stack',    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',   isNew: true },
  { id: '3', name: 'Aisha Khan',   role: 'ML Engineer',   avatar: 'https://randomuser.me/api/portraits/women/65.jpg', isNew: true },
];

// Hired = applicants who received a job offer (reviewable)
// status: 'active' | 'closed' | 'hired'
type ApplicantStatus = 'active' | 'closed' | 'hired';

const PIPELINE: {
  id: string; name: string; role: string; avatar: string;
  status: ApplicantStatus; lastMsg: string; time: string;
  unread: number; expired?: boolean;
  location: string; experience: string; skills: string[];
  about: string; education: string; portfolio?: string;
  lastReplyTimestamp: number;
}[] = [
  {
    id: '1', name: 'Maria Santos', role: 'Frontend Developer',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    lastMsg: "Hi! I'm excited about the role. Happy to start anytime!",
    time: '2m', unread: 2, status: 'active',
    location: 'Quezon City, Metro Manila', experience: '4 years',
    skills: ['React', 'TypeScript', 'Tailwind', 'Figma'],
    about: 'Passionate frontend developer with a strong eye for design and UX. Previously at Grab and a fintech startup.',
    education: 'BS Computer Science, UP Diliman',
    portfolio: 'mariasantos.dev',
    lastReplyTimestamp: Date.now() - 2 * 60 * 1000,
  },
  {
    id: '2', name: 'Pedro Lim', role: 'Full Stack Developer',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    lastMsg: "Thanks for moving me forward! When's the interview?",
    time: '1h', unread: 1, status: 'active',
    location: 'Makati, Metro Manila', experience: '6 years',
    skills: ['Node.js', 'React', 'PostgreSQL', 'AWS'],
    about: 'Full stack engineer who loves building scalable systems. Led backend teams at two Series A startups.',
    education: 'BS Information Technology, DLSU',
    portfolio: 'pedrolim.io',
    lastReplyTimestamp: Date.now() - 60 * 60 * 1000,
  },
  {
    id: '3', name: 'Carla Mendoza', role: 'Data Analyst',
    avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
    lastMsg: "Sounds good, I'll prepare for the case study.",
    time: '3h', unread: 0, status: 'closed', expired: true,
    location: 'Pasig, Metro Manila', experience: '3 years',
    skills: ['Python', 'SQL', 'Tableau', 'Excel'],
    about: 'Data analyst with experience in e-commerce and logistics. Skilled at translating data into business decisions.',
    education: 'BS Statistics, Ateneo de Manila',
    lastReplyTimestamp: Date.now() - 26 * 60 * 60 * 1000,
  },
  {
    id: '4', name: 'James Reyes', role: 'Backend Engineer',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMsg: "I've sent over my portfolio as requested!",
    time: 'Yesterday', unread: 0, status: 'hired',
    location: 'Taguig, Metro Manila', experience: '5 years',
    skills: ['Go', 'Kubernetes', 'Redis', 'gRPC'],
    about: 'Backend engineer focused on distributed systems and high-throughput APIs. Open source contributor.',
    education: 'BS Computer Engineering, UST',
    portfolio: 'github.com/jamesreyes',
    lastReplyTimestamp: Date.now() - 20 * 60 * 60 * 1000,
  },
  {
    id: '5', name: 'Aisha Khan', role: 'ML Engineer',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    lastMsg: "Thrilled to accept the offer! Starting Monday.",
    time: '2d', unread: 0, status: 'hired',
    location: 'BGC, Metro Manila', experience: '7 years',
    skills: ['Python', 'PyTorch', 'MLOps', 'Kubernetes'],
    about: 'Machine learning engineer with deep expertise in NLP and recommendation systems. Led ML infra at a unicorn startup.',
    education: 'MS Computer Science, ADMU',
    portfolio: 'aishakhan.ai',
    lastReplyTimestamp: Date.now() - 48 * 60 * 60 * 1000,
  },
];

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const resolveInitialStatus = (app: typeof PIPELINE[number]): ApplicantStatus => {
  if (app.status === 'closed' || app.status === 'hired') return app.status;
  return Date.now() - app.lastReplyTimestamp > ONE_DAY_MS ? 'closed' : 'active';
};

// ─── Chat data ────────────────────────────────────────────────────────────────
type ChatMessage = { id: number; from: 'me' | 'them'; text: string; time: string; };

const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  '1': [
    { id: 1, from: 'them', text: "Hi! I'm really excited about this Frontend Developer role.", time: '9:45 AM' },
    { id: 2, from: 'me',   text: "Thanks for applying, Maria! We loved your portfolio.", time: '10:02 AM' },
    { id: 3, from: 'them', text: "That means a lot! I've been following your company for a while.", time: '10:08 AM' },
    { id: 4, from: 'me',   text: "Great. We'd love to schedule a screening call. Are you free this week?", time: '10:15 AM' },
    { id: 5, from: 'them', text: "Hi! I'm excited about the role. Happy to start anytime!", time: '2m ago' },
  ],
  '2': [
    { id: 1, from: 'them', text: "Hi, I just saw I was moved forward in the process!", time: '8:30 AM' },
    { id: 2, from: 'me',   text: "Yes! Your technical test results were impressive, Pedro.", time: '9:00 AM' },
    { id: 3, from: 'them', text: "Thanks for moving me forward! When's the interview?", time: '1h ago' },
  ],
  '3': [
    { id: 1, from: 'me',   text: "Hi Carla, thanks for applying to the Data Analyst role.", time: 'Yesterday' },
    { id: 2, from: 'them', text: "Thank you! I'm very interested in this opportunity.", time: 'Yesterday' },
    { id: 3, from: 'me',   text: "We'd like to move forward with a case study. Does that work for you?", time: '3h ago' },
    { id: 4, from: 'them', text: "Sounds good, I'll prepare for the case study.", time: '3h ago' },
  ],
  '4': [
    { id: 1, from: 'me',   text: "Hi James! We're very impressed with your background.", time: 'Mon' },
    { id: 2, from: 'them', text: "Thank you so much! I'm really excited about this opportunity.", time: 'Mon' },
    { id: 3, from: 'me',   text: "We'd love to extend a job offer. Congratulations!", time: 'Tue' },
    { id: 4, from: 'them', text: "I've sent over my portfolio as requested!", time: 'Yesterday' },
  ],
  '5': [
    { id: 1, from: 'me',   text: "Aisha, we were blown away by your experience.", time: '2d ago' },
    { id: 2, from: 'them', text: "Thank you! I'm very excited about this role.", time: '2d ago' },
    { id: 3, from: 'me',   text: "We'd like to offer you the ML Engineer position.", time: '2d ago' },
    { id: 4, from: 'them', text: "Thrilled to accept the offer! Starting Monday.", time: '2d ago' },
  ],
};

const AUTO_REPLIES: Record<string, string[]> = {
  '1': ["Thanks for the update! Looking forward to it.", "We'll send the calendar invite shortly.", "Feel free to reach out if you have any questions."],
  '2': ["The interview is scheduled for Friday at 2 PM.", "We'll send a calendar invite to your email.", "Let us know if you need to reschedule."],
  '3': ["We'll be in touch soon with more details.", "Thanks for your patience!", "We appreciate your enthusiasm."],
  '4': ["We're reviewing your portfolio now.", "We'll be in touch with next steps soon.", "Great work, we're impressed!"],
  '5': ["Welcome aboard! We'll send onboarding details soon.", "We're excited to have you on the team!", "HR will reach out about your start date."],
};

// ─── Review types ─────────────────────────────────────────────────────────────
type Review = {
  id: number; applicantId: string; rating: number;
  title: string; body: string; date: string;
};

// ─── Filter types ─────────────────────────────────────────────────────────────
type FilterState = {
  status: 'all' | 'active' | 'closed' | 'hired';
  roles: string[];
  locations: string[];
  experience: string[];
};

const ALL_ROLES     = Array.from(new Set(PIPELINE.map(a => a.role)));
const ALL_LOCATIONS = Array.from(new Set(PIPELINE.map(a => a.location)));
const ALL_EXP       = Array.from(new Set(PIPELINE.map(a => a.experience)));

const DEFAULT_FILTER: FilterState = {
  status: 'all',
  roles: [],
  locations: [],
  experience: [],
};

// ─── Filter Modal ─────────────────────────────────────────────────────────────
function FilterModal({
  visible, current, onApply, onClose,
}: {
  visible: boolean; current: FilterState;
  onApply: (f: FilterState) => void; onClose: () => void;
}) {
  const T = useTheme();
  const slideAnim = useRef(new Animated.Value(700)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const [local, setLocal] = useState<FilterState>(current);

  useEffect(() => {
    if (visible) {
      setLocal(current);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 700, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const toggleArr = (arr: string[], val: string): string[] =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const activeCount =
    (local.status !== 'all' ? 1 : 0) +
    local.roles.length + local.locations.length + local.experience.length;

  const ChipGroup = ({ label, options, selected, onToggle }: {
    label: string; options: string[]; selected: string[]; onToggle: (v: string) => void;
  }) => (
    <View style={{ marginBottom: 18 }}>
      <Text style={[fm.groupLabel, { color: T.textSub }]}>{label}</Text>
      <View style={fm.chipRow}>
        {options.map(opt => {
          const active = selected.includes(opt);
          return (
            <TouchableOpacity
              key={opt}
              style={[fm.chip, active
                ? { backgroundColor: T.primary, borderColor: T.primary }
                : { backgroundColor: 'transparent', borderColor: T.borderFaint }
              ]}
              onPress={() => onToggle(opt)}
              activeOpacity={0.75}
            >
              <Text style={[fm.chipText, { color: active ? '#fff' : T.textSub }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[fm.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[fm.sheet, { backgroundColor: T.surface, borderColor: T.border, transform: [{ translateY: slideAnim }] }]}>
        <View style={fm.handle} />
        <View style={fm.headerRow}>
          <Text style={[fm.title, { color: T.textPrimary }]}>Filter Applicants</Text>
          {activeCount > 0 && (
            <TouchableOpacity onPress={() => setLocal(DEFAULT_FILTER)} activeOpacity={0.7}>
              <Text style={[fm.clearAll, { color: T.primary }]}>Clear all</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ marginBottom: 18 }}>
            <Text style={[fm.groupLabel, { color: T.textSub }]}>Status</Text>
            <View style={fm.chipRow}>
              {(['all', 'active', 'closed', 'hired'] as const).map(opt => {
                const active = local.status === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[fm.chip, active
                      ? { backgroundColor: T.primary, borderColor: T.primary }
                      : { backgroundColor: 'transparent', borderColor: T.borderFaint }
                    ]}
                    onPress={() => setLocal(l => ({ ...l, status: opt }))}
                    activeOpacity={0.75}
                  >
                    <Text style={[fm.chipText, { color: active ? '#fff' : T.textSub }]}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <ChipGroup label="Role" options={ALL_ROLES} selected={local.roles} onToggle={v => setLocal(l => ({ ...l, roles: toggleArr(l.roles, v) }))} />
          <ChipGroup label="Location" options={ALL_LOCATIONS} selected={local.locations} onToggle={v => setLocal(l => ({ ...l, locations: toggleArr(l.locations, v) }))} />
          <ChipGroup label="Experience" options={ALL_EXP} selected={local.experience} onToggle={v => setLocal(l => ({ ...l, experience: toggleArr(l.experience, v) }))} />
        </ScrollView>
        <TouchableOpacity
          style={[fm.applyBtn, { backgroundColor: T.primary }]}
          onPress={() => { onApply(local); onClose(); }}
          activeOpacity={0.85}
        >
          <Text style={fm.applyBtnText}>Apply Filters{activeCount > 0 ? ` (${activeCount})` : ''}</Text>
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </Animated.View>
    </Modal>
  );
}

// ─── Ghost cards ──────────────────────────────────────────────────────────────
function GhostCard({ rotate, translateX, translateY, blur }: {
  rotate: string; translateX: number; translateY: number; blur?: boolean;
}) {
  const T = useTheme();
  return (
    <View style={[s.ghostCard, {
      backgroundColor: T.surface, borderColor: T.border,
      transform: [{ rotate }, { translateX }, { translateY }],
      opacity: blur ? 0.4 : 0.85,
    }]}>
      <View style={[s.ghostPhoto, { backgroundColor: T.surfaceHigh }]}>
        <MaterialCommunityIcons name="account" size={44} color={T.border} />
      </View>
      <View style={[s.ghostMeta, { backgroundColor: T.surface }]}>
        <View style={[s.ghostLine, { width: 72, backgroundColor: T.borderFaint }]} />
        <View style={[s.ghostLine, { width: 46, marginTop: 6, backgroundColor: T.borderFaint }]} />
      </View>
    </View>
  );
}

function EmptyMatchesState() {
  const T = useTheme();
  return (
    <View style={s.emptyWrap}>
      <View style={s.ghostStack}>
        <GhostCard rotate="8deg"  translateX={42}  translateY={10} blur />
        <GhostCard rotate="-4deg" translateX={-10} translateY={0} />
        <View style={[s.boltBadge, { backgroundColor: '#f97316' }]}>
          <MaterialCommunityIcons name="lightning-bolt" size={17} color="#fff" />
        </View>
      </View>
      <Text style={[s.emptyTitle, { color: T.textPrimary }]}>No applicants yet.{'\n'}Start swiping to find talent!</Text>
      <Text style={[s.emptySub, { color: T.textSub }]}>Swipe on candidate profiles to match with top applicants for your open roles.</Text>
      <TouchableOpacity style={[s.boostBtn, { backgroundColor: T.primary, shadowColor: T.primary }]} activeOpacity={0.85}>
        <View style={s.boostIconWrap}>
          <MaterialCommunityIcons name="rocket-launch" size={15} color="#fff" />
        </View>
        <Text style={s.boostBtnText}>Boost Job Post</Text>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.7}>
        <Text style={[s.editProfileText, { color: T.textSub }]}>Edit Job Listing</Text>
      </TouchableOpacity>
    </View>
  );
}

function SegmentTabs({ tabs, active, onSelect }: {
  tabs: { key: string; label: string; badge?: number }[];
  active: string;
  onSelect: (key: string) => void;
}) {
  const T = useTheme();
  return (
    <View style={[s.segWrap, { backgroundColor: T.surface, borderColor: T.borderFaint }]}>
      {tabs.map(tab => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[s.segTab, isActive && { backgroundColor: T.primary }]}
            onPress={() => onSelect(tab.key)}
            activeOpacity={0.75}
          >
            <Text style={[s.segTabText, { color: isActive ? '#fff' : T.textSub }]}>{tab.label}</Text>
            {!!tab.badge && tab.badge > 0 && (
              <View style={s.segBadge}>
                <Text style={s.segBadgeText}>{tab.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ApplicantAvatar({ uri, size = 52 }: { uri: string; size?: number }) {
  const T = useTheme();
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: T.border }}
    />
  );
}

// ─── View All Pipeline Modal ──────────────────────────────────────────────────
function ViewAllPipelineModal({
  visible,
  applicants,
  onClose,
  onSelect,
}: {
  visible: boolean;
  applicants: (typeof PIPELINE[number] & { status: ApplicantStatus })[];
  onClose: () => void;
  onSelect: (app: typeof PIPELINE[number] & { status: ApplicantStatus }) => void;
}) {
  const T = useTheme();
  const slideAnim = useRef(new Animated.Value(800)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 800, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const activeList = applicants.filter(a => a.status === 'active');
  const closedList = applicants.filter(a => a.status === 'closed');
  const hiredList  = applicants.filter(a => a.status === 'hired');

  const SectionGroup = ({
    label, color, bgColor, dotColor, items,
  }: {
    label: string; color: string; bgColor: string; dotColor: string;
    items: typeof applicants;
  }) => {
    if (items.length === 0) return null;
    return (
      <View style={{ marginBottom: 16 }}>
        <View style={[vap.groupPill, { backgroundColor: bgColor, alignSelf: 'flex-start', marginBottom: 8 }]}>
          <View style={[vap.groupDot, { backgroundColor: dotColor }]} />
          <Text style={[vap.groupLabel, { color }]}>{label}</Text>
          <Text style={[vap.groupCount, { color }]}>{items.length}</Text>
        </View>
        <View style={[vap.groupCard, { backgroundColor: T.surface, borderColor: T.borderFaint }]}>
          {items.map((app, i) => (
            <View key={app.id}>
              {i > 0 && <View style={[vap.divider, { backgroundColor: T.borderFaint }]} />}
              <TouchableOpacity
                style={vap.row}
                onPress={() => { onClose(); onSelect(app); }}
                activeOpacity={0.8}
              >
                <ApplicantAvatar uri={app.avatar} size={44} />
                <View style={vap.info}>
                  <Text style={[vap.name, { color: T.textPrimary }]}>{app.name}</Text>
                  <Text style={[vap.role, { color: T.textSub }]}>{app.role}</Text>
                  <View style={vap.metaRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={10} color={T.textHint} />
                    <Text style={[vap.metaText, { color: T.textHint }]}>{app.location}</Text>
                    <View style={[vap.dot, { backgroundColor: T.borderFaint }]} />
                    <MaterialCommunityIcons name="briefcase-outline" size={10} color={T.textHint} />
                    <Text style={[vap.metaText, { color: T.textHint }]}>{app.experience}</Text>
                  </View>
                </View>
                {app.unread > 0 && (
                  <View style={[vap.unreadDot, { backgroundColor: T.primary }]}>
                    <Text style={vap.unreadText}>{app.unread}</Text>
                  </View>
                )}
                <MaterialCommunityIcons name="chevron-right" size={18} color={T.textHint} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[vap.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[vap.sheet, { backgroundColor: T.bg, transform: [{ translateY: slideAnim }] }]}>
        <View style={[vap.handle, { backgroundColor: T.borderFaint }]} />
        <View style={vap.headerRow}>
          <Text style={[vap.title, { color: T.textPrimary }]}>All Applicants</Text>
          <TouchableOpacity onPress={onClose} style={[vap.closeBtn, { backgroundColor: T.surface, borderColor: T.borderFaint }]} activeOpacity={0.7}>
            <MaterialCommunityIcons name="close" size={18} color={T.textSub} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={vap.scroll}>
          <SectionGroup
            label="Active" color="#22c55e" bgColor="rgba(34,197,94,0.12)" dotColor="#22c55e"
            items={activeList}
          />
          <SectionGroup
            label="Hired" color="#6366f1" bgColor="rgba(99,102,241,0.12)" dotColor="#6366f1"
            items={hiredList}
          />
          <SectionGroup
            label="Closed" color="#9ca3af" bgColor="rgba(156,163,175,0.12)" dotColor="#9ca3af"
            items={closedList}
          />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Applicant Detail + Action Sheet Modal ────────────────────────────────────
function ApplicantActionModal({
  applicant, visible, onClose, onMessage, onReject, onMarkHired,
}: {
  applicant: (typeof PIPELINE[number] & { status: ApplicantStatus }) | null;
  visible: boolean;
  onClose: () => void;
  onMessage: (applicant: typeof PIPELINE[number]) => void;
  onReject: (id: string) => void;
  onMarkHired: (id: string) => void;
}) {
  const T = useTheme();
  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 600, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!applicant) return null;

  const isActive = applicant.status === 'active';
  const isHired  = applicant.status === 'hired';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[am.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[am.sheet, {
        backgroundColor: T.surface, borderColor: T.border,
        transform: [{ translateY: slideAnim }],
      }]}>
        <View style={[am.handle, { backgroundColor: T.borderFaint }]} />

        {/* Profile header */}
        <View style={am.profileHeader}>
          <Image source={{ uri: applicant.avatar }} style={[am.avatar, { borderColor: T.border }]} />
          <View style={am.profileInfo}>
            <Text style={[am.profileName, { color: T.textPrimary }]}>{applicant.name}</Text>
            <Text style={[am.profileRole, { color: T.textSub }]}>{applicant.role}</Text>
            <View style={am.profileMeta}>
              <MaterialCommunityIcons name="map-marker-outline" size={11} color={T.textHint} />
              <Text style={[am.profileMetaText, { color: T.textHint }]}>{applicant.location}</Text>
              <View style={[am.dot, { backgroundColor: T.borderFaint }]} />
              <MaterialCommunityIcons name="briefcase-outline" size={11} color={T.textHint} />
              <Text style={[am.profileMetaText, { color: T.textHint }]}>{applicant.experience}</Text>
            </View>
          </View>
          <View style={[am.statusBadge,
            isActive ? { backgroundColor: 'rgba(34,197,94,0.12)' } :
            isHired  ? { backgroundColor: 'rgba(99,102,241,0.12)' } :
                       { backgroundColor: T.borderFaint }
          ]}>
            <View style={[am.statusDot, {
              backgroundColor: isActive ? '#22c55e' : isHired ? '#6366f1' : T.textHint,
            }]} />
            <Text style={[am.statusText, {
              color: isActive ? '#22c55e' : isHired ? '#6366f1' : T.textHint,
            }]}>
              {isActive ? 'Active' : isHired ? 'Hired' : 'Closed'}
            </Text>
          </View>
        </View>

        <Text style={[am.about, { color: T.textSub }]}>{applicant.about}</Text>

        <View style={am.infoRow}>
          <MaterialCommunityIcons name="school-outline" size={13} color={T.textHint} />
          <Text style={[am.infoText, { color: T.textHint }]}>{applicant.education}</Text>
        </View>
        {applicant.portfolio && (
          <View style={am.infoRow}>
            <MaterialCommunityIcons name="link-variant" size={13} color={T.primary} />
            <Text style={[am.infoText, { color: T.primary }]}>{applicant.portfolio}</Text>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={am.skillsScroll} contentContainerStyle={am.skillsContent}>
          {applicant.skills.map((sk, i) => (
            <View key={i} style={[am.skillChip, { backgroundColor: T.skillChipBg, borderColor: T.skillChipBorder }]}>
              <Text style={[am.skillChipText, { color: T.primary }]}>{sk}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={[am.divider, { backgroundColor: T.borderFaint }]} />

        {/* Active: message + mark hired + reject */}
        {isActive && (
          <>
            <View style={am.actions}>
              <TouchableOpacity
                style={[am.actionBtn, am.actionBtnPrimary, { backgroundColor: T.primary }]}
                activeOpacity={0.85}
                onPress={() => { onClose(); onMessage(applicant); }}
              >
                <MaterialCommunityIcons name="message-outline" size={18} color="#fff" />
                <Text style={am.actionBtnPrimaryText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[am.actionBtnSecondary, { backgroundColor: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.3)' }]}
                activeOpacity={0.85}
                onPress={() => { onMarkHired(applicant.id); onClose(); }}
              >
                <MaterialCommunityIcons name="briefcase-check-outline" size={18} color="#6366f1" />
                <Text style={[am.actionBtnSecondaryText, { color: '#6366f1' }]}>Mark Hired</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[am.rejectBtn, { backgroundColor: T.dangerLight, borderColor: T.dangerBorder }]}
              activeOpacity={0.8}
              onPress={() => { onReject(applicant.id); onClose(); }}
            >
              <MaterialCommunityIcons name="close-circle-outline" size={16} color={T.danger} />
              <Text style={[am.rejectBtnText, { color: T.danger }]}>Reject Applicant</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Hired notice */}
        {isHired && (
          <View style={[am.closedNotice, { backgroundColor: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)' }]}>
            <MaterialCommunityIcons name="briefcase-check-outline" size={14} color="#6366f1" />
            <Text style={[am.closedNoticeText, { color: '#6366f1' }]}>
              This applicant has been hired. You can leave a review in the Review tab.
            </Text>
          </View>
        )}

        {/* Closed notice */}
        {applicant.status === 'closed' && (
          <View style={[am.closedNotice, { backgroundColor: T.borderFaint, borderColor: T.borderFaint }]}>
            <MaterialCommunityIcons name="lock-outline" size={14} color={T.textHint} />
            <Text style={[am.closedNoticeText, { color: T.textHint }]}>
              This conversation was automatically closed after 24 hours of inactivity.
            </Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </Animated.View>
    </Modal>
  );
}

// ─── Conversation Screen ──────────────────────────────────────────────────────
function ConversationScreen({
  applicant, onBack, tabBarHeight,
}: {
  applicant: typeof PIPELINE[number] & { status: ApplicantStatus };
  onBack: () => void;
  tabBarHeight: number;
}) {
  const T = useTheme();
  const { top: topInset } = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES[applicant.id] ?? []);
  const [draft, setDraft] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const replyIndexRef = useRef(0);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { onBack(); return true; });
    return () => sub.remove();
  }, [onBack]);

  useEffect(() => {
    const SCREEN_H = Dimensions.get('screen').height;
    const show = Keyboard.addListener('keyboardDidShow', (e: KeyboardEvent) => {
      setKeyboardHeight(SCREEN_H - e.endCoordinates.screenY);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }, []);

  const scrollToBottom = (animated = true) => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated }), 100);
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now(), from: 'me', text, time: now }]);
    setDraft('');
    scrollToBottom();
    const replies = AUTO_REPLIES[applicant.id] ?? ["Thanks for your message!"];
    const replyText = replies[replyIndexRef.current % replies.length];
    replyIndexRef.current += 1;
    setIsTyping(true);
    scrollToBottom();
    setTimeout(() => {
      setIsTyping(false);
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'them', text: replyText, time: replyTime }]);
      scrollToBottom();
    }, 1400);
  };

  const isActive = applicant.status === 'active';

  return (
    <View style={[cs.screen, { paddingTop: topInset, backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar ?? 'light-content'} />
      <View style={[cs.header, { backgroundColor: T.bg }]}>
        <TouchableOpacity onPress={onBack} style={[cs.backBtn, { backgroundColor: T.surface, borderColor: T.borderFaint }]} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={T.primary} />
        </TouchableOpacity>
        <Image source={{ uri: applicant.avatar }} style={[cs.headerAvatar, { borderColor: T.border }]} />
        <View style={cs.headerInfo}>
          <Text style={[cs.headerName, { color: T.textPrimary }]}>{applicant.name}</Text>
          {isTyping
            ? <Text style={[cs.typingLabel, { color: T.primary }]}>typing...</Text>
            : <Text style={[cs.headerRole, { color: T.textSub }]}>{applicant.role}</Text>
          }
        </View>
        <View style={[cs.statusBadge,
          isActive                       ? { backgroundColor: 'rgba(34,197,94,0.12)' } :
          applicant.status === 'hired'   ? { backgroundColor: 'rgba(99,102,241,0.12)' } :
                                           { backgroundColor: T.borderFaint }
        ]}>
          <Text style={[cs.statusBadgeText, {
            color: isActive ? '#22c55e' : applicant.status === 'hired' ? '#6366f1' : T.textHint,
          }]}>
            {isActive ? 'Active' : applicant.status === 'hired' ? 'Hired' : 'Closed'}
          </Text>
        </View>
      </View>
      <View style={[cs.headerDivider, { backgroundColor: T.borderFaint }]} />

      <View style={[{ flex: 1 }, keyboardHeight > 0 && { marginBottom: keyboardHeight }]}>
        <ScrollView
          ref={scrollRef}
          style={cs.msgScroll}
          contentContainerStyle={[cs.msgContent, { paddingBottom: keyboardHeight > 0 ? 16 : tabBarHeight + 16 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollToBottom(false)}
        >
          {messages.map((msg, i) => {
            const isMe = msg.from === 'me';
            const prevMsg = messages[i - 1];
            const nextMsg = messages[i + 1];
            const isFirstInGroup = i === 0 || prevMsg.from !== msg.from;
            const isLastInGroup  = i === messages.length - 1 || nextMsg?.from !== msg.from;
            return (
              <View key={msg.id} style={[cs.bubbleWrap, isMe ? cs.bubbleWrapMe : cs.bubbleWrapThem, isFirstInGroup && { marginTop: 8 }]}>
                {!isMe && isFirstInGroup && <Image source={{ uri: applicant.avatar }} style={cs.bubbleAvatar} />}
                {!isMe && !isFirstInGroup && <View style={cs.bubbleAvatarSpacer} />}
                <View style={cs.bubbleCol}>
                  <View style={[
                    cs.bubble,
                    isMe ? [cs.bubbleMe, { backgroundColor: T.primary }] : [cs.bubbleThem, { backgroundColor: T.surfaceHigh, borderColor: T.borderFaint }],
                    !isMe && isFirstInGroup && cs.bubbleThemFirst,
                    !isMe && isLastInGroup  && cs.bubbleThemLast,
                    isMe  && isFirstInGroup && cs.bubbleMeFirst,
                    isMe  && isLastInGroup  && cs.bubbleMeLast,
                  ]}>
                    <Text style={[cs.bubbleText, isMe ? cs.bubbleTextMe : [cs.bubbleTextThem, { color: T.textPrimary }]]}>
                      {msg.text}
                    </Text>
                  </View>
                  {isLastInGroup && (
                    <Text style={[cs.bubbleTime, { color: T.textHint }, isMe ? cs.bubbleTimeMe : cs.bubbleTimeThem]}>
                      {msg.time}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}

          {isTyping && (
            <View style={[cs.bubbleWrap, cs.bubbleWrapThem, { marginTop: 8 }]}>
              <Image source={{ uri: applicant.avatar }} style={cs.bubbleAvatar} />
              <View style={[cs.bubble, cs.bubbleThem, cs.typingBubble, { backgroundColor: T.surfaceHigh, borderColor: T.borderFaint }]}>
                <View style={cs.typingDots}>
                  <View style={[cs.typingDot, cs.typingDot1, { backgroundColor: T.textHint }]} />
                  <View style={[cs.typingDot, cs.typingDot2, { backgroundColor: T.textHint }]} />
                  <View style={[cs.typingDot, cs.typingDot3, { backgroundColor: T.textHint }]} />
                </View>
              </View>
            </View>
          )}

          {!isActive && (
            <View style={[cs.expiredBanner, { backgroundColor: T.surface, borderColor: T.borderFaint }]}>
              <MaterialCommunityIcons name="lock-outline" size={13} color={T.textHint} />
              <Text style={[cs.expiredBannerText, { color: T.textHint }]}>This conversation has closed</Text>
            </View>
          )}
        </ScrollView>

        {isActive && (
          <View style={[cs.inputBar, { paddingBottom: keyboardHeight > 0 ? 8 : tabBarHeight + 8, backgroundColor: T.bg, borderTopColor: T.borderFaint }]}>
            <TextInput
              style={[cs.input, { backgroundColor: T.surface, borderColor: T.borderFaint, color: T.textPrimary }]}
              value={draft}
              onChangeText={setDraft}
              placeholder="Message…"
              placeholderTextColor={T.textHint}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[cs.sendBtn, { backgroundColor: T.primary }, !draft.trim() && cs.sendBtnDisabled]}
              onPress={sendMessage}
              activeOpacity={0.85}
              disabled={!draft.trim()}
            >
              <MaterialCommunityIcons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function CompanyMatchesScreen() {
  const T = useTheme();
  const tabBarHeight      = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('matches');

  const [applicants, setApplicants] = useState(() =>
    PIPELINE.map(a => ({ ...a, status: resolveInitialStatus(a) }))
  );

  const hasMatches  = NEW_MATCHES.length > 0;

  const [selectedConversation, setSelectedConversation] = useState<typeof applicants[number] | null>(null);
  const [selectedApplicant, setSelectedApplicant]       = useState<typeof applicants[number] | null>(null);
  const [modalVisible, setModalVisible]                 = useState(false);
  const [viewAllVisible, setViewAllVisible]             = useState(false);
  const [filterVisible, setFilterVisible]               = useState(false);
  const [activeFilter, setActiveFilter]                 = useState<FilterState>(DEFAULT_FILTER);

  const filterCount =
    (activeFilter.status !== 'all' ? 1 : 0) +
    activeFilter.roles.length + activeFilter.locations.length + activeFilter.experience.length;

  const filteredApplicants = useMemo(() => {
    return applicants.filter(a => {
      if (activeFilter.status !== 'all' && a.status !== activeFilter.status) return false;
      if (activeFilter.roles.length > 0 && !activeFilter.roles.includes(a.role)) return false;
      if (activeFilter.locations.length > 0 && !activeFilter.locations.includes(a.location)) return false;
      if (activeFilter.experience.length > 0 && !activeFilter.experience.includes(a.experience)) return false;
      return true;
    });
  }, [applicants, activeFilter]);

  const openActionModal = (app: typeof applicants[number]) => {
    setSelectedApplicant(app);
    setModalVisible(true);
  };

  const handleReject = (id: string) => {
    setApplicants(prev => prev.filter(a => a.id !== id));
  };

  const handleMarkHired = (id: string) => {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: 'hired' as ApplicantStatus } : a));
  };

  // Review state
  const [selectedReviewApplicantId, setSelectedReviewApplicantId] = useState<string | null>(null);
  const [reviewRating, setReviewRating]         = useState(0);
  const [reviewTitle, setReviewTitle]           = useState('');
  const [reviewBody, setReviewBody]             = useState('');
  const [submittedReviews, setSubmittedReviews] = useState<Review[]>([]);
  const [reviewSubmitted, setReviewSubmitted]   = useState(false);

  const closedApplicants  = filteredApplicants.filter(a => a.status === 'closed');
  const activeApplicants  = filteredApplicants.filter(a => a.status === 'active');
  const hiredApplicants   = applicants.filter(a => a.status === 'hired'); // always unfiltered for reviews

  const selectedReviewApplicant = hiredApplicants.find(a => a.id === selectedReviewApplicantId);

  const handleSubmitReview = () => {
    if (!selectedReviewApplicantId || reviewRating === 0 || !reviewTitle.trim() || !reviewBody.trim()) return;
    const review: Review = {
      id: Date.now(),
      applicantId: selectedReviewApplicantId,
      rating: reviewRating,
      title: reviewTitle.trim(),
      body: reviewBody.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };
    setSubmittedReviews(prev => [review, ...prev]);
    setReviewSubmitted(true);
    setReviewRating(0);
    setReviewTitle('');
    setReviewBody('');
    setTimeout(() => {
      setReviewSubmitted(false);
      setSelectedReviewApplicantId(null);
    }, 1800);
  };

  const openReview = (id: string) => {
    setSelectedReviewApplicantId(id);
    setReviewRating(0);
    setReviewTitle('');
    setReviewBody('');
    setReviewSubmitted(false);
  };

  // Only 2 tabs now — Matches + Review
  const tabs = [
    { key: 'matches', label: 'Matches', badge: NEW_MATCHES.length },
    { key: 'reviews', label: 'Review',  badge: hiredApplicants.length },
  ];

  if (selectedConversation) {
    return (
      <ConversationScreen
        applicant={selectedConversation}
        onBack={() => setSelectedConversation(null)}
        tabBarHeight={tabBarHeight}
      />
    );
  }

  const openConversationById = (id: string) => {
    const found = applicants.find(a => a.id === id);
    if (found) setSelectedConversation(found);
  };

  return (
    <View style={[s.screen, { paddingTop: topInset, backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar ?? 'light-content'} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={[s.pageTitle, { color: T.textPrimary }]}>Matches</Text>
          <TouchableOpacity
            style={[s.filterBtn, { backgroundColor: T.primary }]}
            activeOpacity={0.85}
            onPress={() => setFilterVisible(true)}
          >
            <MaterialCommunityIcons name="filter-variant" size={20} color="#fff" />
            {filterCount > 0 && (
              <View style={s.filterCountDot}>
                <Text style={s.filterCountText}>{filterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        {filterCount > 0 && (
          <View style={s.activeFilterRow}>
            <MaterialCommunityIcons name="filter-check" size={12} color={T.primary} />
            <Text style={[s.activeFilterText, { color: T.primary }]}>
              {filterCount} filter{filterCount > 1 ? 's' : ''} active
            </Text>
            <TouchableOpacity onPress={() => setActiveFilter(DEFAULT_FILTER)} activeOpacity={0.7}>
              <Text style={[s.activeFilterClear, { color: T.textHint }]}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Segment tabs — only 2 now */}
      <SegmentTabs tabs={tabs} active={activeTab} onSelect={setActiveTab} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: tabBarHeight + 24 }]}
      >

        {/* ══════════════ MATCHES TAB ══════════════ */}
        {activeTab === 'matches' && (
          hasMatches ? (
            <>
              {/* New applicants */}
              <View style={s.sectionRow}>
                <Text style={[s.sectionTitle, { color: T.textPrimary }]}>New applicants</Text>
                <TouchableOpacity><Text style={[s.viewAll, { color: T.primary }]}>View all</Text></TouchableOpacity>
              </View>
              <View style={[s.card, { backgroundColor: T.surface, borderColor: T.borderFaint }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={s.newMatchRow}>
                    {NEW_MATCHES.map(m => (
                      <TouchableOpacity
                        key={m.id}
                        style={s.newMatchItem}
                        activeOpacity={0.8}
                        onPress={() => openConversationById(m.id)}
                      >
                        <View style={{ position: 'relative' }}>
                          <ApplicantAvatar uri={m.avatar} size={56} />
                          {m.isNew && (
                            <View style={[s.newDot, { backgroundColor: T.primary, borderColor: T.surface }]}>
                              <MaterialCommunityIcons name="lightning-bolt" size={9} color="#fff" />
                            </View>
                          )}
                        </View>
                        <Text style={[s.newMatchName, { color: T.textPrimary }]} numberOfLines={1}>{m.name.split(' ')[0]}</Text>
                        <Text style={[s.newMatchRole, { color: T.textHint }]} numberOfLines={1}>{m.role}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* ── Active pipeline ── */}
              {activeApplicants.length > 0 && (
                <>
                  <View style={[s.sectionRow, { marginTop: 4 }]}>
                    <Text style={[s.sectionTitle, { color: T.textPrimary }]}>Applicant pipeline</Text>
                    <View style={s.pipelineHeaderRight}>
                      <View style={[s.pipelineCountBadge, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                        <Text style={[s.pipelineCountText, { color: '#22c55e' }]}>{activeApplicants.length} active</Text>
                      </View>
                      {/* View all — shows all applicants across all statuses */}
                      <TouchableOpacity
                        onPress={() => setViewAllVisible(true)}
                        activeOpacity={0.7}
                        style={s.viewAllPipeline}
                      >
                        <Text style={[s.viewAll, { color: T.primary }]}>View all</Text>
                        <MaterialCommunityIcons name="chevron-right" size={14} color={T.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={[s.card, { backgroundColor: T.surface, borderColor: T.borderFaint }]}>
                    <View style={s.groupHeader}>
                      <View style={[s.groupPill, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                        <View style={[s.groupDot, { backgroundColor: '#22c55e' }]} />
                        <Text style={[s.groupPillText, { color: '#22c55e' }]}>Active</Text>
                      </View>
                      <Text style={[s.groupCount, { color: T.textHint }]}>{activeApplicants.length}</Text>
                    </View>
                    {activeApplicants.map((app, i) => (
                      <View key={app.id}>
                        {i > 0 && <View style={[s.divider, { backgroundColor: T.borderFaint }]} />}
                        <TouchableOpacity style={s.pipelineRow} activeOpacity={0.8} onPress={() => openActionModal(app)}>
                          <ApplicantAvatar uri={app.avatar} size={44} />
                          <View style={s.pipelineInfo}>
                            <Text style={[s.pipelineName, { color: T.textPrimary }]}>{app.name}</Text>
                            <Text style={[s.pipelineRole, { color: T.textSub }]}>{app.role}</Text>
                            <View style={s.pipelineMeta}>
                              <MaterialCommunityIcons name="map-marker-outline" size={10} color={T.textHint} />
                              <Text style={[s.pipelineMetaText, { color: T.textHint }]}>{app.location}</Text>
                            </View>
                          </View>
                          <View style={s.pipelineActions}>
                            {app.unread > 0 && (
                              <View style={[s.unreadDot, { backgroundColor: T.primary }]}>
                                <Text style={s.unreadDotText}>{app.unread}</Text>
                              </View>
                            )}
                            <MaterialCommunityIcons name="chevron-right" size={18} color={T.textHint} />
                          </View>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* ── Closed pipeline ── */}
              {closedApplicants.length > 0 && (
                <View style={[s.card, { backgroundColor: T.surface, borderColor: T.borderFaint, opacity: 0.75 }]}>
                  <View style={s.groupHeader}>
                    <View style={[s.groupPill, { backgroundColor: T.borderFaint }]}>
                      <View style={[s.groupDot, { backgroundColor: T.textHint }]} />
                      <Text style={[s.groupPillText, { color: T.textHint }]}>Closed</Text>
                    </View>
                    <Text style={[s.groupCount, { color: T.textHint }]}>{closedApplicants.length}</Text>
                  </View>
                  {closedApplicants.map((app, i) => (
                    <View key={app.id}>
                      {i > 0 && <View style={[s.divider, { backgroundColor: T.borderFaint }]} />}
                      <TouchableOpacity style={s.pipelineRow} activeOpacity={0.8} onPress={() => openActionModal(app)}>
                        <View style={{ position: 'relative' }}>
                          <ApplicantAvatar uri={app.avatar} size={44} />
                          <View style={[s.closedOverlay, { backgroundColor: T.bg }]}>
                            <MaterialCommunityIcons name="lock-outline" size={10} color={T.textHint} />
                          </View>
                        </View>
                        <View style={s.pipelineInfo}>
                          <Text style={[s.pipelineName, { color: T.textSub }]}>{app.name}</Text>
                          <Text style={[s.pipelineRole, { color: T.textHint }]}>{app.role}</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={18} color={T.textHint} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* No results from filter */}
              {activeApplicants.length === 0 && closedApplicants.length === 0 && filterCount > 0 && (
                <View style={s.noResultsWrap}>
                  <MaterialCommunityIcons name="filter-off-outline" size={36} color={T.borderFaint} />
                  <Text style={[s.noResultsText, { color: T.textSub }]}>No applicants match your filters.</Text>
                  <TouchableOpacity onPress={() => setActiveFilter(DEFAULT_FILTER)} activeOpacity={0.7}>
                    <Text style={[s.noResultsClear, { color: T.primary }]}>Clear filters</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <EmptyMatchesState />
          )
        )}

        {/* ══════════════ REVIEWS TAB ══════════════ */}
        {activeTab === 'reviews' && (
          <>
            {selectedReviewApplicant ? (
              <>
                <TouchableOpacity style={s.backBtn} onPress={() => setSelectedReviewApplicantId(null)} activeOpacity={0.7}>
                  <MaterialCommunityIcons name="arrow-left" size={18} color={T.primary} />
                  <Text style={[s.backBtnText, { color: T.primary }]}>Hired applicants</Text>
                </TouchableOpacity>

                <View style={[s.detailCard, { backgroundColor: T.surface, borderColor: T.borderFaint }]}>
                  <View style={s.detailHeader}>
                    <ApplicantAvatar uri={selectedReviewApplicant.avatar} size={64} />
                    <View style={{ marginLeft: 14 }}>
                      <Text style={[s.detailName, { color: T.textPrimary }]}>{selectedReviewApplicant.name}</Text>
                      <Text style={[s.detailRole, { color: T.textSub }]}>{selectedReviewApplicant.role}</Text>
                      <View style={[s.hiredTag, { backgroundColor: 'rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.2)' }]}>
                        <MaterialCommunityIcons name="briefcase-check-outline" size={10} color="#6366f1" />
                        <Text style={[s.hiredTagText, { color: '#6366f1' }]}>Hired</Text>
                      </View>
                    </View>
                  </View>

                  <View style={[s.detailDivider, { backgroundColor: T.borderFaint }]} />
                  <Text style={[s.detailSectionLabel, { color: T.textHint }]}>RATE THIS APPLICANT</Text>

                  {reviewSubmitted ? (
                    <View style={[s.successCard, { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.2)' }]}>
                      <MaterialCommunityIcons name="check-circle" size={40} color="#22c55e" />
                      <Text style={[s.successCardTitle, { color: '#22c55e' }]}>Review submitted!</Text>
                      <Text style={[s.successCardSub, { color: '#22c55e', opacity: 0.7 }]}>Thank you for your feedback.</Text>
                    </View>
                  ) : (
                    <>
                      <View style={s.starsRow}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <TouchableOpacity key={star} onPress={() => setReviewRating(star)} activeOpacity={0.7}>
                            <MaterialCommunityIcons
                              name={star <= reviewRating ? 'star' : 'star-outline'}
                              size={36}
                              color={star <= reviewRating ? T.warning : T.borderFaint}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                      {reviewRating > 0 && (
                        <Text style={[s.ratingLabel, { color: T.warning }]}>
                          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][reviewRating]}
                        </Text>
                      )}
                      <Text style={[s.fieldLabel, { color: T.textSub }]}>Review title</Text>
                      <TextInput
                        style={[s.textField, { backgroundColor: T.surfaceHigh, borderColor: T.borderFaint, color: T.textPrimary }]}
                        value={reviewTitle}
                        onChangeText={setReviewTitle}
                        placeholder="Summarise your experience with this applicant…"
                        placeholderTextColor={T.textHint}
                        maxLength={80}
                      />
                      <Text style={[s.fieldLabel, { color: T.textSub }]}>Your review</Text>
                      <TextInput
                        style={[s.textField, s.textArea, { backgroundColor: T.surfaceHigh, borderColor: T.borderFaint, color: T.textPrimary }]}
                        value={reviewBody}
                        onChangeText={setReviewBody}
                        placeholder="Share details about communication, skills, interview performance…"
                        placeholderTextColor={T.textHint}
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                        textAlignVertical="top"
                      />
                      <TouchableOpacity
                        style={[s.submitBtn, { backgroundColor: T.primary }, (!reviewRating || !reviewTitle.trim() || !reviewBody.trim()) && s.submitBtnDisabled]}
                        onPress={handleSubmitReview}
                        activeOpacity={0.85}
                      >
                        <MaterialCommunityIcons name="send" size={16} color="#fff" />
                        <Text style={s.submitBtnText}>Submit Review</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {submittedReviews.filter(r => r.applicantId === selectedReviewApplicant.id).length > 0 && (
                    <>
                      <View style={[s.detailDivider, { backgroundColor: T.borderFaint }]} />
                      <Text style={[s.detailSectionLabel, { color: T.textHint }]}>YOUR PREVIOUS REVIEWS</Text>
                      {submittedReviews
                        .filter(r => r.applicantId === selectedReviewApplicant.id)
                        .map((rev, i) => (
                          <View key={rev.id} style={[s.reviewCard, i > 0 && { marginTop: 12 }]}>
                            <View style={s.reviewStarsRow}>
                              {[1, 2, 3, 4, 5].map(s2 => (
                                <MaterialCommunityIcons
                                  key={s2}
                                  name={s2 <= rev.rating ? 'star' : 'star-outline'}
                                  size={13}
                                  color={s2 <= rev.rating ? T.warning : T.borderFaint}
                                />
                              ))}
                              <Text style={[s.reviewDate, { color: T.textHint }]}>{rev.date}</Text>
                            </View>
                            <Text style={[s.reviewTitle, { color: T.textPrimary }]}>{rev.title}</Text>
                            <Text style={[s.reviewBody, { color: T.textSub }]}>{rev.body}</Text>
                          </View>
                        ))}
                    </>
                  )}
                </View>
              </>
            ) : (
              hiredApplicants.length === 0 ? (
                <View style={s.reviewsEmptyWrap}>
                  <MaterialCommunityIcons name="briefcase-check-outline" size={40} color={T.borderFaint} />
                  <Text style={[s.reviewsEmptyTitle, { color: T.textSub }]}>No hired applicants yet</Text>
                  <Text style={[s.reviewsEmptySub, { color: T.textHint }]}>
                    You can leave a review once you've marked an applicant as hired after extending a job offer.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={s.sectionRow}>
                    <Text style={[s.sectionTitle, { color: T.textPrimary }]}>Hired applicants</Text>
                    <View style={[s.pipelineCountBadge, { backgroundColor: 'rgba(99,102,241,0.12)' }]}>
                      <Text style={[s.pipelineCountText, { color: '#6366f1' }]}>{hiredApplicants.length} hired</Text>
                    </View>
                  </View>
                  {/* Info callout */}
                  <View style={[s.reviewInfoBanner, { backgroundColor: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.18)' }]}>
                    <MaterialCommunityIcons name="information-outline" size={14} color="#6366f1" />
                    <Text style={[s.reviewInfoText, { color: '#6366f1' }]}>
                      Reviews are only available for applicants you've hired and extended a job offer to.
                    </Text>
                  </View>
                  <View style={[s.card, { backgroundColor: T.surface, borderColor: T.borderFaint }]}>
                    {hiredApplicants.map((app, i) => {
                      const appReviews = submittedReviews.filter(r => r.applicantId === app.id);
                      return (
                        <View key={app.id}>
                          {i > 0 && <View style={[s.divider, { backgroundColor: T.borderFaint }]} />}
                          <TouchableOpacity
                            style={s.applicantListRow}
                            onPress={() => openReview(app.id)}
                            activeOpacity={0.8}
                          >
                            <ApplicantAvatar uri={app.avatar} size={48} />
                            <View style={s.applicantListInfo}>
                              <Text style={[s.applicantListName, { color: T.textPrimary }]}>{app.name}</Text>
                              <Text style={[s.applicantListRole, { color: T.textSub }]}>{app.role}</Text>
                              {appReviews.length > 0 ? (
                                <View style={s.reviewedRow}>
                                  <MaterialCommunityIcons name="check-circle" size={12} color="#22c55e" />
                                  <Text style={[s.reviewedText, { color: '#22c55e' }]}>Reviewed</Text>
                                </View>
                              ) : (
                                <Text style={[s.reviewHint, { color: T.primary }]}>Tap to leave a review</Text>
                              )}
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={T.textHint} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </>
              )
            )}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Applicant Action Modal */}
      <ApplicantActionModal
        applicant={selectedApplicant}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onMessage={(app) => setSelectedConversation(app as typeof applicants[number])}
        onReject={handleReject}
        onMarkHired={handleMarkHired}
      />

      {/* View All Pipeline Modal */}
      <ViewAllPipelineModal
        visible={viewAllVisible}
        applicants={applicants}
        onClose={() => setViewAllVisible(false)}
        onSelect={(app) => openActionModal(app)}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={filterVisible}
        current={activeFilter}
        onApply={setActiveFilter}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  );
}

// ─── View All Pipeline styles ─────────────────────────────────────────────────
const vap = StyleSheet.create({
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, top: 60,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12,
  },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 16 },
  headerRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title:      { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  closeBtn:   { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:     { paddingBottom: 40 },
  groupPill:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  groupDot:   { width: 6, height: 6, borderRadius: 3 },
  groupLabel: { fontSize: 12, fontWeight: '700' },
  groupCount: { fontSize: 12, fontWeight: '700', marginLeft: 2 },
  groupCard:  { borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 4 },
  divider:    { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  row:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  info:       { flex: 1 },
  name:       { fontSize: 15, fontWeight: '600' },
  role:       { fontSize: 13, marginTop: 1 },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  metaText:   { fontSize: 11 },
  dot:        { width: 3, height: 3, borderRadius: 1.5 },
  unreadDot:  { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  unreadText: { fontSize: 9, fontWeight: '800', color: '#fff' },
});

// ─── Filter Modal styles ──────────────────────────────────────────────────────
const fm = StyleSheet.create({
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1, maxHeight: '80%',
  },
  handle:    { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title:     { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  clearAll:  { fontSize: 14, fontWeight: '600' },
  groupLabel:{ fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  chipRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 50, borderWidth: 1 },
  chipText:  { fontSize: 13, fontWeight: '600' },
  applyBtn:  { borderRadius: 50, paddingVertical: 15, alignItems: 'center', marginTop: 16 },
  applyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

// ─── Action modal styles ──────────────────────────────────────────────────────
const am = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1,
  },
  handle:          { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  profileHeader:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar:          { width: 58, height: 58, borderRadius: 29, borderWidth: 2 },
  profileInfo:     { flex: 1 },
  profileName:     { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  profileRole:     { fontSize: 13, marginTop: 2 },
  profileMeta:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  profileMetaText: { fontSize: 11 },
  dot:             { width: 3, height: 3, borderRadius: 1.5, marginHorizontal: 2 },
  statusBadge:     { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' },
  statusDot:       { width: 6, height: 6, borderRadius: 3 },
  statusText:      { fontSize: 11, fontWeight: '700' },
  about:           { fontSize: 13, lineHeight: 20, marginBottom: 10 },
  infoRow:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  infoText:        { fontSize: 12 },
  skillsScroll:    { marginTop: 10, marginBottom: 4 },
  skillsContent:   { gap: 7, flexDirection: 'row', paddingBottom: 4 },
  skillChip:       { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  skillChipText:   { fontSize: 12, fontWeight: '600' },
  divider:         { height: StyleSheet.hairlineWidth, marginVertical: 16 },
  actions:         { flexDirection: 'row', gap: 10, marginBottom: 10 },
  actionBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16 },
  actionBtnPrimary:      {},
  actionBtnPrimaryText:  { fontSize: 14, fontWeight: '700', color: '#fff' },
  actionBtnSecondary:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 1 },
  actionBtnSecondaryText:{ fontSize: 14, fontWeight: '700' },
  rejectBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 13, borderRadius: 16, borderWidth: 1, marginBottom: 6 },
  rejectBtnText:   { fontSize: 14, fontWeight: '700' },
  closedNotice:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  closedNoticeText:{ fontSize: 13, flex: 1, lineHeight: 18 },
});

// ─── Main screen styles ───────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1 },

  header:    { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  filterBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  filterCountDot:  { position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center' },
  filterCountText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  activeFilterRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  activeFilterText:{ fontSize: 12, fontWeight: '600' },
  activeFilterClear:{ fontSize: 12, fontWeight: '600', marginLeft: 4 },

  segWrap: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 16,
    borderRadius: 14, borderWidth: 1, padding: 4,
  },
  segTab:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 10, gap: 6 },
  segTabText:  { fontSize: 13, fontWeight: '600' },
  segBadge:    { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, minWidth: 18, alignItems: 'center' },
  segBadgeText:{ fontSize: 10, fontWeight: '700', color: '#fff' },

  scroll: { paddingHorizontal: 20 },

  sectionRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  viewAll:      { fontSize: 13, fontWeight: '600' },

  pipelineHeaderRight:{ flexDirection: 'row', alignItems: 'center', gap: 10 },
  viewAllPipeline:    { flexDirection: 'row', alignItems: 'center', gap: 2 },

  card:    { borderRadius: 20, borderWidth: 1, padding: 14, marginBottom: 16 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 8 },

  pipelineCountBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  pipelineCountText:  { fontSize: 11, fontWeight: '700' },

  groupHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  groupPill:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  groupDot:      { width: 6, height: 6, borderRadius: 3 },
  groupPillText: { fontSize: 12, fontWeight: '700' },
  groupCount:    { fontSize: 12, fontWeight: '600' },

  emptyWrap:      { alignItems: 'center', paddingTop: 24, paddingHorizontal: 32 },
  ghostStack:     { width: SCREEN_WIDTH - 64, height: 210, position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  ghostCard:      { position: 'absolute', width: 136, height: 182, borderRadius: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 6, overflow: 'hidden' },
  ghostPhoto:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ghostMeta:      { padding: 12 },
  ghostLine:      { height: 8, borderRadius: 4 },
  boltBadge:      { position: 'absolute', top: 14, left: '28%' as any, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6, zIndex: 10 },
  emptyTitle:     { fontSize: 21, fontWeight: '800', textAlign: 'center', lineHeight: 30, marginBottom: 12, letterSpacing: -0.3 },
  emptySub:       { fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 32 },
  boostBtn:       { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 50, paddingVertical: 16, paddingHorizontal: 40, marginBottom: 16, width: '100%', justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 4 },
  boostIconWrap:  { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  boostBtnText:   { fontSize: 16, fontWeight: '700', color: '#fff' },
  editProfileText:{ fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },

  newMatchRow:  { flexDirection: 'row', gap: 16, paddingBottom: 4 },
  newMatchItem: { alignItems: 'center', width: 70 },
  newDot:       { position: 'absolute', bottom: 1, right: 1, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  newMatchName: { fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 6 },
  newMatchRole: { fontSize: 10, textAlign: 'center', marginTop: 1 },

  pipelineRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  pipelineInfo:     { flex: 1 },
  pipelineName:     { fontSize: 15, fontWeight: '600' },
  pipelineRole:     { fontSize: 13, marginTop: 1 },
  pipelineMeta:     { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  pipelineMetaText: { fontSize: 11 },
  pipelineActions:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  unreadDot:        { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  unreadDotText:    { fontSize: 9, fontWeight: '800', color: '#fff' },
  closedOverlay:    { position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  noResultsWrap: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  noResultsText: { fontSize: 15, fontWeight: '600' },
  noResultsClear:{ fontSize: 14, fontWeight: '600' },

  backBtn:            { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, marginBottom: 6 },
  backBtnText:        { fontSize: 14, fontWeight: '600' },
  detailCard:         { borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 16 },
  detailHeader:       { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  detailName:         { fontSize: 20, fontWeight: '800', letterSpacing: -0.3, marginBottom: 3 },
  detailRole:         { fontSize: 14, marginBottom: 8 },
  detailDivider:      { height: StyleSheet.hairlineWidth, marginVertical: 16 },
  detailSectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12 },
  successCard:        { alignItems: 'center', paddingVertical: 28, borderRadius: 16, borderWidth: 1, gap: 8, marginBottom: 12 },
  successCardTitle:   { fontSize: 18, fontWeight: '700' },
  successCardSub:     { fontSize: 14 },
  fieldLabel:         { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  starsRow:           { flexDirection: 'row', gap: 6, marginBottom: 6 },
  ratingLabel:        { fontSize: 13, fontWeight: '600', marginBottom: 12 },
  textField:          { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, marginBottom: 10 },
  textArea:           { minHeight: 100, paddingTop: 10 },
  submitBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 50, paddingVertical: 14, marginTop: 4 },
  submitBtnDisabled:  { opacity: 0.4 },
  submitBtnText:      { fontSize: 15, fontWeight: '700', color: '#fff' },
  applicantListRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  applicantListInfo:  { flex: 1 },
  applicantListName:  { fontSize: 15, fontWeight: '600' },
  applicantListRole:  { fontSize: 13, marginTop: 1 },
  reviewedRow:        { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  reviewedText:       { fontSize: 11, fontWeight: '600' },
  reviewHint:         { fontSize: 11, marginTop: 4 },
  reviewsEmptyWrap:   { alignItems: 'center', paddingVertical: 60, gap: 12 },
  reviewsEmptyTitle:  { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  reviewsEmptySub:    { fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 24 },
  reviewCard:         { gap: 5 },
  reviewStarsRow:     { flexDirection: 'row', alignItems: 'center', gap: 2 },
  reviewDate:         { fontSize: 11, marginLeft: 6 },
  reviewTitle:        { fontSize: 14, fontWeight: '600' },
  reviewBody:         { fontSize: 13, lineHeight: 20 },
  hiredTag:           { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, alignSelf: 'flex-start' },
  hiredTagText:       { fontSize: 11, fontWeight: '700' },
  reviewInfoBanner:   { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  reviewInfoText:     { fontSize: 12, flex: 1, lineHeight: 18, fontWeight: '500' },
});

// ─── Conversation screen styles ───────────────────────────────────────────────
const cs = StyleSheet.create({
  screen: { flex: 1 },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  backBtn:         { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerAvatar:    { width: 40, height: 40, borderRadius: 12, borderWidth: 1 },
  headerInfo:      { flex: 1 },
  headerName:      { fontSize: 15, fontWeight: '700' },
  headerRole:      { fontSize: 12, marginTop: 1 },
  typingLabel:     { fontSize: 12, fontStyle: 'italic', marginTop: 1 },
  statusBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  headerDivider:   { height: StyleSheet.hairlineWidth },
  msgScroll:  { flex: 1 },
  msgContent: { paddingHorizontal: 16, paddingTop: 16, gap: 4 },
  bubbleWrap:     { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 2 },
  bubbleWrapMe:   { justifyContent: 'flex-end' },
  bubbleWrapThem: { justifyContent: 'flex-start' },
  bubbleAvatar:       { width: 28, height: 28, borderRadius: 9, marginBottom: 2 },
  bubbleAvatarSpacer: { width: 28 },
  bubbleCol:          { maxWidth: SCREEN_WIDTH * 0.72, gap: 3 },
  bubble:          { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe:        { borderBottomRightRadius: 4 },
  bubbleThem:      { borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleMeFirst:   { borderTopRightRadius: 18 },
  bubbleMeLast:    { borderBottomRightRadius: 4 },
  bubbleThemFirst: { borderTopLeftRadius: 18 },
  bubbleThemLast:  { borderBottomLeftRadius: 4 },
  bubbleText:     { fontSize: 14, lineHeight: 20 },
  bubbleTextMe:   { color: '#fff' },
  bubbleTextThem: {},
  bubbleTime:     { fontSize: 10 },
  bubbleTimeMe:   { textAlign: 'right' },
  bubbleTimeThem: { textAlign: 'left' },
  typingBubble: { paddingVertical: 12, paddingHorizontal: 16 },
  typingDots:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  typingDot:    { width: 7, height: 7, borderRadius: 4 },
  typingDot1:   {},
  typingDot2:   { opacity: 0.65 },
  typingDot3:   { opacity: 0.35 },
  expiredBanner:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, marginBottom: 8, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, alignSelf: 'center' },
  expiredBannerText: { fontSize: 12, fontWeight: '600' },
  inputBar:        { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  input:           { flex: 1, minHeight: 44, maxHeight: 120, borderRadius: 22, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 11, fontSize: 14 },
  sendBtn:         { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.35 },
});