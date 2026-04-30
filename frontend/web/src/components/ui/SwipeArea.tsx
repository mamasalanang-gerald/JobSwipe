import React from 'react';
import { IconX, IconHeart } from './icons';

interface SwipeAreaProps<T extends { id: number }> {
  items: T[];
  index: number;
  remaining: number;
  visibleItems: T[];
  lastAction: string | null;
  // Action config
  positiveAction: { label: string; icon: React.ReactNode; color: string; gradient: string; toastLabel: string; toastColor: string; toastBorder: string; toastBg: string };
  negativeAction: { label: string; icon: React.ReactNode; color: string; toastLabel: string };
  accentColor?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  resetLabel?: string;
  resetGradient?: string;
  // Render prop for the card
  renderCard: (item: T, stackIdx: number, isTop: boolean) => React.ReactNode;
  onSwipe: (dir: 'left' | 'right') => void;
  onButton: (dir: 'left' | 'right') => void;
  onReset: () => void;
}

export default function SwipeArea<T extends { id: number }>({
  items, index, remaining, visibleItems, lastAction,
  positiveAction, negativeAction, accentColor = '#FF4E6A',
  emptyTitle = "You're all caught up!", emptyMessage = 'Check back later',
  resetLabel = 'Refresh', resetGradient = 'linear-gradient(135deg, #FF4E6A, #FF7854)',
  renderCard, onSwipe, onButton, onReset,
}: SwipeAreaProps<T>) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 24px' }}>
      {remaining === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>✨</div>
          <p style={{ color: 'white', fontWeight: 700, fontSize: '20px', margin: 0 }}>{emptyTitle}</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0 }}>{emptyMessage}</p>
          <button onClick={onReset} style={{ marginTop: '8px', padding: '10px 24px', borderRadius: '999px', fontWeight: 600, fontSize: '13px', color: 'white', border: 'none', cursor: 'pointer', background: resetGradient }}>
            {resetLabel}
          </button>
        </div>
      ) : (
        <>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            {items.map((_, i) => (
              <div key={i} style={{ borderRadius: '999px', height: '5px', width: i === index ? '20px' : '5px', background: i <= index ? accentColor : 'rgba(255,255,255,0.1)', transition: 'all 0.4s' }} />
            ))}
          </div>

          {/* Card stack */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '520px', height: 'calc(100vh - 64px - 16px - 29px - 16px - 52px - 28px - 32px)', minHeight: '420px', maxHeight: '680px' }}>
            {visibleItems.map((item, stackIdx) => renderCard(item, stackIdx, stackIdx === 0))}

            {/* Toast */}
            <div style={{ position: 'absolute', top: '16px', left: '50%', zIndex: 20, transform: `translateX(-50%) translateY(${lastAction ? '0px' : '-12px'})`, opacity: lastAction ? 1 : 0, transition: 'all 0.3s', pointerEvents: 'none' }}>
              <div style={{ padding: '5px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, background: lastAction === 'positive' ? positiveAction.toastBg : 'rgba(255,78,106,0.14)', border: `1px solid ${lastAction === 'positive' ? positiveAction.toastBorder : '#FF4E6A'}`, color: lastAction === 'positive' ? positiveAction.toastColor : '#FF4E6A' }}>
                {lastAction === 'positive' ? positiveAction.toastLabel : negativeAction.toastLabel}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '20px' }}>
            <button onClick={() => onButton('left')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 24px', borderRadius: '16px', fontSize: '14px', fontWeight: 600, color: negativeAction.color, cursor: 'pointer', background: `${negativeAction.color}1a`, border: `1px solid ${negativeAction.color}38` }}>
              {negativeAction.icon} {negativeAction.label}
            </button>
            <button onClick={() => onButton('right')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 28px', borderRadius: '16px', fontSize: '14px', fontWeight: 700, color: 'white', cursor: 'pointer', border: 'none', background: positiveAction.gradient, boxShadow: `0 4px 20px ${positiveAction.color}44` }}>
              {positiveAction.icon} {positiveAction.label}
            </button>
          </div>

          <p style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.18)' }}>← {negativeAction.label} &nbsp;·&nbsp; {positiveAction.label} →</p>
        </>
      )}
    </div>
  );
}