import React from 'react';
import { Job } from '../../types/job';
import { IconChevronLeft, IconChevronRight } from './icons';
import DetailPanel from './DetailPanel';

interface RightSidebarProps {
  rightOpen: boolean;
  setRightOpen: (val: boolean | ((v: boolean) => boolean)) => void;
  currentJob: Job | null;
  index: number;
  total: number;
  onApply: () => void;
  onSkip: () => void;
}

export default function RightSidebar({
  rightOpen, setRightOpen, currentJob, index, total, onApply, onSkip,
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
            <p style={{ color: 'white', fontSize: '14px', fontWeight: 700, margin: 0 }}>Job Details</p>
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '11px', margin: 0 }}>{currentJob ? `${index + 1} of ${total}` : 'All done'}</p>
          </div>
        )}
        <button
          onClick={() => setRightOpen((v) => !v)}
          style={{ width: '30px', height: '30px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}
        >
          {rightOpen ? <IconChevronRight /> : <IconChevronLeft />}
        </button>
      </div>

      {/* Collapsed label */}
      {!rightOpen && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Details</p>
        </div>
      )}

      {/* Content */}
      {rightOpen && (
        currentJob ? (
          <DetailPanel key={currentJob.id} job={currentJob} onApply={onApply} onSkip={onSkip} />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', textAlign: 'center', padding: '0 24px' }}>No more jobs to review</p>
          </div>
        )
      )}
    </aside>
  );
}
