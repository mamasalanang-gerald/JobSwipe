import React from 'react';
import FeatureCard from '@/components/ui/FeatureCard';
import SectionContainer from '@/components/ui/SectionContainer';

const features = [
  {
    icon: '👆',
    title: 'Swipe to Match',
    description:
      'Intuitive swipe interface makes job hunting fun and efficient. Right for yes, left for no.',
  },
  {
    icon: '🎯',
    title: 'Smart Matching',
    description:
      'Our AI learns your preferences and shows you jobs that truly match your skills and interests.',
  },
  {
    icon: '⚡',
    title: 'Instant Apply',
    description:
      'Apply to jobs with one tap. Your profile is always ready, no repetitive forms.',
  },
  {
    icon: '💬',
    title: 'Direct Chat',
    description:
      'Connect directly with hiring managers. No middlemen, no delays.',
  },
  {
    icon: '📊',
    title: 'Track Progress',
    description:
      'See all your applications in one place. Know exactly where you stand.',
  },
  {
    icon: '🔒',
    title: 'Privacy First',
    description:
      "Your data is yours. We never share your information without permission.",
  },
];

export default function FeaturesSection() {
  return (
    <SectionContainer
      id="features"
      title="Why JobSwipe?"
      subtitle="Modern job hunting for the modern professional"
    >
      <div className="grid md:grid-cols-3 gap-4">
        {features.map((feature, i) => (
          <FeatureCard
            key={feature.title}
            index={i}
            title={feature.title}
            description={feature.description}
            delay={i * 70}
          />
        ))}
      </div>
    </SectionContainer>
  );
}