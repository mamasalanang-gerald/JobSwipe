import React from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="border border-gray-100 rounded-xl p-6 bg-white hover:shadow-sm transition">
      <div className="w-11 h-11 rounded-lg bg-rose-50 flex items-center justify-center text-lg mb-4">
        {icon}
      </div>
      <h3 className="text-base font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}