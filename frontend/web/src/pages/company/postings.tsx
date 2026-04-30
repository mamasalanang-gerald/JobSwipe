'use client';
import React, { useState, useRef } from 'react';
import LeftSidebar from '@/components/ui/LeftSidebar';
import TopBar from '@/components/ui/TopBar';
import { companyNavItems } from '@/data/candidates';
import {
  IconVerified, IconMapPin, IconDollar, IconDots,
} from '@/components/ui/icons';

const DAILY_LIMIT = 10;
const COMPANY_NAV_ROUTES = {
  home:       '/company/swipe',
  candidates: '/company/candidates',
  postings:   '/company/postings',
  messages:   '/company/messages',
  analytics:  '/company/analytics',
};

type PostingStatus = 'Active' | 'Paused' | 'Closed';
type WorkSetup = 'Remote' | 'Onsite' | 'Hybrid';

interface JobPosting {
  id: number;
  title: string;
  department: string;
  setup: WorkSetup;
  location: string;
  salary: string;
  applicants: number;
  newApplicants: number;
  posted: string;
  status: PostingStatus;
  description: string;
  reqSkills: string[];
  prefSkills: string[];
  message: string;
}

const initialPostings: JobPosting[] = [
  {
    id: 1, title: 'Senior Full Stack Developer', department: 'Engineering',
    setup: 'Hybrid', location: 'Makati, Metro Manila, NCR',
    salary: '₱100k–₱120k/mo', applicants: 47, newApplicants: 12, posted: '3 days ago', status: 'Active',
    description: "We're looking for an experienced full-stack engineer to join our core product team. You'll own features end-to-end, collaborate closely with design, and help shape our technical roadmap.",
    reqSkills: ['React', 'Node.js', 'TypeScript', 'GraphQL'],
    prefSkills: ['AWS', 'Docker', 'PostgreSQL'],
    message: "Hey! We saw your profile and think you'd be a great fit. We move fast — expect to hear back within 48 hours of matching.",
  },
  {
    id: 2, title: 'UX / Product Designer', department: 'Design',
    setup: 'Hybrid', location: 'BGC, Metro Manila, NCR',
    salary: '₱80k–₱100k/mo', applicants: 31, newApplicants: 5, posted: '1 week ago', status: 'Active',
    description: "Join our design team to craft beautiful, user-centric experiences. You'll lead design sprints, build components in our design system, and collaborate with engineers to ship polished products.",
    reqSkills: ['Figma', 'Design Systems', 'User Research'],
    prefSkills: ['Prototyping', 'CSS'],
    message: "We value designers who think in systems. Share your portfolio and we'll get back to you within 3 days!",
  },
  {
    id: 3, title: 'Cloud / DevOps Engineer', department: 'Infrastructure',
    setup: 'Remote', location: 'Philippines (Remote)',
    salary: '₱120k–₱150k/mo', applicants: 18, newApplicants: 0, posted: '2 weeks ago', status: 'Paused',
    description: "Join our infrastructure team to build and maintain our cloud-native platform. You'll work on CI/CD pipelines, container orchestration, and cloud cost optimization across AWS and GCP.",
    reqSkills: ['AWS', 'Kubernetes', 'Terraform'],
    prefSkills: ['GCP', 'Helm', 'Prometheus'],
    message: "This role is temporarily paused. We'll resume reviewing applications soon — apply now to be first in queue!",
  },
  {
    id: 4, title: 'Data & Marketing Analyst', department: 'Marketing',
    setup: 'Onsite', location: 'Ortigas, Metro Manila, NCR',
    salary: '₱70k–₱90k/mo', applicants: 53, newApplicants: 8, posted: '5 days ago', status: 'Active',
    description: "We need a data-driven marketer who can turn raw numbers into actionable growth strategies. You'll own dashboards, run A/B tests, and report directly to the CMO.",
    reqSkills: ['SQL', 'Python', 'Tableau'],
    prefSkills: ['Google Analytics', 'dbt'],
    message: "Love data and storytelling? We want to hear from you. Expect a quick take-home case study as part of the process.",
  },
  {
    id: 5, title: 'Customer Success Manager', department: 'Operations',
    setup: 'Hybrid', location: 'Manila, NCR',
    salary: '₱65k–₱85k/mo', applicants: 24, newApplicants: 3, posted: '1 week ago', status: 'Closed',
    description: "Lead our customer success motion for mid-market accounts. You'll own onboarding, health scores, and renewals while being the voice of the customer internally.",
    reqSkills: ['Salesforce', 'SaaS', 'NPS'],
    prefSkills: ['Gainsight', 'Zendesk'],
    message: "This position is now closed. Thank you to everyone who applied!",
  },
  {
    id: 6, title: 'Mobile Engineer (React Native)', department: 'Engineering',
    setup: 'Remote', location: 'Makati, Metro Manila, NCR',
    salary: '₱90k–₱110k/mo', applicants: 11, newApplicants: 11, posted: 'Today', status: 'Active',
    description: "Build the next generation of our mobile app used by 500k+ users. You'll own features from design handoff to App Store release, working cross-functionally with product and design.",
    reqSkills: ['React Native', 'iOS', 'Android'],
    prefSkills: ['Expo', 'TypeScript', 'Fastlane'],
    message: "Fresh posting! We're moving fast on this one — apply today and expect to hear back within 24 hours.",
  },
];

// ─── Inline SVG icons (no emoji) ─────────────────────────────────────────────
const IcoGlobe = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const IcoBuilding = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
  </svg>
);
const IcoShuffle = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
    <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
    <line x1="4" y1="4" x2="9" y2="9"/>
  </svg>
);
const IcoPlus = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IcoXSm = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IcoUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcoArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IcoPause = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
);
const IcoPlay = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const IcoSlash = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);
const IcoTrash = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const IcoMsg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

// ─── Theme constants ──────────────────────────────────────────────────────────
const ACCENT  = '#6366F1';
const BG      = '#08080f';
const CARD_BG = '#0d0d1a';
const BORDER  = 'rgba(255,255,255,0.07)';
const TEXT    = 'rgba(255,255,255,0.85)';
const MUTED   = 'rgba(255,255,255,0.35)';
const SURFACE = 'rgba(255,255,255,0.04)';

const SETUP_CFG: Record<WorkSetup, { color: string; bg: string; border: string; Icon: React.FC }> = {
  Remote: { color: '#22D3EE', bg: 'rgba(34,211,238,0.10)', border: 'rgba(34,211,238,0.25)', Icon: IcoGlobe },
  Onsite: { color: '#F472B6', bg: 'rgba(244,114,182,0.10)', border: 'rgba(244,114,182,0.25)', Icon: IcoBuilding },
  Hybrid: { color: '#FB923C', bg: 'rgba(251,146,60,0.10)',  border: 'rgba(251,146,60,0.25)',  Icon: IcoShuffle },
};

const STATUS_DOT: Record<PostingStatus, string> = {
  Active: '#22C55E', Paused: '#FACC15', Closed: '#FF4E6A',
};

const REGIONS = ['NCR','Region I','Region II','Region III','Region IV-A','Region IV-B','Region V','Region VI','Region VII','Region VIII','Region IX','Region X','Region XI','Region XII','CAR','CARAGA','BARMM'];

// ─── Skill Adder ─────────────────────────────────────────────────────────────
function SkillAdder({ skills, onChange, chipColor = ACCENT }: { skills: string[]; onChange: (s: string[]) => void; chipColor?: string }) {
  const [adding, setAdding] = useState(false);
  const [val, setVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const v = val.replace(',', '').trim();
    if (v && !skills.includes(v)) onChange([...skills, v]);
    setVal(''); setAdding(false);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
      {skills.map(s => (
        <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: `${chipColor}18`, color: chipColor, border: `1px solid ${chipColor}35` }}>
          {s}
          <button onClick={() => onChange(skills.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: chipColor, padding: 0, display: 'flex', alignItems: 'center', opacity: 0.7 }}>
            <IcoXSm />
          </button>
        </span>
      ))}
      {adding ? (
        <input
          ref={inputRef} autoFocus value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); } if (e.key === 'Escape') { setAdding(false); setVal(''); } }}
          onBlur={commit}
          placeholder="Type & press Enter…"
          style={{ background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${chipColor}50`, borderRadius: '8px', padding: '4px 10px', fontSize: '12px', color: TEXT, outline: 'none', width: '130px', fontFamily: 'inherit' }}
        />
      ) : (
        <button
          onClick={() => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 10); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: 'transparent', border: `1px dashed ${chipColor}40`, color: chipColor, cursor: 'pointer', opacity: 0.8 }}
        >
          <IcoPlus /> Add
        </button>
      )}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
const ddItemBase: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
  padding: '10px 14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
  background: 'none', border: 'none', fontFamily: 'inherit', textAlign: 'left', color: TEXT,
};

function PostCard({ post, onToggleStatus, onClose, onDelete }: {
  post: JobPosting;
  onToggleStatus: (id: number) => void;
  onClose: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const [ddOpen, setDdOpen] = useState(false);
  const sp = SETUP_CFG[post.setup];
  const dot = STATUS_DOT[post.status];

  return (
    <div style={{ borderRadius: '18px', background: CARD_BG, border: `1px solid ${BORDER}`, marginBottom: '14px', overflow: 'visible', opacity: post.status === 'Closed' ? 0.65 : 1 }}>
      <div style={{ padding: '20px 20px 0' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 42, height: 42, borderRadius: '10px', background: `linear-gradient(135deg,${ACCENT},#8B5CF6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0, letterSpacing: '-0.5px' }}>AC</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: TEXT, display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                Accenture PH
                <IconVerified />
                {post.newApplicants > 0 && (
                  <span style={{ background: `${ACCENT}18`, color: ACCENT, fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', border: `1px solid ${ACCENT}30` }}>+{post.newApplicants} new</span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: MUTED, display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, display: 'inline-block', flexShrink: 0 }} />
                {post.status} · posted {post.posted}
              </div>
            </div>
          </div>

          {/* Dropdown */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setDdOpen(v => !v)} style={{ width: 32, height: 32, borderRadius: '8px', background: 'transparent', border: `1px solid ${BORDER}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>
              <IconDots />
            </button>
            {ddOpen && (
              <div onClick={() => setDdOpen(false)} style={{ position: 'absolute', top: 36, right: 0, background: '#13131f', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: `1px solid ${BORDER}`, minWidth: '190px', zIndex: 200, overflow: 'hidden' }}>
                {post.status !== 'Closed' && (
                  <>
                    <button onClick={() => onToggleStatus(post.id)} style={ddItemBase}>
                      {post.status === 'Active' ? <><IcoPause /> Pause posting</> : <><IcoPlay /> Resume posting</>}
                    </button>
                    <button onClick={() => onClose(post.id)} style={{ ...ddItemBase, color: '#FF4E6A' }}>
                      <IcoSlash /> Close posting
                    </button>
                  </>
                )}
                <button onClick={() => onDelete(post.id)} style={{ ...ddItemBase, color: '#FF4E6A' }}>
                  <IcoTrash /> Delete posting
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '6px', lineHeight: 1.2 }}>{post.title}</div>
        <div style={{ fontSize: '13px', color: MUTED, lineHeight: 1.65, marginBottom: '14px' }}>{post.description}</div>

        {/* Meta pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: sp.bg, border: `1px solid ${sp.border}`, color: sp.color }}>
            <sp.Icon /> {post.setup}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: SURFACE, border: `1px solid ${BORDER}`, color: MUTED }}>
            <IconMapPin /> {post.location}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', color: '#FACC15' }}>
            <IconDollar /> {post.salary}
          </span>
        </div>

        {/* Skills */}
        {(post.reqSkills.length > 0 || post.prefSkills.length > 0) && (
          <div style={{ marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {post.reqSkills.length > 0 && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED, marginBottom: '6px' }}>Required Skills</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {post.reqSkills.map(s => <span key={s} style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}>{s}</span>)}
                </div>
              </div>
            )}
            {post.prefSkills.length > 0 && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED, marginBottom: '6px' }}>Preferred Skills</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {post.prefSkills.map(s => <span key={s} style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: SURFACE, color: MUTED, border: `1px solid ${BORDER}` }}>{s}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message */}
        {post.message && (
          <div style={{ background: `${ACCENT}0d`, borderLeft: `3px solid ${ACCENT}`, borderRadius: '0 10px 10px 0', padding: '12px 14px', marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: ACCENT, marginBottom: '4px' }}>Message to Applicants</div>
            <div style={{ fontSize: '13px', color: TEXT, lineHeight: 1.55 }}>{post.message}</div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '13px', color: MUTED, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IcoUsers /> {post.applicants} applicants · {post.department} dept.
          </div>
          {post.newApplicants > 0 && <span style={{ fontSize: '13px', fontWeight: 700, color: ACCENT }}>+{post.newApplicants} new</span>}
        </div>
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', borderTop: `1px solid ${BORDER}` }}>
        {[
          { Icon: IcoUsers,      label: `${post.applicants} Applicants`, primary: false },
          { Icon: IcoMsg,        label: 'Message',           primary: false },
          { Icon: IcoArrowRight, label: 'View Applicants',   primary: true  },
        ].map(({ Icon, label, primary }, i) => (
          <button key={label} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px 8px', background: 'transparent', border: 'none', borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: primary ? ACCENT : MUTED, fontFamily: 'inherit' }}>
            <Icon /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Create Job Modal ─────────────────────────────────────────────────────────
function CreateJobModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (p: Omit<JobPosting, 'id' | 'applicants' | 'newApplicants' | 'posted' | 'status'>) => void;
}) {
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [salary, setSalary]     = useState('');
  const [dept, setDept]         = useState('');
  const [setup, setSetup]       = useState<WorkSetup | ''>('');
  const [region, setRegion]     = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity]         = useState('');
  const [message, setMessage]   = useState('');
  const [reqSkills, setReqSkills]   = useState<string[]>([]);
  const [prefSkills, setPrefSkills] = useState<string[]>([]);

  const canSubmit = title.trim() && desc.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    const loc = [city, province, region].filter(Boolean).join(', ') || 'Philippines';
    onSubmit({ title: title.trim(), description: desc.trim(), department: dept.trim() || 'General', setup: (setup || 'Onsite') as WorkSetup, location: loc, salary: salary.trim() || 'TBD', message: message.trim(), reqSkills, prefSkills });
    onClose();
  };

  const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: '10px', padding: '9px 12px', fontSize: '13px', fontFamily: 'inherit', color: TEXT, outline: 'none' };
  const labelStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' };
  const sectionStyle: React.CSSProperties = { background: SURFACE, borderRadius: '12px', padding: '16px', border: `1px solid ${BORDER}` };
  const sectionTitle: React.CSSProperties = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED, marginBottom: '12px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: CARD_BG, borderRadius: '20px', width: '100%', maxWidth: '560px', border: `1px solid rgba(255,255,255,0.1)`, boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${BORDER}` }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Post a Job</div>
            <div style={{ fontSize: '12px', color: MUTED, marginTop: '2px' }}>Fill in the details to create a new posting</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>
            <IcoXSm size={12} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '66vh', overflowY: 'auto', scrollbarWidth: 'none' }}>

          {/* Basic Info */}
          <div style={sectionStyle}>
            <div style={sectionTitle}>Basic Info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><label style={labelStyle}>Job Title *</label><input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior Full Stack Developer" /></div>
              <div><label style={labelStyle}>Description *</label><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '72px' }} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the role and responsibilities..." /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={labelStyle}>Salary Range</label><input style={inputStyle} value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. ₱100k–₱120k/mo" /></div>
                <div><label style={labelStyle}>Department</label><input style={inputStyle} value={dept} onChange={e => setDept(e.target.value)} placeholder="e.g. Engineering" /></div>
              </div>
            </div>
          </div>

          {/* Work Setup */}
          <div style={sectionStyle}>
            <div style={sectionTitle}>Work Setup</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['Remote', 'Onsite', 'Hybrid'] as WorkSetup[]).map(s => {
                const cfg = SETUP_CFG[s]; const active = setup === s;
                return (
                  <button key={s} onClick={() => setSetup(s)} style={{ flex: 1, padding: '9px', borderRadius: '10px', border: `1px solid ${active ? cfg.border : BORDER}`, background: active ? cfg.bg : 'transparent', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: active ? cfg.color : MUTED, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <cfg.Icon /> {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div style={sectionStyle}>
            <div style={sectionTitle}>Location</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div>
                <label style={labelStyle}>Region</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={region} onChange={e => setRegion(e.target.value)}>
                  <option value="">Select</option>
                  {REGIONS.map(r => <option key={r} value={r} style={{ background: '#0d0d1a' }}>{r}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Province / District</label><input style={inputStyle} value={province} onChange={e => setProvince(e.target.value)} placeholder="e.g. Metro Manila" /></div>
              <div><label style={labelStyle}>City / Municipality</label><input style={inputStyle} value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Makati" /></div>
            </div>
          </div>

          {/* Message */}
          <div style={sectionStyle}>
            <div style={sectionTitle}>Message to Applicants</div>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }} value={message} onChange={e => setMessage(e.target.value)} placeholder="e.g. Hey! We saw your profile and think you'd be a great fit..." />
          </div>

          {/* Skills */}
          <div style={sectionStyle}>
            <div style={sectionTitle}>Skills</div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Required Skills</label>
              <SkillAdder skills={reqSkills} onChange={setReqSkills} chipColor={ACCENT} />
            </div>
            <div>
              <label style={labelStyle}>Preferred Skills</label>
              <SkillAdder skills={prefSkills} onChange={setPrefSkills} chipColor="rgba(255,255,255,0.5)" />
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: MUTED, cursor: 'pointer', background: 'transparent', border: `1px solid ${BORDER}`, fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={!canSubmit} style={{ flex: 1, padding: '10px', background: canSubmit ? `linear-gradient(135deg,${ACCENT},#8B5CF6)` : 'rgba(255,255,255,0.06)', color: canSubmit ? '#fff' : MUTED, border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: canSubmit ? 'pointer' : 'not-allowed', fontFamily: 'inherit', boxShadow: canSubmit ? '0 4px 16px rgba(99,102,241,0.3)' : 'none' }}>
            Post Job
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PostingsPage() {
  const sidebarRef = useRef<HTMLElement>(null);
  const [leftOpen, setLeftOpen]   = useState(true);
  const [postings, setPostings]   = useState(initialPostings);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'All' | PostingStatus>('All');

  const activeCount     = postings.filter(p => p.status === 'Active').length;
  const totalApplicants = postings.reduce((a, p) => a + p.applicants, 0);

  const toggleStatus = (id: number) =>
    setPostings(ps => ps.map(p => p.id !== id ? p : { ...p, status: p.status === 'Active' ? 'Paused' : 'Active' }));
  const closePosting = (id: number) =>
    setPostings(ps => ps.map(p => p.id !== id ? p : { ...p, status: 'Closed' }));
  const deletePosting = (id: number) =>
    setPostings(ps => ps.filter(p => p.id !== id));
  const addPosting = (data: Omit<JobPosting, 'id' | 'applicants' | 'newApplicants' | 'posted' | 'status'>) =>
    setPostings(ps => [{ ...data, id: Date.now(), applicants: 0, newApplicants: 0, posted: 'Just now', status: 'Active' }, ...ps]);

  const visible = postings.filter(p => filterStatus === 'All' || p.status === filterStatus);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: BG, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <LeftSidebar
        sidebarRef={sidebarRef}
        leftOpen={leftOpen}
        setLeftOpen={setLeftOpen}
        activeNav="postings"
        setActiveNav={() => {}}
        swipedCount={activeCount}
        swipesLeft={DAILY_LIMIT - activeCount}
        navItems={companyNavItems}
        navRoutes={COMPANY_NAV_ROUTES}
        accentColor={ACCENT}
        counterLabel="Active posts"
        counterLimit={DAILY_LIMIT}
        profileName="Accenture PH"
        profileEmail="hr@accenture.com"
        profileImage="/assets/images/accenture.jpg"
        avatarRadius="8px"
        badgeLabel="COMPANY"
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar
          title="Job Postings"
          subtitle={`${activeCount} active · ${totalApplicants} total applicants`}
          accentColor={ACCENT}
          extraSlot={
            <button
              onClick={() => setShowModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: 'white', border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${ACCENT},#8B5CF6)`, boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
            >
              <IcoPlus size={14} /> New Posting
            </button>
          }
        />

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '6px', padding: '14px 28px 12px', borderBottom: `1px solid ${BORDER}` }}>
          {(['All', 'Active', 'Paused', 'Closed'] as const).map(s => {
            const count = s === 'All' ? postings.length : postings.filter(p => p.status === s).length;
            const active = filterStatus === s;
            return (
              <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '7px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: `1px solid ${active ? `${ACCENT}35` : BORDER}`, fontFamily: 'inherit', background: active ? `${ACCENT}18` : 'transparent', color: active ? ACCENT : MUTED }}>
                {s} <span style={{ opacity: 0.6 }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', scrollbarWidth: 'none' }}>
          <div style={{ width: '100%', maxWidth: '660px', padding: '0 20px' }}>
            {visible.length === 0
              ? <div style={{ textAlign: 'center', padding: '60px', color: MUTED, fontSize: '14px' }}>No postings found.</div>
              : visible.map(p => (
                  <PostCard key={p.id} post={p} onToggleStatus={toggleStatus} onClose={closePosting} onDelete={deletePosting} />
                ))
            }
          </div>
        </div>
      </main>

      {showModal && <CreateJobModal onClose={() => setShowModal(false)} onSubmit={addPosting} />}
    </div>
  );
}