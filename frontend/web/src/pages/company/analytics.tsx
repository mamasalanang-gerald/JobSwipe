'use client';
import React, { useState, useRef } from 'react';
import LeftSidebar from '@/components/ui/LeftSidebar';
import TopBar from '@/components/ui/TopBar';
import { companyNavItems, candidates } from '@/data/candidates';
import {
  IconMail, IconEye, IconFileText, IconX, IconPin,
} from '@/components/ui/icons';

const DAILY_LIMIT = 10;
const COMPANY_NAV_ROUTES = {
  home:       '/company/swipe',
  candidates: '/company/candidates',
  postings:   '/company/postings',
  messages:   '/company/messages',
  analytics:  '/company/analytics',
};

const WEEKLY_VIEWS = [12, 28, 19, 35, 42, 31, 47];
const WEEKLY_APPS  = [3,  8,  5,  11, 14, 9,  16];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEPT_DATA = [
  { dept: 'Engineering',    applicants: 58, invited: 14, color: '#6366F1' },
  { dept: 'Design',         applicants: 31, invited: 8,  color: '#8B5CF6' },
  { dept: 'Marketing',      applicants: 53, invited: 11, color: '#EC4899' },
  { dept: 'Infrastructure', applicants: 18, invited: 4,  color: '#22C55E' },
  { dept: 'Operations',     applicants: 24, invited: 6,  color: '#FACC15' },
];

const FUNNEL = [
  { label: 'Profile Views', value: 214, color: '#6366F1' },
  { label: 'Card Swipes',   value: 138, color: '#8B5CF6' },
  { label: 'Invites Sent',  value:  43, color: '#22C55E' },
  { label: 'Interviews',    value:  18, color: '#FACC15' },
  { label: 'Offers Made',   value:   6, color: '#FF4E6A' },
];

const RANGE_OPTIONS = ['This Week', 'This Month', 'All Time'];

// Activity feed items — icon is now a React node
const ACTIVITY = [
  { icon: <IconMail />,     color: '#6366F1', bg: 'rgba(99,102,241,0.12)',  text: 'Invite sent to Alex Rivera for Senior Full Stack Developer', time: '2m ago'  },
  { icon: <IconEye />,      color: '#818CF8', bg: 'rgba(129,140,248,0.12)', text: 'Jamie Santos viewed your company profile',                   time: '18m ago' },
  { icon: <IconFileText />, color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   text: 'New application from Morgan Lee — Cloud / DevOps Engineer',  time: '1h ago'  },
  { icon: <IconX />,        color: '#FF4E6A', bg: 'rgba(255,78,106,0.12)',  text: 'Passed on Casey Nguyen',                                     time: '3h ago'  },
  { icon: <IconPin />,      color: '#FACC15', bg: 'rgba(250,204,21,0.12)',  text: 'Job posting "Mobile Engineer" went live',                    time: 'Today'   },
];

function StatCard({ label, value, delta, color, bg, border, suffix = '' }: {
  label: string; value: string | number; delta?: string;
  color: string; bg: string; border: string; suffix?: string;
}) {
  return (
    <div style={{ padding: '18px 20px', borderRadius: '18px', background: bg, border: `1px solid ${border}`, flex: 1 }}>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>{label}</p>
      <p style={{ color, fontSize: '28px', fontWeight: 900, margin: '0 0 4px', lineHeight: 1 }}>{value}{suffix}</p>
      {delta && <p style={{ color: '#22C55E', fontSize: '11px', fontWeight: 600, margin: 0 }}>{delta}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const sidebarRef = useRef<HTMLElement>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [range, setRange]       = useState('This Week');

  const totalApps    = DEPT_DATA.reduce((a, d) => a + d.applicants, 0);
  const totalInvited = DEPT_DATA.reduce((a, d) => a + d.invited, 0);
  const convRate     = Math.round((totalInvited / totalApps) * 100);
  const avgMatch     = Math.round(candidates.reduce((a, c) => a + c.matchScore, 0) / candidates.length);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#08080f', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <LeftSidebar
        sidebarRef={sidebarRef}
        leftOpen={leftOpen}
        setLeftOpen={setLeftOpen}
        activeNav="analytics"
        setActiveNav={() => {}}
        swipedCount={totalInvited}
        swipesLeft={DAILY_LIMIT - totalInvited}
        navItems={companyNavItems}
        navRoutes={COMPANY_NAV_ROUTES}
        accentColor="#6366F1"
        counterLabel="Invites sent"
        counterLimit={DAILY_LIMIT}
        profileName="Accenture PH"
        profileEmail="hr@accenture.com"
        profileImage="/assets/images/accenture.jpg"
        avatarRadius="8px"
        badgeLabel="COMPANY"
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar
          title="Analytics"
          subtitle="Hiring performance overview"
          extraSlot={
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '3px' }}>
              {RANGE_OPTIONS.map(r => (
                <button key={r} onClick={() => setRange(r)} style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.18s', background: range === r ? 'rgba(99,102,241,0.25)' : 'transparent', color: range === r ? '#818CF8' : 'rgba(255,255,255,0.35)' }}>
                  {r}
                </button>
              ))}
            </div>
          }
        />

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px', scrollbarWidth: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* KPI row */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <StatCard label="Total Applicants" value={totalApps}    delta="↑ 24% vs last week" color="#818CF8" bg="rgba(99,102,241,0.08)"  border="rgba(99,102,241,0.2)"  />
            <StatCard label="Invites Sent"     value={totalInvited} delta="↑ 18% vs last week" color="#22C55E" bg="rgba(34,197,94,0.08)"   border="rgba(34,197,94,0.2)"   />
            <StatCard label="Conversion Rate"  value={convRate}     delta="↑ 3pts vs last week" color="#FACC15" bg="rgba(250,204,21,0.08)"  border="rgba(250,204,21,0.2)"  suffix="%" />
            <StatCard label="Avg Match Score"  value={avgMatch}     delta="↑ 5pts vs last week" color="#FF4E6A" bg="rgba(255,78,106,0.08)"  border="rgba(255,78,106,0.2)"  suffix="%" />
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

            {/* Weekly views */}
            <div style={{ padding: '20px', borderRadius: '18px', background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                <div>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: '0 0 2px' }}>Profile Views</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>vs. Applications this week</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[{ color: '#6366F1', label: 'Views' }, { color: '#22C55E', label: 'Apps' }].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px', marginBottom: '10px' }}>
                {DAYS.map((d, i) => {
                  const maxV = Math.max(...WEEKLY_VIEWS);
                  const maxA = Math.max(...WEEKLY_APPS);
                  return (
                    <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ width: '100%', display: 'flex', gap: '2px', alignItems: 'flex-end', height: '80px' }}>
                        <div style={{ flex: 1, borderRadius: '4px 4px 2px 2px', background: i === DAYS.length - 1 ? '#6366F1' : 'rgba(99,102,241,0.35)', height: `${(WEEKLY_VIEWS[i] / maxV) * 100}%`, minHeight: '4px', transition: 'height 0.5s ease' }} />
                        <div style={{ flex: 1, borderRadius: '4px 4px 2px 2px', background: i === DAYS.length - 1 ? '#22C55E' : 'rgba(34,197,94,0.35)', height: `${(WEEKLY_APPS[i] / maxA) * 100}%`, minHeight: '4px', transition: 'height 0.5s ease' }} />
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>{d}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hiring funnel */}
            <div style={{ padding: '20px', borderRadius: '18px', background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: '0 0 4px' }}>Hiring Funnel</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: '0 0 18px' }}>Candidate pipeline overview</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {FUNNEL.map(f => {
                  const pct = Math.round((f.value / FUNNEL[0].value) * 100);
                  return (
                    <div key={f.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px' }}>{f.label}</span>
                        <span style={{ color: f.color, fontSize: '12px', fontWeight: 700 }}>{f.value} <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height: '5px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '999px', background: f.color, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dept breakdown + top candidates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

            {/* By department */}
            <div style={{ padding: '20px', borderRadius: '18px', background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: '0 0 4px' }}>By Department</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: '0 0 16px' }}>Applicants vs invites</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {DEPT_DATA.map(d => (
                  <div key={d.dept}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{d.dept}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{d.applicants} apps</span>
                        <span style={{ color: d.color, fontSize: '12px', fontWeight: 700 }}>{d.invited} invited</span>
                      </div>
                    </div>
                    <div style={{ height: '4px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ height: '100%', width: `${(d.applicants / totalApps) * 100}%`, borderRadius: '999px', background: `${d.color}44` }} />
                      <div style={{ position: 'absolute', top: 0, height: '100%', width: `${(d.invited / totalApps) * 100}%`, borderRadius: '999px', background: d.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top candidates */}
            <div style={{ padding: '20px', borderRadius: '18px', background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: '0 0 4px' }}>Top Candidates</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: '0 0 16px' }}>By match score</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[...candidates].sort((a, b) => b.matchScore - a.matchScore).map((c, i) => {
                  const color = c.matchScore >= 90 ? '#22C55E' : c.matchScore >= 75 ? '#818CF8' : '#FACC15';
                  return (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', fontWeight: 700, width: '16px', textAlign: 'center' }}>#{i + 1}</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '9px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                        <img src={c.avatar} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.role}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '48px', height: '4px', borderRadius: '999px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${c.matchScore}%`, background: color, borderRadius: '999px' }} />
                        </div>
                        <span style={{ color, fontSize: '12px', fontWeight: 700, minWidth: '32px' }}>{c.matchScore}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <div style={{ padding: '20px', borderRadius: '18px', background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: '0 0 14px' }}>Recent Activity</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ACTIVITY.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color, flexShrink: 0 }}>
                    {a.icon}
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0, flex: 1, lineHeight: 1.4 }}>{a.text}</p>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', flexShrink: 0 }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}