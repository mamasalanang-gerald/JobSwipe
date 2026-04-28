'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Candidate } from '../../data/candidates';

interface CandidateCardProps {
  candidate: Candidate;
  isTop: boolean;
  onSwipe: (dir: 'left' | 'right') => void;
  zIndex: number;
  stackIdx: number;
}

function MatchRing({ score }: { score: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 90 ? '#22C55E' : score >= 75 ? '#FF4E6A' : '#FACC15';
  return (
    <svg width="48" height="48" style={{ flexShrink: 0 }}>
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
      <circle
        cx="24" cy="24" r={r} fill="none"
        stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
      <text x="24" y="28" textAnchor="middle" fill={color} fontSize="11" fontWeight="700">{score}%</text>
    </svg>
  );
}

export default function CandidateCard({ candidate, isTop, onSwipe, zIndex, stackIdx }: CandidateCardProps) {
  const [imgIdx, setImgIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [dragRotate, setDragRotate] = useState(0);
  const [hint, setHint] = useState<'invite' | 'skip' | null>(null);
  const [flyOut, setFlyOut] = useState<'left' | 'right' | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedProgressRef = useRef(0);
  const isPausedRef = useRef(false);
  const imgIdxRef = useRef(0);

  const DURATION = 3000;
  const images = candidate.images.slice(0, 4);
  const numImgs = images.length;

  // Auto-advance logic
  useEffect(() => {
    if (!isTop || numImgs <= 1) return;

    pausedProgressRef.current = 0;
    setProgress(0);
    startTimeRef.current = null;
    imgIdxRef.current = 0;
    setImgIdx(0);

    const tick = (timestamp: number) => {
      if (isPausedRef.current) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp - pausedProgressRef.current * DURATION;
      }
      const elapsed = timestamp - startTimeRef.current;
      const pct = Math.min(elapsed / DURATION, 1);
      setProgress(pct);

      if (pct < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        const next = imgIdxRef.current + 1 < numImgs ? imgIdxRef.current + 1 : 0;
        imgIdxRef.current = next;
        setImgIdx(next);
        pausedProgressRef.current = 0;
        startTimeRef.current = null;
        setProgress(0);
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isTop, numImgs]);

  // Pause while dragging
  useEffect(() => {
    isPausedRef.current = isDragging.current;
  });

  const triggerSwipe = (dir: 'left' | 'right') => {
    setFlyOut(dir);
    setTimeout(() => onSwipe(dir), 350);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isTop) return;
    isDragging.current = true;
    isPausedRef.current = true;
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startX.current;
    currentX.current = dx;
    setDragX(dx);
    setDragRotate(dx * 0.022);
    setHint(dx > 60 ? 'invite' : dx < -60 ? 'skip' : null);
  };

  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    isPausedRef.current = false;
    pausedProgressRef.current = progress;
    startTimeRef.current = null;
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
    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
  };

  const goNext = (e: React.MouseEvent) => { e.stopPropagation(); if (imgIdxRef.current < numImgs - 1) goTo(imgIdxRef.current + 1); };
  const goPrev = (e: React.MouseEvent) => { e.stopPropagation(); if (imgIdxRef.current > 0) goTo(imgIdxRef.current - 1); };

  const goTo = (i: number) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    pausedProgressRef.current = 0;
    startTimeRef.current = null;
    imgIdxRef.current = i;
    setProgress(0);
    setImgIdx(i);

    // Restart tick from new index
    const tick = (timestamp: number) => {
      if (isPausedRef.current) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const pct = Math.min(elapsed / DURATION, 1);
      setProgress(pct);

      if (pct < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        const next = imgIdxRef.current + 1 < numImgs ? imgIdxRef.current + 1 : 0;
        imgIdxRef.current = next;
        setImgIdx(next);
        pausedProgressRef.current = 0;
        startTimeRef.current = null;
        setProgress(0);
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
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
        borderRadius: '22px',
        overflow: 'hidden',
        cursor: isTop ? 'grab' : 'default',
        ...dragStyle,
        ...flyStyle,
        boxShadow: isTop
          ? '0 28px 72px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)'
          : '0 14px 36px rgba(0,0,0,0.35)',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Images */}
      {images.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt={candidate.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: i === imgIdx ? 1 : 0, transition: 'opacity 0.3s ease', zIndex: 0 }}
        />
      ))}

      {/* Drag color wash */}
      {isTop && (
        <div className="absolute inset-0" style={{
          background: dragX > 30
            ? `rgba(34,197,94,${Math.min(Math.abs(dragX) / 100, 0.5)})`
            : dragX < -30
            ? `rgba(255,78,106,${Math.min(Math.abs(dragX) / 100, 0.5)})`
            : 'transparent',
          transition: isDragging.current ? 'none' : 'background 0.2s',
          zIndex: 2,
          pointerEvents: 'none',
        }} />
      )}

      {/* Gradient */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 35%, rgba(5,5,20,0.7) 60%, rgba(5,5,20,0.97) 100%)',
        zIndex: 3,
      }} />

      {/* Image progress bars */}
      {isTop && numImgs > 1 && (
        <div className="absolute top-3 left-3 right-3 flex gap-1.5" style={{ zIndex: 10 }} onPointerDown={e => e.stopPropagation()}>
          {images.map((_, i) => (
            <div key={i} style={{ flex: 1, height: '3px', borderRadius: '999px', background: 'rgba(255,255,255,0.22)', overflow: 'hidden', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); goTo(i); }}>
              <div style={{ height: '100%', width: i < imgIdx
                  ? '100%'
                  : i === imgIdx
                  ? `${progress * 100}%`
                  : '0%', background: 'white', borderRadius: '999px', transition: i === imgIdx ? 'none' : 'width 0.3s' }} />
            </div>
          ))}
        </div>
      )}

      {/* Photo tap zones */}
      {isTop && numImgs > 1 && (
        <>
          <div className="absolute top-0 bottom-0 left-0" style={{ width: '35%', zIndex: 5 }} onPointerDown={e => e.stopPropagation()} onClick={goPrev} />
          <div className="absolute top-0 bottom-0 right-0" style={{ width: '35%', zIndex: 5 }} onPointerDown={e => e.stopPropagation()} onClick={goNext} />
        </>
      )}

      {/* Match score badge (top-right) */}
      {isTop && (
        <div className="absolute" style={{ top: '12px', right: '12px', zIndex: 10 }} onPointerDown={e => e.stopPropagation()}>
          <MatchRing score={candidate.matchScore} />
        </div>
      )}

      {/* Verified badge */}
      {candidate.verified && isTop && (
        <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 10, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '999px', padding: '3px 9px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#22C55E"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="0" /></svg>
          <span style={{ fontSize: '10px', color: '#22C55E', fontWeight: 700 }}>Verified</span>
        </div>
      )}

      {/* Swipe hints */}
      {hint === 'invite' && (
        <div className="absolute z-20" style={{ top: '26px', left: '18px', border: '2.5px solid #22C55E', color: '#22C55E', fontSize: '17px', fontWeight: 900, padding: '4px 14px', borderRadius: '10px', transform: 'rotate(-12deg)', letterSpacing: '0.1em' }}>
          INVITE
        </div>
      )}
      {hint === 'skip' && (
        <div className="absolute z-20" style={{ top: '26px', right: '18px', border: '2.5px solid #FF4E6A', color: '#FF4E6A', fontSize: '17px', fontWeight: 900, padding: '4px 14px', borderRadius: '10px', transform: 'rotate(12deg)', letterSpacing: '0.1em' }}>
          PASS
        </div>
      )}

      {/* Card info */}
      <div className="absolute bottom-0 left-0 right-0" style={{ padding: '20px 20px 22px', zIndex: 10 }}>
        {/* Name + availability */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
          <span style={{ color: 'white', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em' }}>{candidate.name}</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', marginBottom: '2px' }}>📍 {candidate.distance}</p>
        <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '11px', marginBottom: '10px' }}>{candidate.availability}</p>

        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginBottom: '2px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Looking for</p>
        <p style={{ color: 'white', fontSize: '18px', fontWeight: 600, marginBottom: '4px', lineHeight: 1.2 }}>{candidate.role}</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '10px' }}>{candidate.salary}</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {candidate.tags.map(t => (
            <span key={t} style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 500, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.78)' }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}