import React from 'react';
import FeatureCard from '@/components/ui/FeatureCard';

const features = [
  {
    icon: '👆',
    title: 'Swipe to Match',
    description: 'Intuitive swipe interface makes job hunting fun and efficient. Right for yes, left for no.',
  },
  {
    icon: '🎯',
    title: 'Smart Matching',
    description: 'Our AI learns your preferences and shows you jobs that truly match your skills and interests.',
  },
  {
    icon: '⚡',
    title: 'Instant Apply',
    description: 'Apply to jobs with one tap. Your profile is always ready, no repetitive forms.',
  },
  {
    icon: '💬',
    title: 'Direct Chat',
    description: 'Connect directly with hiring managers. No middlemen, no delays.',
  },
  {
    icon: '📊',
    title: 'Track Progress',
    description: 'See all your applications in one place. Know exactly where you stand.',
  },
  {
    icon: '🔒',
    title: 'Privacy First',
    description: 'Your data is yours. We never share your information without permission.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-black py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why JobSwipe?</h2>
          <p className="text-lg text-white/50">Modern job hunting for the modern professional</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 hover:bg-white/[0.07] hover:border-[#FF4E6A]/40 transition-all duration-200"
            >
              <p className="text-[#FF4E6A] text-[11px] font-medium tracking-widest mb-5">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="text-white font-medium text-sm mb-2">{feature.title}</h3>
              <p className="text-white/45 text-xs leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}