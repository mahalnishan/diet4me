'use client';

import { useState, useRef, lazy, Suspense } from 'react';

// Lazy load heavy export libraries
const ExportPNGButton = lazy(() => import('./ExportPNGButton'));
const ExportPDFButton = lazy(() => import('./ExportPDFButton'));

interface ExportButtonsProps {
  planRef: React.RefObject<HTMLDivElement>;
  messagesLength: number;
}

export default function ExportButtons({ planRef, messagesLength }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (messagesLength === 0 || !planRef.current) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Suspense fallback={
        <div className="px-3 py-1.5 text-xs sm:text-sm rounded-md border border-slate-300 text-slate-700 opacity-50">
          Loading...
        </div>
      }>
        <ExportPNGButton 
          planRef={planRef} 
          isExporting={isExporting}
          setIsExporting={setIsExporting}
        />
        <ExportPDFButton 
          planRef={planRef} 
          isExporting={isExporting}
          setIsExporting={setIsExporting}
        />
      </Suspense>
    </div>
  );
}
