'use client';
import React, { useState, useRef, useEffect } from 'react';
import { jobs, TOTAL, navItems } from '../../data/jobs';
import { Job } from '../../types/job';
import LeftSidebar from '../../components/ui/LeftSidebar';
import RightSidebar, { UserPlan } from '../../components/ui/RightSidebar';
import TopBar from '../../components/ui/TopBar';
import SwipeArea from '../../components/ui/SwipeArea';
import SwipeCard from '../../components/ui/SwipeCard';
import DetailPanel from '../../components/ui/DetailPanel';
import { IconX, IconHeart } from '../../components/ui/icons';
import { useRouter } from 'next/router';

const USER_NAV_ROUTES = {
  home:     '/user/swipe',
  messages: '/user/messages',
  profile:  '/user/profile',
};

const FREE_LIMIT = 3;

export default function SwipeHomePage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [swipedCount, setSwipedCount] = useState(0);
  const [viewedCount, setViewedCount] = useState(0);
  const [plan] = useState<UserPlan>('free'); // swap with real auth/API later
  const [lastAction, setLastAction] = useState<'positive' | 'negative' | null>(null);
  const [activeNav, setActiveNav] = useState('home');
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const sidebarRef = useRef<HTMLElement>(null);

  const remaining = TOTAL - index;
  const swipesLeft = Math.max(0, 15 - swipedCount);
  const currentJob = jobs[index] ?? null;
  const visibleJobs = jobs.slice(index, index + 3);

  // Increment viewedCount each time the card changes
  useEffect(() => {
    if (currentJob) {
      setViewedCount(c => c + 1);
    }
  }, [index]);

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
    setIndex((i) => i + 1);
    setSwipedCount((c) => c + 1);
  };

  const handleButton = (dir: 'left' | 'right') => {
    if (index >= TOTAL) return;
    handleSwipe(dir);
  };

  const handleReset = () => {
    setIndex(0);
    setSwipedCount(0);
    setViewedCount(0);
  };

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: '#08080f', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      <LeftSidebar
        sidebarRef={sidebarRef}
        leftOpen={leftOpen}
        setLeftOpen={setLeftOpen}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        swipedCount={swipedCount}
        swipesLeft={swipesLeft}
        navItems={navItems}
        navRoutes={USER_NAV_ROUTES}
        accentColor="#FF4E6A"
        counterLabel="Daily swipes"
        counterLimit={15}
        profileName="John Doe"
        profileEmail="user@jobswipe.com"
        profileImage="/assets/images/img1.jpg"
        avatarRadius="50%"
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar
          title="Discover Jobs"
          subtitle={`${remaining} jobs remaining`}
        />
        <SwipeArea
          items={jobs}
          index={index}
          remaining={remaining}
          visibleItems={visibleJobs}
          lastAction={lastAction}
          accentColor="#FF4E6A"
          positiveAction={{
            label: 'Apply',
            icon: <IconHeart />,
            color: '#22C55E',
            gradient: 'linear-gradient(135deg, #22C55E, #16a34a)',
            toastLabel: '❤ Applied!',
            toastColor: '#22C55E',
            toastBorder: '#22C55E',
            toastBg: 'rgba(34,197,94,0.14)',
          }}
          negativeAction={{
            label: 'Pass',
            icon: <IconX />,
            color: '#FF4E6A',
            toastLabel: '✕ Skipped',
          }}
          resetLabel="Refresh Jobs"
          resetGradient="linear-gradient(135deg, #FF4E6A, #FF7854)"
          emptyTitle="You're all caught up!"
          emptyMessage="Check back later for new opportunities"
          renderCard={(job, stackIdx, isTop) => (
            <SwipeCard
              key={(job as Job).id}
              job={job as Job}
              isTop={isTop}
              onSwipe={handleSwipe}
              zIndex={3 - stackIdx}
              scale={1 - stackIdx * 0.038}
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
        title="Job Details"
        subtitle={currentJob ? `${index + 1} of ${TOTAL}` : 'All done'}
        collapsedLabel="Details"
        hasItem={!!currentJob}
        emptyMessage="No more jobs to review"
        plan={plan}
        viewedCount={viewedCount}
        freeLimit={FREE_LIMIT}
        onUpgrade={() => router.push('/pricing')}
        detailPanel={
          currentJob ? (
            <DetailPanel
              key={currentJob.id}
              job={currentJob}
              onApply={() => handleButton('right')}
              onSkip={() => handleButton('left')}
            />
          ) : null
        }
      />
    </div>
  );
}