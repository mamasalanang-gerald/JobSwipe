'use client';
import React, { useState } from 'react';
import { RatingSubmission } from '@/types/messages';
import { IconCheckGreen, IconStarFilled, IconStarEmpty } from '@/components/ui/icons';

interface InlineRatingCardProps {
  /** The entity being rated — company name (user side) or candidate name (company side) */
  subjectName: string;
  subjectLabel: string;         // "your experience with {name}" vs "how well {name} fit the {role}"
  role: string;
  threadId: number;
  accentColor: string;          // star fill + submit gradient start
  accentColorAlt: string;       // submit gradient end
  accentGlow: string;           // box-shadow rgba
  focusBorderColor: string;     // textarea focus border
  starLabels: Record<number, string>;
  successMessage: string;
  commentPlaceholder: string;
  onSubmit: (data: RatingSubmission) => void;
}

export default function InlineRatingCard({
  subjectName, subjectLabel, role, threadId,
  accentColor, accentColorAlt, accentGlow, focusBorderColor,
  starLabels, successMessage, commentPlaceholder,
  onSubmit,
}: InlineRatingCardProps) {
  const [rating, setRating]       = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [comment, setComment]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [skipped, setSkipped]     = useState(false);

  if (skipped) return null;

  if (submitted) {
    return (
      <div style={{
        margin: '20px 0 8px', padding: '14px 16px', borderRadius: '14px',
        background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <IconCheckGreen />
        <p style={{ color: '#22C55E', fontSize: '12px', fontWeight: 600, margin: 0 }}>
          {successMessage}
        </p>
      </div>
    );
  }

  const display = hovered || rating;

  const handleSubmit = () => {
    if (!rating) return;
    setSubmitted(true);
    onSubmit({ threadId, company: subjectName, role, overall: rating, comment });
  };

  return (
    <div style={{
      margin: '20px 0 8px', padding: '18px', borderRadius: '16px',
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
    }}>
      {/* Label */}
      <p style={{
        color: 'rgba(255,255,255,0.45)', fontSize: '11px', fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px',
      }}>{subjectLabel}</p>

      {/* Stars */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
              transform: hovered === star ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.12s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            {star <= display
              ? <IconStarFilled size={24} color={accentColor} />
              : <IconStarEmpty size={24} />}
          </button>
        ))}
      </div>

      {/* Star label */}
      <p style={{
        color: rating > 0 ? accentColor : 'rgba(255,255,255,0.18)',
        fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase', minHeight: '14px',
        margin: '0 0 14px', transition: 'color 0.2s',
      }}>
        {rating > 0 ? starLabels[rating] : ''}
      </p>

      {/* Comment */}
      <textarea
        rows={2}
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder={commentPlaceholder}
        style={{
          width: '100%', padding: '9px 12px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px', color: 'rgba(255,255,255,0.75)',
          fontSize: '12px', lineHeight: 1.6, fontFamily: 'inherit',
          resize: 'none', marginBottom: '12px',
          outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
        }}
        onFocus={e => (e.target.style.borderColor = focusBorderColor)}
        onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
      />

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setSkipped(true)}
          style={{
            flex: 1, padding: '8px 0', borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >Skip</button>
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          style={{
            flex: 2, padding: '8px 0', borderRadius: '10px', border: 'none',
            background: rating > 0
              ? `linear-gradient(135deg, ${accentColor}, ${accentColorAlt})`
              : 'rgba(255,255,255,0.07)',
            color: rating > 0 ? 'white' : 'rgba(255,255,255,0.22)',
            fontSize: '12px', fontWeight: 700,
            cursor: rating > 0 ? 'pointer' : 'default',
            fontFamily: 'inherit',
            boxShadow: rating > 0 ? `0 4px 14px ${accentGlow}` : 'none',
            transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
          }}
        >Submit rating</button>
      </div>
    </div>
  );
}