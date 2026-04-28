import React from 'react';

interface ProfileGridProps {
  images: string[];
  /** Total number of tiles to fill the grid (default: 24) */
  tileCount?: number;
}

/**
 * Renders a rotated background grid of profile image tiles.
 * Extracted from HeroSection — purely presentational.
 */
export default function ProfileGrid({
  images,
  tileCount = 24,
}: ProfileGridProps) {
  const tiles = Array.from({ length: tileCount });

  return (
    <div
      className="absolute inset-0 grid gap-3 p-3 opacity-80"
      style={{
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        transform: 'rotate(6deg) translateX(1%) scale(1)',
      }}
    >
      {tiles.map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden relative">
          <img
            src={images[i % images.length]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ))}
    </div>
  );
}