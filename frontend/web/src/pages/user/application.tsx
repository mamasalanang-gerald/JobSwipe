import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import LeftSidebar from '@/components/ui/LeftSidebar';
import TopBar from '@/components/ui/TopBar';
import { jobs as ALL_JOBS } from '@/data/jobs';
import { Job } from '@/types/job';
import { USER_NAV, USER_NAV_ROUTES } from '@/lib/nav';
import {
  IconVerified,
  IconMapPin,
  IconSearch,
  IconChevronRight,
} from '@/components/ui/icons';

// ─── Route → nav id map ───────────────────────────────────────────────────────
const ROUTE_TO_NAV: Record<string, string> = {
  '/user/explore':     'explore',
  '/user/application': 'applications',
  '/user/messages':    'messages',
  '/user/profile':     'profile',
};

// ─── Types ────────────────────────────────────────────────────────────────────
type AppStatus = 'Applied' | 'Viewed' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn';

interface Application {
  id: number;
  job: Job;
  status: AppStatus;
  appliedAt: string;
  lastUpdate: string;
  notes?: string;
}

const STATUS_CONFIG: Record<AppStatus, { color: string; bg: string; border: string; dot: string; label: string }> = {
  Applied:   { color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',       border: 'rgba(96,165,250,0.25)',       dot: '#60A5FA',              label: 'Application sent'       },
  Viewed:    { color: '#A78BFA', bg: 'rgba(167,139,250,0.1)',      border: 'rgba(167,139,250,0.25)',      dot: '#A78BFA',              label: 'Recruiter viewed'        },
  Interview: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',       border: 'rgba(251,191,36,0.25)',       dot: '#FBBF24',              label: 'Interview scheduled'     },
  Offer:     { color: '#22C55E', bg: 'rgba(34,197,94,0.12)',       border: 'rgba(34,197,94,0.25)',        dot: '#22C55E',              label: 'Offer received'          },
  Rejected:  { color: '#FF4E6A', bg: 'rgba(255,78,106,0.1)',       border: 'rgba(255,78,106,0.2)',        dot: '#FF4E6A',              label: 'Not moving forward'      },
  Withdrawn: { color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', dot: 'rgba(255,255,255,0.3)', label: 'Application withdrawn' },
};

// ─── Mock applications ────────────────────────────────────────────────────────
const MOCK_APPLICATIONS: Application[] = [
  { id: 1, job: ALL_JOBS[0], status: 'Offer',     appliedAt: 'Apr 10, 2025', lastUpdate: '2 days ago',  notes: 'Offer letter received. Reviewing compensation package.' },
  { id: 2, job: ALL_JOBS[1], status: 'Interview', appliedAt: 'Apr 14, 2025', lastUpdate: '1 day ago',   notes: 'Technical interview scheduled for next week.' },
  { id: 3, job: ALL_JOBS[2], status: 'Viewed',    appliedAt: 'Apr 18, 2025', lastUpdate: '5 hours ago'  },
  { id: 4, job: ALL_JOBS[3], status: 'Applied',   appliedAt: 'Apr 20, 2025', lastUpdate: 'Just now'     },
  { id: 5, job: ALL_JOBS[4], status: 'Rejected',  appliedAt: 'Apr 5, 2025',  lastUpdate: '1 week ago',  notes: 'Not moving forward at this time.'            },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: AppStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
      background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ─── Stats Strip ──────────────────────────────────────────────────────────────
function StatsStrip({ apps }: { apps: Application[] }) {
  const counts = { Applied: 0, Viewed: 0, Interview: 0, Offer: 0, Rejected: 0, Withdrawn: 0 } as Record<AppStatus, number>;
  apps.forEach(a => counts[a.status]++);

  const stats = [
    { label: 'Total',     value: apps.length,        color: 'rgba(255,255,255,0.7)' },
    { label: 'In Review', value: counts['Viewed'],    color: '#A78BFA' },
    { label: 'Interview', value: counts['Interview'], color: '#FBBF24' },
    { label: 'Offers',    value: counts['Offer'],     color: '#22C55E' },
    { label: 'Rejected',  value: counts['Rejected'],  color: '#FF4E6A' },
  ];

  return (
    <div style={{ display: 'flex', gap: '1px', padding: '0 32px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
      {stats.map(({ label, value, color }, i) => (
        <div key={label} style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
          <p style={{ color, fontSize: '20px', fontWeight: 700, margin: 0, lineHeight: 1 }}>{value}</p>
          <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '4px 0 0' }}>{label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Accordion Row ────────────────────────────────────────────────────────────
function AccordionRow({ app, isOpen, onToggle }: { app: Application; isOpen: boolean; onToggle: () => void }) {
  const cfg = STATUS_CONFIG[app.status];

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

      {/* ── Collapsed header ── */}
      <div
        onClick={onToggle}
        style={{
          display: 'grid',
          gridTemplateColumns: '2.2fr 1fr 1fr 1fr 36px',
          alignItems: 'center',
          padding: '13px 20px',
          cursor: 'pointer',
          background: isOpen ? 'rgba(255,78,106,0.04)' : 'transparent',
          borderLeft: `3px solid ${isOpen ? '#FF4E6A' : 'transparent'}`,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'; }}
        onMouseLeave={e => { if (!isOpen) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
      >
        {/* Company / Role */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
            <img src={app.job.logo} alt={app.job.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.job.company}</span>
              {app.job.verified && <IconVerified />}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.job.role}</p>
          </div>
        </div>

        {/* Status */}
        <div><StatusBadge status={app.status} /></div>

        {/* Applied */}
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{app.appliedAt}</span>

        {/* Salary */}
        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>{app.job.salary}</span>

        {/* Chevron */}
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isOpen ? 'rgba(255,78,106,0.12)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isOpen ? 'rgba(255,78,106,0.3)' : 'rgba(255,255,255,0.08)'}`,
          color: isOpen ? '#FF4E6A' : 'rgba(255,255,255,0.3)',
          transition: 'all 0.2s',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        }}>
          <IconChevronRight />
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {isOpen && (
        <div style={{ padding: '0 20px 20px', background: 'rgba(255,78,106,0.025)', borderLeft: '3px solid #FF4E6A' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', paddingTop: '16px' }}>

            {/* Application status card */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)', padding: '14px 16px' }}>
              <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Application</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Row label="Status">
                  <span style={{ color: cfg.color, fontWeight: 600, fontSize: '12px' }}>{cfg.label}</span>
                </Row>
                <Row label="Applied on"><span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{app.appliedAt}</span></Row>
                <Row label="Last update"><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{app.lastUpdate}</span></Row>
              </div>
            </div>

            {/* Job details card */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)', padding: '14px 16px' }}>
              <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Job details</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Row label="Salary"><span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{app.job.salary}</span></Row>
                <Row label="Type"><span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{app.job.type.split('·')[0].trim()}</span></Row>
                <Row label="Location">
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <IconMapPin /> {app.job.distance}
                  </span>
                </Row>
              </div>
            </div>

            {/* Company card */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)', padding: '14px 16px' }}>
              <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Company</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '9px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <img src={app.job.logo} alt={app.job.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{app.job.company}</span>
                    {app.job.verified && <IconVerified />}
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>{app.job.role}</p>
                </div>
              </div>
              {app.job.tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {app.job.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {app.notes && (
            <div style={{ marginTop: '12px', padding: '11px 14px', borderRadius: '10px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)' }}>
              <p style={{ color: 'rgba(251,191,36,0.85)', fontSize: '12px', margin: 0, lineHeight: 1.55 }}>
                📝 {app.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Label / value row helper ─────────────────────────────────────────────────
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>{label}</span>
      {children}
    </div>
  );
}

// ─── Main ApplicationsPage ────────────────────────────────────────────────────
export default function ApplicationsPage() {
  const router     = useRouter();
  const sidebarRef = useRef<HTMLElement>(null!);

  const activeNav = ROUTE_TO_NAV[router.pathname] ?? 'applications';

  const [leftOpen,     setLeftOpen]    = useState(true);
  const [activeFilter, setActiveFilter] = useState<AppStatus | 'All'>('All');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [openRowId,    setOpenRowId]    = useState<number | null>(MOCK_APPLICATIONS[0]?.id ?? null);

  const swipedCount = 0;
  const swipesLeft  = 15 - swipedCount;

  const FILTERS: (AppStatus | 'All')[] = ['All', 'Applied', 'Viewed', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

  const filtered = MOCK_APPLICATIONS.filter(a => {
    const matchStatus = activeFilter === 'All' || a.status === activeFilter;
    const matchSearch =
      !searchQuery ||
      a.job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.job.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleToggle = (id: number) => {
    setOpenRowId(prev => (prev === id ? null : id));
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#07070f', fontFamily: "'DM Sans', 'Inter', sans-serif", overflow: 'hidden' }}>

      {/* ── Left Sidebar ── */}
      <LeftSidebar
        sidebarRef={sidebarRef}
        leftOpen={leftOpen}
        setLeftOpen={setLeftOpen}
        activeNav={activeNav}
        setActiveNav={() => {}}
        swipedCount={swipedCount}
        swipesLeft={swipesLeft}
        navItems={USER_NAV}
        navRoutes={USER_NAV_ROUTES}
        accentColor="#FF4E6A"
        counterLabel="Daily swipes"
        counterLimit={15}
        profileName="Alex Rivera"
        profileEmail="alex@email.com"
        profileImage="/assets/images/img1.jpg"
        avatarRadius="50%"
      />

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        <TopBar
          title="My Applications"
          subtitle={`${MOCK_APPLICATIONS.length} total applications`}
          accentColor="#FF4E6A"
        />

        <StatsStrip apps={MOCK_APPLICATIONS} />

        {/* Search + filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', padding: '8px 12px', flex: '0 0 240px' }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}><IconSearch /></span>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search applications…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', flex: 1 }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  flexShrink: 0, padding: '5px 13px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                  border: `1px solid ${activeFilter === f ? '#FF4E6A' : 'rgba(255,255,255,0.1)'}`,
                  background: activeFilter === f ? 'rgba(255,78,106,0.12)' : 'transparent',
                  color: activeFilter === f ? '#FF4E6A' : 'rgba(255,255,255,0.35)',
                  cursor: 'pointer', transition: 'all 0.18s',
                }}
              >
                {f}
                {f !== 'All' && (
                  <span style={{ marginLeft: '5px', opacity: 0.6, fontSize: '10px' }}>
                    {MOCK_APPLICATIONS.filter(a => a.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '80px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '18px', margin: '0 0 8px' }}>No applications found</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', margin: 0 }}>Try adjusting your filters or start swiping</p>
              <button
                onClick={() => router.push(USER_NAV_ROUTES.explore)}
                style={{ marginTop: '20px', padding: '10px 24px', borderRadius: '999px', fontWeight: 600, fontSize: '13px', color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #FF4E6A, #FF7854)' }}
              >
                Explore Jobs
              </button>
            </div>
          ) : (
            <div style={{ minWidth: '640px' }}>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr 36px',
                padding: '9px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
                position: 'sticky', top: 0, zIndex: 1,
              }}>
                {['Company / Role', 'Status', 'Applied', 'Salary', ''].map(h => (
                  <span key={h} style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {h}
                  </span>
                ))}
              </div>

              {filtered.map(app => (
                <AccordionRow
                  key={app.id}
                  app={app}
                  isOpen={openRowId === app.id}
                  onToggle={() => handleToggle(app.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}