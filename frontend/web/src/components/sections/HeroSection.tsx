'use client';
import React, { useEffect, useState } from 'react';

const mockProfiles = [
  { name: 'Alex', role: 'Software Engineer', bg: 'from-stone-600 to-stone-800' },
  { name: 'Maria', role: 'Product Manager', bg: 'from-amber-700 to-amber-900' },
  { name: 'James', role: 'UX Designer', bg: 'from-teal-600 to-teal-800' },
  { name: 'Sofia', role: 'Data Analyst', bg: 'from-rose-700 to-rose-900' },
  { name: 'Luca', role: 'DevOps Eng.', bg: 'from-slate-600 to-slate-800' },
  { name: 'Hana', role: 'ML Engineer', bg: 'from-indigo-600 to-indigo-800' },
  { name: 'Carlos', role: 'iOS Developer', bg: 'from-orange-600 to-orange-800' },
  { name: 'Priya', role: 'Backend Dev', bg: 'from-cyan-600 to-cyan-800' },
  { name: 'Noah', role: 'Full Stack', bg: 'from-violet-600 to-violet-800' },
  { name: 'Yui', role: 'Frontend Dev', bg: 'from-lime-600 to-lime-800' },
  { name: 'Ben', role: 'Security Eng.', bg: 'from-yellow-600 to-yellow-800' },
  { name: 'Nina', role: 'QA Engineer', bg: 'from-pink-600 to-pink-800' },
  { name: 'Omar', role: 'Cloud Architect', bg: 'from-sky-600 to-sky-800' },
  { name: 'Ella', role: 'Scrum Master', bg: 'from-fuchsia-600 to-fuchsia-800' },
  { name: 'Jin', role: 'Data Engineer', bg: 'from-emerald-600 to-emerald-800' },
  { name: 'Rosa', role: 'UI Designer', bg: 'from-red-600 to-red-800' },
  { name: 'Kai', role: 'Web Developer', bg: 'from-blue-600 to-blue-800' },
  { name: 'Mia', role: 'Tech Lead', bg: 'from-purple-600 to-purple-800' },
  { name: 'Ryo', role: 'Site Reliability', bg: 'from-green-600 to-green-800' },
  { name: 'Isla', role: 'Product Designer', bg: 'from-pink-500 to-pink-800' },
  { name: 'Dani', role: 'Android Dev', bg: 'from-teal-500 to-teal-800' },
  { name: 'Leo', role: 'Game Developer', bg: 'from-orange-500 to-orange-800' },
  { name: 'Zoe', role: 'React Developer', bg: 'from-indigo-500 to-indigo-800' },
  { name: 'Sam', role: 'Systems Eng.', bg: 'from-slate-500 to-slate-800' },
];

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

  return (
    <section className="relative h-full bg-black flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 grid gap-3 p-3 opacity-70"
        style={{
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
          transform: 'rotate(6deg) translateX(1%) scale(1)',
        }}
      >
        {mockProfiles.map((p, i) => (
          <div
            key={p.name}
            className="rounded-xl overflow-hidden relative flex flex-col justify-end"
          >
            <img
              src={profileImages[i % profileImages.length]}
              alt={p.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="relative z-10 p-2">
              <p className="text-white text-[11px] font-medium">{p.name}</p>
              <p className="text-white/70 text-[10px]">{p.role}</p>
              <div className="flex gap-1.5 mt-1">
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-red-400 text-[9px]">✕</span>
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[#FF4E6A] text-[9px]">♥</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70 z-[1]" />

      <div
        className="relative z-10 text-center px-4"
        style={{
          opacity: 1 - progress,
          transform: `translateY(${-progress * 60}px)`,
          willChange: 'opacity, transform',
        }}
      >
        <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight mb-7">
          Swipe Right<sup className="text-2xl align-super">™</sup><br />on Your Career
        </h1>
        <button className="bg-gradient-to-r from-[#FF4E6A] to-[#FF7854] text-white rounded-full px-10 py-4 text-lg font-semibold hover:opacity-90 transition shadow-lg">
          Create account
        </button>
      </div>
    </section>
  );
}