'use client';
import React, { useRef, useState } from 'react';

interface FeatureCardProps {
  icon?: React.ReactNode;
  index?: number;
  title: string;
  description: string;
  showConnector?: boolean;
  delay?: number;
}

export default function FeatureCard({
  icon,
  index,
  title,
  description,
  showConnector = false,
  delay = 0,
}: FeatureCardProps) {
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

  const label = index !== undefined ? String(index + 1).padStart(2, '0') : null;

  return (
    <>
      <style>{`
        @keyframes cardFadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fcard-accent { width: 0%; transition: width 0.4s cubic-bezier(0.22,1,0.36,1); }
        .fcard:hover .fcard-accent { width: 55% !important; }
        .fcard-num { transition: color 0.2s, transform 0.2s; }
        .fcard:hover .fcard-num { color: #FF4E6A !important; transform: scale(1.18) !important; }
        .fcard-title { transition: color 0.2s; }
        .fcard:hover .fcard-title { color: #ffffff !important; }
        .fcard-desc { transition: color 0.2s; }
        .fcard:hover .fcard-desc { color: rgba(255,255,255,0.65) !important; }
        .fcard-iconbox { transition: background 0.25s, border-color 0.25s, transform 0.25s; }
        .fcard:hover .fcard-iconbox {
          background: rgba(255,78,106,0.2) !important;
          border-color: rgba(255,78,106,0.55) !important;
          transform: scale(1.1) rotate(-4deg) !important;
        }
        .fcard-connector { transition: background 0.25s; }
        .fcard:hover .fcard-connector { background: rgba(255,78,106,0.5) !important; }
      `}</style>

      <div
        ref={cardRef}
        className="fcard"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          borderRadius: '18px',
          padding: '28px',
          cursor: 'default',
          userSelect: 'none',
          animationName: 'cardFadeUp',
          animationDuration: '0.55s',
          animationTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
          animationFillMode: 'both',
          animationDelay: `${delay}ms`,
          background: hovered ? 'rgba(255,78,106,0.055)' : 'rgba(255,255,255,0.03)',
          border: hovered
            ? '1px solid rgba(255,78,106,0.38)'
            : '1px solid rgba(255,255,255,0.08)',
          transform: hovered ? 'translateY(-7px) scale(1.025)' : 'translateY(0) scale(1)',
          boxShadow: hovered
            ? '0 24px 64px rgba(255,78,106,0.16), 0 0 0 1px rgba(255,78,106,0.15) inset'
            : '0 0 0 transparent',
          transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s, border-color 0.28s, background 0.28s',
          overflow: 'hidden',
        }}
      >
        {/* Mouse-tracking radial spotlight */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s',
            background: `radial-gradient(220px circle at ${mouse.x}% ${mouse.y}%, rgba(255,78,106,0.13) 0%, transparent 70%)`,
          }}
        />

        {/* Connector for step flow */}
        {showConnector && (
          <div
            className="hidden md:block absolute fcard-connector"
            style={{
              top: '42px',
              left: 'calc(100% + 2px)',
              width: '16px',
              height: '1px',
              background: 'rgba(255,255,255,0.1)',
              zIndex: 10,
            }}
          />
        )}

        {/* Number badge */}
        {label && (
          <p
            className="fcard-num"
            style={{
              color: hovered ? '#FF4E6A' : 'rgba(255,78,106,0.5)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              marginBottom: '18px',
              display: 'inline-block',
              transform: hovered ? 'scale(1.18)' : 'scale(1)',
              transformOrigin: 'left center',
            }}
          >
            {label}
          </p>
        )}

        {/* Icon box */}
        {icon && index === undefined && (
          <div
            className="fcard-iconbox"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(255,78,106,0.08)',
              border: '1px solid rgba(255,78,106,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              fontSize: '20px',
            }}
          >
            {icon}
          </div>
        )}

        {/* Title */}
        <h3
          className="fcard-title"
          style={{
            color: hovered ? '#ffffff' : 'rgba(255,255,255,0.82)',
            fontWeight: 600,
            fontSize: '14px',
            marginBottom: '10px',
            lineHeight: 1.35,
          }}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className="fcard-desc"
          style={{
            color: hovered ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.36)',
            fontSize: '12.5px',
            lineHeight: 1.72,
            margin: 0,
          }}
        >
          {description}
        </p>

        {/* Bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            height: '2px',
            borderRadius: '2px 2px 0 0',
            background: 'linear-gradient(90deg, #FF4E6A, #FF7854)',
            width: hovered ? '60%' : '0%',
            transition: 'width 0.4s cubic-bezier(0.22,1,0.36,1)',
          }}
        />
      </div>
    </>
  );
}