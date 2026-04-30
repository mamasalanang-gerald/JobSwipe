'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { candidates, TOTAL, companyNavItems } from '@/data/candidates';
import { Candidate } from '@/data/candidates';
import LeftSidebar from '@/components/ui/LeftSidebar';
import TopBar from '@/components/ui/TopBar';
import { IconX, IconChevronRight, IconVerified } from '@/components/ui/icons';

const DAILY_LIMIT = 10;
const COMPANY_NAV_ROUTES = {
  home:       '/company/swipe',
  candidates: '/company/candidates',
  postings:   '/company/postings',
  messages:   '/company/messages',
  analytics:  '/company/analytics',
};

const STATUS_OPTIONS = ['All', 'Invited', 'Passed', 'Pending'];
const MATCH_COLORS: Record<string, string> = {
  high:   '#22C55E',
  medium: '#818CF8',
  low:    '#FACC15',
};

function matchTier(score: number) {
  if (score >= 90) return 'high';
  if (score >= 75) return 'medium';
  return 'low';
}

function MatchBar({ score }: { score: number }) {
  const color = MATCH_COLORS[matchTier(score)];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '4px', borderRadius: '999px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, borderRadius: '999px', background: color, transition: 'width 0.5s' }} />
      </div>
      <span style={{ color, fontSize: '12px', fontWeight: 700, minWidth: '32px' }}>{score}%</span>
    </div>
  );
}

type CandidateStatus = 'Pending' | 'Invited' | 'Passed';

export default function CandidatesPage() {
  const sidebarRef = useRef<HTMLElement>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('candidates');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [statuses, setStatuses] = useState<Record<number, CandidateStatus>>(
    Object.fromEntries(candidates.map(c => [c.id, 'Pending']))
  );

  const filtered = candidates.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || statuses[c.id] === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const setStatus = (id: number, status: CandidateStatus) =>
    setStatuses(s => ({ ...s, [id]: status }));

  const invited = Object.values(statuses).filter(s => s === 'Invited').length;
  const passed  = Object.values(statuses).filter(s => s === 'Passed').length;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#08080f', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <LeftSidebar
        sidebarRef={sidebarRef}
        leftOpen={leftOpen}
        setLeftOpen={setLeftOpen}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        swipedCount={invited}
        swipesLeft={DAILY_LIMIT - invited}
        navItems={companyNavItems}
        navRoutes={COMPANY_NAV_ROUTES}
        accentColor="#6366F1"
        counterLabel="Daily reviews"
        counterLimit={DAILY_LIMIT}
        profileName="Accenture PH"
        profileEmail="hr@accenture.com"
        profileImage="/assets/images/accenture.jpg"
        avatarRadius="8px"
        badgeLabel="COMPANY"
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar
          title="Candidates"
          subtitle={`${TOTAL} total applicants`}
          accentColor="#6366F1"
        />

        {/* Summary cards */}
        <div style={{ display: 'flex', gap: '12px', padding: '20px 28px 0' }}>
          {[
            { label: 'Total Applied', value: TOTAL, color: '#6366F1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
            { label: 'Invited',       value: invited, color: '#22C55E', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
            { label: 'Passed',        value: passed,  color: '#FF4E6A', bg: 'rgba(255,78,106,0.08)', border: 'rgba(255,78,106,0.2)' },
            { label: 'Pending',       value: TOTAL - invited - passed, color: '#FACC15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.2)' },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} style={{ flex: 1, padding: '14px 18px', borderRadius: '16px', background: bg, border: `1px solid ${border}` }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>{label}</p>
              <p style={{ color, fontSize: '26px', fontWeight: 800, margin: 0, lineHeight: 1 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 28px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, role, or skill…"
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '9px 12px 9px 34px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.18s', background: statusFilter === s ? 'rgba(99,102,241,0.15)' : 'transparent', color: statusFilter === s ? '#818CF8' : 'rgba(255,255,255,0.35)', borderColor: statusFilter === s ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px 28px', scrollbarWidth: 'none' }}>
          <div style={{ borderRadius: '18px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 120px 36px', gap: '0', padding: '10px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Candidate', 'Role', 'Location', 'Salary', 'Match', 'Status', ''].map((h, i) => (
                <span key={i} style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>No candidates match your search</p>
              </div>
            ) : (
              filtered.map((c, i) => {
                const status = statuses[c.id];
                const statusStyle: Record<CandidateStatus, { color: string; bg: string; border: string }> = {
                  Invited: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' },
                  Passed:  { color: '#FF4E6A', bg: 'rgba(255,78,106,0.12)', border: 'rgba(255,78,106,0.25)' },
                  Pending: { color: '#FACC15', bg: 'rgba(250,204,21,0.10)', border: 'rgba(250,204,21,0.2)' },
                };
                const ss = statusStyle[status];
                return (
                  <div
                    key={c.id}
                    style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 120px 36px', gap: '0', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center', background: selected?.id === c.id ? 'rgba(99,102,241,0.06)' : 'transparent', transition: 'background 0.15s', cursor: 'pointer' }}
                    onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  >
                    {/* Name + avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img src={c.avatar} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{c.name}</span>
                          {c.verified && <svg width="12" height="12" viewBox="0 0 24 24" fill="#22C55E"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '11px', margin: 0 }}>{c.availability.split('·')[0].trim()}</p>
                      </div>
                    </div>

                    {/* Role */}
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px' }}>{c.role}</span>

                    {/* Location */}
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{c.distance}</span>

                    {/* Salary */}
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px' }}>{c.salary.split('–')[0].trim()}+</span>

                    {/* Match */}
                    <MatchBar score={c.matchScore} />

                    {/* Status pill + actions */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color }}>{status}</span>
                    </div>

                    {/* Chevron */}
                    <div style={{ color: 'rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'flex-end' }}>
                      <IconChevronRight />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Slide-in detail panel */}
      <aside style={{ width: selected ? '320px' : '0', transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)', flexShrink: 0, background: '#0d0d1a', borderLeft: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {selected && (
          <div style={{ width: '320px', overflowY: 'auto', scrollbarWidth: 'none', flex: 1 }}>
            {/* Panel header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: 0 }}>Profile</p>
              <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><IconX /></button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Avatar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '18px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
                  <img src={selected.avatar} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '16px', margin: 0 }}>{selected.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '3px 0 0' }}>{selected.role}</p>
                </div>
              </div>

              {/* Match */}
              <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Match Score</span>
                  <span style={{ color: MATCH_COLORS[matchTier(selected.matchScore)], fontWeight: 800, fontSize: '14px' }}>{selected.matchScore}%</span>
                </div>
                <MatchBar score={selected.matchScore} />
              </div>

              {/* About */}
              <div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>About</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', lineHeight: 1.7, margin: 0 }}>{selected.description}</p>
              </div>

              {/* Skills */}
              <div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Skills</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selected.tags.map(t => (
                    <span key={t} style={{ padding: '4px 11px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)', color: '#818CF8' }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Experience</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selected.experience.map((exp, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366F1', marginTop: '5px', flexShrink: 0 }} />
                      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{exp}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div style={{ padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>🎓</span>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Education</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: 0, fontWeight: 500 }}>{selected.education}</p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => setStatus(selected.id, 'Invited')} style={{ padding: '12px', borderRadius: '14px', fontSize: '13px', fontWeight: 700, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 18px rgba(99,102,241,0.25)' }}>
                  ✉ Send Invite
                </button>
                <button onClick={() => setStatus(selected.id, 'Passed')} style={{ padding: '11px', borderRadius: '14px', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.09)' }}>
                  Pass
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}