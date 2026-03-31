import React, { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Dimensions, TextInput, Image, Keyboard, KeyboardEvent, Platform,
} from 'react-native';
import {
  StatusPill, CountBadge, CompanyLogo,
  Colors, Typography, Spacing, Radii,
} from '../../components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:          '#0f0a1e',
  surface:     '#16102a',
  surfaceHigh: '#1e1535',
  border:      'rgba(168,85,247,0.18)',
  borderFaint: 'rgba(255,255,255,0.07)',
  primary:     '#a855f7',
  primaryDark: '#7c3aed',
  textPrimary: '#ffffff',
  textSub:     'rgba(255,255,255,0.55)',
  textHint:    'rgba(255,255,255,0.35)',
  warning:     '#f59e0b',
  warningLight:'rgba(245,158,11,0.12)',
  success:     '#22c55e',
  successLight:'rgba(34,197,94,0.12)',
  rose:        '#ec4899',
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const NEW_MATCHES: {
  id: number; abbr: string; color: string;
  company: string; role: string; isNew: boolean;
}[] = [];

type Status = 'applied' | 'screening' | 'interview' | 'offer';

const PIPELINE: {
  id: number; abbr: string; color: string;
  company: string; role: string; status: Status;
  lastMsg: string; time: string; unread: number;
  expired?: boolean;
}[] = [
  {
    id: 10, abbr: 'IL', color: T.warning, company: 'InnovateLabs', role: 'Product Designer',
    lastMsg: "Hi Alex! We loved your portfolio — available for a call this week?",
    time: '2m', unread: 2, status: 'screening',
  },
  {
    id: 11, abbr: 'PW', color: T.rose, company: 'Pixel Works', role: 'iOS Engineer',
    lastMsg: "Moving you to the technical interview stage 🎉",
    time: '1h', unread: 1, status: 'interview',
  },
  {
    id: 12, abbr: 'TF', color: T.primary, company: 'TechFlow Inc', role: 'Sr. RN Engineer',
    lastMsg: "Thanks for applying! We'll review and get back to you soon.",
    time: '3h', unread: 0, status: 'applied', expired: true,
  },
  {
    id: 13, abbr: 'DS', color: T.success, company: 'DataStream', role: 'ML Engineer',
    lastMsg: "We'd like to extend a formal offer — congratulations!",
    time: 'Yesterday', unread: 0, status: 'offer',
  },
];

const PIPELINE_STAGES: { key: Status; label: string; icon: string; bg: string; text: string }[] = [
  { key: 'applied',   label: 'Applied',   icon: 'send-outline',           bg: 'rgba(255,255,255,0.07)', text: 'rgba(255,255,255,0.5)'  },
  { key: 'screening', label: 'Screening', icon: 'account-search-outline', bg: T.warningLight,           text: '#fbbf24'                },
  { key: 'interview', label: 'Interview', icon: 'video-outline',          bg: 'rgba(168,85,247,0.15)',  text: '#c084fc'                },
  { key: 'offer',     label: 'Offer 🎉',  icon: 'star-outline',           bg: T.successLight,           text: '#4ade80'                },
];

const APPLIED_COMPANIES = [
  {
    id: 10, abbr: 'IL', color: T.warning, company: 'InnovateLabs', role: 'Product Designer',
    salary: '$100k – $130k / yr', location: 'New York, NY · Hybrid',
    tags: ['Hybrid', 'Full-time', 'Scaleup'],
    description: 'Design beautiful interfaces for next-gen SaaS products. Work with a world-class design system team. Own end-to-end product design from research to delivery.',
    photos: [
      require('../assets/images/alorica.jpg'),
      require('../assets/images/alorica2.jpg'),
      require('../assets/images/alorica3.jpg'),
    ],
  },
  {
    id: 11, abbr: 'PW', color: T.rose, company: 'Pixel Works', role: 'iOS Engineer',
    salary: '$115k – $145k / yr', location: 'Los Angeles · Remote',
    tags: ['Remote', 'Full-time', 'Startup'],
    description: 'Build polished iOS experiences for millions of creative professionals. Join a small, high-output team shipping major features every sprint.',
    photos: [
      require('../assets/images/alorica2.jpg'),
      require('../assets/images/alorica3.jpg'),
      require('../assets/images/alorica.jpg'),
    ],
  },
  {
    id: 12, abbr: 'TF', color: T.primary, company: 'TechFlow Inc', role: 'Sr. RN Engineer',
    salary: '$120k – $150k / yr', location: 'San Francisco, CA · Remote',
    tags: ['Remote', 'Full-time', 'Startup'],
    description: 'Build cutting-edge mobile experiences for 2M+ users. Lead a team of 4 engineers shipping weekly releases. You will own the entire mobile stack.',
    photos: [
      require('../assets/images/accenture.jpg'),
      require('../assets/images/accenture2.jpg'),
      require('../assets/images/accenture3.jpg'),
    ],
  },
  {
    id: 13, abbr: 'DS', color: T.success, company: 'DataStream', role: 'ML Engineer',
    salary: '$140k – $180k / yr', location: 'Boston, MA · On-site',
    tags: ['On-site', 'Full-time', 'Enterprise'],
    description: 'Lead machine learning initiatives for Fortune 500 clients. Publish research and own the ML roadmap. Work with petabyte-scale datasets.',
    photos: [
      require('../assets/images/socia.png'),
      require('../assets/images/socia2.jpg'),
      require('../assets/images/socia3.jpg'),
    ],
  },
];

type Review = {
  id: number;
  companyId: number;
  rating: number;
  title: string;
  body: string;
  date: string;
};

// ─── Chat types & seed data ───────────────────────────────────────────────────
type ChatMessage = {
  id: number;
  from: 'me' | 'them';
  text: string;
  time: string;
};

const SEED_MESSAGES: Record<number, ChatMessage[]> = {
  10: [
    { id: 1, from: 'them', text: "Hi Alex! We loved your portfolio 🎨 — are you available for a quick call this week?", time: '10:02 AM' },
    { id: 2, from: 'me',   text: "Thanks so much! I'd love that. I'm free Thursday or Friday afternoon.", time: '10:15 AM' },
    { id: 3, from: 'them', text: "Perfect, let's do Friday at 2 PM EST. I'll send a calendar invite shortly.", time: '10:18 AM' },
    { id: 4, from: 'me',   text: "Sounds great, looking forward to it!", time: '10:20 AM' },
    { id: 5, from: 'them', text: "Hi Alex! We loved your portfolio — available for a call this week?", time: '2m ago' },
  ],
  11: [
    { id: 1, from: 'them', text: "Hey Alex, thanks for applying to the iOS Engineer role!", time: 'Yesterday' },
    { id: 2, from: 'me',   text: "Thanks for considering me. I'm really excited about what Pixel Works is building.", time: 'Yesterday' },
    { id: 3, from: 'them', text: "Moving you to the technical interview stage 🎉 Our team will reach out to schedule.", time: '1h ago' },
  ],
  12: [
    { id: 1, from: 'me',   text: "Hi, I just submitted my application for the Sr. RN Engineer role. Looking forward to hearing from you!", time: '3h ago' },
    { id: 2, from: 'them', text: "Thanks for applying! We'll review your profile and get back to you soon.", time: '3h ago' },
  ],
  13: [
    { id: 1, from: 'me',   text: "Hi, I'm very interested in the ML Engineer position at DataStream.", time: 'Mon' },
    { id: 2, from: 'them', text: "Great to meet you, Alex! Your background in ML is impressive.", time: 'Mon' },
    { id: 3, from: 'me',   text: "Thank you! I've been following DataStream's research publications closely.", time: 'Tue' },
    { id: 4, from: 'them', text: "We'd like to extend a formal offer — congratulations! 🎉 Details incoming.", time: 'Yesterday' },
  ],
};

// ─── Conversation Screen ──────────────────────────────────────────────────────
type ConvMsg = ChatMessage;

const AUTO_REPLIES: Record<number, string[]> = {
  10: [
    "Sounds great, we'll confirm the time shortly!",
    "Looking forward to connecting with you 😊",
    "Feel free to ask any questions before the call.",
  ],
  11: [
    "Our engineering team will reach out within 24 hours.",
    "Excited to have you move forward in the process!",
    "Let us know if you have any questions in the meantime.",
  ],
  12: [
    "We appreciate your patience while we review.",
    "Our team carefully reviews every application.",
    "We'll be in touch soon!",
  ],
  13: [
    "Congratulations again — we're thrilled to have you!",
    "HR will send over the formal offer letter shortly.",
    "Feel free to reach out with any questions about the offer.",
  ],
};

function ConversationScreen({
  conversation,
  onBack,
  tabBarHeight,
}: {
  conversation: typeof PIPELINE[number];
  onBack: () => void;
  tabBarHeight: number;
}) {
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const [messages, setMessages] = useState<ConvMsg[]>(
    SEED_MESSAGES[conversation.id] ?? []
  );
  const [draft, setDraft] = useState('');
const [keyboardHeight, setKeyboardHeight] = useState(0);

useEffect(() => {
  const SCREEN_H = Dimensions.get('screen').height;
  const show = Keyboard.addListener('keyboardDidShow', (e: KeyboardEvent) => {
    // screenY is the top of the keyboard on screen — subtract from screen height
    // to get true height including toolbar row
    setKeyboardHeight(SCREEN_H - e.endCoordinates.screenY);
  });
  const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
  return () => { show.remove(); hide.remove(); };
}, []);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const replyIndexRef = useRef(0);

  // Header height: back btn row ~62px + divider 1px
  const HEADER_H = 63;

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

    const replies = AUTO_REPLIES[conversation.id] ?? ["Thanks for your message!"];
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

  return (
    <View style={[cs.screen, { paddingTop: topInset }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Conversation header (outside KAV so it never moves) ── */}
      <View style={cs.header}>
        <TouchableOpacity onPress={onBack} style={cs.backBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={T.primary} />
        </TouchableOpacity>
        <View style={[cs.headerLogo, { backgroundColor: conversation.color }]}>
          <Text style={cs.headerLogoText}>{conversation.abbr}</Text>
        </View>
        <View style={cs.headerInfo}>
          <Text style={cs.headerCompany}>{conversation.company}</Text>
          {isTyping
            ? <Text style={cs.typingLabel}>typing…</Text>
            : <Text style={cs.headerRole}>{conversation.role}</Text>
          }
        </View>
        <View style={[cs.statusBadge, { backgroundColor: statusBg(conversation.status) }]}>
          <Text style={[cs.statusBadgeText, { color: statusColor(conversation.status) }]}>
            {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
          </Text>
        </View>
      </View>
      <View style={cs.headerDivider} />

      {/* ── Plain View, margin = true keyboard height from screenY ── */}
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
            const isFirstInGroup = i === 0 || prevMsg.from !== msg.from;
            const isLastInGroup  = i === messages.length - 1 || messages[i + 1].from !== msg.from;
            const showAvatar = !isMe && isFirstInGroup;
            const showSpacer = !isMe && !isFirstInGroup;
            return (
              <View
                key={msg.id}
                style={[
                  cs.bubbleWrap,
                  isMe ? cs.bubbleWrapMe : cs.bubbleWrapThem,
                  isFirstInGroup && { marginTop: 8 },
                ]}
              >
                {showAvatar && (
                  <View style={[cs.bubbleAvatar, { backgroundColor: conversation.color }]}>
                    <Text style={cs.bubbleAvatarText}>{conversation.abbr}</Text>
                  </View>
                )}
                {showSpacer && <View style={cs.bubbleAvatarSpacer} />}
                <View style={cs.bubbleCol}>
                  <View style={[
                    cs.bubble,
                    isMe ? cs.bubbleMe : cs.bubbleThem,
                    !isMe && isFirstInGroup  && cs.bubbleThemFirst,
                    !isMe && isLastInGroup   && cs.bubbleThemLast,
                    isMe  && isFirstInGroup  && cs.bubbleMeFirst,
                    isMe  && isLastInGroup   && cs.bubbleMeLast,
                  ]}>
                    <Text style={[cs.bubbleText, isMe ? cs.bubbleTextMe : cs.bubbleTextThem]}>
                      {msg.text}
                    </Text>
                  </View>
                  {isLastInGroup && (
                    <Text style={[cs.bubbleTime, isMe ? cs.bubbleTimeMe : cs.bubbleTimeThem]}>
                      {msg.time}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}

          {isTyping && (
            <View style={[cs.bubbleWrap, cs.bubbleWrapThem, { marginTop: 8 }]}>
              <View style={[cs.bubbleAvatar, { backgroundColor: conversation.color }]}>
                <Text style={cs.bubbleAvatarText}>{conversation.abbr}</Text>
              </View>
              <View style={[cs.bubble, cs.bubbleThem, cs.typingBubble]}>
                <View style={cs.typingDots}>
                  <View style={[cs.typingDot, cs.typingDot1]} />
                  <View style={[cs.typingDot, cs.typingDot2]} />
                  <View style={[cs.typingDot, cs.typingDot3]} />
                </View>
              </View>
            </View>
          )}

          {conversation.expired && (
            <View style={cs.expiredBanner}>
              <MaterialCommunityIcons name="lock-outline" size={13} color={T.textHint} />
              <Text style={cs.expiredBannerText}>This conversation has closed</Text>
            </View>
          )}
        </ScrollView>

        {!conversation.expired && (
          <View style={[cs.inputBar, { paddingBottom: keyboardHeight > 0 ? 8 : tabBarHeight + 8 }]}>
            <TextInput
              style={cs.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Message…"
              placeholderTextColor={T.textHint}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[cs.sendBtn, !draft.trim() && cs.sendBtnDisabled]}
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

function statusBg(status: Status) {
  const map: Record<Status, string> = {
    applied:   'rgba(255,255,255,0.07)',
    screening: 'rgba(245,158,11,0.12)',
    interview: 'rgba(168,85,247,0.15)',
    offer:     'rgba(34,197,94,0.12)',
  };
  return map[status];
}

function statusColor(status: Status) {
  const map: Record<Status, string> = {
    applied:   'rgba(255,255,255,0.5)',
    screening: '#fbbf24',
    interview: '#c084fc',
    offer:     '#4ade80',
  };
  return map[status];
}

// ─── Ghost cards for empty state ──────────────────────────────────────────────
function GhostCard({
  avatarColor,
  rotate,
  translateX,
  translateY,
  blur,
}: {
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
          transform: [{ rotate }, { translateX }, { translateY }],
          opacity: blur ? 0.4 : 0.85,
        },
      ]}
    >
      <View style={[s.ghostPhoto, { backgroundColor: avatarColor + '25' }]}>
        <MaterialCommunityIcons name="account" size={48} color={avatarColor + '55'} />
      </View>
      <View style={s.ghostMeta}>
        <View style={[s.ghostLine, { width: 80 }]} />
        <View style={[s.ghostLine, { width: 50, marginTop: 6 }]} />
      </View>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyMatchesState() {
  return (
    <View style={s.emptyWrap}>
      <View style={s.ghostStack}>
        <GhostCard avatarColor="#7c3aed" rotate="8deg" translateX={40} translateY={10} blur />
        <GhostCard avatarColor="#a855f7" rotate="-4deg" translateX={-10} translateY={0} />
        <View style={s.boltBadge}>
          <MaterialCommunityIcons name="lightning-bolt" size={18} color="#fff" />
        </View>
      </View>

      <Text style={s.emptyTitle}>Oops! Your profile hasn't{'\n'}received any likes yet.</Text>
      <Text style={s.emptySub}>
        Consider completing it or boosting your profile to attract more attention and likes.
      </Text>

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

// ─── Segment tabs ─────────────────────────────────────────────────────────────
function SegmentTabs({
  tabs,
  active,
  onSelect,
}: {
  tabs: { key: string; label: string; badge?: number }[];
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <View style={s.segWrap}>
      {tabs.map(tab => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[s.segTab, isActive && s.segTabActive]}
            onPress={() => onSelect(tab.key)}
            activeOpacity={0.75}
          >
            <Text style={[s.segTabText, isActive && s.segTabTextActive]}>
              {tab.label}
            </Text>
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

// ─── MatchesTab ───────────────────────────────────────────────────────────────
export default function MatchesTab() {
  const [activeTab, setActiveTab] = useState('matches');

  const tabBarHeight = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();
  const totalUnread = PIPELINE.reduce((a, m) => a + m.unread, 0);
  const hasMatches = NEW_MATCHES.length > 0;

  // ── Review form state ──────────────────────────────────────────────────────
  const [selectedConversation, setSelectedConversation] = useState<typeof PIPELINE[number] | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [reviewRating, setReviewRating]           = useState(0);
  const [reviewTitle, setReviewTitle]             = useState('');
  const [reviewBody, setReviewBody]               = useState('');
  const [submittedReviews, setSubmittedReviews]   = useState<Review[]>([]);
  const [reviewSubmitted, setReviewSubmitted]     = useState(false);

  const selectedCompany = APPLIED_COMPANIES.find(c => c.id === selectedCompanyId);

  const handleSubmitReview = () => {
    if (!selectedCompanyId || reviewRating === 0 || !reviewTitle.trim() || !reviewBody.trim()) return;
    const review: Review = {
      id: Date.now(),
      companyId: selectedCompanyId,
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
      setSelectedCompanyId(null);
    }, 1800);
  };

  const openCompany = (id: number) => {
    setSelectedCompanyId(id);
    setReviewRating(0);
    setReviewTitle('');
    setReviewBody('');
    setReviewSubmitted(false);
  };

  const tabs = [
    { key: 'matches',  label: 'Matches',  badge: NEW_MATCHES.length },
    { key: 'messages', label: 'Messages', badge: totalUnread },
    { key: 'reviews',  label: 'Reviews',  badge: 0 },
  ];

  // ── Conversation detail (full-screen swap) ─────────────────────────────────
  if (selectedConversation) {
    return (
      <ConversationScreen
        conversation={selectedConversation}
        onBack={() => setSelectedConversation(null)}
        tabBarHeight={tabBarHeight}
      />
    );
  }

  return (
    <View style={[s.screen, { paddingTop: topInset }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.pageTitle}>Matches</Text>
          <TouchableOpacity style={s.filterBtn} activeOpacity={0.85}>
            <MaterialCommunityIcons name="filter-variant" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Segment tabs ── */}
      <SegmentTabs tabs={tabs} active={activeTab} onSelect={setActiveTab} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: tabBarHeight + 24 }]}
      >
        {/* ── MATCHES TAB ── */}
        {activeTab === 'matches' && (
          hasMatches ? (
            <>
              {/* New matches */}
              <View style={s.sectionRow}>
                <Text style={s.sectionTitle}>New matches</Text>
                <TouchableOpacity><Text style={s.viewAll}>View all</Text></TouchableOpacity>
              </View>
              <View style={s.card}>
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
              </View>

              {/* Pipeline */}
              <View style={[s.sectionRow, { marginTop: 8 }]}>
                <Text style={s.sectionTitle}>Your pipeline</Text>
              </View>
              <View style={s.card}>
                {PIPELINE_STAGES.map((stage, si) => {
                  const stageJobs = PIPELINE.filter(p => p.status === stage.key);
                  if (!stageJobs.length) return null;
                  return (
                    <View key={stage.key}>
                      {si > 0 && <View style={s.divider} />}
                      <View style={s.stageHeader}>
                        <View style={[s.stagePill, { backgroundColor: stage.bg }]}>
                          <MaterialCommunityIcons name={stage.icon as any} size={12} color={stage.text} />
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
                          <MaterialCommunityIcons name="chevron-right" size={18} color={T.textHint} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <EmptyMatchesState />
          )
        )}

        {/* ── MESSAGES TAB ── */}
        {activeTab === 'messages' && (
          <>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Recent conversations</Text>
            </View>
            <View style={s.card}>
              {PIPELINE.map((msg, i) => (
                <View key={msg.id}>
                  {i > 0 && <View style={s.divider} />}
                  <TouchableOpacity
                    style={[s.msgRow, msg.expired && s.msgRowExpired]}
                    activeOpacity={0.85}
                    onPress={() => setSelectedConversation(msg)}
                  >
                    <View style={{ position: 'relative' }}>
                      <View style={msg.expired ? s.msgLogoExpired : undefined}>
                        <CompanyLogo
                          abbr={msg.abbr}
                          color={msg.expired ? 'rgba(255,255,255,0.18)' : msg.color}
                          size="md"
                        />
                      </View>
                      {msg.unread > 0 && !msg.expired && <CountBadge count={msg.unread} />}
                    </View>
                    <View style={s.msgBody}>
                      <View style={s.msgTopRow}>
                        <Text style={[s.msgCompany, msg.expired && s.msgTextFaded]}>{msg.company}</Text>
                        <Text style={s.msgTime}>{msg.time}</Text>
                      </View>
                      <Text style={[s.msgRole, msg.expired && s.msgTextFaded]}>{msg.role}</Text>
                      <Text
                        style={[s.msgPreview, msg.expired && s.msgTextFaded]}
                        numberOfLines={1}
                      >
                        {msg.lastMsg}
                      </Text>

                      {msg.expired ? (
                        <View style={s.expiredRow}>
                          <View style={s.closedTag}>
                            <MaterialCommunityIcons name="lock-outline" size={10} color={T.textHint} />
                            <Text style={s.closedTagText}>Conversation closed</Text>
                          </View>
                          <TouchableOpacity
                            style={s.leaveReviewBtn}
                            activeOpacity={0.8}
                            onPress={() => {
                              openCompany(msg.id);
                              setActiveTab('reviews');
                            }}
                          >
                            <MaterialCommunityIcons name="star-outline" size={11} color={T.primary} />
                            <Text style={s.leaveReviewBtnText}>Leave a review</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <StatusPill status={msg.status} />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── REVIEWS TAB ── */}
        {activeTab === 'reviews' && (
          <>
            {selectedCompany ? (
              <>
                {/* Back button */}
                <TouchableOpacity
                  style={s.backBtn}
                  onPress={() => setSelectedCompanyId(null)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="arrow-left" size={18} color={T.primary} />
                  <Text style={s.backBtnText}>All companies</Text>
                </TouchableOpacity>

                {/* Company detail card */}
                <View style={s.detailCard}>
                  <Image source={selectedCompany.photos[0]} style={s.detailHeroImg} resizeMode="cover" />
                  <View style={s.detailHeroScrim} />

                  <View style={s.detailContent}>
                    <Text style={s.detailRole}>{selectedCompany.role}</Text>
                    <Text style={s.detailSalary}>{selectedCompany.salary}</Text>

                    <View style={s.detailLocationRow}>
                      <MaterialCommunityIcons name="map-marker-outline" size={13} color={T.textSub} />
                      <Text style={s.detailLocation}>{selectedCompany.location}</Text>
                    </View>

                    <View style={s.detailTagsRow}>
                      {selectedCompany.tags.map(tag => (
                        <View key={tag} style={s.detailTag}>
                          <Text style={s.detailTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={s.detailDivider} />
                    <Text style={s.detailSectionLabel}>ABOUT THE ROLE</Text>
                    <Text style={s.detailDescription}>{selectedCompany.description}</Text>

                    <View style={s.detailDivider} />
                    <Text style={s.detailSectionLabel}>COMPANY PHOTOS</Text>
                    <View style={s.detailGalleryMain}>
                      <Image
                        source={selectedCompany.photos[0]}
                        style={s.detailGalleryMainImg}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={s.detailThumbRow}>
                      {selectedCompany.photos.map((p, i) => (
                        <Image key={i} source={p} style={s.detailThumb} resizeMode="cover" />
                      ))}
                    </View>

                    <View style={s.detailDivider} />
                    <Text style={s.detailSectionLabel}>COMPANY RATING</Text>

                    {reviewSubmitted ? (
                      <View style={s.successCard}>
                        <MaterialCommunityIcons name="check-circle" size={40} color={T.success} />
                        <Text style={s.successCardTitle}>Review submitted!</Text>
                        <Text style={s.successCardSub}>Thank you for sharing your experience.</Text>
                      </View>
                    ) : (
                      <>
                        <View style={s.starsRow}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <TouchableOpacity
                              key={star}
                              onPress={() => setReviewRating(star)}
                              activeOpacity={0.7}
                            >
                              <MaterialCommunityIcons
                                name={star <= reviewRating ? 'star' : 'star-outline'}
                                size={36}
                                color={star <= reviewRating ? T.warning : T.borderFaint}
                              />
                            </TouchableOpacity>
                          ))}
                        </View>
                        {reviewRating > 0 && (
                          <Text style={s.ratingLabel}>
                            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][reviewRating]}
                          </Text>
                        )}

                        <Text style={s.fieldLabel}>Review title</Text>
                        <TextInput
                          style={s.textField}
                          value={reviewTitle}
                          onChangeText={setReviewTitle}
                          placeholder="Summarise your experience…"
                          placeholderTextColor={T.textHint}
                          maxLength={80}
                        />

                        <Text style={s.fieldLabel}>Your review</Text>
                        <TextInput
                          style={[s.textField, s.textArea]}
                          value={reviewBody}
                          onChangeText={setReviewBody}
                          placeholder="Share details about the interview process, culture, communication…"
                          placeholderTextColor={T.textHint}
                          multiline
                          numberOfLines={4}
                          maxLength={500}
                          textAlignVertical="top"
                        />

                        <TouchableOpacity
                          style={[
                            s.submitBtn,
                            (!reviewRating || !reviewTitle.trim() || !reviewBody.trim()) &&
                              s.submitBtnDisabled,
                          ]}
                          onPress={handleSubmitReview}
                          activeOpacity={0.85}
                        >
                          <MaterialCommunityIcons name="send" size={16} color="#fff" />
                          <Text style={s.submitBtnText}>Submit Review</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {submittedReviews.filter(r => r.companyId === selectedCompany.id).length > 0 && (
                      <>
                        <View style={s.detailDivider} />
                        <Text style={s.detailSectionLabel}>YOUR PREVIOUS REVIEWS</Text>
                        {submittedReviews
                          .filter(r => r.companyId === selectedCompany.id)
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
                                <Text style={s.reviewDate}>{rev.date}</Text>
                              </View>
                              <Text style={s.reviewTitle}>{rev.title}</Text>
                              <Text style={s.reviewBody}>{rev.body}</Text>
                            </View>
                          ))}
                      </>
                    )}
                  </View>
                </View>
              </>
            ) : (
              /* Company list — only expired/closed conversations */
              (() => {
                const expiredIds = new Set(PIPELINE.filter(p => p.expired).map(p => p.id));
                const reviewableCompanies = APPLIED_COMPANIES.filter(c => expiredIds.has(c.id));
                return reviewableCompanies.length === 0 ? (
                  <View style={s.reviewsEmptyWrap}>
                    <MaterialCommunityIcons name="star-off-outline" size={40} color={T.borderFaint} />
                    <Text style={s.reviewsEmptyTitle}>No closed conversations yet</Text>
                    <Text style={s.reviewsEmptySub}>
                      You can leave a review once a conversation has closed.
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={s.sectionRow}>
                      <Text style={s.sectionTitle}>Closed conversations</Text>
                    </View>
                    <View style={s.card}>
                      {reviewableCompanies.map((co, i) => {
                        const coReviews = submittedReviews.filter(r => r.companyId === co.id);
                        return (
                          <View key={co.id}>
                            {i > 0 && <View style={s.divider} />}
                            <TouchableOpacity
                              style={s.companyListRow}
                              onPress={() => openCompany(co.id)}
                              activeOpacity={0.8}
                            >
                              <CompanyLogo abbr={co.abbr} color={co.color} size="md" />
                              <View style={s.companyListInfo}>
                                <Text style={s.companyListName}>{co.company}</Text>
                                <Text style={s.companyListRole}>{co.role}</Text>
                                {coReviews.length > 0 ? (
                                  <View style={s.companyListReviewedRow}>
                                    <MaterialCommunityIcons name="check-circle" size={12} color={T.success} />
                                    <Text style={s.companyListReviewedText}>Reviewed</Text>
                                  </View>
                                ) : (
                                  <Text style={s.companyListReviewHint}>Tap to leave a review</Text>
                                )}
                              </View>
                              <MaterialCommunityIcons name="chevron-right" size={20} color={T.textHint} />
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  </>
                );
              })()
            )}
          </>
        )}

        <View style={{ height: Spacing['4'] }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },

  // ── Header ────────────────────────────────────────────────────────────────
  header:    { paddingHorizontal: 20, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { fontSize: 28, fontWeight: '800', color: T.textPrimary, letterSpacing: -0.5 },
  filterBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: T.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Segment tabs ──────────────────────────────────────────────────────────
  segWrap: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.borderFaint,
    padding: 4,
  },
  segTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  segTabActive: {
    backgroundColor: T.primary,
  },
  segTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: T.textSub,
  },
  segTabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  segBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  segBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scroll: { paddingHorizontal: 20, gap: 0 },

  // ── Section header row ────────────────────────────────────────────────────
  sectionRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: T.textPrimary },
  viewAll:      { fontSize: 13, fontWeight: '600', color: T.primary },

  // ── Surface card ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: T.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.borderFaint,
    padding: Spacing['4'],
    marginBottom: 16,
  },

  // ── Shared divider ────────────────────────────────────────────────────────
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: T.borderFaint,
    marginVertical: Spacing['2'],
  },

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
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
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
    backgroundColor: T.surface,
  },
  ghostLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: T.borderFaint,
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
    fontSize: 22, fontWeight: '800', color: T.textPrimary,
    textAlign: 'center', lineHeight: 30, marginBottom: 12, letterSpacing: -0.3,
  },
  emptySub: {
    fontSize: 14, color: T.textSub,
    textAlign: 'center', lineHeight: 21, marginBottom: 32,
  },
  boostBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.primary,
    borderRadius: 50, paddingVertical: 16, paddingHorizontal: 40,
    marginBottom: 16, width: '100%' as any, justifyContent: 'center',
    shadowColor: T.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 4,
  },
  boostIconWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  boostBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  editProfileText: {
    fontSize: 15, fontWeight: '600',
    color: T.textSub, textDecorationLine: 'underline',
  },

  // ── Avatar ────────────────────────────────────────────────────────────────
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
    backgroundColor: T.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: T.surface,
  },
  newMatchCompany: {
    fontSize: 11, fontWeight: '600',
    color: T.textPrimary, textAlign: 'center', marginTop: 6,
  },
  newMatchRole: { fontSize: 10, color: T.textHint, textAlign: 'center', marginTop: 1 },

  // ── Pipeline ───────────────────────────────────────────────────────────────
  stageHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing['2'],
  },
  stagePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing['3'], paddingVertical: 4, borderRadius: Radii.sm,
  },
  stagePillText: { fontSize: 12, fontWeight: '700' },
  stageCount:    { fontSize: 12, color: T.textHint, fontWeight: '600' },

  pipelineRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing['3'], paddingVertical: Spacing['3'],
  },
  pipelineInfo:    { flex: 1 },
  pipelineCompany: { fontSize: 15, fontWeight: '600', color: T.textPrimary },
  pipelineRole:    { fontSize: 13, color: T.textSub, marginTop: 1 },

  // ── Messages ───────────────────────────────────────────────────────────────
  msgRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: Spacing['3'], paddingVertical: Spacing['2'],
  },
  msgRowExpired: { opacity: 0.5 },
  msgLogoExpired: { opacity: 0.4 },
  msgBody: { flex: 1 },
  msgTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  msgCompany: { fontSize: 15, fontWeight: '700', color: T.textPrimary },
  msgTime:    { fontSize: 11, color: T.textHint },
  msgRole:    { fontSize: 13, color: T.textSub, marginBottom: 4 },
  msgPreview: { fontSize: 13, color: T.textSub, lineHeight: 18, marginBottom: Spacing['2'] },
  msgTextFaded: { color: 'rgba(255,255,255,0.25)' },

  expiredRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginTop: 4, flexWrap: 'wrap',
  },
  closedTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: T.borderFaint,
    borderRadius: Radii.full,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  closedTagText: { fontSize: 11, fontWeight: '600', color: T.textHint },
  leaveReviewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderRadius: Radii.full,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: T.border,
  },
  leaveReviewBtnText: { fontSize: 11, fontWeight: '700', color: T.primary },

  // ── Reviews ────────────────────────────────────────────────────────────────
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: Spacing['2'], marginBottom: Spacing['2'],
  },
  backBtnText: { fontSize: 14, fontWeight: '600', color: T.primary },

  detailCard: {
    backgroundColor: T.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: T.borderFaint,
    marginBottom: 16,
  },
  detailHeroImg:   { width: '100%', height: 220 },
  detailHeroScrim: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 220,
    backgroundColor: 'rgba(10,5,25,0.45)',
  },
  detailContent: { padding: Spacing['5'] },
  detailRole: {
    fontSize: 22, fontWeight: '800', color: T.textPrimary,
    letterSpacing: -0.4, marginBottom: 4,
  },
  detailSalary: {
    fontSize: 14, fontWeight: '700',
    color: T.primary, marginBottom: 6,
  },
  detailLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  detailLocation: { fontSize: 13, color: T.textSub },
  detailTagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  detailTag: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radii.full, borderWidth: 1,
    borderColor: T.border,
    backgroundColor: 'rgba(168,85,247,0.08)',
  },
  detailTagText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: T.borderFaint,
    marginVertical: Spacing['4'],
  },
  detailSectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    color: T.textHint, marginBottom: Spacing['3'],
  },
  detailDescription: {
    fontSize: 14, color: T.textSub, lineHeight: 22,
  },
  detailGalleryMain: {
    borderRadius: 14, overflow: 'hidden', marginBottom: 10,
  },
  detailGalleryMainImg: {
    width: '100%', height: 200, borderRadius: 14,
  },
  detailThumbRow: { flexDirection: 'row', gap: 8 },
  detailThumb: {
    width: (SCREEN_WIDTH - 80) / 3, height: 80,
    borderRadius: 10,
  },

  // Success card
  successCard: {
    alignItems: 'center', paddingVertical: Spacing['6'],
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)',
    gap: Spacing['2'], marginBottom: Spacing['3'],
  },
  successCardTitle: { fontSize: 18, fontWeight: '700', color: '#4ade80' },
  successCardSub:   { fontSize: 14, color: 'rgba(74,222,128,0.6)' },

  // Review form
  fieldLabel: {
    fontSize: 13, fontWeight: '600',
    color: T.textSub, marginBottom: Spacing['2'], marginTop: Spacing['3'],
  },
  starsRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing['2'] },
  ratingLabel: {
    fontSize: 13, fontWeight: '600',
    color: T.warning, marginBottom: Spacing['3'],
  },
  textField: {
    backgroundColor: T.surfaceHigh,
    borderRadius: 14, borderWidth: 1,
    borderColor: T.borderFaint,
    paddingHorizontal: Spacing['4'], paddingVertical: Spacing['3'],
    fontSize: 14, color: T.textPrimary,
    marginBottom: Spacing['3'],
  },
  textArea: { minHeight: 100, paddingTop: Spacing['3'] },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: T.primary, borderRadius: Radii.full,
    paddingVertical: 14, marginTop: Spacing['2'],
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Company list
  companyListRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing['3'], paddingVertical: Spacing['3'],
  },
  companyListInfo: { flex: 1 },
  companyListName: { fontSize: 15, fontWeight: '600', color: T.textPrimary },
  companyListRole: { fontSize: 13, color: T.textSub, marginTop: 1 },
  companyListReviewedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  companyListReviewedText: { fontSize: 11, color: '#4ade80', fontWeight: '600' },
  companyListReviewHint:   { fontSize: 11, color: T.primary, marginTop: 4 },

  // Reviews empty state
  reviewsEmptyWrap: {
    alignItems: 'center', paddingVertical: 60, gap: 12,
  },
  reviewsEmptyTitle: {
    fontSize: 17, fontWeight: '700',
    color: T.textSub, textAlign: 'center',
  },
  reviewsEmptySub: {
    fontSize: 13, color: T.textHint,
    textAlign: 'center', lineHeight: 20, paddingHorizontal: 24,
  },

  // Review cards
  reviewCard:      { gap: 6 },
  reviewStarsRow:  { flexDirection: 'row', alignItems: 'center', gap: 2 },
  reviewDate:      { fontSize: 11, color: T.textHint, marginLeft: 6 },
  reviewTitle:     { fontSize: 14, fontWeight: '600', color: T.textPrimary },
  reviewBody:      { fontSize: 13, color: T.textSub, lineHeight: 20 },
});

// ─── Conversation screen styles ───────────────────────────────────────────────
const cs = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    gap: 10,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: T.surface,
    borderWidth: 1, borderColor: T.borderFaint,
    alignItems: 'center', justifyContent: 'center',
  },
  headerLogo: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  headerLogoText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  headerInfo:    { flex: 1 },
  headerCompany: { fontSize: 15, fontWeight: '700', color: T.textPrimary },
  headerRole:    { fontSize: 12, color: T.textSub, marginTop: 1 },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: T.borderFaint,
  },

  // Message scroll
  msgScroll:   { flex: 1 },
  msgContent:  { paddingHorizontal: 16, paddingTop: 16, gap: 4 },

  // Bubble rows
  bubbleWrap: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 2,
  },
  bubbleWrapMe:   { justifyContent: 'flex-end' },
  bubbleWrapThem: { justifyContent: 'flex-start' },

  bubbleAvatar: {
    width: 28, height: 28, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  bubbleAvatarText:   { fontSize: 9, fontWeight: '800', color: '#fff' },
  bubbleAvatarSpacer: { width: 28 },

  bubbleCol: { maxWidth: SCREEN_WIDTH * 0.72, gap: 3 },

  bubble: {
    borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
  },
  bubbleMe: {
    backgroundColor: T.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: T.surfaceHigh,
    borderWidth: 1, borderColor: T.borderFaint,
    borderBottomLeftRadius: 4,
  },
  bubbleText:     { fontSize: 14, lineHeight: 20 },
  bubbleTextMe:   { color: '#fff' },
  bubbleTextThem: { color: T.textPrimary },

  bubbleTime:     { fontSize: 10, color: T.textHint },
  bubbleTimeMe:   { textAlign: 'right' },
  bubbleTimeThem: { textAlign: 'left' },

  // Expired banner
  expiredBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 16, marginBottom: 8,
    paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: T.surface, borderRadius: 12,
    borderWidth: 1, borderColor: T.borderFaint,
    alignSelf: 'center',
  },
  expiredBannerText: { fontSize: 12, color: T.textHint, fontWeight: '600' },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingTop: 10,
    backgroundColor: T.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: T.borderFaint,
  },
  input: {
    flex: 1,
    minHeight: 44, maxHeight: 120,
    backgroundColor: T.surface,
    borderRadius: 22,
    borderWidth: 1, borderColor: T.borderFaint,
    paddingHorizontal: 16, paddingVertical: 11,
    fontSize: 14, color: T.textPrimary,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: T.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.35 },

  // Bubble shape variants (grouped messages)
  bubbleMeFirst:   { borderTopRightRadius: 18 },
  bubbleMeLast:    { borderBottomRightRadius: 4 },
  bubbleThemFirst: { borderTopLeftRadius: 18 },
  bubbleThemLast:  { borderBottomLeftRadius: 4 },

  // "typing…" label in header
  typingLabel: { fontSize: 12, color: T.primary, fontStyle: 'italic', marginTop: 1 },

  // Typing indicator bubble
  typingBubble: { paddingVertical: 12, paddingHorizontal: 16 },
  typingDots:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  typingDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: T.textHint,
  },
  typingDot1: {},
  typingDot2: { opacity: 0.65 },
  typingDot3: { opacity: 0.35 },
});