'use client';
import React, { useState, useRef, useEffect } from 'react';
import { jobs, TOTAL } from '../../data/jobs';
import LeftSidebar from '../../components/ui/LeftSidebar';
import RightSidebar from '../../components/ui/RightSidebar';
import TopBar from '../../components/ui/TopBar';
import SwipeArea from '../../components/ui/SwipeArea';

export default function SwipeHomePage() {
  const [index, setIndex] = useState(0);
  const [swipedCount, setSwipedCount] = useState(0);
  const [lastAction, setLastAction] = useState<'like' | 'nope' | null>(null);
  const [activeNav, setActiveNav] = useState('home');
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const sidebarRef = useRef<HTMLElement>(null);

  const remaining = TOTAL - index;
  const swipesLeft = Math.max(0, 15 - swipedCount);
  const currentJob = jobs[index] ?? null;
  const visibleJobs = jobs.slice(index, index + 3);

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
    setLastAction(dir === 'right' ? 'like' : 'nope');
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
      />

      {/* Center */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar remaining={remaining} />
        <SwipeArea
          jobs={jobs}
          index={index}
          remaining={remaining}
          visibleJobs={visibleJobs}
          lastAction={lastAction}
          onSwipe={handleSwipe}
          onButton={handleButton}
          onReset={handleReset}
        />
      </main>

      <RightSidebar
          rightOpen={rightOpen}
          setRightOpen={setRightOpen}
          currentJob={currentJob}
          index={index}
          total={TOTAL}
          onApply={() => handleButton('right')}
          onSkip={() => handleButton('left')}
        />

    </div>
  );
}