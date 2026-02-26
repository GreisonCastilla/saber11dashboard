import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const exportToPDF = async (elementId: string, fileName: string = 'dashboard.pdf') => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id ${elementId} not found`);
        return;
    }

    try {
        // We might want to force a light theme or specific styles during capture
        // For now, capture as is.
        const dataUrl = await toPng(element, {
            pixelRatio: 2, // Higher scale for better quality
            skipFonts: false,
            backgroundColor: window.getComputedStyle(document.body).backgroundColor,
        });

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [img.width, img.height]
        });

        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();

        pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
        pdf.save(fileName);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};
