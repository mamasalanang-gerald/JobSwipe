import React from 'react';

const stats = [
  { value: '10K+', label: 'Active jobs' },
  { value: '5K+', label: 'Companies' },
  { value: '50K+', label: 'Job seekers' },
  { value: '95%', label: 'Match rate' },
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#FF4E6A] to-[#FF7854] text-white">
      <div className="max-w-4xl mx-auto px-8 grid grid-cols-4 gap-8 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-4xl font-bold">{s.value}</p>
            <p className="text-sm text-white/80 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}