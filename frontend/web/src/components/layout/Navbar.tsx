'use client';
import React, { useEffect, useState } from 'react';
import NavLink from '@/components/ui/NavLink';
import LinkButton from '@/components/ui/LinkButton';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'For Companies', href: '#for-companies' },
  { label: 'Download', href: '#download' },
];

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
        hidden
          ? 'opacity-0 pointer-events-none -translate-y-2'
          : 'opacity-100 translate-y-0'
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
          {/* Logo */}
          <span className="text-xl font-bold text-white tracking-tight">
            <span className="text-[#FF4E6A]">●</span> JobSwipe
          </span>

          {/* Nav links */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map(({ label, href }) => (
              <NavLink key={label} href={href}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <LinkButton href="/login" variant="outline" size="sm">
              Sign In
            </LinkButton>
            <LinkButton href="/signup" variant="primary" size="sm">
              Get Started
            </LinkButton>
          </div>
        </div>
      </div>
    </nav>
  );
}