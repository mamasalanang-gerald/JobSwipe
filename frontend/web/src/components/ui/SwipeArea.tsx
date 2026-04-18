import React from 'react';
import { Job } from '../../types/job';
import { IconX, IconHeart } from './icons';
import SwipeCard from './SwipeCard';

interface SwipeAreaProps {
  jobs: Job[];
  index: number;
  remaining: number;
  visibleJobs: Job[];
  lastAction: 'like' | 'nope' | null;
  onSwipe: (dir: 'left' | 'right') => void;
  onButton: (dir: 'left' | 'right') => void;
  onReset: () => void;
}

export default function SwipeArea({
  jobs, index, remaining, visibleJobs, lastAction, onSwipe, onButton, onReset,
}: SwipeAreaProps) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 24px' }}>
      {remaining === 0 ? (
        // Empty state
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>✨</div>
          <p style={{ color: 'white', fontWeight: 700, fontSize: '20px', margin: 0 }}>You're all caught up!</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0 }}>Check back later for new opportunities</p>
          <button onClick={onReset} style={{ marginTop: '8px', padding: '10px 24px', borderRadius: '999px', fontWeight: 600, fontSize: '13px', color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #FF4E6A, #FF7854)' }}>
            Refresh Jobs
          </button>
        </div>
      ) : (
        <>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            {jobs.map((_, i) => (
              <div key={i} style={{ borderRadius: '999px', height: '5px', width: i === index ? '20px' : '5px', background: i <= index ? '#FF4E6A' : 'rgba(255,255,255,0.1)', transition: 'all 0.4s' }} />
            ))}
          </div>

          {/* Card stack */}
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
                  onSwipe={onSwipe}
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

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '20px' }}>
            <button onClick={() => onButton('left')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 24px', borderRadius: '16px', fontSize: '14px', fontWeight: 600, color: '#FF4E6A', cursor: 'pointer', background: 'rgba(255,78,106,0.1)', border: '1px solid rgba(255,78,106,0.22)' }}>
              <IconX /> Pass
            </button>
            <button onClick={() => onButton('right')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 28px', borderRadius: '16px', fontSize: '14px', fontWeight: 700, color: 'white', cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #22C55E, #16a34a)', boxShadow: '0 4px 20px rgba(34,197,94,0.28)' }}>
              <IconHeart /> Apply
            </button>
          </div>

          <p style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.18)' }}>← Pass &nbsp;·&nbsp; Apply →</p>
        </>
      )}
    </div>
  );
}
