import React from 'react';

const steps = [
  {
    step: 1,
    title: 'Create Your Profile',
    description: 'Sign up in minutes. Add your skills, experience, and what you\'re looking for.',
  },
  {
    step: 2,
    title: 'Start Swiping',
    description: 'Browse personalized job matches. Swipe right on jobs you love, left on ones you don\'t.',
  },
  {
    step: 3,
    title: 'Get Hired',
    description: 'When you match with a company, chat directly and schedule interviews. Land your dream job!',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-black py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-lg text-white/50">Get started in 3 simple steps</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className="relative bg-white/[0.04] border border-white/10 rounded-2xl p-7 hover:bg-white/[0.07] hover:border-[#FF4E6A]/40 transition-all duration-200"
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-[42px] left-[calc(100%+2px)] w-4 h-px bg-white/10 z-10" />
              )}
              <p className="text-[#FF4E6A] text-[11px] font-medium tracking-widest mb-5">
                {String(step.step).padStart(2, '0')}
              </p>
              <h3 className="text-white font-medium text-sm mb-2">{step.title}</h3>
              <p className="text-white/45 text-xs leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}