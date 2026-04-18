'use client';
import React, { useEffect, useState } from 'react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <ProfileGrid images={profileImages} />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/10 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 z-[1]" />

      {/* Animations */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Hero content */}
      <div
        className="relative z-10 text-center px-4"
        style={{
          opacity: 1 - progress,
          transform: `translateY(${-progress * 60}px)`,
        }}
      >
        <h1
          className="text-6xl md:text-7xl font-bold text-white leading-tight mb-4"
          style={{
            animation: mounted ? 'fadeUp 0.8s ease forwards' : 'none',
          }}
        >
          <span style={{ display: 'inline-block', animation: 'float 4s ease-in-out infinite' }}>
            Swipe Right
          </span>
          <sup className="text-2xl align-super">™</sup>
          <br />
          on Your Career
        </h1>

        <p
          className="text-white/70 text-lg mb-7"
          style={{
            animation: mounted ? 'fadeUp 0.8s ease forwards' : 'none',
            animationDelay: '0.2s',
            opacity: mounted ? 1 : 0,
          }}
        >
          Find jobs that match you. Instantly.
        </p>

        <div
          style={{
            animation: mounted ? 'fadeUp 0.8s ease forwards' : 'none',
            animationDelay: '0.4s',
            opacity: mounted ? 1 : 0,
          }}
        >
          <LinkButton href="/signup" size="lg">
            Create account
          </LinkButton>
        </div>
      </div>
    </section>
  );
}