'use client';

import { useCallback } from 'react';

interface ExportPNGButtonProps {
  planRef: React.RefObject<HTMLDivElement>;
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
}

export default function ExportPNGButton({ planRef, isExporting, setIsExporting }: ExportPNGButtonProps) {
  const handleExportPNG = useCallback(async () => {
    if (!planRef.current || isExporting) return;
    
    setIsExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(planRef.current, { 
        pixelRatio: 2, 
        backgroundColor: "#ffffff",
        quality: 0.95,
        skipFonts: true
      });
      
      const link = document.createElement("a");
      link.download = "diet4me-plan.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('PNG export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [planRef, isExporting]);

  return (
    <button
      type="button"
      disabled={isExporting}
      onClick={handleExportPNG}
      className="px-3 py-1.5 text-xs sm:text-sm rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isExporting ? 'Exporting...' : 'Export PNG'}
    </button>
  );
}
