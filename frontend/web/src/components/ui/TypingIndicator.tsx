'use client';
import React from 'react';

interface TypingIndicatorProps {
  /** Shown when the other party is a company — uses initials + color */
  mode: 'initials' | 'avatar';
  initials?: string;
  color?: string;
  bg?: string;
  avatar?: string;
  name?: string;
}

export default function TypingIndicator({ mode, initials, color, bg, avatar, name }: TypingIndicatorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
      {/* Avatar */}
      {mode === 'avatar' && avatar ? (
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
          <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
          background: bg ?? 'rgba(255,78,106,0.1)',
          border: `1px solid ${color ?? '#FF4E6A'}26`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color ?? '#FF4E6A', fontSize: '10px', fontWeight: 700,
        }}>{initials}</div>
      )}

      {/* Dots */}
      <div style={{
        padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px',
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: '5px',
      }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.4)',
            animation: `typingBounce 1.2s ease-in-out ${delay}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}