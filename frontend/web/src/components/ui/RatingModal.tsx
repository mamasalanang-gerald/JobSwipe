'use client';
import React, { useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RatingSubmission {
  threadId: number;
  company: string;
  role: string;
  overall: number;
  comment: string;
}

interface RatingModalProps {
  company: string;
  role: string;
  initials: string;
  accentColor: string;
  accentBg: string;
  threadId: number;
  onSubmit: (data: RatingSubmission) => void;
  onDismiss: () => void;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconStar = ({ filled }: { filled: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      fill={filled ? '#FF4E6A' : 'transparent'}
      stroke={filled ? '#FF4E6A' : 'rgba(255,255,255,0.18)'}
      strokeWidth="1.5"
    />
  </svg>
);
const IconCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Star Picker ──────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
            transform: hovered === star ? 'scale(1.25)' : 'scale(1)',
            transition: 'transform 0.15s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <IconStar filled={star <= display} />
        </button>
      ))}
    </div>
  );
}

// ─── Label for star value ────────────────────────────────────────────────────
const STAR_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RatingModal({
  company, role, initials, accentColor, accentBg,
  threadId, onSubmit, onDismiss,
}: RatingModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const [hovered, setHovered]     = useState(false);
  const [overall, setOverall]     = useState(0);
  const [comment, setComment]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onDismiss();
  };

  const handleSubmit = () => {
    if (overall === 0) { setError('Please select an overall rating before submitting.'); return; }
    setError('');
    setSubmitted(true);
    onSubmit({ threadId, company, role, overall, comment });
  };

  return (
    <>
      <style>{`
        @keyframes ratingFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ratingSlideUp {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes successPop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .rating-textarea:focus { outline: none; }
        .rating-textarea::placeholder { color: rgba(255,255,255,0.2); }
        .submit-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .dismiss-btn:hover { background: rgba(255,255,255,0.08) !important; color: rgba(255,255,255,0.6) !important; }
      `}</style>

      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(4,4,14,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          animation: 'ratingFadeIn 0.2s ease forwards',
          backdropFilter: 'blur(4px)',
        }}
      >
        {/* Card */}
        <div
          ref={cardRef}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '420px',
            borderRadius: '18px',
            padding: '32px 28px 28px',
            cursor: 'default',
            userSelect: 'none',
            animation: 'ratingSlideUp 0.3s cubic-bezier(0.22,1,0.36,1) forwards',
            background: '#111120',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
            transition: 'border-color 0.28s',
            overflow: 'hidden',
          }}
        >
          {/* Bottom accent bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: '50%',
            transform: 'translateX(-50%)', height: '2px',
            borderRadius: '2px 2px 0 0',
            background: 'linear-gradient(90deg, #FF4E6A, #FF7854)',
            width: hovered ? '60%' : '0%',
            transition: 'width 0.4s cubic-bezier(0.22,1,0.36,1)',
          }} />

          {/* Dismiss button */}
          <button
            className="dismiss-btn"
            onClick={onDismiss}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              width: '30px', height: '30px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
              transition: 'background 0.18s, color 0.18s',
            }}
          ><IconX /></button>

          {submitted ? (
            /* ── Success state ── */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '20px 0 12px', textAlign: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'successPop 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
              }}>
                <IconCheck />
              </div>
              <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 600, margin: 0 }}>
                Rating submitted!
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12.5px', lineHeight: 1.72, margin: 0, maxWidth: '300px' }}>
                Thanks for rating your experience with{' '}
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{company}</span>.
                Your feedback helps other job seekers.
              </p>
              <button
                onClick={onDismiss}
                style={{
                  marginTop: '8px', padding: '9px 28px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.55)', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >Close</button>
            </div>
          ) : (
            <>
              {/* ── Header ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingRight: '36px' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '13px', flexShrink: 0,
                  background: accentBg, border: `1px solid ${accentColor}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: accentColor, fontSize: '13px', fontWeight: 700,
                }}>{initials}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>{company}</span>
                    <span style={{
                      color: 'rgba(255,78,106,0.8)', fontSize: '10px', fontWeight: 700,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                    }}>· Rate</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.36)', fontSize: '12px', margin: 0 }}>{role}</p>
                </div>
              </div>

              {/* ── Overall stars ── */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p style={{
                  color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px',
                }}>Overall experience</p>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <StarPicker value={overall} onChange={v => { setOverall(v); setError(''); }} />
                </div>
                <p style={{
                  color: overall > 0 ? '#FF4E6A' : 'rgba(255,255,255,0.18)',
                  fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
                  textTransform: 'uppercase', minHeight: '16px',
                  transition: 'color 0.2s',
                }}>
                  {overall > 0 ? STAR_LABELS[overall] : ''}
                </p>
              </div>

              {/* ── Comment ── */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{
                  color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px',
                }}>
                  Leave a comment{' '}
                  <span style={{ color: 'rgba(255,255,255,0.18)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                    (optional)
                  </span>
                </p>
                <textarea
                  className="rating-textarea"
                  rows={3}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Share your experience with this company…"
                  style={{
                    width: '100%', padding: '10px 13px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'rgba(255,255,255,0.75)', fontSize: '12.5px',
                    lineHeight: 1.65, fontFamily: 'inherit',
                    resize: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(255,78,106,0.4)')}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>

              {/* ── Error ── */}
              {error && (
                <p style={{
                  color: '#FF4E6A', fontSize: '11.5px', marginBottom: '12px',
                  padding: '7px 12px', borderRadius: '9px',
                  background: 'rgba(255,78,106,0.08)', border: '1px solid rgba(255,78,106,0.2)',
                }}>{error}</p>
              )}

              {/* ── Actions ── */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="dismiss-btn"
                  onClick={onDismiss}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'background 0.18s, color 0.18s',
                  }}
                >Maybe later</button>
                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={overall === 0}
                  style={{
                    flex: 2, padding: '10px 0', borderRadius: '12px', border: 'none',
                    background: overall > 0
                      ? 'linear-gradient(135deg, #FF4E6A, #FF7854)'
                      : 'rgba(255,255,255,0.06)',
                    color: overall > 0 ? 'white' : 'rgba(255,255,255,0.22)',
                    fontSize: '13px', fontWeight: 700,
                    cursor: overall > 0 ? 'pointer' : 'default',
                    fontFamily: 'inherit',
                    boxShadow: overall > 0 ? '0 4px 20px rgba(255,78,106,0.28)' : 'none',
                    transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                  }}
                >Submit rating</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}