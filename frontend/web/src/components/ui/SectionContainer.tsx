import React from 'react';

interface SectionContainerProps {
  children: React.ReactNode;
  /** Renders a wrapping <section> with bg-black py-20 px-4 when true (default: true) */
  asSection?: boolean;
  /** Section id for anchor links */
  id?: string;
  /** Optional centered heading */
  title?: string;
  /** Optional centered subtitle below the heading */
  subtitle?: string;
  /** Max width constraint — defaults to max-w-5xl */
  maxWidth?: 'max-w-3xl' | 'max-w-5xl' | 'max-w-7xl';
}

export default function SectionContainer({
  children,
  asSection = true,
  id,
  title,
  subtitle,
  maxWidth = 'max-w-5xl',
}: SectionContainerProps) {
  const inner = (
    <div className={`${maxWidth} mx-auto`}>
      {(title || subtitle) && (
        <div className="text-center mb-16">
          {title && (
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-white/50">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );

  if (!asSection) return inner;

  return (
    <section id={id} className="bg-black py-20 px-4">
      {inner}
    </section>
  );
}