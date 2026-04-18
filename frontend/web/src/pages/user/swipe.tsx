import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';

// ─── Job data ─────────────────────────────────────────────────────────────────
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
    images: [
      '/assets/images/accenture2.jpg',
      '/assets/images/accenture3.jpg',
      '/assets/images/accenture.jpg',
    ],
    description:
      "Join Accenture's digital engineering team to build scalable web applications used by Fortune 500 clients. You'll work across the full stack delivering high-impact features with a cross-functional team.",
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
    images: [
      '/assets/images/alorica.jpg',
      '/assets/images/alorica3.jpg',
      '/assets/images/alorica2.jpg',
    ],
    description:
      "Lead customer relationships for a portfolio of enterprise SaaS clients. You'll drive adoption, reduce churn, and act as the voice of the customer internally.",
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
    images: [
      '/assets/images/socia.png',
      '/assets/images/socia2.jpg',
      '/assets/images/socia3.jpg',
    ],
    description:
      "Shape the end-to-end design of Socia's consumer mobile app. From discovery research to polished high-fidelity prototypes, you'll own the design process.",
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
    images: [
      '/assets/images/accenture3.jpg',
      '/assets/images/accenture2.jpg',
      '/assets/images/accenture.jpg',
    ],
    description:
      "Design and implement cloud infrastructure solutions for enterprise clients. You'll lead architecture reviews, define best practices, and guide engineering teams through cloud migrations.",
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
    images: [
      '/assets/images/socia3.jpg',
      '/assets/images/socia2.jpg',
    ],
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

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconHeart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const IconNext = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconPrev = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconVerified = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="#4F9DFF">
    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
  </svg>
);
const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
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
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
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
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconStar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconChevronLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconChevronRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconLogOut = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────
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
  images: string[];
  description: string;
  requirements: string[];
  benefits: string[];
}

// ─── Swipe Card ───────────────────────────────────────────────────────────────
function SwipeCard({
  job, isTop, onSwipe, zIndex, scale, stackIdx,
}: {
  job: Job; isTop: boolean; onSwipe: (dir: 'left' | 'right') => void;
  zIndex: number; scale: number; stackIdx: number;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [dragRotate, setDragRotate] = useState(0);
  const [hint, setHint] = useState<'like' | 'nope' | null>(null);
  const [flyOut, setFlyOut] = useState<'left' | 'right' | null>(null);

  const images = job.images.slice(0, 6);
  const numImgs = images.length;

  const overlayOpacity = Math.min(Math.abs(dragX) / 80, 1) * 0.55;
  const overlayColor =
    dragX > 0
      ? `rgba(34, 197, 94, ${overlayOpacity})`
      : dragX < 0
      ? `rgba(239, 68, 68, ${overlayOpacity})`
      : 'transparent';

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
    setDragRotate(dx * 0.025);
    setHint(dx > 60 ? 'like' : dx < -60 ? 'nope' : null);
  };
  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dx = currentX.current;
    if (Math.abs(dx) > 110) triggerSwipe(dx > 0 ? 'right' : 'left');
    else { setDragX(0); setDragRotate(0); setHint(null); }
  };

  const flyStyle: React.CSSProperties = flyOut ? {
    transform: `translateX(${flyOut === 'right' ? 150 : -150}%) rotate(${flyOut === 'right' ? 18 : -18}deg)`,
    opacity: 0,
    transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s',
  } : {};

  const dragStyle: React.CSSProperties = isTop && !flyOut ? {
    transform: `translateX(${dragX}px) rotate(${dragRotate}deg)`,
    transition: isDragging.current ? 'none' : 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
  } : isTop ? {} : {
    transition: 'top 0.35s cubic-bezier(0.4,0,0.2,1), left 0.35s, right 0.35s, bottom 0.35s',
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIdx((i) => Math.min(i + 1, numImgs - 1));
  };
  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIdx((i) => Math.max(i - 1, 0));
  };

  return (
    <div
      className="absolute select-none"
      style={{
        top: isTop ? 0 : `${stackIdx * 2}%`,
        left: isTop ? 0 : `${stackIdx * 2}%`,
        right: isTop ? 0 : `${stackIdx * 2}%`,
        bottom: isTop ? 0 : `${stackIdx * 2}%`,
        zIndex,
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: isTop ? 'grab' : 'default',
        ...dragStyle,
        ...flyStyle,
        boxShadow: isTop ? '0 24px 64px rgba(0,0,0,0.55)' : '0 12px 32px rgba(0,0,0,0.3)',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${job.company} ${i + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: i === imgIdx ? 1 : 0, transition: 'opacity 0.3s ease', zIndex: 0 }}
        />
      ))}

      {isTop && (
        <div
          className="absolute inset-0"
          style={{
            background: 'transparent',
            transition: isDragging.current ? 'none' : 'background 0.25s ease',
            zIndex: 2,
            pointerEvents: 'none',
            borderRadius: 'inherit',
          }}
        />
      )}

      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.0) 40%, rgba(5,5,18,0.75) 65%, rgba(5,5,18,0.98) 100%)',
        zIndex: 3,
      }} />

      {isTop && numImgs > 1 && (
        <div
          className="absolute top-3 left-3 right-3 flex gap-1.5"
          style={{ zIndex: 10 }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {images.map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-full overflow-hidden"
              style={{ height: '3px', background: 'rgba(255,255,255,0.25)', cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
            >
              <div style={{
                height: '100%',
                width: i <= imgIdx ? '100%' : '0%',
                background: i <= imgIdx ? 'white' : 'transparent',
                transition: 'width 0.3s',
                borderRadius: '999px',
              }} />
            </div>
          ))}
        </div>
      )}

      {isTop && numImgs > 1 && (
        <>
          <div className="absolute top-0 bottom-0 left-0" style={{ width: '35%', zIndex: 5, cursor: imgIdx > 0 ? 'w-resize' : 'default' }} onPointerDown={(e) => e.stopPropagation()} onClick={goPrev} />
          <div className="absolute top-0 bottom-0 right-0" style={{ width: '35%', zIndex: 5, cursor: imgIdx < numImgs - 1 ? 'e-resize' : 'default' }} onPointerDown={(e) => e.stopPropagation()} onClick={goNext} />
        </>
      )}

      {isTop && numImgs > 1 && (
        <>
          {imgIdx > 0 && (
            <button className="absolute flex items-center justify-center" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.18)', color: 'white', cursor: 'pointer', backdropFilter: 'blur(6px)' }} onPointerDown={(e) => e.stopPropagation()} onClick={goPrev}><IconPrev /></button>
          )}
          {imgIdx < numImgs - 1 && (
            <button className="absolute flex items-center justify-center" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.18)', color: 'white', cursor: 'pointer', backdropFilter: 'blur(6px)' }} onPointerDown={(e) => e.stopPropagation()} onClick={goNext}><IconNext /></button>
          )}
        </>
      )}

      {isTop && numImgs > 1 && (
        <div className="absolute" style={{ top: '14px', right: '14px', zIndex: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '3px 9px', color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: 600 }}>
          {imgIdx + 1} / {numImgs}
        </div>
      )}

      {hint === 'like' && (
        <div className="absolute z-20" style={{ top: '28px', left: '20px', border: '2.5px solid #22C55E', color: '#22C55E', fontSize: '18px', fontWeight: 900, padding: '4px 14px', borderRadius: '10px', transform: 'rotate(-12deg)', letterSpacing: '0.12em', opacity: 0.95 }}>APPLY</div>
      )}
      {hint === 'nope' && (
        <div className="absolute z-20" style={{ top: '28px', right: '20px', border: '2.5px solid #FF4E6A', color: '#FF4E6A', fontSize: '18px', fontWeight: 900, padding: '4px 14px', borderRadius: '10px', transform: 'rotate(12deg)', letterSpacing: '0.12em', opacity: 0.95 }}>SKIP</div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-10" style={{ padding: '20px 20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ color: 'white', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em' }}>{job.company}</span>
          {job.verified && <IconVerified />}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}><IconMapPin /> {job.distance}</p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginBottom: '10px' }}>{job.type}</p>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', marginBottom: '2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Looking for</p>
        <p style={{ color: 'white', fontSize: '18px', fontWeight: 600, marginBottom: '10px', lineHeight: 1.2 }}>{job.role}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {job.tags.map((t) => (
            <span key={t} style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 500, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.8)' }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function DetailPanel({ job, onApply, onSkip }: { job: Job; onApply: () => void; onSkip: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', scrollbarWidth: 'none' }}>
      <div style={{ padding: '20px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
            <img src={job.logo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '16px', lineHeight: 1.2 }}>{job.company}</span>
              {job.verified && <IconVerified />}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.3 }}>{job.role}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {[{ icon: <IconDollar />, text: job.salary }, { icon: <IconClock />, text: job.type }, { icon: <IconMapPin />, text: job.distance }].map(({ icon, text }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>{icon}<span>{text}</span></div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onApply} style={{ flex: 1, padding: '11px 0', borderRadius: '14px', fontSize: '13px', fontWeight: 700, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #22C55E, #16a34a)', boxShadow: '0 4px 18px rgba(34,197,94,0.28)' }}>Apply Now</button>
          <button onClick={onSkip} style={{ width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><IconX /></button>
        </div>
      </div>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>About the Role</p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.65 }}>{job.description}</p>
      </div>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Requirements</p>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', margin: 0, padding: 0 }}>
          {job.requirements.map((req, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ marginTop: '2px', width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(34,197,94,0.14)', color: '#22C55E' }}><IconCheck /></span>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', lineHeight: 1.5 }}>{req}</span>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Skills</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {job.tags.map((t) => (
            <span key={t} style={{ padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, background: 'rgba(255,78,106,0.08)', border: '1px solid rgba(255,78,106,0.2)', color: '#FF7A8A' }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: '18px 22px', flexShrink: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Benefits</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {job.benefits.map((b) => (
            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }}>
              <span style={{ color: '#FFB347', flexShrink: 0 }}><IconStar /></span>{b}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const navItems = [
  { id: 'home', label: 'Home', Icon: IconHome },
  { id: 'explore', label: 'Explore', Icon: IconCompass },
  { id: 'applications', label: 'Applications', Icon: IconBriefcase },
  { id: 'messages', label: 'Messages', Icon: IconChat },
  { id: 'profile', label: 'Profile', Icon: IconUser },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SwipeHomePage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [swipedCount, setSwipedCount] = useState(0);
  const [lastAction, setLastAction] = useState<'like' | 'nope' | null>(null);
  const [activeNav, setActiveNav] = useState('home');
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

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

  const handleLogout = () => {
    // Add your logout logic here, e.g. clear session/token then redirect
    router.push('/login');
  };

  const visibleJobs = jobs.slice(index, index + 3);

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: '#08080f', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>

      {/* ─── Left Sidebar ──────────────────────────────────────────────────── */}
      <aside style={{
        width: leftOpen ? '220px' : '64px',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        flexShrink: 0, background: '#0d0d1a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        position: 'relative', zIndex: 20,
      }}>
        {/* Logo row */}
        <div style={{ padding: '0 16px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          {leftOpen && (
            <span style={{ color: 'white', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Job<span style={{ color: '#FF4E6A' }}>Swipe</span>
            </span>
          )}
          <button onClick={() => setLeftOpen((v) => !v)} style={{ width: '30px', height: '30px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', marginLeft: 'auto' }}>
            {leftOpen ? <IconChevronLeft /> : <IconChevronRight />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, padding: '0 8px' }}>
          {navItems.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => { if (id === 'messages') router.push('/user/messages'); else setActiveNav(id); }} title={!leftOpen ? label : undefined} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px', padding: leftOpen ? '9px 12px' : '9px', justifyContent: leftOpen ? 'flex-start' : 'center', color: activeNav === id ? '#FF4E6A' : 'rgba(255,255,255,0.4)', background: activeNav === id ? 'rgba(255,78,106,0.08)' : 'transparent', border: 'none', cursor: 'pointer', minHeight: '40px', fontSize: '13px', fontWeight: 500, position: 'relative' }}>
              <span style={{ flexShrink: 0 }}><Icon /></span>
              {leftOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
              {leftOpen && id === 'messages' && (
                <span style={{ marginLeft: 'auto', background: '#FF4E6A', color: 'white', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '999px' }}>3</span>
              )}
            </button>
          ))}
        </nav>

        {/* Swipe counter */}
        {leftOpen && (
          <div style={{ margin: '12px 12px 0', padding: '12px', borderRadius: '14px', background: 'rgba(255,78,106,0.06)', border: '1px solid rgba(255,78,106,0.14)' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>Daily swipes</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{swipedCount} used</span>
              <span style={{ color: '#FF4E6A', fontWeight: 600, fontSize: '13px' }}>{swipesLeft} left</span>
            </div>
            <div style={{ height: '3px', borderRadius: '999px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '999px', width: `${(swipedCount / 15) * 100}%`, background: 'linear-gradient(90deg, #FF4E6A, #FF7854)', transition: 'width 0.5s' }} />
            </div>
          </div>
        )}

        {/* ─── User + Logout ───────────────────────────────────────────────── */}
        <div style={{
          margin: '8px 8px 16px',
          padding: leftOpen ? '10px 10px 10px 12px' : '8px',
          borderRadius: '14px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          justifyContent: leftOpen ? 'flex-start' : 'center',
        }}>
          {/* Avatar */}
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.07)' }}>
            <img src="/assets/images/img1.jpg" alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Name + email */}
          {leftOpen && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'white', fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>John Doe</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>user@jobswipe.com</p>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            title="Log out"
            style={{
              flexShrink: 0,
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              transition: 'background 0.18s, color 0.18s, border-color 0.18s',
            }}
            onMouseEnter={e => {
              const btn = e.currentTarget;
              btn.style.background = 'rgba(255,78,106,0.1)';
              btn.style.color = '#FF4E6A';
              btn.style.borderColor = 'rgba(255,78,106,0.3)';
            }}
            onMouseLeave={e => {
              const btn = e.currentTarget;
              btn.style.background = 'transparent';
              btn.style.color = 'rgba(255,255,255,0.3)';
              btn.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            <IconLogOut />
          </button>
        </div>
      </aside>

      {/* ─── Center ────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h1 style={{ color: 'white', fontWeight: 700, fontSize: '17px', margin: 0 }}>Discover Jobs</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>{remaining} jobs remaining</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{ padding: '7px 16px', borderRadius: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer' }}>Filters</button>
            <button style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </button>
          </div>
        </div>

        {/* Swipe area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 24px' }}>
          {remaining === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>✨</div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '20px', margin: 0 }}>You're all caught up!</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0 }}>Check back later for new opportunities</p>
              <button onClick={() => { setIndex(0); setSwipedCount(0); }} style={{ marginTop: '8px', padding: '10px 24px', borderRadius: '999px', fontWeight: 600, fontSize: '13px', color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #FF4E6A, #FF7854)' }}>Refresh Jobs</button>
            </div>
          ) : (
            <>
              {/* Progress dots */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                {jobs.map((_, i) => (
                  <div key={i} style={{ borderRadius: '999px', height: '5px', width: i === index ? '20px' : '5px', background: i <= index ? '#FF4E6A' : 'rgba(255,255,255,0.1)', transition: 'all 0.4s' }} />
                ))}
              </div>

              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '520px',
                height: 'calc(100vh - 64px - 16px - 29px - 16px - 52px - 28px - 32px)',
                minHeight: '420px',
                maxHeight: '680px',
              }}>
                {visibleJobs.map((job, stackIdx) => {
                  const isTop = stackIdx === 0;
                  const scale = 1 - stackIdx * 0.038;
                  return (
                    <SwipeCard
                      key={job.id}
                      job={job}
                      isTop={isTop}
                      onSwipe={handleSwipe}
                      zIndex={3 - stackIdx}
                      scale={scale}
                      stackIdx={stackIdx}
                    />
                  );
                })}

                {/* Toast */}
                <div style={{ position: 'absolute', top: '16px', left: '50%', zIndex: 20, transform: `translateX(-50%) translateY(${lastAction ? '0px' : '-12px'})`, opacity: lastAction ? 1 : 0, transition: 'all 0.3s', pointerEvents: 'none' }}>
                  <div style={{ padding: '5px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, ...(lastAction === 'like' ? { background: 'rgba(34,197,94,0.14)', border: '1px solid #22C55E', color: '#22C55E' } : { background: 'rgba(255,78,106,0.14)', border: '1px solid #FF4E6A', color: '#FF4E6A' }) }}>
                    {lastAction === 'like' ? '❤ Applied!' : '✕ Skipped'}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '20px' }}>
                <button onClick={() => handleButton('left')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 24px', borderRadius: '16px', fontSize: '14px', fontWeight: 600, color: '#FF4E6A', cursor: 'pointer', background: 'rgba(255,78,106,0.1)', border: '1px solid rgba(255,78,106,0.22)' }}><IconX /> Pass</button>
                <button onClick={() => handleButton('right')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 28px', borderRadius: '16px', fontSize: '14px', fontWeight: 700, color: 'white', cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #22C55E, #16a34a)', boxShadow: '0 4px 20px rgba(34,197,94,0.28)' }}><IconHeart /> Apply</button>
              </div>

              <p style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.18)' }}>← Pass &nbsp;·&nbsp; Apply →</p>
            </>
          )}
        </div>
      </main>

      {/* ─── Right Detail Panel ────────────────────────────────────────────── */}
      <aside style={{
        width: rightOpen ? '360px' : '48px',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        flexShrink: 0, background: '#0d0d1a',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        position: 'relative', zIndex: 20,
      }}>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: rightOpen ? '0 20px' : '0 8px', justifyContent: rightOpen ? 'space-between' : 'center', height: '64px' }}>
          {rightOpen && (
            <div>
              <p style={{ color: 'white', fontSize: '14px', fontWeight: 700, margin: 0 }}>Job Details</p>
              <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '11px', margin: 0 }}>{currentJob ? `${index + 1} of ${TOTAL}` : 'All done'}</p>
            </div>
          )}
          <button onClick={() => setRightOpen((v) => !v)} style={{ width: '30px', height: '30px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>
            {rightOpen ? <IconChevronRight /> : <IconChevronLeft />}
          </button>
        </div>

        {!rightOpen && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Details</p>
          </div>
        )}

        {rightOpen && (
          currentJob ? (
            <DetailPanel key={currentJob.id} job={currentJob} onApply={() => handleButton('right')} onSkip={() => handleButton('left')} />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', textAlign: 'center', padding: '0 24px' }}>No more jobs to review</p>
            </div>
          )
        )}
      </aside>
    </div>
  );
}   