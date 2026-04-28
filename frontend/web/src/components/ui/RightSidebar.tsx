import React from 'react';
import { IconChevronLeft, IconChevronRight } from './icons';

interface RightSidebarProps {
  rightOpen: boolean;
  setRightOpen: (val: boolean | ((v: boolean) => boolean)) => void;
  title?: string;
  subtitle?: string;           // e.g. "1 of 5" or "All done"
  collapsedLabel?: string;     // rotated text when closed
  hasItem: boolean;            // controls empty state
  emptyMessage?: string;
  detailPanel: React.ReactNode; // pass <DetailPanel /> or <CandidateDetailPanel />
}

export default function RightSidebar({
  rightOpen, setRightOpen,
  title = 'Details', subtitle,
  collapsedLabel = 'Details',
  hasItem, emptyMessage = 'Nothing to review',
  detailPanel,
}: RightSidebarProps) {
  return (
    <aside style={{
      width: rightOpen ? '360px' : '48px',
      transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
      flexShrink: 0,
      background: '#0d0d1a',
      borderLeft: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 20,
    }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: rightOpen ? '0 20px' : '0 8px', justifyContent: rightOpen ? 'space-between' : 'center', height: '64px' }}>
        {rightOpen && (
          <div>
            <p style={{ color: 'white', fontSize: '14px', fontWeight: 700, margin: 0 }}>{title}</p>
            {subtitle && <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '11px', margin: 0 }}>{subtitle}</p>}
          </div>
        )}
        <button
          onClick={() => setRightOpen(v => !v)}
          style={{ width: '30px', height: '30px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}
        >
          {rightOpen ? <IconChevronRight /> : <IconChevronLeft />}
        </button>
      </div>

      {/* Collapsed label */}
      {!rightOpen && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{collapsedLabel}</p>
        </div>
      )}

      {/* Content */}
      {rightOpen && (
        hasItem ? detailPanel : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', textAlign: 'center', padding: '0 24px' }}>{emptyMessage}</p>
          </div>
        )
      )}
    </aside>
  );
}