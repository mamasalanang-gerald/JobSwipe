import React from 'react';

export interface StatCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export default function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
      {icon && <div className="flex justify-center mb-2 text-[#FF4E6A]">{icon}</div>}

      <div className="text-white text-3xl font-bold">{value}</div>
      <div className="text-white/50 text-sm">{label}</div>
    </div>
  );
}