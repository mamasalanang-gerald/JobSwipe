'use client';
import React, { useState } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────

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

const IconZoomIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PhotoCardProps {
  src: string;
  editMode: boolean;
  onView: () => void;
  onReplace: () => void;
  onRemove: () => void;
  fileInputRef: (el: HTMLInputElement | null) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PhotoCard({
  src, editMode, onView, onReplace, onRemove, fileInputRef, onFileChange,
}: PhotoCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ position: 'relative', aspectRatio: '5 / 3' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image tile */}
      <div
        onClick={() => editMode ? onReplace() : onView()}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '14px',
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <img
          src={src}
          alt="Profile photo"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />

        {/* Edit mode — camera replace overlay */}
        {editMode && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.48)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}>
            <IconCamera />
          </div>
        )}

        {/* View mode — hover zoom cue */}
        {!editMode && hovered && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            gap: '4px',
          }}>
            <IconZoomIn />
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em' }}>View</span>
          </div>
        )}
      </div>

      {/* Remove button — edit mode only */}
      {editMode && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            background: 'rgba(255,78,106,0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            zIndex: 2,
          }}
        >
          <IconX />
        </button>
      )}

      {/* Hidden file input for replacement */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />
    </div>
  );
}