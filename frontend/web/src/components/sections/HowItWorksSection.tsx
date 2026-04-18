import React from 'react';
import FeatureCard from '@/components/ui/FeatureCard';
import SectionContainer from '@/components/ui/SectionContainer';

const steps = [
  {
    title: 'Create Your Profile',
    description:
      "Sign up in minutes. Add your skills, experience, and what you're looking for.",
  },
  {
    title: 'Start Swiping',
    description:
      "Browse personalized job matches. Swipe right on jobs you love, left on ones you don't.",
  },
  {
    title: 'Get Hired',
    description:
      'When you match with a company, chat directly and schedule interviews. Land your dream job!',
  },
];

export default function HowItWorksSection() {
  return (
    <SectionContainer
      id="how-it-works"
      title="How It Works"
      subtitle="Get started in 3 simple steps"
    >
      <div className="grid md:grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <FeatureCard
            key={step.title}
            index={i}
            title={step.title}
            description={step.description}
            showConnector={i < steps.length - 1}
          />
        ))}
      </div>
    </SectionContainer>
  );
}