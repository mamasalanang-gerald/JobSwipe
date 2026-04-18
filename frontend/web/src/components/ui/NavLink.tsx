import React from 'react';
import Link from 'next/link';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="text-white/90 hover:text-[#FF4E6A] text-sm font-medium transition-colors duration-200 no-underline relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF4E6A] group-hover:w-full transition-all duration-200" />
    </Link>
  );
}