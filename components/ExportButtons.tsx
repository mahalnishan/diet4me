'use client';

import { useState, useRef, useEffect } from 'react';
import ExportPDFButton from './ExportPDFButton';

interface ExportButtonsProps {
  planRef: React.RefObject<HTMLDivElement | null>;
  messagesLength: number;
}

export default function ExportButtons({ planRef, messagesLength }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const hasContent = messagesLength > 0;
  
  // Also check if planRef is available
  const isRefAvailable = planRef.current !== null;
  

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 hidden sm:inline">Export:</span>
      <ExportPDFButton 
        planRef={planRef} 
        isExporting={isExporting}
        setIsExporting={setIsExporting}
        hasContent={hasContent}
      />
    </div>
  );
}
