'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import PhotoCard from '../../components/ui/Photocard';
import LeftSidebar from '../../components/ui/LeftSidebar';
import { USER_NAV, USER_NAV_ROUTES } from '../../lib/nav';

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconVerified = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="#4F9DFF">
    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
  </svg>
);

const IconMapPin = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const IconPencil = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconPlus = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconCode = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconBriefcase = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);

const IconGraduationCap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const IconHome = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);

const IconMonitor = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const IconDollarSign = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IconImage = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const IconCamera = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const IconX = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  icon: React.ReactNode;
  color: string;
}

interface EducationItem {
  degree: string;
  school: string;
  period: string;
  icon: React.ReactNode;
  color: string;
}

interface ProfileData {
  name: string;
  verified: boolean;
  role: string;
  location: string;
  about: string;
  stats: { value: string; label: string }[];
  hardSkills: string[];
  softSkills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  preferences: { icon: React.ReactNode; label: string }[];
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.93)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '18px',
          right: '18px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          zIndex: 1000,
        }}
      >
        <IconX />
      </button>

      <img
        src={src}
        alt="Full size"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '92vw',
          maxHeight: '88vh',
          borderRadius: '18px',
          objectFit: 'contain',
          boxShadow: '0 12px 80px rgba(0,0,0,0.7)',
          display: 'block',
        }}
      />
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      color: 'rgba(255,255,255,0.28)',
      fontSize: '10px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      margin: '0 0 12px 0',
      ...style,
    }}>
      {children}
    </p>
  );
}

function SkillTag({ label, variant, editMode, onRemove }: {
  label: string; variant: 'hard' | 'soft'; editMode?: boolean; onRemove?: () => void;
}) {
  const styles = variant === 'hard'
    ? { background: 'rgba(124,111,255,0.1)', border: '1px solid rgba(124,111,255,0.25)', color: '#A78BFF' }
    : { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)', color: '#4ADE80' };
  return (
    <span style={{ padding: '5px 10px 5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', ...styles }}>
      {label}
      {editMode && onRemove && (
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', color: 'inherit', opacity: 0.7 }}>
          <IconX />
        </button>
      )}
    </span>
  );
}

function SkillSubHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color, fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
      {icon}{label}
    </div>
  );
}

function TimelineItem({ icon, color, title, subtitle, editMode, onRemove }: {
  icon: React.ReactNode; color: string; title: string; subtitle: string; editMode?: boolean; onRemove?: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: 'white', fontWeight: 600, fontSize: '14px', margin: '0 0 2px 0' }}>{title}</p>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', margin: 0 }}>{subtitle}</p>
      </div>
      {editMode && onRemove && (
        <button onClick={onRemove} style={{ background: 'rgba(255,78,106,0.1)', border: '1px solid rgba(255,78,106,0.2)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#FF4E6A', display: 'flex', alignItems: 'center' }}>
          <IconTrash />
        </button>
      )}
    </div>
  );
}

function StatCell({ value, label, last }: { value: string; label: string; last?: boolean }) {
  return (
    <div style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderRight: last ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
      <p style={{ color: 'white', fontWeight: 700, fontSize: '18px', margin: '0 0 3px 0' }}>{value}</p>
      <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '10px', fontWeight: 500, margin: 0 }}>{label}</p>
    </div>
  );
}

function AddItemRow({ fields, onAdd, onCancel, accentColor }: {
  fields: { key: string; placeholder: string }[]; onAdd: (vals: Record<string, string>) => void; onCancel: () => void; accentColor: string;
}) {
  const [vals, setVals] = useState<Record<string, string>>(Object.fromEntries(fields.map(f => [f.key, ''])));
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${accentColor}30`, borderRadius: '14px', padding: '14px', marginBottom: '12px' }}>
      {fields.map(f => (
        <input key={f.key} value={vals[f.key]} onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.placeholder}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", padding: '7px 10px', width: '100%', boxSizing: 'border-box', outline: 'none', marginBottom: '8px' }} />
      ))}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => onAdd(vals)} style={{ flex: 1, padding: '8px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: accentColor, background: `${accentColor}18`, border: `1px solid ${accentColor}35`, cursor: 'pointer' }}>Add</button>
        <button onClick={onCancel} style={{ flex: 1, padding: '8px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Initial Data ─────────────────────────────────────────────────────────────

const initialData: ProfileData = {
  name: 'John Doe',
  verified: true,
  role: 'Full Stack Developer',
  location: 'San Francisco, CA',
  about: 'Passionate developer with expertise in building modern web applications. Strong background in React, Node.js, and cloud technologies.',
  stats: [
    { value: '12', label: 'Applied' },
    { value: '4', label: 'Pending Messages' },
    { value: '1', label: 'Closed Messages' },
  ],
  hardSkills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'GraphQL', 'Figma'],
  softSkills: ['Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Adaptability'],
  experience: [
    { title: 'Senior Developer', company: 'Tech Company', period: '2021 – Present', icon: <IconCode />, color: '#7C6FFF' },
    { title: 'Full Stack Developer', company: 'Startup Inc', period: '2019 – 2021', icon: <IconMonitor />, color: '#22C55E' },
  ],
  education: [
    { degree: 'BS Computer Science', school: 'University of California', period: '2015 – 2019', icon: <IconGraduationCap />, color: '#4F9DFF' },
  ],
  preferences: [
    { icon: <IconHome />, label: 'Remote' },
    { icon: <IconBriefcase />, label: 'Full-time' },
    { icon: <IconDollarSign />, label: '$120k+' },
  ],
};

// ─── CropModal ────────────────────────────────────────────────────────────────

function CropModal({ src, onConfirm, onCancel }: { src: string; onConfirm: (url: string) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ offsetX: 0, offsetY: 0, scale: 1 });
  const [scale, setScaleState] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const imgEl = useRef<HTMLImageElement | null>(null);
  const SIZE = 260;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgEl.current;
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { offsetX, offsetY, scale: s } = stateRef.current;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.drawImage(img, offsetX, offsetY, img.naturalWidth * s, img.naturalHeight * s);
  }, []);

  function setScale(s: number) {
    stateRef.current.scale = s;
    setScaleState(s);
    draw();
  }

  function setOffset(x: number, y: number) {
    stateRef.current.offsetX = x;
    stateRef.current.offsetY = y;
    draw();
  }

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgEl.current = img;
      const s = Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight);
      stateRef.current = {
        scale: s,
        offsetX: (SIZE - img.naturalWidth * s) / 2,
        offsetY: (SIZE - img.naturalHeight * s) / 2,
      };
      setScaleState(s);
      draw();
    };
    img.src = src;
  }, [src, draw]);

  useEffect(() => { draw(); }, [scale, draw]);

  function onMouseDown(e: React.MouseEvent) {
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: stateRef.current.offsetX, oy: stateRef.current.offsetY };
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    setOffset(dragStart.current.ox + e.clientX - dragStart.current.mx, dragStart.current.oy + e.clientY - dragStart.current.my);
  }
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { mx: t.clientX, my: t.clientY, ox: stateRef.current.offsetX, oy: stateRef.current.offsetY };
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset(dragStart.current.ox + t.clientX - dragStart.current.mx, dragStart.current.oy + t.clientY - dragStart.current.my);
  }

  function confirm() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onConfirm(canvas.toDataURL('image/png'));
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>Drag to reposition · Scroll or slider to zoom</p>

      <div style={{ position: 'relative', width: SIZE, height: SIZE, borderRadius: '50%', overflow: 'hidden', border: '3px solid #4F3BFF', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}>
        <canvas
          ref={canvasRef} width={SIZE} height={SIZE}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove}
          onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={() => setDragging(false)}
          onWheel={e => { e.preventDefault(); const next = Math.max(0.3, Math.min(4, stateRef.current.scale + (e.deltaY < 0 ? 0.05 : -0.05))); setScale(next); }}
          style={{ display: 'block' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>−</span>
        <input type="range" min={0.3} max={4} step={0.01} value={scale}
          onChange={e => setScale(Number(e.target.value))}
          style={{ width: '140px', accentColor: '#4F3BFF' }} />
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>+</span>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onCancel} style={{ padding: '9px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>Cancel</button>
        <button onClick={confirm} style={{ padding: '9px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: 'white', background: '#4F3BFF', border: 'none', cursor: 'pointer' }}>Apply</button>
      </div>
    </div>
  );
}

// ─── BannerCropModal ──────────────────────────────────────────────────────────

const PREV_W = 340;
const PREV_H = 120;
const EXPORT_W = 1200;
const EXPORT_H = 400;
const SCALE_RATIO = EXPORT_W / PREV_W;

function BannerCropModal({ src, onConfirm, onCancel }: { src: string; onConfirm: (url: string) => void; onCancel: () => void }) {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ offsetX: 0, offsetY: 0, scale: 1 });
  const [scale, setScaleState] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const imgEl = useRef<HTMLImageElement | null>(null);

  const draw = useCallback(() => {
    const canvas = previewRef.current;
    const img = imgEl.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { offsetX, offsetY, scale: s } = stateRef.current;
    ctx.clearRect(0, 0, PREV_W, PREV_H);
    ctx.drawImage(img, offsetX, offsetY, img.naturalWidth * s, img.naturalHeight * s);
  }, []);

  function setScale(s: number) {
    stateRef.current.scale = s;
    setScaleState(s);
    draw();
  }

  function setOffset(x: number, y: number) {
    stateRef.current.offsetX = x;
    stateRef.current.offsetY = y;
    draw();
  }

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgEl.current = img;
      const s = Math.max(PREV_W / img.naturalWidth, PREV_H / img.naturalHeight);
      stateRef.current = {
        scale: s,
        offsetX: (PREV_W - img.naturalWidth * s) / 2,
        offsetY: (PREV_H - img.naturalHeight * s) / 2,
      };
      setScaleState(s);
      draw();
    };
    img.src = src;
  }, [src, draw]);

  useEffect(() => { draw(); }, [scale, draw]);

  function onMouseDown(e: React.MouseEvent) {
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: stateRef.current.offsetX, oy: stateRef.current.offsetY };
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    setOffset(dragStart.current.ox + e.clientX - dragStart.current.mx, dragStart.current.oy + e.clientY - dragStart.current.my);
  }
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { mx: t.clientX, my: t.clientY, ox: stateRef.current.offsetX, oy: stateRef.current.offsetY };
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset(dragStart.current.ox + t.clientX - dragStart.current.mx, dragStart.current.oy + t.clientY - dragStart.current.my);
  }

  function confirm() {
    const img = imgEl.current;
    if (!img) return;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = EXPORT_W;
    exportCanvas.height = EXPORT_H;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;
    const { offsetX, offsetY, scale: s } = stateRef.current;
    ctx.drawImage(
      img,
      offsetX * SCALE_RATIO,
      offsetY * SCALE_RATIO,
      img.naturalWidth * s * SCALE_RATIO,
      img.naturalHeight * s * SCALE_RATIO,
    );
    onConfirm(exportCanvas.toDataURL('image/png'));
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>Drag to reposition · Scroll or slider to zoom</p>

      <div style={{ position: 'relative', width: PREV_W, height: PREV_H, borderRadius: '10px', overflow: 'hidden', border: '2px solid #4F3BFF', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}>
        <canvas
          ref={previewRef} width={PREV_W} height={PREV_H}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove}
          onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={() => setDragging(false)}
          onWheel={e => { e.preventDefault(); const next = Math.max(0.3, Math.min(4, stateRef.current.scale + (e.deltaY < 0 ? 0.05 : -0.05))); setScale(next); }}
          style={{ display: 'block' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>−</span>
        <input type="range" min={0.3} max={4} step={0.01} value={scale}
          onChange={e => setScale(Number(e.target.value))}
          style={{ width: '140px', accentColor: '#4F3BFF' }} />
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>+</span>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onCancel} style={{ padding: '9px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>Cancel</button>
        <button onClick={confirm} style={{ padding: '9px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: 'white', background: '#4F3BFF', border: 'none', cursor: 'pointer' }}>Apply</button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('profile');
  const sidebarRef = useRef<HTMLElement>(null);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(initialData);
  const [bannerImg, setBannerImg] = useState<string | null>(null);
  const [avatarImg, setAvatarImg] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [bannerCropSrc, setBannerCropSrc] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [addingHard, setAddingHard] = useState(false);
  const [addingSoft, setAddingSoft] = useState(false);
  const [addingExp, setAddingExp] = useState(false);
  const [addingEdu, setAddingEdu] = useState(false);
  const [addingPref, setAddingPref] = useState(false);
  const [newPrefLabel, setNewPrefLabel] = useState('');

  const bannerRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const photoRefs = useRef<(HTMLInputElement | null)[]>([]);
  const addPhotoRef = useRef<HTMLInputElement | null>(null);

  function pickImage(callback: (url: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => { if (ev.target?.result) callback(ev.target.result as string); };
      reader.readAsDataURL(file);
      e.target.value = '';
    };
  }

  function update(field: keyof ProfileData, value: unknown) {
    setProfile(p => ({ ...p, [field]: value }));
  }

  const section: React.CSSProperties = { padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)' };
  const divider: React.CSSProperties = { borderTop: '1px solid rgba(255,255,255,0.06)', margin: 0 };

  const editBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 600,
    color: active ? '#22C55E' : 'rgba(124,111,255,0.8)',
    background: active ? 'rgba(34,197,94,0.08)' : 'rgba(124,111,255,0.08)',
    border: active ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(124,111,255,0.2)',
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '10px',
  });

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#08080f', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <LeftSidebar
        sidebarRef={sidebarRef}
        leftOpen={leftOpen}
        setLeftOpen={setLeftOpen}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        swipedCount={0}
        swipesLeft={15}
        navItems={USER_NAV}
        navRoutes={USER_NAV_ROUTES}
        accentColor="#FF4E6A"
        counterLabel="Daily swipes"
        counterLimit={15}
        profileName="John Doe"
        profileEmail="user@jobswipe.com"
        profileImage="/assets/images/img1.jpg"
        avatarRadius="50%"
      />
    <div style={{ flex: 1, overflowY: 'auto', background: '#08080f', scrollbarWidth: 'none' }}>

      {/* ── Crop Modal ── */}
      {cropSrc && (
        <CropModal
          src={cropSrc}
          onConfirm={url => { setAvatarImg(url); setCropSrc(null); }}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* ── Banner Crop Modal ── */}
      {bannerCropSrc && (
        <BannerCropModal
          src={bannerCropSrc}
          onConfirm={url => { setBannerImg(url); setBannerCropSrc(null); }}
          onCancel={() => setBannerCropSrc(null)}
        />
      )}

      {/* ── Lightbox ── */}
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      {/* ── Banner ── */}
      <div
        onClick={() => editMode && bannerRef.current?.click()}
        style={{
          height: '200px',
          background: bannerImg ? 'transparent' : 'linear-gradient(135deg, #1a1030 0%, #0d0d20 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.12)', cursor: editMode ? 'pointer' : 'default',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {bannerImg
          ? <img src={bannerImg} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }} />
          : <IconImage />
        }
        {editMode && (
          <div style={{ position: 'absolute', bottom: '8px', right: '10px', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '5px 10px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IconCamera /> {bannerImg ? 'Change banner' : 'Upload banner'}
          </div>
        )}
        <input ref={bannerRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => { if (ev.target?.result) setBannerCropSrc(ev.target.result as string); };
            reader.readAsDataURL(file);
            e.target.value = '';
          }} />
      </div>

      {/* ── Avatar + Edit button ── */}
      <div style={{ padding: '0 28px', marginTop: '-52px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div
          onClick={() => editMode && avatarRef.current?.click()}
          style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: avatarImg ? 'transparent' : '#4F3BFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', fontWeight: 700, color: 'white', border: '4px solid #08080f',
            flexShrink: 0, letterSpacing: '-0.02em', cursor: editMode ? 'pointer' : 'default',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {avatarImg
            ? <img src={avatarImg} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : profile.name.split(' ').map(w => w[0]).join('').slice(0, 2)
          }
          {editMode && (
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', borderRadius: '50%', background: '#4F3BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #08080f' }}>
              <IconCamera />
            </div>
          )}
        </div>
        <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => { if (ev.target?.result) setCropSrc(ev.target.result as string); };
            reader.readAsDataURL(file);
            e.target.value = '';
          }} />

        <button
          onClick={() => setEditMode(e => !e)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: editMode ? '#22C55E' : '#A78BFF', background: editMode ? 'rgba(34,197,94,0.1)' : 'rgba(124,111,255,0.1)', border: editMode ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(124,111,255,0.25)', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          {editMode ? <IconCheck /> : <IconPencil />}
          {editMode ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* ── Name Block ── */}
      <div style={{ ...section, paddingTop: 0 }}>
        {editMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { value: profile.name, field: 'name' as const, placeholder: 'Full name', style: { color: 'white', fontSize: '18px', fontWeight: 700 } },
              { value: profile.role, field: 'role' as const, placeholder: 'Role / Title', style: { color: 'rgba(255,255,255,0.65)', fontSize: '13px', fontWeight: 400 } },
              { value: profile.location, field: 'location' as const, placeholder: 'Location', style: { color: 'rgba(255,255,255,0.55)', fontSize: '12px', fontWeight: 400 } },
            ].map(({ value, field, placeholder, style: s }) => (
              <input key={field} value={value} onChange={e => update(field, e.target.value)} placeholder={placeholder}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,111,255,0.35)', borderRadius: '10px', fontFamily: "'DM Sans', sans-serif", padding: '6px 10px', outline: 'none', width: '100%', boxSizing: 'border-box', ...s }} />
            ))}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ color: 'white', fontSize: '20px', fontWeight: 700 }}>{profile.name}</span>
              {profile.verified && <IconVerified />}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', margin: '0 0 6px 0' }}>{profile.role}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
              <IconMapPin />{profile.location}
            </div>
          </>
        )}
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'flex', margin: '16px 28px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        {profile.stats.map((s, i) => <StatCell key={i} value={s.value} label={s.label} last={i === profile.stats.length - 1} />)}
      </div>

      <hr style={divider} />

      {/* ── About ── */}
      <div style={section}>
        <SectionLabel>About</SectionLabel>
        {editMode ? (
          <textarea value={profile.about} onChange={e => update('about', e.target.value)} rows={4} placeholder="Write something about yourself..."
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,111,255,0.35)', borderRadius: '10px', color: 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", padding: '8px 12px', width: '100%', boxSizing: 'border-box', outline: 'none', resize: 'vertical' }} />
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>{profile.about}</p>
        )}
      </div>

      {/* ── Photos ── */}
      <div style={section}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <SectionLabel style={{ margin: 0 }}>Photos</SectionLabel>
          {editMode && (
            <>
              <button
                onClick={() => addPhotoRef.current?.click()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '5px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 600,
                  color: 'rgba(124,111,255,0.8)', background: 'rgba(124,111,255,0.08)',
                  border: '1px solid rgba(124,111,255,0.2)', cursor: 'pointer',
                }}
              >
                <IconPlus /> Add Photo
              </button>
              <input
                ref={addPhotoRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={pickImage(url => setPhotos(prev => [...prev, url]))}
              />
            </>
          )}
        </div>

        {!editMode && photos.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', margin: 0, fontStyle: 'italic' }}>
            No photos uploaded
          </p>
        )}

        {editMode && photos.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', margin: '0 0 4px 0', fontStyle: 'italic' }}>
            No photos yet — click "Add Photo" to upload one.
          </p>
        )}

        {photos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {photos.map((photo, i) => (
              <PhotoCard
                key={i}
                src={photo}
                editMode={editMode}
                onView={() => setLightboxSrc(photo)}
                onReplace={() => photoRefs.current[i]?.click()}
                onRemove={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                fileInputRef={el => { photoRefs.current[i] = el; }}
                onFileChange={pickImage(url => setPhotos(prev => { const n = [...prev]; n[i] = url; return n; }))}
              />
            ))}
          </div>
        )}

        {editMode && photos.length > 0 && (
          <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '11px', marginTop: '10px', marginBottom: 0 }}>
            Tap a photo to replace · Use ✕ to remove
          </p>
        )}
      </div>

      {/* ── Skills ── */}
      <div style={section}>
        <SectionLabel>Skills</SectionLabel>

        <SkillSubHeader icon={<IconCode />} label="Hard Skills" color="#A78BFF" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          {profile.hardSkills.map((s, i) => (
            <SkillTag key={s} label={s} variant="hard" editMode={editMode} onRemove={() => update('hardSkills', profile.hardSkills.filter((_, j) => j !== i))} />
          ))}
        </div>
        {editMode && !addingHard && <button style={editBtnStyle(false)} onClick={() => setAddingHard(true)}><IconPlus /> Add skill</button>}
        {editMode && addingHard && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input autoFocus placeholder="e.g. Docker"
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,111,255,0.35)', borderRadius: '8px', color: 'white', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", padding: '6px 10px', outline: 'none' }}
              onKeyDown={e => { if (e.key === 'Enter') { const v = (e.target as HTMLInputElement).value.trim(); if (v) update('hardSkills', [...profile.hardSkills, v]); setAddingHard(false); } if (e.key === 'Escape') setAddingHard(false); }} />
            <button style={{ ...editBtnStyle(true), marginTop: 0 }} onClick={() => setAddingHard(false)}>Done</button>
          </div>
        )}

        <div style={{ marginBottom: '20px' }} />

        <SkillSubHeader icon={<IconUsers />} label="Soft Skills" color="#4ADE80" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          {profile.softSkills.map((s, i) => (
            <SkillTag key={s} label={s} variant="soft" editMode={editMode} onRemove={() => update('softSkills', profile.softSkills.filter((_, j) => j !== i))} />
          ))}
        </div>
        {editMode && !addingSoft && <button style={editBtnStyle(false)} onClick={() => setAddingSoft(true)}><IconPlus /> Add skill</button>}
        {editMode && addingSoft && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input autoFocus placeholder="e.g. Mentorship"
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '8px', color: 'white', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", padding: '6px 10px', outline: 'none' }}
              onKeyDown={e => { if (e.key === 'Enter') { const v = (e.target as HTMLInputElement).value.trim(); if (v) update('softSkills', [...profile.softSkills, v]); setAddingSoft(false); } if (e.key === 'Escape') setAddingSoft(false); }} />
            <button style={{ ...editBtnStyle(true), marginTop: 0 }} onClick={() => setAddingSoft(false)}>Done</button>
          </div>
        )}
      </div>

      {/* ── Experience ── */}
      <div style={section}>
        <SectionLabel>Experience</SectionLabel>
        {profile.experience.map((e, i) => (
          <TimelineItem key={i} icon={e.icon} color={e.color} title={e.title} subtitle={`${e.company} · ${e.period}`} editMode={editMode} onRemove={() => update('experience', profile.experience.filter((_, j) => j !== i))} />
        ))}
        {editMode && !addingExp && <button style={editBtnStyle(false)} onClick={() => setAddingExp(true)}><IconPlus /> Add experience</button>}
        {editMode && addingExp && (
          <AddItemRow accentColor="#7C6FFF"
            fields={[{ key: 'title', placeholder: 'Job title (e.g. Senior Engineer)' }, { key: 'company', placeholder: 'Company name' }, { key: 'period', placeholder: 'Period (e.g. 2022 – Present)' }]}
            onAdd={vals => { if (vals.title) update('experience', [...profile.experience, { title: vals.title, company: vals.company, period: vals.period, icon: <IconBriefcase />, color: '#7C6FFF' }]); setAddingExp(false); }}
            onCancel={() => setAddingExp(false)} />
        )}
      </div>

      {/* ── Education ── */}
      <div style={section}>
        <SectionLabel>Education</SectionLabel>
        {profile.education.map((e, i) => (
          <TimelineItem key={i} icon={e.icon} color={e.color} title={e.degree} subtitle={`${e.school} · ${e.period}`} editMode={editMode} onRemove={() => update('education', profile.education.filter((_, j) => j !== i))} />
        ))}
        {editMode && !addingEdu && <button style={editBtnStyle(false)} onClick={() => setAddingEdu(true)}><IconPlus /> Add education</button>}
        {editMode && addingEdu && (
          <AddItemRow accentColor="#4F9DFF"
            fields={[{ key: 'degree', placeholder: 'Degree / Certificate' }, { key: 'school', placeholder: 'School / Institution' }, { key: 'period', placeholder: 'Period (e.g. 2015 – 2019)' }]}
            onAdd={vals => { if (vals.degree) update('education', [...profile.education, { degree: vals.degree, school: vals.school, period: vals.period, icon: <IconGraduationCap />, color: '#4F9DFF' }]); setAddingEdu(false); }}
            onCancel={() => setAddingEdu(false)} />
        )}
      </div>

      {/* ── Job Preferences ── */}
      <div style={section}>
        <SectionLabel>Job Preferences</SectionLabel>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {profile.preferences.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 12px 7px 16px', borderRadius: '999px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 500 }}>
              {p.icon}{p.label}
              {editMode && <button onClick={() => update('preferences', profile.preferences.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,78,106,0.7)', padding: '0', display: 'flex', alignItems: 'center', marginLeft: '2px' }}><IconX /></button>}
            </div>
          ))}
        </div>
        {editMode && !addingPref && <button style={editBtnStyle(false)} onClick={() => setAddingPref(true)}><IconPlus /> Add preference</button>}
        {editMode && addingPref && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <input autoFocus value={newPrefLabel} onChange={e => setNewPrefLabel(e.target.value)} placeholder="e.g. Hybrid, Contract, $150k+"
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", padding: '6px 10px', outline: 'none' }}
              onKeyDown={e => { if (e.key === 'Enter' && newPrefLabel.trim()) { update('preferences', [...profile.preferences, { icon: <IconBriefcase />, label: newPrefLabel.trim() }]); setNewPrefLabel(''); setAddingPref(false); } if (e.key === 'Escape') { setAddingPref(false); setNewPrefLabel(''); } }} />
            <button style={{ ...editBtnStyle(true), marginTop: 0 }} onClick={() => { if (newPrefLabel.trim()) update('preferences', [...profile.preferences, { icon: <IconBriefcase />, label: newPrefLabel.trim() }]); setNewPrefLabel(''); setAddingPref(false); }}>Add</button>
          </div>
        )}
      </div>

    </div>
    </div>
  );
}