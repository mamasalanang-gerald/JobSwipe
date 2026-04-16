'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const profileImages = [
  '/assets/images/img1.jpg',
  '/assets/images/img2.jpg',
  '/assets/images/img3.jpg',
  '/assets/images/img4.jpg',
];

export default function HeroSection() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const start = vh * 0.05;
      const end = vh * 0.4;
      const p = Math.min(1, Math.max(0, (scrollY - start) / (end - start)));
      setProgress(p);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Create enough tiles to fill grid (6 x 4 = 24)
  const tiles = Array.from({ length: 24 });

  return (
    <section className="relative h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 grid gap-3 p-3 opacity-80"
        style={{
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
          transform: 'rotate(6deg) translateX(1%) scale(1)',
        }}
      >
        {tiles.map((_, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden relative"
          >
            <img
              src={profileImages[i % profileImages.length]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Optional overlay for better contrast */}
            <div className="absolute inset-0 bg-black/30" />
          </div>
        ))}
      </div>

      {/* Overlays */}
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
          Swipe Right<sup className="text-2xl align-super">™</sup><br />on Your Career
        </h1>
        <p className="text-white/70 text-lg mb-7">
          Find jobs that match you. Instantly.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-gradient-to-r from-[#FF4E6A] to-[#FF7854] text-white rounded-full px-10 py-4 text-lg font-semibold hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Create account
          </Link>
        </div>
      </div>
    </section>
  );
}