'use client';
import React, { useState, useRef, useEffect } from 'react';
import { candidates, TOTAL, companyNavItems } from '@/data/candidates';
import { Candidate } from '@/data/candidates';
import LeftSidebar from '@/components/ui/LeftSidebar';
import RightSidebar from '@/components/ui/RightSidebar';
import TopBar from '@/components/ui/TopBar';
import SwipeArea from '@/components/ui/SwipeArea';
import CandidateCard from '@/components/ui/CandidateCard';
import CandidateDetailPanel from '@/components/ui/CandidateDetailPanel';
import { IconX } from '@/components/ui/icons';

const DAILY_LIMIT = 10;

const COMPANY_NAV_ROUTES = {
  home:      '/company/swipe',
  candidates: '/company/candidates',
  postings:  '/company/postings',
  messages:  '/company/messages',
  analytics: '/company/analytics',
};

const InviteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

export default function CompanySwipePage() {
  const [index, setIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [lastAction, setLastAction] = useState<'positive' | 'negative' | null>(null);
  const [activeNav, setActiveNav] = useState('home');
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const sidebarRef = useRef<HTMLElement>(null);

  const remaining = TOTAL - index;
  const currentCandidate = candidates[index] ?? null;
  const visibleCandidates = candidates.slice(index, index + 3);
  const swipesLeft = Math.max(0, DAILY_LIMIT - reviewedCount);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (leftOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setLeftOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [leftOpen]);

  const handleSwipe = (dir: 'left' | 'right') => {
    setLastAction(dir === 'right' ? 'positive' : 'negative');
    setTimeout(() => setLastAction(null), 1400);
    setIndex(i => i + 1);
    setReviewedCount(c => c + 1);
  };

  const handleButton = (dir: 'left' | 'right') => {
    if (index >= TOTAL) return;
    handleSwipe(dir);
  };

  const handleReset = () => {
    setIndex(0);
    setReviewedCount(0);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: '#08080f',
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      <LeftSidebar
        sidebarRef={sidebarRef}
        leftOpen={leftOpen}
        setLeftOpen={setLeftOpen}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        swipedCount={reviewedCount}
        swipesLeft={swipesLeft}
        navItems={companyNavItems}
        navRoutes={COMPANY_NAV_ROUTES}
        accentColor="#6366F1"
        counterLabel="Daily reviews"
        counterLimit={DAILY_LIMIT}
        profileName="Accenture PH"
        profileEmail="hr@accenture.com"
        profileImage="/assets/images/accenture.jpg"
        avatarRadius="8px"
        badgeLabel="COMPANY"
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar
          title="Discover Candidates"
          subtitle={`${remaining} applicants remaining`}
          extraSlot={
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Senior Full Stack Developer</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>▾</span>
            </div>
          }
        />

        <SwipeArea
          items={candidates}
          index={index}
          remaining={remaining}
          visibleItems={visibleCandidates}
          lastAction={lastAction}
          accentColor="#6366F1"
          positiveAction={{
            label: 'Invite',
            icon: <InviteIcon />,
            color: '#6366F1',
            gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            toastLabel: '✉ Invite Sent!',
            toastColor: '#818CF8',
            toastBorder: '#6366F1',
            toastBg: 'rgba(99,102,241,0.15)',
          }}
          negativeAction={{
            label: 'Pass',
            icon: <IconX />,
            color: '#FF4E6A',
            toastLabel: '✕ Passed',
          }}
          resetLabel="Refresh Pool"
          resetGradient="linear-gradient(135deg, #6366F1, #8B5CF6)"
          emptyTitle="You've seen everyone!"
          emptyMessage="New candidates appear daily — check back soon"
          renderCard={(candidate, stackIdx, isTop) => (
            <CandidateCard
              key={(candidate as Candidate).id}
              candidate={candidate as Candidate}
              isTop={isTop}
              onSwipe={handleSwipe}
              zIndex={3 - stackIdx}
              stackIdx={stackIdx}
            />
          )}
          onSwipe={handleSwipe}
          onButton={handleButton}
          onReset={handleReset}
        />
      </main>

      <RightSidebar
        rightOpen={rightOpen}
        setRightOpen={setRightOpen}
        title="Candidate Details"
        subtitle={currentCandidate ? `${index + 1} of ${TOTAL}` : 'All reviewed'}
        collapsedLabel="Candidate"
        hasItem={!!currentCandidate}
        emptyMessage="No more candidates to review"
        detailPanel={
          currentCandidate ? (
            <CandidateDetailPanel
              key={currentCandidate.id}
              candidate={currentCandidate}
              onInvite={() => handleButton('right')}
              onPass={() => handleButton('left')}
            />
          ) : null
        }
      />
    </div>
  );
}