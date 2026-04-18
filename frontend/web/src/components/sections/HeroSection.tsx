'use client';
import React from 'react';
import LinkButton from '@/components/ui/LinkButton';
import ProfileGrid from '@/components/ui/ProfileGrid';
import { useScrollProgress } from '@/hooks/useScrollProgress';

const profileImages = [
  '/assets/images/img1.jpg',
  '/assets/images/img2.jpg',
  '/assets/images/img3.jpg',
  '/assets/images/img4.jpg',
];

export default function HeroSection() {
  const progress = useScrollProgress(0.05, 0.4);

  return (
    <section className="relative h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <ProfileGrid images={profileImages} />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/10 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 z-[1]" />

      {/* Hero content */}
      <div
        className="relative z-10 text-center px-4"
        style={{
          opacity: 1 - progress,
          transform: `translateY(${-progress * 60}px)`,
          willChange: 'opacity, transform',
        }}
      >
        <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight mb-4">
          Swipe Right<sup className="text-2xl align-super">™</sup>
          <br />
          on Your Career
        </h1>
        <p className="text-white/70 text-lg mb-7">
          Find jobs that match you. Instantly.
        </p>
        <LinkButton href="/signup" size="lg">
          Create account
        </LinkButton>
      </div>
    </section>
  );
}