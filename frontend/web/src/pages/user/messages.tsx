import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import RatingModal, { RatingSubmission } from '@/components/ui/RatingModal';
import LeftSidebar from '@/components/ui/LeftSidebar';
import { navItems } from '@/data/jobs';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: number;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

interface Thread {
  id: number;
  company: string;
  initials: string;
  role: string;
  status: 'applied' | 'interview' | 'reviewing' | 'offer' | 'closed';
  lastMessage: string;
  time: string;
  unread: number;
  color: string;
  bg: string;
  messages: Message[];
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);
const IconPaperclip = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
const IconVerified = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#4F9DFF">
    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
  </svg>
);
const USER_NAV_ROUTES = {
  home:     '/user/swipe',
  messages: '/user/messages',
  profile:  '/user/profile',
};

const IconDots = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);
const IconPhone = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 5.51 5.51l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconCheckGreen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconStarFilled = ({ size = 22, color = '#FF4E6A' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
    />
  </svg>
);
const IconStarEmpty = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      fill="transparent"
      stroke="rgba(255,255,255,0.18)"
      strokeWidth="1.5"
    />
  </svg>
);

// ─── Thread data ──────────────────────────────────────────────────────────────
const THREADS: Thread[] = [
  {
    id: 1,
    company: 'Accenture',
    initials: 'AC',
    role: 'Senior Full Stack Developer',
    status: 'interview',
    lastMessage: "We'd love to schedule a call with our engineering lead.",
    time: '2m',
    unread: 2,
    color: '#FF4E6A',
    bg: 'rgba(255,78,106,0.12)',
    messages: [
      { id: 1, sender: 'them', text: "Hi John! Thanks for applying to the Senior Full Stack Developer role. We reviewed your profile and were really impressed.", time: '10:12 AM' },
      { id: 2, sender: 'them', text: "Could you tell us a bit more about your experience with GraphQL and large-scale TypeScript projects?", time: '10:13 AM' },
      { id: 3, sender: 'me', text: "Thanks for reaching out! I've been working with GraphQL for about 3 years — most recently building a real-time dashboard for a fintech client. TypeScript is my primary language across all recent projects, fully typed end-to-end.", time: '10:28 AM' },
      { id: 4, sender: 'them', text: "That's exactly the kind of background we're looking for. We'd love to schedule a quick 30-min intro call with our engineering lead this week. Are you free Thursday or Friday afternoon?", time: '2m ago' },
    ],
  },
  {
    id: 2,
    company: 'Alorica',
    initials: 'AL',
    role: 'Customer Success Manager',
    status: 'interview',
    lastMessage: 'Interview confirmed for Friday at 2pm PST!',
    time: '1h',
    unread: 1,
    color: '#4F9DFF',
    bg: 'rgba(79,157,255,0.12)',
    messages: [
      { id: 1, sender: 'them', text: "Hi John, we've reviewed your application for the Customer Success Manager position and we'd like to move forward.", time: 'Yesterday' },
      { id: 2, sender: 'me', text: "That's great to hear! I'm very interested in the role. What are the next steps?", time: 'Yesterday' },
      { id: 3, sender: 'them', text: "We'd like to schedule a panel interview with our CS leadership team. Does Friday at 2pm PST work for you?", time: 'Yesterday' },
      { id: 4, sender: 'me', text: "Friday at 2pm works perfectly. Looking forward to it!", time: 'Yesterday' },
      { id: 5, sender: 'them', text: 'Interview confirmed for Friday at 2pm PST! You will receive a calendar invite shortly with the video call link.', time: '1h ago' },
    ],
  },
  {
    id: 3,
    company: 'Socia',
    initials: 'SO',
    role: 'Product Designer',
    status: 'reviewing',
    lastMessage: "Thanks for your application. We're currently reviewing all candidates.",
    time: '3h',
    unread: 1,
    color: '#FFB347',
    bg: 'rgba(255,183,71,0.12)',
    messages: [
      { id: 1, sender: 'them', text: "Hi John, thank you for applying to the Product Designer position at Socia. We're excited to review your portfolio.", time: '3h ago' },
      { id: 2, sender: 'them', text: "We're currently reviewing all candidates and will be in touch within 5 business days. Thanks for your patience!", time: '3h ago' },
    ],
  },
  {
    id: 4,
    company: 'Accenture',
    initials: 'AC',
    role: 'Cloud Solutions Architect',
    status: 'applied',
    lastMessage: 'Your cloud architecture portfolio looks outstanding.',
    time: 'Yesterday',
    unread: 0,
    color: '#FF4E6A',
    bg: 'rgba(255,78,106,0.08)',
    messages: [
      { id: 1, sender: 'them', text: "Hi John, we received your application for the Cloud Solutions Architect role. Your cloud architecture portfolio looks outstanding.", time: 'Yesterday' },
      { id: 2, sender: 'me', text: "Thank you! I'm very excited about this opportunity. The scale of Accenture's enterprise cloud work is exactly what I've been looking for.", time: 'Yesterday' },
    ],
  },
  {
    id: 5,
    company: 'Socia',
    initials: 'SO',
    role: 'Marketing Analytics Lead',
    status: 'closed',
    lastMessage: "We've decided to move forward with another candidate.",
    time: 'Mon',
    unread: 0,
    color: 'rgba(255,255,255,0.25)',
    bg: 'rgba(255,255,255,0.05)',
    messages: [
      { id: 1, sender: 'me', text: "Hi! I applied for the Marketing Analytics Lead role and wanted to check in on the status.", time: 'Mon' },
      { id: 2, sender: 'them', text: "Hi John, thank you for your interest and patience. After careful consideration, we've decided to move forward with another candidate for this role. We'll keep your profile on file for future opportunities.", time: 'Mon' },
    ],
  },
];

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  applied:   { label: 'Applied',   color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)' },
  interview: { label: 'Interview', color: '#4F9DFF', bg: 'rgba(79,157,255,0.1)',  border: 'rgba(79,157,255,0.25)' },
  reviewing: { label: 'Reviewing', color: '#FFB347', bg: 'rgba(255,183,71,0.1)',  border: 'rgba(255,183,71,0.25)' },
  offer:     { label: 'Offer',     color: '#A855F7', bg: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.25)' },
  closed:    { label: 'Closed',    color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
};

// ─── Star labels ──────────────────────────────────────────────────────────────
const STAR_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
};

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
        background: 'rgba(255,78,106,0.1)', border: '1px solid rgba(255,78,106,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#FF4E6A', fontSize: '10px', fontWeight: 700,
      }}>AC</div>
      <div style={{
        padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px',
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: '5px',
      }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.4)',
            animation: `typingBounce 1.2s ease-in-out ${delay}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Inline Rating Card ───────────────────────────────────────────────────────
interface InlineRatingCardProps {
  company: string;
  role: string;
  threadId: number;
  onSubmit: (data: RatingSubmission) => void;
}

function InlineRatingCard({ company, role, threadId, onSubmit }: InlineRatingCardProps) {
  const [rating, setRating]       = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [comment, setComment]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [skipped, setSkipped]     = useState(false);

  if (skipped) return null;

  if (submitted) {
    return (
      <div style={{
        margin: '20px 0 8px',
        padding: '14px 16px',
        borderRadius: '14px',
        background: 'rgba(34,197,94,0.06)',
        border: '1px solid rgba(34,197,94,0.18)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <IconCheckGreen />
        <p style={{ color: '#22C55E', fontSize: '12px', fontWeight: 600, margin: 0 }}>
          Thanks for rating {company} — your feedback helps other job seekers.
        </p>
      </div>
    );
  }

  const display = hovered || rating;

  const handleSubmit = () => {
    if (!rating) return;
    setSubmitted(true);
    onSubmit({ threadId, company, role, overall: rating, comment });
  };

  return (
    <div style={{
      margin: '20px 0 8px',
      padding: '18px',
      borderRadius: '16px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.09)',
    }}>
      <p style={{
        color: 'rgba(255,255,255,0.45)', fontSize: '11px', fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px',
      }}>
        Rate your experience with {company}
      </p>

      {/* Stars */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
              transform: hovered === star ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.12s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            {star <= display
              ? <IconStarFilled size={24} />
              : <IconStarEmpty size={24} />}
          </button>
        ))}
      </div>

      {/* Label */}
      <p style={{
        color: rating > 0 ? '#FF4E6A' : 'rgba(255,255,255,0.18)',
        fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase', minHeight: '14px',
        margin: '0 0 14px', transition: 'color 0.2s',
      }}>
        {rating > 0 ? STAR_LABELS[rating] : ''}
      </p>

      {/* Comment */}
      <textarea
        rows={2}
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Add a comment (optional)…"
        style={{
          width: '100%', padding: '9px 12px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          color: 'rgba(255,255,255,0.75)', fontSize: '12px',
          lineHeight: 1.6, fontFamily: 'inherit',
          resize: 'none', marginBottom: '12px',
          outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => (e.target.style.borderColor = 'rgba(255,78,106,0.4)')}
        onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
      />

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setSkipped(true)}
          style={{
            flex: 1, padding: '8px 0', borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Skip
        </button>
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          style={{
            flex: 2, padding: '8px 0', borderRadius: '10px', border: 'none',
            background: rating > 0
              ? 'linear-gradient(135deg, #FF4E6A, #FF7854)'
              : 'rgba(255,255,255,0.07)',
            color: rating > 0 ? 'white' : 'rgba(255,255,255,0.22)',
            fontSize: '12px', fontWeight: 700,
            cursor: rating > 0 ? 'pointer' : 'default',
            fontFamily: 'inherit',
            boxShadow: rating > 0 ? '0 4px 14px rgba(255,78,106,0.28)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          Submit rating
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const router = useRouter();
  const [leftOpen, setLeftOpen]         = useState(true);
  const [activeNav, setActiveNav]       = useState('messages');
  const [activeThread, setActiveThread] = useState<Thread>(THREADS[0]);
  const [messages, setMessages]         = useState<Message[]>(THREADS[0].messages);
  const [threads, setThreads]           = useState<Thread[]>(THREADS);
  const [search, setSearch]             = useState('');
  const [activeTab, setActiveTab]       = useState<'all' | 'unread' | 'applied'>('all');
  const [input, setInput]               = useState('');
  const [isTyping, setIsTyping]         = useState(false);
  const [showRating, setShowRating]     = useState(false);
  const [ratedThreads, setRatedThreads] = useState<Set<number>>(new Set());
  const bottomRef                       = useRef<HTMLDivElement>(null);
  const inputRef                        = useRef<HTMLTextAreaElement>(null);
  const sidebarRef                      = useRef<HTMLElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const selectThread = (thread: Thread) => {
    setActiveThread(thread);
    setMessages(thread.messages);
    setIsTyping(false);
    setShowRating(false);
    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread: 0 } : t));
  };

  const handleRatingSubmit = (data: RatingSubmission) => {
    setRatedThreads(prev => new Set(prev).add(data.threadId));
    // POST to your API: fetch('/api/ratings', { method: 'POST', body: JSON.stringify(data) })
    console.log('Rating submitted:', data);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const newMsg: Message = {
      id: messages.length + 1,
      sender: 'me',
      text,
      time: 'Just now',
    };
    setMessages(prev => [...prev, newMsg]);
    setThreads(prev => prev.map(t =>
      t.id === activeThread.id ? { ...t, lastMessage: text, time: 'Just now' } : t
    ));
    setInput('');
    inputRef.current?.focus();

    setTimeout(() => setIsTyping(true), 800);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: messages.length + 2,
        sender: 'them',
        text: "Thanks for your message! I'll get back to you shortly.",
        time: 'Just now',
      };
      setMessages(prev => [...prev, reply]);
    }, 2800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const filteredThreads = threads.filter(t => {
    const matchesSearch =
      t.company.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'unread') return matchesSearch && t.unread > 0;
    if (activeTab === 'applied') return matchesSearch && (t.status === 'applied' || t.status === 'interview');
    return matchesSearch;
  });

  const totalUnread    = threads.reduce((acc, t) => acc + t.unread, 0);
  const status         = STATUS_CONFIG[activeThread.status];
  const isClosedThread = activeThread.status === 'closed';
  const isRated        = ratedThreads.has(activeThread.id);

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: '#08080f', fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
    }}>

      {/* ─── Keyframes ──────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes typingBounce {
          0%,60%,100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-in { animation: fadeUp 0.22s ease forwards; }
        textarea:focus { outline: none; }
        ::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; }
      `}</style>

      <LeftSidebar
        sidebarRef={sidebarRef}
        leftOpen={leftOpen}
        setLeftOpen={setLeftOpen}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        swipedCount={0}
        swipesLeft={15}
        navItems={navItems}
        navRoutes={USER_NAV_ROUTES}
        accentColor="#FF4E6A"
        counterLabel="Daily swipes"
        counterLimit={15}
        profileName="John Doe"
        profileEmail="user@jobswipe.com"
        profileImage="/assets/images/img1.jpg"
        avatarRadius="50%"
      />

      {/* ─── Thread List ────────────────────────────────────────────────────── */}
      <div style={{
        width: '300px', flexShrink: 0,
        background: '#0d0d1a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          height: '64px', display: 'flex', alignItems: 'center',
          padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          gap: '10px', flexShrink: 0,
        }}>
          <p style={{ color: 'white', fontSize: '15px', fontWeight: 700, margin: 0, flex: 1 }}>Messages</p>
          {totalUnread > 0 && (
            <span style={{
              background: 'rgba(255,78,106,0.15)', color: '#FF4E6A',
              fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
              border: '1px solid rgba(255,78,106,0.25)',
            }}>{totalUnread} new</span>
          )}
        </div>

        {/* Search */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '11px', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }}>
              <IconSearch />
            </span>
            <input
              type="text"
              placeholder="Search conversations…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px 8px 32px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', color: 'rgba(255,255,255,0.7)',
                fontSize: '12px', fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', padding: '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
        }}>
          {(['all', 'unread', 'applied'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '9px 0', background: 'transparent',
              border: 'none', borderBottom: activeTab === tab ? '2px solid #FF4E6A' : '2px solid transparent',
              color: activeTab === tab ? '#FF4E6A' : 'rgba(255,255,255,0.3)',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
              textTransform: 'capitalize',
            }}>{tab}</button>
          ))}
        </div>

        {/* Thread list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredThreads.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', margin: 0 }}>No conversations found</p>
            </div>
          ) : filteredThreads.map(thread => (
            <button
              key={thread.id}
              onClick={() => selectThread(thread)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '13px 16px', background: 'transparent',
                borderLeft: activeThread.id === thread.id ? '3px solid #FF4E6A' : '3px solid transparent',
                borderRight: 'none', borderTop: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                cursor: 'pointer', textAlign: 'left',
                backgroundColor: activeThread.id === thread.id ? 'rgba(255,78,106,0.05)' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: thread.bg, border: `1px solid ${thread.color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: thread.color, fontSize: '12px', fontWeight: 700, flexShrink: 0,
                position: 'relative',
              }}>
                {thread.initials}
                {thread.unread > 0 && (
                  <span style={{
                    position: 'absolute', top: '-3px', right: '-3px',
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#FF4E6A', border: '1.5px solid #0d0d1a',
                  }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                  <span style={{
                    color: 'white', fontSize: '13px', fontWeight: thread.unread > 0 ? 700 : 600,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px',
                  }}>{thread.company}</span>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', flexShrink: 0, marginLeft: '4px' }}>{thread.time}</span>
                </div>
                <p style={{
                  color: thread.unread > 0 ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.35)',
                  fontSize: '11px', fontWeight: thread.unread > 0 ? 500 : 400,
                  margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{thread.lastMessage}</p>
              </div>
              {thread.unread > 0 && (
                <span style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: '#FF4E6A', color: 'white',
                  fontSize: '10px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{thread.unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Chat Area ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Chat header */}
        <div style={{
          height: '64px', flexShrink: 0, display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: '14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#08080f',
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: activeThread.bg, border: `1px solid ${activeThread.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: activeThread.color, fontSize: '11px', fontWeight: 700, flexShrink: 0,
          }}>{activeThread.initials}</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>{activeThread.company}</span>
              <IconVerified />
              <span style={{
                padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700,
                background: status.bg, color: status.color, border: `1px solid ${status.border}`,
              }}>{status.label}</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0 }}>{activeThread.role}</p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              width: '34px', height: '34px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
            }}><IconPhone /></button>
            <button style={{
              width: '34px', height: '34px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
            }}><IconDots /></button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>

          {/* Date divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0 16px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Today</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Status chip */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
              background: status.bg, color: status.color, border: `1px solid ${status.border}`,
            }}>
              <IconCheck /> {status.label} · {activeThread.role}
            </span>
          </div>

          {/* Message bubbles */}
          {messages.map((msg, i) => {
            const isMine   = msg.sender === 'me';
            const prevSame = i > 0 && messages[i - 1].sender === msg.sender;
            return (
              <div key={msg.id} className="msg-in" style={{
                display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row',
                alignItems: 'flex-end', gap: '8px',
                marginTop: prevSame ? '3px' : '10px',
              }}>
                <div style={{ width: '28px', flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  {!prevSame && (
                    isMine ? (
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: 'rgba(255,78,106,0.15)', border: '1px solid rgba(255,78,106,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#FF4E6A', fontSize: '9px', fontWeight: 700,
                      }}>JD</div>
                    ) : (
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: activeThread.bg, border: `1px solid ${activeThread.color}22`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: activeThread.color, fontSize: '9px', fontWeight: 700,
                      }}>{activeThread.initials}</div>
                    )
                  )}
                </div>
                <div style={{ maxWidth: '65%' }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '16px',
                    borderBottomLeftRadius: !isMine && !prevSame ? '4px' : '16px',
                    borderBottomRightRadius: isMine && !prevSame ? '4px' : '16px',
                    background: isMine
                      ? 'linear-gradient(135deg, #FF4E6A, #FF7854)'
                      : 'rgba(255,255,255,0.07)',
                    border: isMine ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    color: isMine ? 'white' : 'rgba(255,255,255,0.82)',
                    fontSize: '13px', lineHeight: 1.55,
                  }}>{msg.text}</div>
                  <p style={{
                    color: 'rgba(255,255,255,0.22)', fontSize: '10px',
                    margin: '4px 2px 0',
                    textAlign: isMine ? 'right' : 'left',
                  }}>{msg.time}</p>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="msg-in" style={{ marginTop: '10px' }}>
              <TypingIndicator />
            </div>
          )}

          {/* ── Inline rating card — only shown for closed threads ── */}
          {isClosedThread && (
            <InlineRatingCard
              key={activeThread.id}
              company={activeThread.company}
              role={activeThread.role}
              threadId={activeThread.id}
              onSubmit={handleRatingSubmit}
            />
          )}

          <div ref={bottomRef} />
        </div>

        {/* Compose bar — disabled for closed threads */}
        {isClosedThread ? (
          <div style={{
            padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
            background: '#08080f', flexShrink: 0, display: 'flex', justifyContent: 'center',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '12px', margin: 0 }}>
              Messaging is disabled for closed conversations.
            </p>
          </div>
        ) : (
          <div style={{
            padding: '12px 16px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: '#08080f', flexShrink: 0,
          }}>
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '16px', padding: '8px 8px 8px 14px',
            }}>
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a message…"
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  color: 'rgba(255,255,255,0.8)', fontSize: '13px',
                  fontFamily: 'inherit', resize: 'none',
                  lineHeight: 1.5, maxHeight: '100px', outline: 'none',
                  paddingTop: '4px',
                }}
              />
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                <button style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.09)',
                  color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
                }}><IconPaperclip /></button>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  style={{
                    width: '34px', height: '34px', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: input.trim() ? 'linear-gradient(135deg, #FF4E6A, #FF7854)' : 'rgba(255,255,255,0.07)',
                    border: 'none', color: input.trim() ? 'white' : 'rgba(255,255,255,0.25)',
                    cursor: input.trim() ? 'pointer' : 'default',
                    transition: 'all 0.2s', boxShadow: input.trim() ? '0 4px 14px rgba(255,78,106,0.3)' : 'none',
                  }}><IconSend /></button>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.14)', fontSize: '10px', marginTop: '7px', textAlign: 'center', margin: '7px 0 0' }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        )}

        {/* Rating modal — kept as fallback, can be removed if not needed */}
        {showRating && (
          <RatingModal
            company={activeThread.company}
            role={activeThread.role}
            initials={activeThread.initials}
            accentColor={activeThread.color}
            accentBg={activeThread.bg}
            threadId={activeThread.id}
            onSubmit={handleRatingSubmit}
            onDismiss={() => setShowRating(false)}
          />
        )}
      </div>
    </div>
  );
}