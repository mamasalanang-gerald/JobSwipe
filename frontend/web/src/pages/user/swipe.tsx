'use client';
import React, { useState, useRef, useEffect } from 'react';

// ─── Job data ───────────────────────────────────────────────────────────────
const jobs = [
  {
    id: 1,
    company: 'Accenture',
    verified: true,
    role: 'Senior Full Stack Developer',
    salary: '$95k – $120k / yr',
    distance: '5.3 km away',
    type: 'Full-time · Remote Hybrid',
    tags: ['React', 'Node.js', 'TypeScript'],
    logo: '/assets/images/accenture.jpg',
    bg: '/assets/images/accenture2.jpg',
    description:
      'Join Accenture\'s digital engineering team to build scalable web applications used by Fortune 500 clients. You\'ll work across the full stack delivering high-impact features with a cross-functional team.',
    requirements: [
      '5+ years of full-stack development experience',
      'Proficiency in React, Node.js, and TypeScript',
      'Experience with REST and GraphQL APIs',
      'Familiarity with CI/CD pipelines and cloud platforms',
    ],
    benefits: ['Health & Dental', 'Remote Flexibility', '401(k) Match', 'Learning Budget'],
  },
  {
    id: 2,
    company: 'Alorica',
    verified: true,
    role: 'Customer Success Manager',
    salary: '$65k – $80k / yr',
    distance: '8.7 km away',
    type: 'Full-time · On-site',
    tags: ['CRM', 'Leadership', 'SaaS'],
    logo: '/assets/images/alorica2.jpg',
    bg: '/assets/images/alorica3.jpg',
    description:
      'Lead customer relationships for a portfolio of enterprise SaaS clients. You\'ll drive adoption, reduce churn, and act as the voice of the customer internally.',
    requirements: [
      '3+ years in customer success or account management',
      'Experience with CRM platforms (Salesforce, HubSpot)',
      'Strong communication and presentation skills',
      'Proven ability to manage multiple accounts simultaneously',
    ],
    benefits: ['PTO Policy', 'Health Insurance', 'Annual Bonus', 'Career Growth'],
  },
  {
    id: 3,
    company: 'Socia',
    verified: false,
    role: 'Product Designer',
    salary: '$80k – $100k / yr',
    distance: '2.1 km away',
    type: 'Contract · Remote',
    tags: ['Figma', 'UX Research', 'Design Systems'],
    logo: '/assets/images/socia.jpg',
    bg: '/assets/images/socia2.jpg',
    description:
      'Shape the end-to-end design of Socia\'s consumer mobile app. From discovery research to polished high-fidelity prototypes, you\'ll own the design process.',
    requirements: [
      'Portfolio demonstrating product design work',
      'Expert-level Figma skills',
      'Experience conducting user research and usability testing',
      'Ability to create and maintain design systems',
    ],
    benefits: ['Fully Remote', 'Flexible Hours', 'Equipment Stipend', 'Stock Options'],
  },
  {
    id: 4,
    company: 'Accenture',
    verified: true,
    role: 'Cloud Solutions Architect',
    salary: '$130k – $160k / yr',
    distance: '12.4 km away',
    type: 'Full-time · Remote',
    tags: ['AWS', 'Kubernetes', 'Terraform'],
    logo: '/assets/images/accenture.jpg',
    bg: '/assets/images/accenture3.jpg',
    description:
      'Design and implement cloud infrastructure solutions for enterprise clients. You\'ll lead architecture reviews, define best practices, and guide engineering teams through cloud migrations.',
    requirements: [
      'AWS Solutions Architect certification (preferred)',
      '7+ years in infrastructure or cloud engineering',
      'Hands-on with Kubernetes, Docker, and Terraform',
      'Experience with multi-cloud and hybrid environments',
    ],
    benefits: ['Top-tier Salary', 'Remote First', 'Training Budget', 'Stock Grants'],
  },
  {
    id: 5,
    company: 'Socia',
    verified: false,
    role: 'Marketing Analytics Lead',
    salary: '$70k – $90k / yr',
    distance: '6.9 km away',
    type: 'Full-time · Hybrid',
    tags: ['Data Studio', 'SQL', 'Growth'],
    logo: '/assets/images/socia2.jpg',
    bg: '/assets/images/socia3.jpg',
    description:
      'Own the marketing analytics function at Socia. Build dashboards, run experiments, and translate data into growth insights for the marketing and product teams.',
    requirements: [
      '4+ years in marketing analytics or growth',
      'Strong SQL and data visualization skills',
      'Experience with A/B testing and attribution models',
      'Comfortable presenting insights to executives',
    ],
    benefits: ['Hybrid Schedule', 'Performance Bonus', 'Health Benefits', 'Equity'],
  },
];

const TOTAL = jobs.length;

// ─── Icons ───────────────────────────────────────────────────────────────────
const IconX = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconHeart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const IconVerified = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="#4F9DFF">
    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
  </svg>
);
const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);
const IconCompass = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" />
  </svg>
);
const IconBriefcase = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const IconChat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconMapPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);
const IconDollar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ─── Swipe Card ──────────────────────────────────────────────────────────────
interface Job {
  id: number;
  company: string;
  verified: boolean;
  role: string;
  salary: string;
  distance: string;
  type: string;
  tags: string[];
  logo: string;
  bg: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

interface CardProps {
  job: Job;
  isTop: boolean;
  onSwipe: (dir: 'left' | 'right') => void;
  zIndex: number;
  scale: number;
  translateY: number;
}

function SwipeCard({ job, isTop, onSwipe, zIndex, scale, translateY }: CardProps) {
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [dragRotate, setDragRotate] = useState(0);
  const [hint, setHint] = useState<'like' | 'nope' | null>(null);
  const [flyOut, setFlyOut] = useState<'left' | 'right' | null>(null);

  const triggerSwipe = (dir: 'left' | 'right') => {
    setFlyOut(dir);
    setTimeout(() => onSwipe(dir), 350);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isTop) return;
    isDragging.current = true;
    startX.current = e.clientX;
    currentX.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startX.current;
    currentX.current = dx;
    setDragX(dx);
    setDragRotate(dx * 0.03);
    if (dx > 50) setHint('like');
    else if (dx < -50) setHint('nope');
    else setHint(null);
  };
  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dx = currentX.current;
    if (Math.abs(dx) > 100) {
      triggerSwipe(dx > 0 ? 'right' : 'left');
    } else {
      setDragX(0);
      setDragRotate(0);
      setHint(null);
    }
  };

  const flyStyle: React.CSSProperties = flyOut
    ? {
        transform: `translateX(${flyOut === 'right' ? 130 : -130}%) rotate(${flyOut === 'right' ? 18 : -18}deg)`,
        opacity: 0,
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s',
      }
    : {};

  const dragStyle: React.CSSProperties =
    isTop && !flyOut
      ? {
          transform: `translateX(${dragX}px) rotate(${dragRotate}deg) translateY(${translateY}px) scale(${scale})`,
          transition: isDragging.current ? 'none' : 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        }
      : {
          transform: `translateY(${translateY}px) scale(${scale})`,
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        };

  return (
    <div
      className="absolute inset-0 rounded-3xl overflow-hidden select-none cursor-grab active:cursor-grabbing"
      style={{ zIndex, ...dragStyle, ...flyStyle }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <img src={job.bg} alt={job.company} className="absolute inset-0 w-full h-full object-cover" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0) 35%, rgba(5,5,20,0.72) 62%, rgba(5,5,20,0.97) 100%)',
        }}
      />

      {hint === 'like' && (
        <div className="absolute top-8 left-6 border-[3px] border-[#22C55E] text-[#22C55E] text-xl font-black px-4 py-1 rounded-xl -rotate-12 opacity-90 tracking-widest z-10">
          LIKE
        </div>
      )}
      {hint === 'nope' && (
        <div className="absolute top-8 right-6 border-[3px] border-[#FF4E6A] text-[#FF4E6A] text-xl font-black px-4 py-1 rounded-xl rotate-12 opacity-90 tracking-widest z-10">
          NOPE
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white text-xl font-bold">{job.company}</span>
          {job.verified && <IconVerified />}
        </div>
        <p className="text-white/50 text-xs mb-0.5 flex items-center gap-1">
          <IconMapPin /> {job.distance}
        </p>
        <p className="text-white/40 text-xs mb-2">{job.type}</p>
        <p className="text-white/50 text-[11px] mb-0.5">Looking for</p>
        <p className="text-white text-lg font-semibold mb-3">{job.role}</p>
        <div className="flex flex-wrap gap-1.5">
          {job.tags.map((t) => (
            <span key={t} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 border border-white/15 text-white/80">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function DetailPanel({ job, onApply, onSkip }: { job: Job; onApply: () => void; onSkip: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-white/[0.07]">
        <div className="flex items-start gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <span className="text-white font-bold text-lg leading-tight">{job.company}</span>
              {job.verified && <IconVerified />}
            </div>
            <p className="text-white/50 text-sm leading-snug">{job.role}</p>
          </div>
        </div>

        {/* Meta pills */}
        <div className="flex flex-col gap-2 mb-5">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <IconDollar />
            <span>{job.salary}</span>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <IconClock />
            <span>{job.type}</span>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <IconMapPin />
            <span>{job.distance}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onApply}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white transition active:scale-95 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16a34a)', boxShadow: '0 4px 16px rgba(34,197,94,0.3)' }}
          >
            Apply Now
          </button>
          <button
            onClick={onSkip}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white/60 transition hover:text-white hover:bg-white/10 border border-white/10"
          >
            <IconX />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="flex-shrink-0 p-6 border-b border-white/[0.07]">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">About the Role</p>
        <p className="text-white/75 text-sm leading-relaxed">{job.description}</p>
      </div>

      {/* Requirements */}
      <div className="flex-shrink-0 p-6 border-b border-white/[0.07]">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Requirements</p>
        <ul className="flex flex-col gap-2.5">
          {job.requirements.map((req, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                <IconCheck />
              </span>
              <span className="text-white/70 text-sm leading-snug">{req}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Skills */}
      <div className="flex-shrink-0 p-6 border-b border-white/[0.07]">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Skills</p>
        <div className="flex flex-wrap gap-2">
          {job.tags.map((t) => (
            <span
              key={t}
              className="px-3 py-1.5 rounded-xl text-xs font-medium border"
              style={{ background: 'rgba(255,78,106,0.08)', borderColor: 'rgba(255,78,106,0.2)', color: '#FF7A8A' }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="flex-shrink-0 p-6">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Benefits</p>
        <div className="grid grid-cols-2 gap-2">
          {job.benefits.map((b) => (
            <div
              key={b}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-white/70"
              style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)' }}
            >
              <span style={{ color: '#FFB347' }}><IconStar /></span>
              {b}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────
const navItems = [
  { id: 'home', label: 'Home', Icon: IconHome },
  { id: 'explore', label: 'Explore', Icon: IconCompass },
  { id: 'applications', label: 'Applications', Icon: IconBriefcase },
  { id: 'messages', label: 'Messages', Icon: IconChat },
  { id: 'profile', label: 'Profile', Icon: IconUser },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SwipeHomePage() {
  const [index, setIndex] = useState(0);
  const [swipedCount, setSwipedCount] = useState(0);
  const [lastAction, setLastAction] = useState<'like' | 'nope' | null>(null);
  const [activeNav, setActiveNav] = useState('home');

  const remaining = TOTAL - index;
  const swipesLeft = Math.max(0, 15 - swipedCount);
  const currentJob = jobs[index] ?? null;

  const handleSwipe = (dir: 'left' | 'right') => {
    setLastAction(dir === 'right' ? 'like' : 'nope');
    setTimeout(() => setLastAction(null), 1400);
    setIndex((i) => i + 1);
    setSwipedCount((c) => c + 1);
  };

  const handleButton = (dir: 'left' | 'right') => {
    if (index >= TOTAL) return;
    handleSwipe(dir);
  };

  const visibleJobs = jobs.slice(index, index + 3);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#08080f', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      {/* ── Left Sidebar ── */}
      <aside
        className="flex-shrink-0 flex flex-col py-6 px-4"
        style={{
          width: '220px',
          background: '#0d0d1a',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="px-2 mb-8">
          <span className="text-white text-xl font-bold tracking-tight">
            Job<span style={{ color: '#FF4E6A' }}>Swipe</span>
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium"
              style={{
                color: activeNav === id ? '#FF4E6A' : 'rgba(255,255,255,0.45)',
                background: activeNav === id ? 'rgba(255,78,106,0.08)' : 'transparent',
              }}
            >
              <Icon />
              {label}
              {id === 'messages' && (
                <span
                  className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: '#FF4E6A', color: 'white' }}
                >
                  3
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Swipe counter */}
        <div
          className="px-3 py-3 rounded-xl mt-4"
          style={{ background: 'rgba(255,78,106,0.07)', border: '1px solid rgba(255,78,106,0.15)' }}
        >
          <p className="text-[11px] font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Daily swipes
          </p>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white font-bold text-sm">{swipedCount} used</span>
            <span className="text-sm font-medium" style={{ color: '#FF4E6A' }}>
              {swipesLeft} left
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(swipedCount / 15) * 100}%`, background: 'linear-gradient(90deg, #FF4E6A, #FF7854)' }}
            />
          </div>
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-3 mt-4 px-2">
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border border-white/10"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <img src="/assets/images/img1.jpg" alt="You" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">John Doe</p>
            <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
              user@jobswipe.com
            </p>
          </div>
        </div>
      </aside>

      {/* ── Center: Swipe Area ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div>
            <h1 className="text-white font-bold text-lg">Discover Jobs</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {remaining} jobs remaining
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-xl text-sm font-medium border transition hover:border-white/20"
              style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)', background: 'transparent' }}
            >
              Filters
            </button>
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center transition hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Card stack */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-6">
          {remaining === 0 ? (
            <div className="flex flex-col items-center text-center gap-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-2"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                ✨
              </div>
              <p className="text-white font-bold text-xl">You're all caught up!</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Check back later for new opportunities
              </p>
              <button
                onClick={() => {
                  setIndex(0);
                  setSwipedCount(0);
                }}
                className="mt-2 px-6 py-2.5 rounded-full font-semibold text-sm text-white transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #FF4E6A, #FF7854)' }}
              >
                Refresh Jobs
              </button>
            </div>
          ) : (
            <>
              {/* Progress dots */}
              <div className="flex gap-1.5 mb-6">
                {jobs.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-500"
                    style={{
                      width: i === index ? '20px' : '6px',
                      height: '6px',
                      background: i < index ? '#FF4E6A' : i === index ? '#FF4E6A' : 'rgba(255,255,255,0.12)',
                    }}
                  />
                ))}
              </div>

              {/* Card container */}
              <div className="relative" style={{ width: '340px', height: '460px' }}>
                {visibleJobs.map((job, stackIdx) => {
                  const isTop = stackIdx === 0;
                  const scale = 1 - stackIdx * 0.04;
                  const translateY = stackIdx * -12;
                  return (
                    <SwipeCard
                      key={job.id}
                      job={job}
                      isTop={isTop}
                      onSwipe={handleSwipe}
                      zIndex={3 - stackIdx}
                      scale={scale}
                      translateY={translateY}
                    />
                  );
                })}

                {/* Toast */}
                <div
                  className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-20 transition-all duration-300"
                  style={{
                    opacity: lastAction ? 1 : 0,
                    transform: `translateX(-50%) translateY(${lastAction ? '0px' : '-10px'})`,
                  }}
                >
                  <div
                    className="px-4 py-1.5 rounded-full text-sm font-bold border"
                    style={
                      lastAction === 'like'
                        ? { background: 'rgba(34,197,94,0.15)', borderColor: '#22C55E', color: '#22C55E' }
                        : { background: 'rgba(255,78,106,0.15)', borderColor: '#FF4E6A', color: '#FF4E6A' }
                    }
                  >
                    {lastAction === 'like' ? '❤ Applied!' : '✕ Skipped'}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-6 mt-8">
                <button
                  onClick={() => handleButton('left')}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white transition active:scale-95 hover:opacity-90"
                  style={{ background: 'rgba(255,78,106,0.12)', border: '1px solid rgba(255,78,106,0.25)', color: '#FF4E6A' }}
                >
                  <IconX /> Pass
                </button>
                <button
                  onClick={() => handleButton('right')}
                  className="flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-semibold text-white transition active:scale-95 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #16a34a)', boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}
                >
                  <IconHeart /> Apply
                </button>
              </div>

              {/* Keyboard hint */}
              <p className="mt-4 text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                ← Pass &nbsp;·&nbsp; Apply →
              </p>
            </>
          )}
        </div>
      </main>

      {/* ── Right: Detail Panel ── */}
      <aside
        className="flex-shrink-0 flex flex-col"
        style={{
          width: '300px',
          background: '#0d0d1a',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Panel header */}
        <div
          className="flex-shrink-0 px-5 py-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <p className="text-white text-sm font-semibold">Job Details</p>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {currentJob ? `${index + 1} of ${TOTAL}` : 'All done'}
          </p>
        </div>

        {currentJob ? (
          <DetailPanel
            key={currentJob.id}
            job={currentJob}
            onApply={() => handleButton('right')}
            onSkip={() => handleButton('left')}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-center px-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
              No more jobs to review
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}