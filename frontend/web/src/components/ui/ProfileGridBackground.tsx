import React from 'react';

const profileImages = [
  '/assets/images/img1.jpg',
  '/assets/images/img2.jpg',
  '/assets/images/img3.jpg',
  '/assets/images/img4.jpg',
];

export default function ProfileGridBackground() {
  return (
    <div
      className="absolute inset-0 grid gap-3 p-3 opacity-80"
      style={{
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridTemplateRows: 'repeat(7, 1fr)',
        transform: 'rotate(6deg) translateX(1%) scale(1)',
      }}
    >
      {Array.from({ length: 35 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden relative bg-white/5"
        >
          <img
            src={profileImages[i % profileImages.length]}
            alt="profile"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ))}
    </div>
  );
}