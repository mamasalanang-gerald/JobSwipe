'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const profileImages = [
  '/assets/images/img1.jpg',
  '/assets/images/img2.jpg',
  '/assets/images/img3.jpg',
  '/assets/images/img4.jpg',
];

const mockProfiles = [
  { name: 'Alex', role: 'Software Engineer' },
  { name: 'Maria', role: 'Product Manager' },
  { name: 'James', role: 'UX Designer' },
  { name: 'Sofia', role: 'Data Analyst' },
  { name: 'Luca', role: 'DevOps Eng.' },
  { name: 'Hana', role: 'ML Engineer' },
  { name: 'Carlos', role: 'iOS Developer' },
  { name: 'Priya', role: 'Backend Dev' },
  { name: 'Noah', role: 'Full Stack' },
  { name: 'Yui', role: 'Frontend Dev' },
  { name: 'Ben', role: 'Security Eng.' },
  { name: 'Nina', role: 'QA Engineer' },
  { name: 'Omar', role: 'Cloud Architect' },
  { name: 'Ella', role: 'Scrum Master' },
  { name: 'Jin', role: 'Data Engineer' },
  { name: 'Rosa', role: 'UI Designer' },
  { name: 'Kai', role: 'Web Developer' },
  { name: 'Mia', role: 'Tech Lead' },
  { name: 'Ryo', role: 'Site Reliability' },
  { name: 'Isla', role: 'Product Designer' },
  { name: 'Dani', role: 'Android Dev' },
  { name: 'Leo', role: 'Game Developer' },
  { name: 'Zoe', role: 'React Developer' },
  { name: 'Sam', role: 'Systems Eng.' },
];

export default function LoginSection() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleBack = () => {
    setExiting(true);
    setTimeout(() => router.back(), 320);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
  };

  const cardStyle: React.CSSProperties = {
    opacity: mounted && !exiting ? 1 : 0,
    transform: mounted && !exiting ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
    transition: 'opacity 0.38s cubic-bezier(0.4,0,0.2,1), transform 0.38s cubic-bezier(0.4,0,0.2,1)',
  };

  const backStyle: React.CSSProperties = {
    opacity: mounted && !exiting ? 1 : 0,
    transform: mounted && !exiting ? 'translateX(0)' : 'translateX(-14px)',
    transition: 'opacity 0.3s ease 0.12s, transform 0.3s ease 0.12s',
  };

  const inputClass =
    'bg-white/[0.08] border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-[#FF4E6A]/60 focus:bg-white/[0.12] transition-all duration-200';

  return (
    <section className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 grid gap-3 p-3 opacity-80"
        style={{
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
          transform: 'rotate(6deg) translateX(1%) scale(1)',
        }}
      >
        {mockProfiles.map((p, i) => (
          <div key={p.name} className="rounded-xl overflow-hidden relative">
            <img
              src={profileImages[i % profileImages.length]}
              alt={p.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        ))}
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/10 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 z-[1]" />

      {/* Back button */}
      <button
        onClick={handleBack}
        style={backStyle}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200 group"
        aria-label="Go back"
      >
        <span className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all duration-200">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className="text-sm font-medium hidden sm:block">Back</span>
      </button>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4" style={cardStyle}>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">

          <div className="mb-6">
            <span className="text-white text-2xl font-bold tracking-tight">
              Job<span className="text-[#FF4E6A]">Swipe</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-white/60 text-sm mb-6">Sign in to continue your career journey</p>

          <div className="flex gap-3 mb-5">
            <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-2.5 text-white text-sm font-medium transition-all duration-200 active:scale-95">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-2.5 text-white text-sm font-medium transition-all duration-200 active:scale-95">
              <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-white/40 text-xs">or continue with email</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={inputClass}
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className={`w-full pr-16 ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors duration-200 text-xs font-medium"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="flex justify-end -mt-1">
              <Link href="/forgot-password" className="text-[#FF4E6A] text-xs hover:opacity-80 transition font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-[#FF4E6A] to-[#FF7854] text-white rounded-full py-3 font-semibold text-sm hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg mt-1"
            >
              Sign in
            </button>
          </form>

          <p className="text-center text-white/50 text-sm mt-5">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#FF4E6A] hover:opacity-80 transition font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}