import React from 'react';

type Props = {
  label: string;
  path: string;
};

export default function SocialIconButton({ label, path }: Props) {
  return (
    <a
      href="#"
      aria-label={label}
      className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 transition"
    >
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white/60 hover:fill-white">
        <path d={path} />
      </svg>
    </a>
  );
}