import React from 'react';
import Link from 'next/link';

export interface LinkButtonProps {
  href: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

const variants = {
  primary:
    'bg-gradient-to-r from-[#FF4E6A] to-[#FF7854] text-white hover:opacity-90 shadow-lg',
  secondary:
    'bg-white/10 text-white hover:bg-white/20 border border-white/20',
  outline:
    'border border-white/30 text-white hover:border-white hover:bg-white/10',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2 text-sm',
  lg: 'px-10 py-4 text-lg',
};

export default function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-full font-semibold transition-all duration-200
        hover:scale-105 active:scale-[0.98]
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {children}
    </Link>
  );
}