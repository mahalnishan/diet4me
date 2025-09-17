'use client';

import { useCallback } from 'react';

interface ExportPDFButtonProps {
  planRef: React.RefObject<HTMLDivElement | null>;
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
  hasContent: boolean;
}

export default function ExportPDFButton({ planRef, isExporting, setIsExporting, hasContent }: ExportPDFButtonProps) {
  const handleExportPDF = useCallback(async () => {
    if (!hasContent || isExporting) return;
    
    // Wait for planRef to be available
    if (!planRef.current) {
      return;
    }
    
    setIsExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      
      // Create a temporary container with better styling for export
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 1200px;
        background: white;
        padding: 40px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #1e293b;
      `;
      
      // Clone the content and add export-specific styling
      const clonedContent = planRef.current.cloneNode(true) as HTMLElement;
      clonedContent.style.cssText = `
        width: 100%;
        background: white;
        color: #1e293b;
      `;
      
      // Style the table for better export
      const tables = clonedContent.querySelectorAll('table');
      tables.forEach(table => {
        (table as HTMLElement).style.cssText = `
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          margin: 0;
        `;
        
        // Style table headers
        const headers = table.querySelectorAll('th');
        headers.forEach(header => {
          (header as HTMLElement).style.cssText = `
            background: #f1f5f9;
            color: #334155;
            font-weight: 600;
            padding: 12px 8px;
            border: 1px solid #e2e8f0;
            text-align: left;
            font-size: 13px;
          `;
        });
        
        // Style table cells
        const cells = table.querySelectorAll('td');
        cells.forEach(cell => {
          (cell as HTMLElement).style.cssText = `
            padding: 12px 8px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
            font-size: 12px;
            line-height: 1.4;
            word-wrap: break-word;
          `;
        });
      });
      
      tempContainer.appendChild(clonedContent);
      document.body.appendChild(tempContainer);
      
      const canvas = await html2canvas(tempContainer, { 
        backgroundColor: "#ffffff", 
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: 1200,
        height: tempContainer.scrollHeight
      });
      
      // Clean up
      document.body.removeChild(tempContainer);
      
      const imgData = canvas.toDataURL("image/png", 0.95);
      
      // Calculate PDF dimensions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdfWidth = 595.28; // A4 width in points
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
      
      const pdf = new jsPDF({
        orientation: pdfHeight > 841.89 ? "landscape" : "portrait", // A4 dimensions
        unit: "pt",
        format: "a4"
      });
      
      // Add title
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Diet4Me - Personalized Diet Plan", 40, 40);
      
      // Add date
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 60);
      
      // Add the image
      const yOffset = 80;
      const availableHeight = pdf.internal.pageSize.height - yOffset - 40;
      
      if (pdfHeight <= availableHeight) {
        // Single page
        pdf.addImage(imgData, "PNG", 40, yOffset, pdfWidth - 80, pdfHeight);
      } else {
        // Multiple pages
        const pageHeight = availableHeight;
        const totalPages = Math.ceil(pdfHeight / pageHeight);
        
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) pdf.addPage();
          
          const sourceY = i * pageHeight;
          const sourceHeight = Math.min(pageHeight, pdfHeight - sourceY);
          const targetHeight = (sourceHeight * (pdfWidth - 80)) / imgWidth;
          
          // Create a temporary canvas for this page
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = imgWidth;
          pageCanvas.height = sourceHeight;
          const ctx = pageCanvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
            const pageImgData = pageCanvas.toDataURL("image/png", 0.95);
            pdf.addImage(pageImgData, "PNG", 40, yOffset, pdfWidth - 80, targetHeight);
          }
        }
      }
      
      pdf.save(`diet4me-plan-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [planRef, isExporting, hasContent]);

  return (
    <button
      type="button"
      disabled={!hasContent || isExporting}
      onClick={handleExportPDF}
      className="px-3 py-1.5 text-xs sm:text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
    >
      {isExporting ? (
        <>
          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
          Exporting...
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF
        </>
      )}
    </button>
  );
}
