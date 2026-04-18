import React from 'react';
import Button from '@/components/ui/Button';
import SectionContainer from '@/components/ui/SectionContainer';

export default function CTASection() {
  return (
    <SectionContainer>
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-8 py-16 text-center hover:border-[#FF4E6A]/20 transition-all duration-200 flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Ready to Find Your Dream Job?
        </h2>
        <p className="text-lg text-white/50 mb-10">
          Join thousands of professionals who&apos;ve already found their perfect match
        </p>
        <div className="flex justify-center">
          <Button size="lg">Get Started Free</Button>
        </div>
      </div>
    </SectionContainer>
  );
}