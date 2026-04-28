import React from 'react';

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  active?: boolean;
}

export default function StepCard({
  step,
  title,
  description,
  active = false,
}: StepCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 border transition ${
        active
          ? 'bg-[#FF4E6A]/10 border-[#FF4E6A]/40'
          : 'bg-white/5 border-white/10'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${
            active
              ? 'bg-[#FF4E6A] text-white'
              : 'bg-white/10 text-white/70'
          }`}
        >
          {step}
        </div>

        <h3 className="text-white font-semibold">{title}</h3>
      </div>

      <p className="text-white/50 text-sm">{description}</p>
    </div>
  );
}