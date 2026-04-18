'use client';
import { useEffect, useState } from 'react';

/**
 * Returns a 0–1 progress value based on how far the user has scrolled
 * within a configurable vertical window of the viewport height.
 *
 * @param startFraction  - scroll position (as fraction of vh) where progress begins (default 0.05)
 * @param endFraction    - scroll position (as fraction of vh) where progress reaches 1 (default 0.4)
 */
export function useScrollProgress(
  startFraction = 0.05,
  endFraction = 0.4
): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const start = vh * startFraction;
      const end = vh * endFraction;
      const p = Math.min(1, Math.max(0, (scrollY - start) / (end - start)));
      setProgress(p);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [startFraction, endFraction]);

  return progress;
}