import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
    title: string;
    stateName?: string;
    summary?: any;
    insights?: any;
    includeCharts?: boolean;
}

export const generatePolicyPDF = async (options: PDFExportOptions): Promise<void> => {
    const { title, stateName, summary, insights } = options;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color: number[] = [255, 255, 255]) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setTextColor(color[0], color[1], color[2]);

        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
            if (yPosition > pageHeight - margin) {
                pdf.addPage();
                yPosition = margin;
            }
            pdf.text(line, margin, yPosition);
            yPosition += fontSize * 0.5;
        });
        yPosition += 5;
    };

    // Add dark background
    pdf.setFillColor(18, 18, 18); // #121212
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Header
    pdf.setFillColor(255, 153, 51); // Orange
    pdf.rect(0, 0, pageWidth, 40, 'F');

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AadhaarIQ', margin, 20);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('AI-Powered Aadhaar Analytics Platform', margin, 30);

    yPosition = 50;

    // Document Title
    addText(title, 18, true, [255, 153, 51]);

    if (stateName) {
        addText(`State Analysis: ${stateName}`, 14, true);
    }

    addText(`Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, 9, false, [170, 170, 170]);
    yPosition += 5;

    // Executive Summary
    if (summary) {
        addText('Executive Summary', 14, true, [255, 153, 51]);
        addText(`Total Enrolments: ${(summary.totalEnrolments / 10000000).toFixed(2)} Crore`, 11);
        addText(`Total Updates: ${(summary.totalUpdates / 10000000).toFixed(2)} Crore`, 11);
        addText(`Child Enrolments: ${(summary.totalChildEnrolments / 1000000).toFixed(2)} Million`, 11);
        addText(`Total States Analyzed: ${summary.totalStates}`, 11);
        yPosition += 5;
    }

    // AI-Generated Insights
    if (insights) {
        addText('AI-Generated Policy Insights', 14, true, [255, 153, 51]);

        if (insights.insight) {
            addText(insights.insight, 10);
        }

        // Add Data-Driven Strategic Metrics
        if (insights.metrics) {
            yPosition += 5;
            addText('Regional Strategic Metrics', 12, true, [66, 135, 245]);
            addText(`• Saturation Gap: ${insights.metrics.gap}%`, 10);
            addText(`• Anomaly Sensitivity: ${insights.metrics.anomaly}`, 10);
            addText(`• Saturation Status: ${insights.metrics.status}`, 10);
        }

        if (insights.insightHindi) {
            yPosition += 5;
            addText('हिंदी अनुवाद', 12, true, [66, 135, 245]);
            addText(insights.insightHindi, 10);
        }

        if (insights.tags && insights.tags.length > 0) {
            yPosition += 5;
            addText('Identified Trends', 12, true, [66, 135, 245]);
            insights.tags.forEach((trend: any) => {
                const severityColor = trend.severity === 'critical' ? [239, 68, 68] :
                    trend.severity === 'high' ? [251, 146, 60] :
                        trend.severity === 'medium' ? [252, 211, 77] : [74, 222, 128];
                addText(`• ${trend.type.toUpperCase()} (${trend.severity}, ${trend.confidence}% confidence)`, 10, false, severityColor);
            });
        }

        if (insights.actionableSteps && insights.actionableSteps.length > 0) {
            yPosition += 5;
            addText('Actionable Recommendations', 12, true, [66, 135, 245]);
            insights.actionableSteps.forEach((step: string, idx: number) => {
                addText(`${idx + 1}. ${step}`, 10);
            });
        }
    }

    // Footer on last page
    const totalPages = (pdf as any).internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
            `Powered by AadhaarIQ | Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }

    // Save the PDF
    const fileName = stateName
        ? `AadhaarIQ_${stateName.replace(/\s+/g, '_')}_${Date.now()}.pdf`
        : `AadhaarIQ_Report_${Date.now()}.pdf`;

    pdf.save(fileName);
};

export const captureChartAsPNG = async (elementId: string): Promise<string | null> => {
    const element = document.getElementById(elementId);
    if (!element) return null;

    try {
        const canvas = await html2canvas(element, {
            backgroundColor: '#121212',
            scale: 2,
        });
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Error capturing chart:', error);
        return null;
    }
};
