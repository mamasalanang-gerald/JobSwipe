'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

import LeftSidebar from '@/components/ui/LeftSidebar';
import RatingModal from '@/components/ui/RatingModal';
import TypingIndicator from '@/components/ui/TypingIndicator';
import InlineRatingCard from '@/components/ui/InlineRatingCard';
import { IconSearch, IconSend, IconPaperclip, IconPhone, IconDots, IconStarFilled } from '@/components/ui/icons';import { IconCheck } from '@/components/ui/icons';

import { CompanyThread, Message, RatingSubmission } from '@/types/messages';
import { COMPANY_THREADS } from '@/data/companyThreads';
import { COMPANY_STATUS_CONFIG, COMPANY_STAR_LABELS, COMPANY_NAV_ROUTES } from '@/lib/constants';
import { companyNavItems } from '@/data/candidates';

const DAILY_LIMIT = 10;

export default function CompanyMessagesPage() {
  const router = useRouter();
  const [leftOpen, setLeftOpen]         = useState(true);
  const [threads, setThreads]           = useState<CompanyThread[]>(COMPANY_THREADS);
  const [activeThread, setActiveThread] = useState<CompanyThread>(COMPANY_THREADS[0]);
  const [messages, setMessages]         = useState<Message[]>(COMPANY_THREADS[0].messages);
  const [search, setSearch]             = useState('');
  const [activeTab, setActiveTab]       = useState<'all' | 'unread' | 'active'>('all');
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

  const selectThread = (thread: CompanyThread) => {
    setActiveThread(thread);
    setMessages(thread.messages);
    setIsTyping(false);
    setShowRating(false);
    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread: 0 } : t));
  };

  const handleRatingSubmit = (data: RatingSubmission) => {
    setRatedThreads(prev => new Set(prev).add(data.threadId));
    setShowRating(false);
    console.log('Candidate rating submitted:', data);
    // fetch('/api/candidate-ratings', { method: 'POST', body: JSON.stringify(data) });
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const newMsg: Message = { id: messages.length + 1, sender: 'company', text, time: 'Just now' };
    setMessages(prev => [...prev, newMsg]);
    setThreads(prev => prev.map(t => t.id === activeThread.id ? { ...t, lastMessage: text, time: 'Just now' } : t));
    setInput('');
    inputRef.current?.focus();
    setTimeout(() => setIsTyping(true), 800);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = { id: messages.length + 2, sender: 'candidate', text: "Thanks for the message! I'll get back to you shortly.", time: 'Just now' };
      setMessages(prev => [...prev, reply]);
    }, 2800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const filteredThreads = threads.filter(t => {
    const q = search.toLowerCase();
    const match = t.name.toLowerCase().includes(q) || t.role.toLowerCase().includes(q);
    if (activeTab === 'unread') return match && t.unread > 0;
    if (activeTab === 'active') return match && t.status !== 'passed';
    return match;
  });

  const totalUnread = threads.reduce((acc, t) => acc + t.unread, 0);
  const status      = COMPANY_STATUS_CONFIG[activeThread.status];
  const isPassed    = activeThread.status === 'passed';
  const isRated     = ratedThreads.has(activeThread.id);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#08080f', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
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
        activeNav="messages"
        setActiveNav={() => {}}
        swipedCount={threads.filter(t => t.status !== 'passed').length}
        swipesLeft={DAILY_LIMIT - threads.filter(t => t.status !== 'passed').length}
        navItems={companyNavItems}
        navRoutes={COMPANY_NAV_ROUTES}
        accentColor="#6366F1"
        counterLabel="Active threads"
        counterLimit={DAILY_LIMIT}
        profileName="Accenture PH"
        profileEmail="hr@accenture.com"
        profileImage="/assets/images/accenture.jpg"
        avatarRadius="8px"
        badgeLabel="COMPANY"
      />

      {/* ─── Thread List ──────────────────────────────────────────────────────── */}
      <div style={{ width: '300px', flexShrink: 0, background: '#0d0d1a', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '10px', flexShrink: 0 }}>
          <p style={{ color: 'white', fontSize: '15px', fontWeight: 700, margin: 0, flex: 1 }}>Messages</p>
          {totalUnread > 0 && <span style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(99,102,241,0.25)' }}>{totalUnread} new</span>}
        </div>

        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '11px', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }}><IconSearch /></span>
            <input type="text" placeholder="Search candidates…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 32px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontFamily: 'inherit', outline: 'none' }} />
          </div>
        </div>

        <div style={{ display: 'flex', padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          {(['all', 'unread', 'active'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: '9px 0', background: 'transparent', border: 'none', borderBottom: activeTab === tab ? '2px solid #6366F1' : '2px solid transparent', color: activeTab === tab ? '#818CF8' : 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', textTransform: 'capitalize' }}>
              {tab}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredThreads.map(thread => {
            const sc = COMPANY_STATUS_CONFIG[thread.status];
            return (
              <button key={thread.id} onClick={() => selectThread(thread)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: 'transparent', borderLeft: activeThread.id === thread.id ? '3px solid #6366F1' : '3px solid transparent', borderRight: 'none', borderTop: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'left', backgroundColor: activeThread.id === thread.id ? 'rgba(99,102,241,0.06)' : 'transparent', transition: 'background 0.15s', opacity: thread.status === 'passed' ? 0.65 : 1 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${thread.color}33`, flexShrink: 0, position: 'relative' }}>
                  <img src={thread.avatar} alt={thread.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {thread.unread > 0 && <span style={{ position: 'absolute', top: '-3px', right: '-3px', width: '8px', height: '8px', borderRadius: '50%', background: '#6366F1', border: '1.5px solid #0d0d1a' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                    <span style={{ color: 'white', fontSize: '13px', fontWeight: thread.unread > 0 ? 700 : 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{thread.name}</span>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', flexShrink: 0, marginLeft: '4px' }}>{thread.time}</span>
                  </div>
                  <span style={{ padding: '1px 6px', borderRadius: '999px', fontSize: '9px', fontWeight: 700, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, display: 'inline-block', marginBottom: '3px' }}>{sc.label}</span>
                  <p style={{ color: thread.unread > 0 ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: thread.unread > 0 ? 500 : 400, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{thread.lastMessage}</p>
                </div>
                {thread.unread > 0 && <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#6366F1', color: 'white', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{thread.unread}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Chat Area ──────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Chat header */}
        <div style={{ height: '64px', flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 24px', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#08080f' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${activeThread.color}33`, flexShrink: 0 }}>
            <img src={activeThread.avatar} alt={activeThread.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>{activeThread.name}</span>
              <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>{status.label}</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0 }}>{activeThread.role}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isPassed && !isRated && (
              <button onClick={() => setShowRating(true)}
                style={{ padding: '7px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: '#818CF8', cursor: 'pointer', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                <IconStarFilled size={13} color="#818CF8" /> Rate Candidate
              </button>
            )}
            <button style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><IconPhone /></button>
            <button style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><IconDots /></button>
          </div>
        </div>

        {/* Messages scroll area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0 16px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Today</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
              <IconCheck /> {status.label} · {activeThread.role}
            </span>
          </div>

          {messages.map((msg, i) => {
            const isMine   = msg.sender === 'company';
            const prevSame = i > 0 && messages[i - 1].sender === msg.sender;
            return (
              <div key={msg.id} className="msg-in" style={{ display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '8px', marginTop: prevSame ? '3px' : '10px' }}>
                <div style={{ width: '28px', flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  {!prevSame && (isMine ? (
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(99,102,241,0.3)' }}>
                      <img src="/assets/images/accenture.jpg" alt="Company" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${activeThread.color}33` }}>
                      <img src={activeThread.avatar} alt={activeThread.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
                <div style={{ maxWidth: '65%' }}>
                  <div style={{ padding: '10px 14px', borderRadius: '16px', borderBottomLeftRadius: !isMine && !prevSame ? '4px' : '16px', borderBottomRightRadius: isMine && !prevSame ? '4px' : '16px', background: isMine ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255,255,255,0.07)', border: isMine ? 'none' : '1px solid rgba(255,255,255,0.08)', color: isMine ? 'white' : 'rgba(255,255,255,0.82)', fontSize: '13px', lineHeight: 1.55 }}>
                    {msg.text}
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '10px', margin: '4px 2px 0', textAlign: isMine ? 'right' : 'left' }}>{msg.time}</p>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="msg-in" style={{ marginTop: '10px' }}>
              <TypingIndicator mode="avatar" avatar={activeThread.avatar} name={activeThread.name} />
            </div>
          )}

          {isPassed && !isRated && (
            <InlineRatingCard
              key={activeThread.id}
              subjectName={activeThread.name}
              subjectLabel="Rate this candidate"
              role={activeThread.role}
              threadId={activeThread.id}
              accentColor="#6366F1"
              accentColorAlt="#8B5CF6"
              accentGlow="rgba(99,102,241,0.28)"
              focusBorderColor="rgba(99,102,241,0.4)"
              starLabels={COMPANY_STAR_LABELS}
              successMessage="Candidate rated — feedback helps improve future matches."
              commentPlaceholder="Add internal notes (optional)…"
              onSubmit={handleRatingSubmit}
            />
          )}

          <div ref={bottomRef} />
        </div>

        {/* Compose bar */}
        {isPassed ? (
          <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#08080f', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '12px', margin: 0 }}>Messaging is disabled for passed candidates.</p>
          </div>
        ) : (
          <div style={{ padding: '12px 16px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#08080f', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '16px', padding: '8px 8px 8px 14px' }}>
              <textarea ref={inputRef} rows={1} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder={`Message ${activeThread.name}…`}
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontFamily: 'inherit', resize: 'none', lineHeight: 1.5, maxHeight: '100px', outline: 'none', paddingTop: '4px' }} />
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                <button style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><IconPaperclip /></button>
                <button onClick={sendMessage} disabled={!input.trim()}
                  style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: input.trim() ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255,255,255,0.07)', border: 'none', color: input.trim() ? 'white' : 'rgba(255,255,255,0.25)', cursor: input.trim() ? 'pointer' : 'default', transition: 'all 0.2s', boxShadow: input.trim() ? '0 4px 14px rgba(99,102,241,0.3)' : 'none' }}>
                  <IconSend />
                </button>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.14)', fontSize: '10px', margin: '7px 0 0', textAlign: 'center' }}>Enter to send · Shift+Enter for new line</p>
          </div>
        )}

        {showRating && (
          <RatingModal
            company={activeThread.name}
            role={activeThread.role}
            initials={activeThread.initials}
            accentColor="#6366F1"
            accentBg="rgba(99,102,241,0.12)"
            threadId={activeThread.id}
            onSubmit={handleRatingSubmit}
            onDismiss={() => setShowRating(false)}
          />
        )}
      </div>
    </div>
  );
}