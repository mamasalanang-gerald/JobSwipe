import React from 'react';

export default function CTASection() {
  return (
    <section className="bg-black py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-8 py-16 text-center hover:border-[#FF4E6A]/20 transition-all duration-200">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Find Your Dream Job?
          </h2>
          <p className="text-lg text-white/50 mb-10">
            Join thousands of professionals who&apos;ve already found their perfect match
          </p>
          <button className="bg-gradient-to-r from-[#FF4E6A] to-[#FF7854] text-white rounded-full px-10 py-4 text-lg font-semibold hover:opacity-90 transition shadow-lg">
            Get Started Free
          </button>
        </div>
      </div>
    </section>
  );
}