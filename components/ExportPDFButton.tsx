'use client';

import { useCallback } from 'react';

interface ExportPDFButtonProps {
  planRef: React.RefObject<HTMLDivElement>;
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
}

export default function ExportPDFButton({ planRef, isExporting, setIsExporting }: ExportPDFButtonProps) {
  const handleExportPDF = useCallback(async () => {
    if (!planRef.current || isExporting) return;
    
    setIsExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      
      const canvas = await html2canvas(planRef.current, { 
        backgroundColor: "#ffffff", 
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL("image/png", 0.95);
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "pt",
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("diet4me-plan.pdf");
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [planRef, isExporting]);

  return (
    <button
      type="button"
      disabled={isExporting}
      onClick={handleExportPDF}
      className="px-3 py-1.5 text-xs sm:text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isExporting ? 'Exporting...' : 'Export PDF'}
    </button>
  );
}
