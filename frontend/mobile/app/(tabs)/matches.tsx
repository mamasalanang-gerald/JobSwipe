import React, { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, BackHandler,
  StatusBar, Dimensions, TextInput, Image, Keyboard, KeyboardEvent, Platform,
} from 'react-native';
import {
  StatusPill, CountBadge, CompanyLogo,
  Colors, Typography, Spacing, Radii,
} from '../../components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme'; // ← centralized theme

const SCREEN_WIDTH = Dimensions.get('window').width;

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
  { id: 10, abbr: 'IL', color: '#f59e0b', company: 'InnovateLabs', role: 'Product Designer', lastMsg: "Hi Alex! We loved your portfolio — available for a call this week?", time: '2m', unread: 2, status: 'screening' },
  { id: 11, abbr: 'PW', color: '#ec4899', company: 'Pixel Works',   role: 'iOS Engineer',      lastMsg: "Moving you to the technical interview stage 🎉", time: '1h', unread: 1, status: 'interview' },
  { id: 12, abbr: 'TF', color: '#a855f7', company: 'TechFlow Inc',  role: 'Sr. RN Engineer',   lastMsg: "Thanks for applying! We'll review and get back to you soon.", time: '3h', unread: 0, status: 'applied', expired: true },
  { id: 13, abbr: 'DS', color: '#22c55e', company: 'DataStream',    role: 'ML Engineer',        lastMsg: "We'd like to extend a formal offer — congratulations!", time: 'Yesterday', unread: 0, status: 'offer' },
];

const APPLIED_COMPANIES = [
  { id: 10, abbr: 'IL', color: '#f59e0b', company: 'InnovateLabs', role: 'Product Designer', salary: '$100k – $130k / yr', location: 'New York, NY · Hybrid', tags: ['Hybrid', 'Full-time', 'Scaleup'], description: 'Design beautiful interfaces for next-gen SaaS products. Work with a world-class design system team. Own end-to-end product design from research to delivery.', photos: [require('../assets/images/alorica.jpg'), require('../assets/images/alorica2.jpg'), require('../assets/images/alorica3.jpg')] },
  { id: 11, abbr: 'PW', color: '#ec4899', company: 'Pixel Works',   role: 'iOS Engineer',      salary: '$115k – $145k / yr', location: 'Los Angeles · Remote',  tags: ['Remote', 'Full-time', 'Startup'],   description: 'Build polished iOS experiences for millions of creative professionals. Join a small, high-output team shipping major features every sprint.', photos: [require('../assets/images/alorica2.jpg'), require('../assets/images/alorica3.jpg'), require('../assets/images/alorica.jpg')] },
  { id: 12, abbr: 'TF', color: '#a855f7', company: 'TechFlow Inc',  role: 'Sr. RN Engineer',   salary: '$120k – $150k / yr', location: 'San Francisco, CA · Remote', tags: ['Remote', 'Full-time', 'Startup'], description: 'Build cutting-edge mobile experiences for 2M+ users. Lead a team of 4 engineers shipping weekly releases.', photos: [require('../assets/images/accenture.jpg'), require('../assets/images/accenture2.jpg'), require('../assets/images/accenture3.jpg')] },
  { id: 13, abbr: 'DS', color: '#22c55e', company: 'DataStream',    role: 'ML Engineer',        salary: '$140k – $180k / yr', location: 'Boston, MA · On-site',    tags: ['On-site', 'Full-time', 'Enterprise'], description: 'Lead machine learning initiatives for Fortune 500 clients. Publish research and own the ML roadmap. Work with petabyte-scale datasets.', photos: [require('../assets/images/socia.png'), require('../assets/images/socia2.jpg'), require('../assets/images/socia3.jpg')] },
];

type Review    = { id: number; companyId: number; rating: number; title: string; body: string; date: string };
type ChatMessage = { id: number; from: 'me' | 'them'; text: string; time: string };

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

const AUTO_REPLIES: Record<number, string[]> = {
  10: ["Sounds great, we'll confirm the time shortly!", "Looking forward to connecting with you 😊", "Feel free to ask any questions before the call."],
  11: ["Our engineering team will reach out within 24 hours.", "Excited to have you move forward in the process!", "Let us know if you have any questions in the meantime."],
  12: ["We appreciate your patience while we review.", "Our team carefully reviews every application.", "We'll be in touch soon!"],
  13: ["Congratulations again — we're thrilled to have you!", "HR will send over the formal offer letter shortly.", "Feel free to reach out with any questions about the offer."],
};

// ─── Status helpers ───────────────────────────────────────────────────────────
function statusBg(status: Status) {
  const map: Record<Status, string> = { applied: 'rgba(255,255,255,0.07)', screening: 'rgba(245,158,11,0.12)', interview: 'rgba(168,85,247,0.15)', offer: 'rgba(34,197,94,0.12)' };
  return map[status];
}
function statusColor(status: Status) {
  const map: Record<Status, string> = { applied: 'rgba(255,255,255,0.5)', screening: '#fbbf24', interview: '#c084fc', offer: '#4ade80' };
  return map[status];
}

// ─── Conversation Screen ──────────────────────────────────────────────────────
function ConversationScreen({ conversation, onBack, tabBarHeight }: { conversation: typeof PIPELINE[number]; onBack: () => void; tabBarHeight: number }) {
  const T = useTheme();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES[conversation.id] ?? []);
  const [draft, setDraft]       = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
useEffect(() => { const sub = BackHandler.addEventListener('hardwareBackPress', () => { 
  onBack(); return true; }); 
  return () => sub.remove(); }, [onBack]);
  
useEffect(() => {
  const show = Keyboard.addListener(
    Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
    (e: KeyboardEvent) => {
      if (Platform.OS === 'android') {
        // On Android, use windowHeight (excludes nav bar) not screenHeight
        const windowHeight = Dimensions.get('window').height;
        const keyboardTop = e.endCoordinates.screenY;
        setKeyboardHeight(Math.max(0, windowHeight - keyboardTop));
      } else {
        setKeyboardHeight(e.endCoordinates.height);
      }
    },
  );
  const hide = Keyboard.addListener(
    Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
    () => setKeyboardHeight(0),
  );
  return () => { show.remove(); hide.remove(); };
}, []);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef    = useRef<ScrollView>(null);
  const replyIndexRef = useRef(0);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e: KeyboardEvent) => {
      if (Platform.OS === 'android') {
        const windowHeight = Dimensions.get('window').height;
        setKeyboardHeight(Math.max(0, windowHeight - e.endCoordinates.screenY));
      } else { setKeyboardHeight(e.endCoordinates.height); }
    });
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => { setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100); }, []);

  const scrollToBottom = (animated = true) => { setTimeout(() => scrollRef.current?.scrollToEnd({ animated }), 100); };

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
    <View style={[cs.screen, { backgroundColor: T.bg, paddingTop: topInset }]}>
      <StatusBar barStyle={T.bg === '#f5f3ff' ? 'dark-content' : 'light-content'} />

      {/* Header */}
      <View style={[cs.header, { backgroundColor: T.bg }]}>
        <TouchableOpacity onPress={onBack} style={[cs.backBtn, { backgroundColor: T.surface, borderColor: T.borderFaint }]} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={T.primary} />
        </TouchableOpacity>
        <View style={[cs.headerLogo, { backgroundColor: conversation.color }]}>
          <Text style={cs.headerLogoText}>{conversation.abbr}</Text>
        </View>
        <View style={cs.headerInfo}>
          <Text style={[cs.headerCompany, { color: T.textPrimary }]}>{conversation.company}</Text>
          {isTyping
            ? <Text style={[cs.typingLabel, { color: T.primary }]}>typing…</Text>
            : <Text style={[cs.headerRole, { color: T.textSub }]}>{conversation.role}</Text>
          }
        </View>
        <View style={[cs.statusBadge, { backgroundColor: statusBg(conversation.status) }]}>
          <Text style={[cs.statusBadgeText, { color: statusColor(conversation.status) }]}>
            {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
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
            const isFirstInGroup = i === 0 || prevMsg.from !== msg.from;
            const isLastInGroup  = i === messages.length - 1 || messages[i + 1].from !== msg.from;
            const showAvatar = !isMe && isFirstInGroup;
            const showSpacer = !isMe && !isFirstInGroup;
            return (
              <View key={msg.id} style={[cs.bubbleWrap, isMe ? cs.bubbleWrapMe : cs.bubbleWrapThem, isFirstInGroup && { marginTop: 8 }]}>
                {showAvatar && <View style={[cs.bubbleAvatar, { backgroundColor: conversation.color }]}><Text style={cs.bubbleAvatarText}>{conversation.abbr}</Text></View>}
                {showSpacer && <View style={cs.bubbleAvatarSpacer} />}
                <View style={cs.bubbleCol}>
                  <View style={[
                    cs.bubble,
                    isMe ? [cs.bubbleMe, { backgroundColor: T.primary }] : [cs.bubbleThem, { backgroundColor: T.surfaceHigh, borderColor: T.borderFaint }],
                    !isMe && isFirstInGroup && cs.bubbleThemFirst,
                    !isMe && isLastInGroup  && cs.bubbleThemLast,
                    isMe  && isFirstInGroup && cs.bubbleMeFirst,
                    isMe  && isLastInGroup  && cs.bubbleMeLast,
                  ]}>
                    <Text style={[cs.bubbleText, { color: isMe ? '#fff' : T.textPrimary }]}>{msg.text}</Text>
                  </View>
                  {isLastInGroup && (
                    <Text style={[cs.bubbleTime, { color: T.textHint }, isMe ? cs.bubbleTimeMe : cs.bubbleTimeThem]}>{msg.time}</Text>
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
              <View style={[cs.bubble, cs.bubbleThem, cs.typingBubble, { backgroundColor: T.surfaceHigh, borderColor: T.borderFaint }]}>
                <View style={cs.typingDots}>
                  <View style={[cs.typingDot, cs.typingDot1, { backgroundColor: T.textHint }]} />
                  <View style={[cs.typingDot, cs.typingDot2, { backgroundColor: T.textHint }]} />
                  <View style={[cs.typingDot, cs.typingDot3, { backgroundColor: T.textHint }]} />
                </View>
              </View>
            </View>
          )}

          {conversation.expired && (
            <View style={[cs.expiredBanner, { backgroundColor: T.surface, borderColor: T.borderFaint }]}>
              <MaterialCommunityIcons name="lock-outline" size={13} color={T.textHint} />
              <Text style={[cs.expiredBannerText, { color: T.textHint }]}>This conversation has closed</Text>
            </View>
          )}
        </ScrollView>

        {!conversation.expired && (
          <View style={[cs.inputBar, { backgroundColor: T.bg, borderTopColor: T.borderFaint, paddingBottom: keyboardHeight > 0 ? 8 : tabBarHeight + 8 }]}>
            <TextInput
              style={[cs.input, { backgroundColor: T.surface, borderColor: T.borderFaint, color: T.textPrimary }]}
              value={draft}
              onChangeText={setDraft}
              placeholder="Message…"
              placeholderTextColor={T.textHint}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={[cs.sendBtn, { backgroundColor: T.primary }, !draft.trim() && cs.sendBtnDisabled]} onPress={sendMessage} activeOpacity={0.85} disabled={!draft.trim()}>
              <MaterialCommunityIcons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Ghost card (empty state decoration) ─────────────────────────────────────
function GhostCard({ avatarColor, rotate, translateX, translateY, blur }: { avatarColor: string; rotate: string; translateX: number; translateY: number; blur?: boolean }) {
  const T = useTheme();
  return (
    <View style={[cs2.ghostCard, { backgroundColor: T.surface, borderColor: T.border, transform: [{ rotate }, { translateX }, { translateY }], opacity: blur ? 0.4 : 0.85 }]}>
      <View style={[cs2.ghostPhoto, { backgroundColor: avatarColor + '25' }]}>
        <MaterialCommunityIcons name="account" size={48} color={avatarColor + '55'} />
      </View>
      <View style={[cs2.ghostMeta, { backgroundColor: T.surface }]}>
        <View style={[cs2.ghostLine, { backgroundColor: T.borderFaint, width: 80 }]} />
        <View style={[cs2.ghostLine, { backgroundColor: T.borderFaint, width: 50, marginTop: 6 }]} />
      </View>
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyMatchesState() {
  const T = useTheme();
  const navigation = useNavigation();
  return (
    <View style={cs2.emptyWrap}>
      <View style={cs2.ghostStack}>
        <GhostCard avatarColor="#7c3aed" rotate="8deg"  translateX={40}  translateY={10} blur />
        <GhostCard avatarColor="#a855f7" rotate="-4deg" translateX={-10} translateY={0} />
        <View style={cs2.boltBadge}>
          <MaterialCommunityIcons name="lightning-bolt" size={18} color="#fff" />
        </View>
      </View>
      <Text style={[cs2.emptyTitle, { color: T.textPrimary }]}>Oops! Your profile hasn't{'\n'}received any likes yet.</Text>
      <Text style={[cs2.emptySub,  { color: T.textSub   }]}>Consider completing it or boosting your profile to attract more attention and likes.</Text>
      <TouchableOpacity style={[cs2.boostBtn, { backgroundColor: T.primary }]} activeOpacity={0.85} onPress={() => navigation.navigate('subscription' as never)}>
        <View style={cs2.boostIconWrap}>
          <MaterialCommunityIcons name="rocket-launch" size={16} color="#fff" />
        </View>
        <Text style={cs2.boostBtnText}>Boost Me</Text>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.7}>
        <Text style={[cs2.editProfileText, { color: T.textSub }]}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Segment tabs ─────────────────────────────────────────────────────────────
function SegmentTabs({ tabs, active, onSelect }: { tabs: { key: string; label: string; badge?: number }[]; active: string; onSelect: (key: string) => void }) {
  const T = useTheme();
  return (
    <View style={[cs2.segWrap, { backgroundColor: T.surface, borderColor: T.borderFaint }]}>
      {tabs.map(tab => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity key={tab.key} style={[cs2.segTab, isActive && { backgroundColor: T.primary }]} onPress={() => onSelect(tab.key)} activeOpacity={0.75}>
            <Text style={[cs2.segTabText, { color: isActive ? '#fff' : T.textSub }, isActive && cs2.segTabTextActive]}>{tab.label}</Text>
            {!!tab.badge && tab.badge > 0 && (
              <View style={cs2.segBadge}>
                <Text style={cs2.segBadgeText}>{tab.badge}</Text>
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
  const T = useTheme();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('messages');
  const tabBarHeight = useTabBarHeight();
  const { top: topInset } = useSafeAreaInsets();
  const totalUnread = PIPELINE.reduce((a, m) => a + m.unread, 0);

  const [selectedConversation, setSelectedConversation] = useState<typeof PIPELINE[number] | null>(null);
  const [selectedCompanyId, setSelectedCompanyId]       = useState<number | null>(null);
  const [reviewRating, setReviewRating]                 = useState(0);
  const [reviewTitle, setReviewTitle]                   = useState('');
  const [reviewBody, setReviewBody]                     = useState('');
  const [submittedReviews, setSubmittedReviews]         = useState<Review[]>([]);
  const [reviewSubmitted, setReviewSubmitted]           = useState(false);

  const selectedCompany = APPLIED_COMPANIES.find(c => c.id === selectedCompanyId);

  const handleSubmitReview = () => {
    if (!selectedCompanyId || reviewRating === 0 || !reviewTitle.trim() || !reviewBody.trim()) return;
    const review: Review = { id: Date.now(), companyId: selectedCompanyId, rating: reviewRating, title: reviewTitle.trim(), body: reviewBody.trim(), date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) };
    setSubmittedReviews(prev => [review, ...prev]);
    setReviewSubmitted(true);
    setReviewRating(0); setReviewTitle(''); setReviewBody('');
    setTimeout(() => { setReviewSubmitted(false); setSelectedCompanyId(null); }, 1800);
  };

  const openCompany = (id: number) => { setSelectedCompanyId(id); setReviewRating(0); setReviewTitle(''); setReviewBody(''); setReviewSubmitted(false); };

  const tabs = [
    { key: 'messages', label: 'Messages', badge: totalUnread },
    { key: 'closed',   label: 'Closed Conversations', badge: 0 },
  ];

  if (selectedConversation) {
    return <ConversationScreen conversation={selectedConversation} onBack={() => setSelectedConversation(null)} tabBarHeight={tabBarHeight} />;
  }

  return (
    <View style={[cs2.screen, { backgroundColor: T.bg, paddingTop: topInset }]}>
      <StatusBar barStyle={T.bg === '#f5f3ff' ? 'dark-content' : 'light-content'} />

      <View style={{ height: 50 }} />
      <SegmentTabs tabs={tabs} active={activeTab} onSelect={setActiveTab} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[cs2.scroll, { paddingBottom: tabBarHeight + 24 }]}>

        {/* ── MESSAGES TAB ── */}
        {activeTab === 'messages' && (
          <>
            <View style={cs2.sectionRow}>
              <Text style={[cs2.sectionTitle, { color: T.textPrimary }]}>Recent conversations</Text>
            </View>
            <View style={[cs2.card, { backgroundColor: T.surface, borderColor: T.borderFaint }]}>
              {PIPELINE.map((msg, i) => (
                <View key={msg.id}>
                  {i > 0 && <View style={[cs2.divider, { backgroundColor: T.borderFaint }]} />}
                  <TouchableOpacity style={[cs2.msgRow, msg.expired && cs2.msgRowExpired]} activeOpacity={0.85} onPress={() => setSelectedConversation(msg)}>
                    <View style={{ position: 'relative' }}>
                      <View style={msg.expired ? cs2.msgLogoExpired : undefined}>
                        <CompanyLogo abbr={msg.abbr} color={msg.expired ? 'rgba(255,255,255,0.18)' : msg.color} size="md" />
                      </View>
                      {msg.unread > 0 && !msg.expired && <CountBadge count={msg.unread} />}
                    </View>
                    <View style={cs2.msgBody}>
                      <View style={cs2.msgTopRow}>
                        <Text style={[cs2.msgCompany, { color: T.textPrimary }, msg.expired && { color: T.textHint }]}>{msg.company}</Text>
                        <Text style={[cs2.msgTime, { color: T.textHint }]}>{msg.time}</Text>
                      </View>
                      <Text style={[cs2.msgRole, { color: T.textSub }, msg.expired && { color: T.textHint }]}>{msg.role}</Text>
                      <Text style={[cs2.msgPreview, { color: T.textSub }, msg.expired && { color: T.textHint }]} numberOfLines={1}>{msg.lastMsg}</Text>

                      {msg.expired ? (
                        <View style={cs2.expiredRow}>
                          <View style={[cs2.closedTag, { backgroundColor: T.borderFaint, borderColor: T.borderFaint }]}>
                            <MaterialCommunityIcons name="lock-outline" size={10} color={T.textHint} />
                            <Text style={[cs2.closedTagText, { color: T.textHint }]}>Conversation closed</Text>
                          </View>
                          <TouchableOpacity style={[cs2.leaveReviewBtn, { backgroundColor: T.primary + '18', borderColor: T.border }]} activeOpacity={0.8} onPress={() => { openCompany(msg.id); setActiveTab('closed'); }}>
                            <MaterialCommunityIcons name="star-outline" size={11} color={T.primary} />
                            <Text style={[cs2.leaveReviewBtnText, { color: T.primary }]}>Leave a review</Text>
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

        {/* ── CLOSED CONVERSATIONS TAB ── */}
        {activeTab === 'closed' && (
          <>
            {selectedCompany ? (
              <>
                <TouchableOpacity style={cs2.backBtn} onPress={() => setSelectedCompanyId(null)} activeOpacity={0.7}>
                  <MaterialCommunityIcons name="arrow-left" size={18} color={T.primary} />
                  <Text style={[cs2.backBtnText, { color: T.primary }]}>All companies</Text>
                </TouchableOpacity>

                <View style={[cs2.detailCard, { backgroundColor: T.surface, borderColor: T.borderFaint }]}>
                  <Image source={selectedCompany.photos[0]} style={cs2.detailHeroImg} resizeMode="cover" />
                  <View style={cs2.detailHeroScrim} />
                  <View style={cs2.detailContent}>
                    <Text style={[cs2.detailRole,   { color: T.textPrimary }]}>{selectedCompany.role}</Text>
                    <Text style={[cs2.detailSalary, { color: T.primary     }]}>{selectedCompany.salary}</Text>
                    <View style={cs2.detailLocationRow}>
                      <MaterialCommunityIcons name="map-marker-outline" size={13} color={T.textSub} />
                      <Text style={[cs2.detailLocation, { color: T.textSub }]}>{selectedCompany.location}</Text>
                    </View>
                    <View style={cs2.detailTagsRow}>
                      {selectedCompany.tags.map(tag => (
                        <View key={tag} style={[cs2.detailTag, { borderColor: T.border, backgroundColor: T.primary + '14' }]}>
                          <Text style={[cs2.detailTagText, { color: T.textPrimary }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={[cs2.detailDivider, { backgroundColor: T.borderFaint }]} />
                    <Text style={[cs2.detailSectionLabel, { color: T.textHint }]}>ABOUT THE ROLE</Text>
                    <Text style={[cs2.detailDescription, { color: T.textSub }]}>{selectedCompany.description}</Text>

                    <View style={[cs2.detailDivider, { backgroundColor: T.borderFaint }]} />
                    <Text style={[cs2.detailSectionLabel, { color: T.textHint }]}>COMPANY PHOTOS</Text>
                    <View style={cs2.detailGalleryMain}>
                      <Image source={selectedCompany.photos[0]} style={cs2.detailGalleryMainImg} resizeMode="cover" />
                    </View>
                    <View style={cs2.detailThumbRow}>
                      {selectedCompany.photos.map((p, i) => <Image key={i} source={p} style={cs2.detailThumb} resizeMode="cover" />)}
                    </View>

                    <View style={[cs2.detailDivider, { backgroundColor: T.borderFaint }]} />
                    <Text style={[cs2.detailSectionLabel, { color: T.textHint }]}>COMPANY RATING</Text>

                    {reviewSubmitted ? (
                      <View style={cs2.successCard}>
                        <MaterialCommunityIcons name="check-circle" size={40} color={T.success} />
                        <Text style={[cs2.successCardTitle, { color: T.success }]}>Review submitted!</Text>
                        <Text style={[cs2.successCardSub,   { color: T.success + '99' }]}>Thank you for sharing your experience.</Text>
                      </View>
                    ) : (
                      <>
                        <View style={cs2.starsRow}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <TouchableOpacity key={star} onPress={() => setReviewRating(star)} activeOpacity={0.7}>
                              <MaterialCommunityIcons name={star <= reviewRating ? 'star' : 'star-outline'} size={36} color={star <= reviewRating ? T.warning : T.borderFaint} />
                            </TouchableOpacity>
                          ))}
                        </View>
                        {reviewRating > 0 && <Text style={[cs2.ratingLabel, { color: T.warning }]}>{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][reviewRating]}</Text>}
                        <Text style={[cs2.fieldLabel, { color: T.textSub }]}>Review title</Text>
                        <TextInput style={[cs2.textField, { backgroundColor: T.surfaceHigh, borderColor: T.borderFaint, color: T.textPrimary }]} value={reviewTitle} onChangeText={setReviewTitle} placeholder="Summarise your experience…" placeholderTextColor={T.textHint} maxLength={80} />
                        <Text style={[cs2.fieldLabel, { color: T.textSub }]}>Your review</Text>
                        <TextInput style={[cs2.textField, cs2.textArea, { backgroundColor: T.surfaceHigh, borderColor: T.borderFaint, color: T.textPrimary }]} value={reviewBody} onChangeText={setReviewBody} placeholder="Share details about the interview process, culture, communication…" placeholderTextColor={T.textHint} multiline numberOfLines={4} maxLength={500} textAlignVertical="top" />
                        <TouchableOpacity style={[cs2.submitBtn, { backgroundColor: T.primary }, (!reviewRating || !reviewTitle.trim() || !reviewBody.trim()) && cs2.submitBtnDisabled]} onPress={handleSubmitReview} activeOpacity={0.85}>
                          <MaterialCommunityIcons name="send" size={16} color="#fff" />
                          <Text style={cs2.submitBtnText}>Submit Review</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {submittedReviews.filter(r => r.companyId === selectedCompany.id).length > 0 && (
                      <>
                        <View style={[cs2.detailDivider, { backgroundColor: T.borderFaint }]} />
                        <Text style={[cs2.detailSectionLabel, { color: T.textHint }]}>YOUR PREVIOUS REVIEWS</Text>
                        {submittedReviews.filter(r => r.companyId === selectedCompany.id).map((rev, i) => (
                          <View key={rev.id} style={[cs2.reviewCard, i > 0 && { marginTop: 12 }]}>
                            <View style={cs2.reviewStarsRow}>
                              {[1, 2, 3, 4, 5].map(s2 => <MaterialCommunityIcons key={s2} name={s2 <= rev.rating ? 'star' : 'star-outline'} size={13} color={s2 <= rev.rating ? T.warning : T.borderFaint} />)}
                              <Text style={[cs2.reviewDate, { color: T.textHint }]}>{rev.date}</Text>
                            </View>
                            <Text style={[cs2.reviewTitle, { color: T.textPrimary }]}>{rev.title}</Text>
                            <Text style={[cs2.reviewBody,  { color: T.textSub   }]}>{rev.body}</Text>
                          </View>
                        ))}
                      </>
                    )}
                  </View>
                </View>
              </>
            ) : (
              (() => {
                const expiredIds = new Set(PIPELINE.filter(p => p.expired).map(p => p.id));
                const reviewableCompanies = APPLIED_COMPANIES.filter(c => expiredIds.has(c.id));
                return reviewableCompanies.length === 0 ? (
                  <View style={cs2.reviewsEmptyWrap}>
                    <MaterialCommunityIcons name="star-off-outline" size={40} color={T.borderFaint} />
                    <Text style={[cs2.reviewsEmptyTitle, { color: T.textSub  }]}>No closed conversations yet</Text>
                    <Text style={[cs2.reviewsEmptySub,   { color: T.textHint }]}>You can leave a review once a conversation has closed.</Text>
                  </View>
                ) : (
                  <>
                    <View style={cs2.sectionRow}>
                      <Text style={[cs2.sectionTitle, { color: T.textPrimary }]}>Closed conversations</Text>
                    </View>
                    <View style={[cs2.card, { backgroundColor: T.surface, borderColor: T.borderFaint }]}>
                      {reviewableCompanies.map((co, i) => {
                        const coReviews = submittedReviews.filter(r => r.companyId === co.id);
                        return (
                          <View key={co.id}>
                            {i > 0 && <View style={[cs2.divider, { backgroundColor: T.borderFaint }]} />}
                            <TouchableOpacity style={cs2.companyListRow} onPress={() => openCompany(co.id)} activeOpacity={0.8}>
                              <CompanyLogo abbr={co.abbr} color={co.color} size="md" />
                              <View style={cs2.companyListInfo}>
                                <Text style={[cs2.companyListName, { color: T.textPrimary }]}>{co.company}</Text>
                                <Text style={[cs2.companyListRole, { color: T.textSub    }]}>{co.role}</Text>
                                {coReviews.length > 0 ? (
                                  <View style={cs2.companyListReviewedRow}>
                                    <MaterialCommunityIcons name="check-circle" size={12} color={T.success} />
                                    <Text style={[cs2.companyListReviewedText, { color: T.success }]}>Reviewed</Text>
                                  </View>
                                ) : (
                                  <Text style={[cs2.companyListReviewHint, { color: T.primary }]}>Tap to leave a review</Text>
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

// ─── Structural styles — conversation screen ──────────────────────────────────
const cs = StyleSheet.create({
  screen:           { flex: 1 },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  backBtn:          { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerLogo:       { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerLogoText:   { fontSize: 13, fontWeight: '800', color: '#fff' },
  headerInfo:       { flex: 1 },
  headerCompany:    { fontSize: 15, fontWeight: '700' },
  headerRole:       { fontSize: 12, marginTop: 1 },
  statusBadge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText:  { fontSize: 11, fontWeight: '700' },
  headerDivider:    { height: StyleSheet.hairlineWidth },
  typingLabel:      { fontSize: 12, fontStyle: 'italic', marginTop: 1 },

  msgScroll:        { flex: 1 },
  msgContent:       { paddingHorizontal: 16, paddingTop: 16, gap: 4 },

  bubbleWrap:       { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 2 },
  bubbleWrapMe:     { justifyContent: 'flex-end' },
  bubbleWrapThem:   { justifyContent: 'flex-start' },
  bubbleAvatar:     { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  bubbleAvatarText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  bubbleAvatarSpacer:{ width: 28 },
  bubbleCol:        { maxWidth: SCREEN_WIDTH * 0.72, gap: 3 },
  bubble:           { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe:         { borderBottomRightRadius: 4 },
  bubbleThem:       { borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleText:       { fontSize: 14, lineHeight: 20 },
  bubbleTime:       { fontSize: 10 },
  bubbleTimeMe:     { textAlign: 'right' },
  bubbleTimeThem:   { textAlign: 'left' },

  bubbleMeFirst:   { borderTopRightRadius: 18 },
  bubbleMeLast:    { borderBottomRightRadius: 4 },
  bubbleThemFirst: { borderTopLeftRadius: 18 },
  bubbleThemLast:  { borderBottomLeftRadius: 4 },

  expiredBanner:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, marginBottom: 8, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, alignSelf: 'center' },
  expiredBannerText: { fontSize: 12, fontWeight: '600' },

  inputBar:  { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  input:     { flex: 1, minHeight: 44, maxHeight: 120, borderRadius: 22, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 11, fontSize: 14 },
  sendBtn:   { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.35 },

  typingBubble: { paddingVertical: 12, paddingHorizontal: 16 },
  typingDots:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  typingDot:    { width: 7, height: 7, borderRadius: 4 },
  typingDot1:   {},
  typingDot2:   { opacity: 0.65 },
  typingDot3:   { opacity: 0.35 },
});

// ─── Structural styles — main screen ─────────────────────────────────────────
const cs2 = StyleSheet.create({
  screen: { flex: 1 },

  segWrap:          { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, borderRadius: 14, borderWidth: 1, padding: 4 },
  segTab:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 10, gap: 6 },
  segTabText:       { fontSize: 13, fontWeight: '600' },
  segTabTextActive: { fontWeight: '700' },
  segBadge:         { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, minWidth: 18, alignItems: 'center' },
  segBadgeText:     { fontSize: 10, fontWeight: '700', color: '#fff' },

  scroll:        { paddingHorizontal: 20 },
  sectionRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle:  { fontSize: 17, fontWeight: '700' },
  viewAll:       { fontSize: 13, fontWeight: '600' },
  card:          { borderRadius: 20, borderWidth: 1, padding: Spacing['4'], marginBottom: 16 },
  divider:       { height: StyleSheet.hairlineWidth, marginVertical: Spacing['2'] },

  // Empty state
  emptyWrap:     { alignItems: 'center', paddingTop: 24, paddingHorizontal: 32 },
  ghostStack:    { width: SCREEN_WIDTH - 64, height: 220, marginBottom: 32, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  ghostCard:     { position: 'absolute', width: 140, height: 190, borderRadius: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 6, overflow: 'hidden' },
  ghostPhoto:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ghostMeta:     { padding: 12 },
  ghostLine:     { height: 8, borderRadius: 4 },
  boltBadge:     { position: 'absolute', top: 14, left: '28%' as any, width: 36, height: 36, borderRadius: 18, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center', shadowColor: '#f97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6, zIndex: 10 },
  emptyTitle:    { fontSize: 22, fontWeight: '800', textAlign: 'center', lineHeight: 30, marginBottom: 12, letterSpacing: -0.3 },
  emptySub:      { fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 32 },
  boostBtn:      { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 50, paddingVertical: 16, paddingHorizontal: 40, marginBottom: 16, width: '100%' as any, justifyContent: 'center' },
  boostIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  boostBtnText:  { fontSize: 16, fontWeight: '700', color: '#fff' },
  editProfileText:{ fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },

  // Messages list
  msgRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing['3'], paddingVertical: Spacing['2'] },
  msgRowExpired: { opacity: 0.5 },
  msgLogoExpired:{ opacity: 0.4 },
  msgBody:       { flex: 1 },
  msgTopRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  msgCompany:    { fontSize: 15, fontWeight: '700' },
  msgTime:       { fontSize: 11 },
  msgRole:       { fontSize: 13, marginBottom: 4 },
  msgPreview:    { fontSize: 13, lineHeight: 18, marginBottom: Spacing['2'] },
  expiredRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  closedTag:     { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radii.full, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  closedTagText: { fontSize: 11, fontWeight: '600' },
  leaveReviewBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: Radii.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  leaveReviewBtnText:{ fontSize: 11, fontWeight: '700' },

  // Company/review detail
  backBtn:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: Spacing['2'], marginBottom: Spacing['2'] },
  backBtnText:   { fontSize: 14, fontWeight: '600' },
  detailCard:    { borderRadius: 20, overflow: 'hidden', borderWidth: 1, marginBottom: 16 },
  detailHeroImg: { width: '100%', height: 220 },
  detailHeroScrim:{ position: 'absolute', top: 0, left: 0, right: 0, height: 220, backgroundColor: 'rgba(10,5,25,0.45)' },
  detailContent: { padding: Spacing['5'] },
  detailRole:    { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, marginBottom: 4 },
  detailSalary:  { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  detailLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  detailLocation:{ fontSize: 13 },
  detailTagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  detailTag:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radii.full, borderWidth: 1 },
  detailTagText: { fontSize: 11, fontWeight: '700' },
  detailDivider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing['4'] },
  detailSectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: Spacing['3'] },
  detailDescription:  { fontSize: 14, lineHeight: 22 },
  detailGalleryMain:  { borderRadius: 14, overflow: 'hidden', marginBottom: 10 },
  detailGalleryMainImg: { width: '100%', height: 200, borderRadius: 14 },
  detailThumbRow:{ flexDirection: 'row', gap: 8 },
  detailThumb:   { width: (SCREEN_WIDTH - 80) / 3, height: 80, borderRadius: 10 },

  successCard:      { alignItems: 'center', paddingVertical: Spacing['6'], borderRadius: 16, borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', backgroundColor: 'rgba(34,197,94,0.08)', gap: Spacing['2'], marginBottom: Spacing['3'] },
  successCardTitle: { fontSize: 18, fontWeight: '700' },
  successCardSub:   { fontSize: 14 },

  fieldLabel:   { fontSize: 13, fontWeight: '600', marginBottom: Spacing['2'], marginTop: Spacing['3'] },
  starsRow:     { flexDirection: 'row', gap: 6, marginBottom: Spacing['2'] },
  ratingLabel:  { fontSize: 13, fontWeight: '600', marginBottom: Spacing['3'] },
  textField:    { borderRadius: 14, borderWidth: 1, paddingHorizontal: Spacing['4'], paddingVertical: Spacing['3'], fontSize: 14, marginBottom: Spacing['3'] },
  textArea:     { minHeight: 100, paddingTop: Spacing['3'] },
  submitBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radii.full, paddingVertical: 14, marginTop: Spacing['2'] },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText:{ fontSize: 15, fontWeight: '700', color: '#fff' },

  companyListRow:         { flexDirection: 'row', alignItems: 'center', gap: Spacing['3'], paddingVertical: Spacing['3'] },
  companyListInfo:        { flex: 1 },
  companyListName:        { fontSize: 15, fontWeight: '600' },
  companyListRole:        { fontSize: 13, marginTop: 1 },
  companyListReviewedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  companyListReviewedText:{ fontSize: 11, fontWeight: '600' },
  companyListReviewHint:  { fontSize: 11, marginTop: 4 },

  reviewsEmptyWrap:  { alignItems: 'center', paddingVertical: 60, gap: 12 },
  reviewsEmptyTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  reviewsEmptySub:   { fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 24 },

  reviewCard:      { gap: 6 },
  reviewStarsRow:  { flexDirection: 'row', alignItems: 'center', gap: 2 },
  reviewDate:      { fontSize: 11, marginLeft: 6 },
  reviewTitle:     { fontSize: 14, fontWeight: '600' },
  reviewBody:      { fontSize: 13, lineHeight: 20 },
});
