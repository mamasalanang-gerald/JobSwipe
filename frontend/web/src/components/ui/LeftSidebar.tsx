import React, { RefObject } from 'react';
import { useRouter } from 'next/router';
import { IconChevronLeft, IconChevronRight, IconLogOut } from './icons';
import RatingModal, { RatingSubmission } from './RatingModal';

interface NavItem {
  id: string;
  label: string;
  Icon: React.FC;
}

interface LeftSidebarProps {
  sidebarRef: RefObject<HTMLElement>;
  leftOpen: boolean;
  setLeftOpen: (val: boolean | ((v: boolean) => boolean)) => void;
  activeNav: string;
  setActiveNav: (id: string) => void;
  swipedCount: number;
  swipesLeft: number;
  // Customization props
  navItems: NavItem[];
  navRoutes?: Record<string, string>;
  accentColor?: string;
  counterLabel?: string;
  counterLimit?: number;
  profileName?: string;
  profileEmail?: string;
  profileImage?: string;
  avatarRadius?: string; // '50%' for user circle, '8px' for company square
  badgeLabel?: string;   // e.g. 'COMPANY' badge next to logo
  // Rating modal (user only)
  pendingRating?: {
    threadId: number;
    company: string;
    role: string;
    initials: string;
    accentColor: string;
    accentBg: string;
  } | null;
  onRatingSubmit?: (data: RatingSubmission) => void;
  onRatingDismiss?: () => void;
}

export default function LeftSidebar({
  sidebarRef, leftOpen, setLeftOpen, activeNav, setActiveNav,
  swipedCount, swipesLeft,
  navItems, navRoutes = {}, accentColor = '#FF4E6A',
  counterLabel = 'Daily swipes', counterLimit = 15,
  profileName = 'John Doe', profileEmail = 'user@jobswipe.com',
  profileImage = '/assets/images/img1.jpg', avatarRadius = '50%',
  badgeLabel,
  pendingRating, onRatingSubmit, onRatingDismiss,
}: LeftSidebarProps) {
  const router = useRouter();

  const accentBg = `${accentColor}14`;
  const accentBorder = `${accentColor}24`;

  const handleNavClick = (id: string) => {
    if (navRoutes[id]) router.push(navRoutes[id]);
    else setActiveNav(id);
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        onClick={() => { if (!leftOpen) setLeftOpen(true); }}
        style={{
          width: leftOpen ? '220px' : '64px',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          flexShrink: 0,
          background: '#0d0d1a',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 20,
          cursor: leftOpen ? 'default' : 'pointer',
        }}
      >
        {/* Logo row */}
        <div style={{ padding: '0 16px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          {leftOpen && (
            <span style={{ color: 'white', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Job<span style={{ color: accentColor }}>Swipe</span>
              {badgeLabel && (
                <span style={{ marginLeft: '6px', fontSize: '10px', padding: '2px 7px', borderRadius: '999px', background: accentBg, border: `1px solid ${accentBorder}`, color: accentColor, fontWeight: 600, letterSpacing: '0.06em', verticalAlign: 'middle' }}>
                  {badgeLabel}
                </span>
              )}
            </span>
          )}
          <button
            onClick={e => { e.stopPropagation(); setLeftOpen(v => !v); }}
            style={{ width: '30px', height: '30px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', marginLeft: 'auto' }}
          >
            {leftOpen ? <IconChevronLeft /> : <IconChevronRight />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, padding: '0 8px' }}>
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              title={!leftOpen ? label : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px',
                padding: leftOpen ? '9px 12px' : '9px',
                justifyContent: leftOpen ? 'flex-start' : 'center',
                color: activeNav === id ? accentColor : 'rgba(255,255,255,0.4)',
                background: activeNav === id ? accentBg : 'transparent',
                border: 'none', cursor: 'pointer', minHeight: '40px', fontSize: '13px', fontWeight: 500,
              }}
            >
              <span style={{ flexShrink: 0 }}><Icon /></span>
              {leftOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
              {leftOpen && id === 'messages' && (
                <span style={{ marginLeft: 'auto', background: accentColor, color: 'white', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '999px' }}>3</span>
              )}
            </button>
          ))}
        </nav>

        {/* Counter */}
        {leftOpen && (
          <div style={{ margin: '12px 12px 0', padding: '12px', borderRadius: '14px', background: accentBg, border: `1px solid ${accentBorder}` }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>{counterLabel}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{swipedCount} used</span>
              <span style={{ color: accentColor, fontWeight: 600, fontSize: '13px' }}>{swipesLeft} left</span>
            </div>
            <div style={{ height: '3px', borderRadius: '999px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '999px', width: `${(swipedCount / counterLimit) * 100}%`, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`, transition: 'width 0.5s' }} />
            </div>
          </div>
        )}

        {/* Profile + Logout */}
        <div style={{
          margin: '8px 8px 16px',
          padding: leftOpen ? '10px 10px 10px 12px' : '8px',
          borderRadius: '14px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: '10px',
          justifyContent: leftOpen ? 'flex-start' : 'center',
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: avatarRadius, flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.07)' }}>
            <img src={profileImage} alt={profileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {leftOpen && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'white', fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{profileName}</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{profileEmail}</p>
            </div>
          )}
          {leftOpen && (
            <button
              onClick={() => router.push('/login')}
              title="Log out"
              style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'background 0.18s, color 0.18s, border-color 0.18s' }}
              onMouseEnter={e => { const b = e.currentTarget; b.style.background = accentBg; b.style.color = accentColor; b.style.borderColor = accentBorder; }}
              onMouseLeave={e => { const b = e.currentTarget; b.style.background = 'transparent'; b.style.color = 'rgba(255,255,255,0.3)'; b.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <IconLogOut />
            </button>
          )}
        </div>
      </aside>

      {pendingRating && onRatingSubmit && onRatingDismiss && (
        <RatingModal
          threadId={pendingRating.threadId}
          company={pendingRating.company}
          role={pendingRating.role}
          initials={pendingRating.initials}
          accentColor={pendingRating.accentColor}
          accentBg={pendingRating.accentBg}
          onSubmit={onRatingSubmit}
          onDismiss={onRatingDismiss}
        />
      )}
    </>
  );
}