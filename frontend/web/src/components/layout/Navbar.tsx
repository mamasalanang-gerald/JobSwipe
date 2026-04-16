'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const features = document.getElementById('features');
      const navEl = document.querySelector('nav');
      if (!features || !navEl) return;
      const featuresTop = features.getBoundingClientRect().top;
      setHidden(featuresTop <= navEl.offsetHeight);
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        hidden ? 'opacity-0 pointer-events-none -translate-y-2' : 'opacity-100 translate-y-0'
      }`}
      style={{
        background: scrolled
          ? 'rgba(0,0,0,0.85)'
          : 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 70%, transparent 100%)',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-16">
          <span className="text-xl font-bold text-white tracking-tight">
            <span className="text-[#FF4E6A]">●</span> JobSwipe
          </span>
          <div className="hidden md:flex space-x-8">
            {['Features', 'How It Works', 'For Companies', 'Download'].map(l => (
              <Link
                key={l}
                href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                className="text-white/90 hover:text-[#FF4E6A] text-sm font-medium transition-colors duration-200 no-underline relative group"
              >
                {l}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF4E6A] group-hover:w-full transition-all duration-200" />
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-white font-semibold text-sm px-4 py-2 rounded-full border border-white/30 hover:border-white hover:bg-white/10 transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-gradient-to-r from-[#FF4E6A] to-[#FF7854] text-white rounded-full px-5 py-2 text-sm font-semibold hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}