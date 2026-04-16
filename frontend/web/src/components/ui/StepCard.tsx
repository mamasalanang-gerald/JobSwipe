import React from 'react';

interface StepCardProps {
  step: number;
  title: string;
  description: string;
}

export default function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4E6A] to-[#FF7854] text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
        {step}
      </div>
      <h3 className="text-base font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}