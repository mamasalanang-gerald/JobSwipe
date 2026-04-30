import React from 'react';
import { IconChevronLeft, IconChevronRight, IconZap, IconLock, IconWarning, IconCheck, IconShield, IconInfinity, IconMail } from './icons';

export type UserPlan = 'free' | 'pro';

interface RightSidebarProps {
  rightOpen: boolean;
  setRightOpen: (val: boolean | ((v: boolean) => boolean)) => void;
  title?: string;
  subtitle?: string;
  collapsedLabel?: string;
  hasItem: boolean;
  emptyMessage?: string;
  detailPanel: React.ReactNode;
  plan?: UserPlan;
  viewedCount?: number;
  freeLimit?: number;
  onUpgrade?: () => void;
}

function UpgradeBanner({ onUpgrade, viewed, limit }: { onUpgrade?: () => void; viewed: number; limit: number }) {
  const features = [
    { icon: <IconInfinity />, label: 'Unlimited job details' },
    { icon: <IconBarChart />, label: 'Full salary breakdown' },
    { icon: <IconZap />,      label: 'Priority applications' },
    { icon: <IconShield />,   label: 'Advanced filters' },
  ];

  return (
    <div style={{
      margin: '12px 16px 0',
      padding: '14px',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
      border: '1px solid rgba(99,102,241,0.25)',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
          <IconZap />
        </div>
        <div>
          <p style={{ color: 'white', fontSize: '12px', fontWeight: 700, margin: 0 }}>Free Plan Limit</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', margin: 0 }}>{viewed} of {limit} details used</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', borderRadius: '999px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginBottom: '10px' }}>
        <div style={{ height: '100%', borderRadius: '999px', width: `${Math.min((viewed / limit) * 100, 100)}%`, background: 'linear-gradient(90deg, #6366F1, #8B5CF6)', transition: 'width 0.5s' }} />
      </div>

      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', lineHeight: 1.6, marginBottom: '10px' }}>
        Upgrade to <span style={{ color: '#818CF8', fontWeight: 600 }}>Pro</span> to unlock unlimited job details, salary insights, and direct apply.
      </p>

      {/* Features */}
      {features.map(({ icon, label }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#818CF8' }}>
            {icon}
          </div>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px' }}>{label}</span>
        </div>
      ))}

      <button
        onClick={onUpgrade}
        style={{ width: '100%', marginTop: '12px', padding: '10px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
      >
        <IconZap /> Upgrade to Pro
      </button>

      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', textAlign: 'center', marginTop: '8px', marginBottom: 0 }}>
        Cancel anytime · No hidden fees
      </p>
    </div>
  );
}

function LockedPanel({ onUpgrade }: { onUpgrade?: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Blurred placeholder */}
      <div style={{ flex: 1, padding: '20px', filter: 'blur(4px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: '14px', borderRadius: '6px', background: 'rgba(255,255,255,0.15)', marginBottom: '8px', width: '70%' }} />
            <div style={{ height: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', width: '50%' }} />
          </div>
        </div>
        {[90, 70, 80, 60, 75].map((w, i) => (
          <div key={i} style={{ height: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', marginBottom: '10px', width: `${w}%` }} />
        ))}
      </div>

      {/* Lock CTA */}
      <div style={{ padding: '16px', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8' }}>
            <IconLock />
          </div>
          <p style={{ color: 'white', fontSize: '13px', fontWeight: 700, margin: 0, textAlign: 'center' }}>You've used all free previews</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>Upgrade to Pro to keep viewing full job details</p>
        </div>
        <button
          onClick={onUpgrade}
          style={{ width: '100%', padding: '11px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <IconZap /> Upgrade to Pro
        </button>
      </div>
    </div>
  );
}

// Need to add IconBarChart inline since it references the new icon
function IconBarChart() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

export default function RightSidebar({
  rightOpen, setRightOpen,
  title = 'Details', subtitle,
  collapsedLabel = 'Details',
  hasItem, emptyMessage = 'Nothing to review',
  detailPanel,
  plan = 'free',
  viewedCount = 0,
  freeLimit = 3,
  onUpgrade,
}: RightSidebarProps) {
  const isLocked = plan === 'free' && viewedCount >= freeLimit;
  const isNearLimit = plan === 'free' && viewedCount === freeLimit - 1;
  const showBanner = plan === 'free' && viewedCount > 0 && !isLocked && !isNearLimit;

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <p style={{ color: 'white', fontSize: '14px', fontWeight: 700, margin: 0 }}>{title}</p>
              {plan === 'free' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', padding: '2px 7px', borderRadius: '999px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818CF8', fontWeight: 600 }}>
                  {viewedCount}/{freeLimit} free
                </span>
              )}
              {plan === 'pro' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', padding: '2px 7px', borderRadius: '999px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E', fontWeight: 600 }}>
                  <IconZap /> PRO
                </span>
              )}
            </div>
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
        !hasItem ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', textAlign: 'center', padding: '0 24px' }}>{emptyMessage}</p>
          </div>
        ) : isLocked ? (
          <LockedPanel onUpgrade={onUpgrade} />
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Near-limit warning */}
            {isNearLimit && (
              <div style={{ margin: '12px 16px 0', padding: '10px 12px', borderRadius: '12px', background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)', display: 'flex', alignItems: 'flex-start', gap: '8px', flexShrink: 0 }}>
                <span style={{ color: 'rgba(250,204,21,0.9)', flexShrink: 0, marginTop: '1px' }}><IconWarning /></span>
                <p style={{ color: 'rgba(250,204,21,0.9)', fontSize: '11px', margin: 0, lineHeight: 1.5 }}>
                  This is your last free preview.{' '}
                  <span style={{ fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }} onClick={onUpgrade}>
                    Upgrade to Pro
                  </span>{' '}
                  for unlimited access.
                </p>
              </div>
            )}

            {/* Inline upgrade banner */}
            {showBanner && (
              <UpgradeBanner onUpgrade={onUpgrade} viewed={viewedCount} limit={freeLimit} />
            )}

            {/* Detail panel */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {detailPanel}
            </div>
          </div>
        )
      )}
    </aside>
  );
}