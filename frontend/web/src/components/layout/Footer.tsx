'use client';
import React, { useState } from 'react';

const footerLinks = [
  {
    title: 'Product',
    links: ['Features', 'Pricing', 'For Companies'],
  },
  {
    title: 'Company',
    links: ['About', 'Blog', 'Careers'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Contact'],
  },
];

const socialLinks = [
  {
    label: 'X',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'Facebook',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    label: 'LinkedIn',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    label: 'Instagram',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
];

function AppStoreButton({ type }: { type: 'apple' | 'google' }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="#"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        border: hovered ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.12)',
        borderRadius: '14px', padding: '10px 16px',
        background: hovered ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.25)' : 'none',
        transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)',
        textDecoration: 'none', width: 'fit-content',
      }}
    >
      {type === 'apple' ? (
        <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'white', flexShrink: 0 }}>
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'white', flexShrink: 0 }}>
          <path d="M3.18 23.76c.3.17.64.22.99.15l13.23-7.62-2.84-2.84-11.38 10.31zM20.7 10.26L17.6 8.46l-3.13 3.13 3.13 3.13 3.13-1.82a1.56 1.56 0 000-2.64zM2.01.36a1.56 1.56 0 00-.51 1.18v20.92c0 .47.19.9.51 1.18l.07.06 11.7-11.7v-.28L2.08.3l-.07.06zM14.45 11.41l3.14-3.14-11.4-6.58L14.45 11.41z" />
        </svg>
      )}
      <div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', lineHeight: 1, marginBottom: '3px' }}>
          {type === 'apple' ? 'Download on the' : 'Get it on'}
        </p>
        <p style={{ color: 'white', fontSize: '13px', fontWeight: 600, lineHeight: 1 }}>
          {type === 'apple' ? 'App Store' : 'Google Play'}
        </p>
      </div>
    </a>
  );
}

function SocialButton({ label, path }: { label: string; path: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="#"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: hovered ? 'rgba(255,78,106,0.15)' : 'rgba(255,255,255,0.05)',
        border: hovered ? '1px solid rgba(255,78,106,0.35)' : '1px solid rgba(255,255,255,0.09)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: hovered ? 'translateY(-3px) scale(1.1)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? '0 8px 20px rgba(255,78,106,0.2)' : 'none',
        transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)',
        textDecoration: 'none',
      }}
    >
      <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: hovered ? '#FF4E6A' : 'rgba(255,255,255,0.5)', transition: 'fill 0.22s' }}>
        <path d={path} />
      </svg>
    </a>
  );
}

function FooterLink({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <li>
      <a
        href="#"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          color: hovered ? 'white' : 'rgba(255,255,255,0.35)',
          fontSize: '13px',
          textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          transition: 'color 0.2s',
          paddingLeft: hovered ? '6px' : '0px',
          transition2: 'padding-left 0.2s',
        } as any}
      >
        <span style={{
          display: 'inline-block', width: '4px', height: '4px',
          borderRadius: '50%', background: '#FF4E6A',
          opacity: hovered ? 1 : 0, flexShrink: 0,
          transition: 'opacity 0.2s',
        }} />
        {label}
      </a>
    </li>
  );
}

export default function Footer() {
  return (
    <>
      <style>{`
        @keyframes footerFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <footer style={{
        background: '#08080f',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: '64px', paddingBottom: '32px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle top glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,78,106,0.4), transparent)',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '300px', height: '60px',
          background: 'radial-gradient(ellipse, rgba(255,78,106,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
            gap: '40px',
            marginBottom: '48px',
            animationName: 'footerFadeUp',
            animationDuration: '0.6s',
            animationTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
            animationFillMode: 'both',
          }}>

            {/* Brand column */}
            <div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ color: 'white', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  <span style={{ color: '#FF4E6A' }}>●</span> Job<span style={{ color: '#FF4E6A' }}>Swipe</span>
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', lineHeight: 1.65, marginBottom: '24px', maxWidth: '220px' }}>
                Swipe your way to your dream job. The modern career platform for modern professionals.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                <AppStoreButton type="apple" />
                <AppStoreButton type="google" />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {socialLinks.map((s) => (
                  <SocialButton key={s.label} label={s.label} path={s.path} />
                ))}
              </div>
            </div>

            {/* Link columns */}
            {footerLinks.map((section, colIdx) => (
              <div key={section.title} style={{
                animationName: 'footerFadeUp',
                animationDuration: '0.6s',
                animationDelay: `${(colIdx + 1) * 80}ms`,
                animationTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
                animationFillMode: 'both',
              }}>
                <h4 style={{
                  color: 'rgba(255,255,255,0.55)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '18px',
                }}>
                  {section.title}
                </h4>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {section.links.map((l) => (
                    <FooterLink key={l} label={l} />
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '12px',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', margin: 0 }}>
              © {new Date().getFullYear()} JobSwipe. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((l) => (
                <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                >{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}