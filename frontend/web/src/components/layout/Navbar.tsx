'use client';
import React, { useEffect, useState } from 'react';

export default function Navbar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const features = document.getElementById('features');
      const nav = document.querySelector('nav');
      if (!features || !nav) return;
      const featuresTop = features.getBoundingClientRect().top;
      setHidden(featuresTop <= nav.offsetHeight);
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
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-16">
          <span className="text-xl font-medium text-white">
            <span className="text-[#FF4E6A]">●</span> JobSwipe
          </span>
          <div className="hidden md:flex space-x-8">
            {['Features', 'How It Works', 'For Companies', 'Download'].map(l => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                className="text-white/80 hover:text-white text-sm transition no-underline"
              >
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="text-white text-sm font-medium px-2">Sign In</button>
            <button className="bg-white text-black rounded-full px-5 py-2 text-sm font-medium hover:bg-gray-100 transition">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}