import React, { useState, useRef, useEffect } from 'react';
import { Job } from '../../types/job';
import { IconPrev, IconNext, IconVerified, IconMapPin } from './icons';

interface SwipeCardProps {
  job: Job;
  isTop: boolean;
  onSwipe: (dir: 'left' | 'right') => void;
  zIndex: number;
  scale: number;
  stackIdx: number;
}

export default function SwipeCard({ job, isTop, onSwipe, zIndex, scale, stackIdx }: SwipeCardProps) {
  const [imgIdx, setImgIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [dragRotate, setDragRotate] = useState(0);
  const [hint, setHint] = useState<'like' | 'nope' | null>(null);
  const [flyOut, setFlyOut] = useState<'left' | 'right' | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedProgressRef = useRef(0);
  const isPausedRef = useRef(false);
  const imgIdxRef = useRef(0);

  const DURATION = 3000;

  const images = job.images.slice(0, 6);
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

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imgIdxRef.current < numImgs - 1) goTo(imgIdxRef.current + 1);
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imgIdxRef.current > 0) goTo(imgIdxRef.current - 1);
  };

  const triggerSwipe = (dir: 'left' | 'right') => {
    setFlyOut(dir);
    setTimeout(() => onSwipe(dir), 350);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isTop) return;
    isDragging.current = true;
    isPausedRef.current = true;
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
    transition: 'top 0.35s cubic-bezier(0.4,0,0.2,1), left 0.35s, right 0.35s, bottom 0.35s',
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
      {/* Images */}
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${job.company} ${i + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: i === imgIdx ? 1 : 0, transition: 'opacity 0.3s ease', zIndex: 0 }}
        />
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.0) 40%, rgba(5,5,18,0.75) 65%, rgba(5,5,18,0.98) 100%)',
        zIndex: 3,
      }} />

      {/* Progress bars */}
      {isTop && numImgs > 1 && (
        <div
          className="absolute top-3 left-3 right-3 flex gap-1.5"
          style={{ zIndex: 10 }}
          onPointerDown={e => e.stopPropagation()}
        >
          {images.map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-full overflow-hidden"
              style={{ height: '3px', background: 'rgba(255,255,255,0.25)', cursor: 'pointer' }}
              onClick={e => { e.stopPropagation(); goTo(i); }}
            >
              <div style={{
                height: '100%',
                borderRadius: '999px',
                background: 'white',
                width: i < imgIdx
                  ? '100%'
                  : i === imgIdx
                  ? `${progress * 100}%`
                  : '0%',
                transition: i === imgIdx ? 'none' : 'width 0.3s',
              }} />
            </div>
          ))}
        </div>
      )}

      {/* Tap zones */}
      {isTop && numImgs > 1 && (
        <>
          <div className="absolute top-0 bottom-0 left-0" style={{ width: '35%', zIndex: 5, cursor: imgIdx > 0 ? 'w-resize' : 'default' }} onPointerDown={e => e.stopPropagation()} onClick={goPrev} />
          <div className="absolute top-0 bottom-0 right-0" style={{ width: '35%', zIndex: 5, cursor: imgIdx < numImgs - 1 ? 'e-resize' : 'default' }} onPointerDown={e => e.stopPropagation()} onClick={goNext} />
        </>
      )}

      {/* Arrow buttons */}
      {isTop && numImgs > 1 && (
        <>
          {imgIdx > 0 && (
            <button
              className="absolute flex items-center justify-center"
              style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.18)', color: 'white', cursor: 'pointer', backdropFilter: 'blur(6px)' }}
              onPointerDown={e => e.stopPropagation()}
              onClick={goPrev}
            >
              <IconPrev />
            </button>
          )}
          {imgIdx < numImgs - 1 && (
            <button
              className="absolute flex items-center justify-center"
              style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.18)', color: 'white', cursor: 'pointer', backdropFilter: 'blur(6px)' }}
              onPointerDown={e => e.stopPropagation()}
              onClick={goNext}
            >
              <IconNext />
            </button>
          )}
        </>
      )}

      {/* Photo counter */}
      {isTop && numImgs > 1 && (
        <div className="absolute" style={{ top: '14px', right: '14px', zIndex: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '3px 9px', color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: 600 }}>
          {imgIdx + 1} / {numImgs}
        </div>
      )}

      {/* Swipe hint labels */}
      {hint === 'like' && (
        <div className="absolute z-20" style={{ top: '28px', left: '20px', border: '2.5px solid #22C55E', color: '#22C55E', fontSize: '18px', fontWeight: 900, padding: '4px 14px', borderRadius: '10px', transform: 'rotate(-12deg)', letterSpacing: '0.12em', opacity: 0.95 }}>APPLY</div>
      )}
      {hint === 'nope' && (
        <div className="absolute z-20" style={{ top: '28px', right: '20px', border: '2.5px solid #FF4E6A', color: '#FF4E6A', fontSize: '18px', fontWeight: 900, padding: '4px 14px', borderRadius: '10px', transform: 'rotate(12deg)', letterSpacing: '0.12em', opacity: 0.95 }}>SKIP</div>
      )}

      {/* Card content */}
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