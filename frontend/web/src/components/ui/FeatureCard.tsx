import React from 'react';

interface FeatureCardProps {
  /** Emoji/icon shown in icon-box mode (when no `index` is provided) */
  icon?: React.ReactNode;
  /** When provided, renders a number badge instead of the icon box */
  index?: number;
  title: string;
  description: string;
  /** Optional connector line shown to the right of the card (used in step flows) */
  showConnector?: boolean;
}

export default function FeatureCard({
  icon,
  index,
  title,
  description,
  showConnector = false,
}: FeatureCardProps) {
  return (
    <div className="relative bg-white/[0.04] border border-white/10 rounded-2xl p-7 hover:bg-white/[0.07] hover:border-[#FF4E6A]/40 transition-all duration-200">
      {/* Connector line (step flow only) */}
      {showConnector && (
        <div className="hidden md:block absolute top-[42px] left-[calc(100%+2px)] w-4 h-px bg-white/10 z-10" />
      )}

      {/* Number badge mode */}
      {index !== undefined && (
        <p className="text-[#FF4E6A] text-[11px] font-medium tracking-widest mb-5">
          {String(index + 1).padStart(2, '0')}
        </p>
      )}

      {/* Icon box mode */}
      {icon && index === undefined && (
        <div className="w-11 h-11 rounded-xl bg-[#FF4E6A]/10 border border-[#FF4E6A]/20 flex items-center justify-center mb-4 text-[#FF4E6A]">
          {icon}
        </div>
      )}

      <h3 className="text-white font-medium text-sm mb-2">{title}</h3>
      <p className="text-white/45 text-xs leading-relaxed">{description}</p>
    </div>
  );
}