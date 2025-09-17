'use client';

import { useEffect } from 'react';

// Type definition for PerformanceEventTiming
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  processingEnd: number;
  cancelable: boolean;
}

export default function PerformanceMonitor() {
  useEffect(() => {
    // Preload critical resources
    const preloadResources = () => {
      // Preload the logo
      const logoLink = document.createElement('link');
      logoLink.rel = 'preload';
      logoLink.as = 'image';
      logoLink.href = '/logo.png';
      document.head.appendChild(logoLink);

      // Preload critical fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.as = 'font';
      fontLink.type = 'font/woff2';
      fontLink.crossOrigin = 'anonymous';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Helvetica+Neue:wght@400;500;600;700&display=swap';
      document.head.appendChild(fontLink);
    };

    // Monitor Core Web Vitals
    const measureWebVitals = () => {
      // LCP (Largest Contentful Paint)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay) / INP (Interaction to Next Paint)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if ('processingStart' in entry) {
            const eventEntry = entry as PerformanceEventTiming;
            console.log('INP:', eventEntry.processingStart - eventEntry.startTime);
          }
        });
      }).observe({ entryTypes: ['event'] });

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            console.log('CLS:', clsValue);
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
    };

    // Preload resources immediately
    preloadResources();

    // Monitor performance after page load
    if (typeof window !== 'undefined') {
      measureWebVitals();
    }

    // Preload export libraries when user hovers over export buttons
    const preloadExportLibraries = () => {
      import('jspdf');
    };

    // Preload on user interaction
    const handleUserInteraction = () => {
      preloadExportLibraries();
      document.removeEventListener('mousedown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('mousedown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('mousedown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  return null;
}
