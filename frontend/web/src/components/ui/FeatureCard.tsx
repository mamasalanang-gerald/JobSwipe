import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
      <div className="w-11 h-11 rounded-xl bg-[#FF4E6A]/10 border border-[#FF4E6A]/20 flex items-center justify-center mb-4 text-[#FF4E6A]">
        {icon}
      </div>

      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{description}</p>
    </div>
  );
}