'use client';
import React, { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 10000, suffix: 'K+', divisor: 1000, label: 'Active Jobs' },
  { value: 5000,  suffix: 'K+', divisor: 1000, label: 'Companies' },
  { value: 50000, suffix: 'K+', divisor: 1000, label: 'Job Seekers' },
  { value: 95,    suffix: '%',  divisor: 1,    label: 'Match Rate' },
];

function useCountUp(target: number, duration = 1800, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}

function StatCard({
  value, suffix, divisor, label, delay, active,
}: {
  value: number; suffix: string; divisor: number; label: string;
  delay: number; active: boolean;
}) {
  const raw = useCountUp(value, 1800, active);
  const display = divisor > 1 ? (raw / divisor).toFixed(0) : raw;
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <style>{`
        @keyframes statFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          padding: '16px 12px',
          borderRadius: '20px',
          textAlign: 'center',
          background: hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
          border: hovered ? '1px solid rgba(255,255,255,0.55)' : '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(12px)',
          transform: hovered ? 'translateY(-8px) scale(1.04)' : 'translateY(0) scale(1)',
          boxShadow: hovered
            ? '0 24px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.15) inset'
            : '0 4px 20px rgba(0,0,0,0.1)',
          transition: 'all 0.28s cubic-bezier(0.22,1,0.36,1)',
          animationName: 'statFadeUp',
          animationDuration: '0.6s',
          animationTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
          animationFillMode: 'both',
          animationDelay: `${delay}ms`,
          cursor: 'default',
          overflow: 'hidden',
        }}
      >
        {/* Shimmer sweep on hover */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
          animation: hovered ? 'shimmer 0.7s ease forwards' : 'none',
        }} />
        <style>{`@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }`}</style>

        <p style={{
          fontSize: '28px', fontWeight: 800, color: 'white', lineHeight: 1,
          marginBottom: '4px', letterSpacing: '-0.02em',
          textShadow: '0 2px 12px rgba(0,0,0,0.15)',
        }}>
          {display}{suffix}
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', fontWeight: 500, letterSpacing: '0.04em' }}>
          {label}
        </p>
      </div>
    </>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ position: 'relative', padding: '80px 32px', overflow: 'hidden' }}>
      {/* Gradient background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #FF4E6A 0%, #FF7854 50%, #FF4E6A 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradShift 6s ease infinite',
      }} />
      <style>{`@keyframes gradShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }`}</style>

      {/* Noise texture overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: '-60px', right: '-20px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(50px)' }} />

      <div style={{ position: 'relative', maxWidth: '900px', margin: '0 auto' }}>
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '10px' }}>
            By the numbers
          </p>
          <h2 style={{ color: 'white', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Trusted by thousands
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 80} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}