import React from 'react';
import Head from 'next/head';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import StatsSection from '@/components/sections/StatsSection';
import CTASection from '@/components/sections/CTASection';

export default function Home() {
  return (
    <>
      <Head>
        <title>JobSwipe - Swipe Your Way to Your Dream Job</title>
        <meta name="description" content="The modern way to find your perfect job. Swipe right on opportunities, swipe left on what doesn't fit. Your career journey starts here." />
      </Head>

      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="relative">
          <div className="sticky top-0 h-screen">
            <HeroSection />
          </div>
          <div className="relative z-10">
            <FeaturesSection />
            <HowItWorksSection />
            <StatsSection />
            <CTASection />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}