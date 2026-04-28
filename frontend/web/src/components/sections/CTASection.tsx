'use client';
import React, { useRef, useState } from 'react';
import SectionContainer from '@/components/ui/SectionContainer';
import LinkButton from '@/components/ui/LinkButton';

export default function CTASection() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <SectionContainer>
      <style>{`
        @keyframes ctaPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%       { opacity: 0.6;  transform: scale(1.08); }
        }
        @keyframes float1 { 0%,100% { transform: translateY(0px);   } 50% { transform: translateY(-12px); } }
        @keyframes float2 { 0%,100% { transform: translateY(-8px);  } 50% { transform: translateY(6px);   } }
        @keyframes float3 { 0%,100% { transform: translateY(4px);   } 50% { transform: translateY(-10px); } }
        @keyframes ctaFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          borderRadius: '28px',
          padding: 'clamp(48px, 8vw, 80px) clamp(24px, 6vw, 64px)',
          textAlign: 'center',
          overflow: 'hidden',
          background: hovered
            ? 'rgba(255,78,106,0.07)'
            : 'rgba(255,255,255,0.03)',
          border: hovered
            ? '1px solid rgba(255,78,106,0.4)'
            : '1px solid rgba(255,255,255,0.08)',
          transform: hovered ? 'scale(1.008)' : 'scale(1)',
          boxShadow: hovered
            ? '0 32px 80px rgba(255,78,106,0.18), 0 0 0 1px rgba(255,78,106,0.1) inset'
            : '0 8px 40px rgba(0,0,0,0.2)',
          transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
          cursor: 'default',
          animationName: 'ctaFadeUp',
          animationDuration: '0.6s',
          animationTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
          animationFillMode: 'both',
        }}
      >
        {/* Pulsing glow orbs */}
        <div style={{
          position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,78,106,0.22) 0%, transparent 70%)',
          animation: 'ctaPulse 4s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', right: '-40px',
          width: '260px', height: '260px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,120,84,0.15) 0%, transparent 70%)',
          animation: 'ctaPulse 5s ease-in-out infinite 1s',
          pointerEvents: 'none',
        }} />

        {/* Mouse spotlight */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.35s',
          background: `radial-gradient(380px circle at ${mouse.x}% ${mouse.y}%, rgba(255,78,106,0.1) 0%, transparent 65%)`,
        }} />

        {/* Floating decorative dots */}
        {[
          { size: 6,  top: '18%', left: '8%',  anim: 'float1', delay: '0s',    opacity: 0.25 },
          { size: 4,  top: '70%', left: '12%', anim: 'float2', delay: '0.8s',  opacity: 0.18 },
          { size: 8,  top: '25%', right: '9%', anim: 'float3', delay: '0.4s',  opacity: 0.2  },
          { size: 5,  top: '72%', right: '7%', anim: 'float1', delay: '1.2s',  opacity: 0.22 },
          { size: 3,  top: '45%', left: '5%',  anim: 'float2', delay: '0.2s',  opacity: 0.15 },
          { size: 3,  top: '50%', right: '5%', anim: 'float3', delay: '1s',    opacity: 0.15 },
        ].map((dot, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${dot.size}px`, height: `${dot.size}px`,
            borderRadius: '50%',
            background: '#FF4E6A',
            top: dot.top,
            left: (dot as any).left,
            right: (dot as any).right,
            opacity: dot.opacity,
            animation: `${dot.anim} ${3 + i * 0.4}s ease-in-out infinite`,
            animationDelay: dot.delay,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,78,106,0.1)', border: '1px solid rgba(255,78,106,0.25)',
            borderRadius: '999px', padding: '5px 14px', marginBottom: '24px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF4E6A', display: 'inline-block', animation: 'ctaPulse 2s ease-in-out infinite' }} />
            <span style={{ color: '#FF4E6A', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Start for free
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            marginBottom: '16px',
          }}>
            Ready to Find Your<br />
            <span style={{ color: '#FF4E6A' }}>Dream Job?</span>
          </h2>

          <p style={{
            fontSize: 'clamp(14px, 1.5vw, 17px)',
            color: 'rgba(255,255,255,0.48)',
            maxWidth: '460px',
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}>
            Join thousands of professionals who&apos;ve already found their perfect match. No credit card required.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <LinkButton href="/signup" size="lg">
              Get Started Free
            </LinkButton>
            <LinkButton href="#features" variant="outline" size="lg">
              See How It Works
            </LinkButton>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', marginTop: '20px' }}>
            ✓ Free forever plan &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Cancel anytime
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}