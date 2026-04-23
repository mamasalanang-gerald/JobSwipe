import React from 'react';

interface TopBarProps {
  remaining: number;
}

export default function TopBar({ remaining }: TopBarProps) {
  return (
    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div>
        <h1 style={{ color: 'white', fontWeight: 700, fontSize: '17px', margin: 0 }}>Discover Jobs</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>{remaining} jobs remaining</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button style={{ padding: '7px 16px', borderRadius: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer' }}>
          Filters
        </button>
        <button style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
