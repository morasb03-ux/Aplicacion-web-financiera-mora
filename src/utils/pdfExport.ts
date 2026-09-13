import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CompanyInfo } from '../types';

export function exportToPDF(
  moduleTitle: string,
  companyInfo: CompanyInfo,
  summaryText: string,
  steps: { title: string; description: string; formula: string; substitution: string | undefined; result: string }[],
  tableHeaders?: string[],
  tableData?: (string | number)[][]
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Color palette
  const primaryColor: [number, number, number] = [139, 0, 0]; // Dark Red #8B0000
  const darkSlate: [number, number, number] = [15, 23, 42]; // #0f172a
  const grayText: [number, number, number] = [71, 85, 105];

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 25, 'F');

  // App / Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('MORA - SISTEMA DE INFORMACIÓN FINANCIERA', 14, 16);

  let currentY = 32;

  // Company Information Block (if present)
  if (companyInfo.companyName || companyInfo.nit) {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, pageWidth - 28, 28, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, currentY, pageWidth - 28, 28, 'S');

    doc.setTextColor(...darkSlate);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`EMPRESA / INSTITUCIÓN: ${companyInfo.companyName || 'N/A'}`, 18, currentY + 8);
    doc.text(`NIT: ${companyInfo.nit || 'N/A'}`, 18, currentY + 15);
    doc.text(`DIRECCIÓN: ${companyInfo.address || 'N/A'}`, 18, currentY + 22);

    doc.text(`PROCESO CONTABLE: ${companyInfo.processType || moduleTitle}`, 120, currentY + 8);
    doc.text(`FECHA DE EMISIÓN: ${new Date().toLocaleDateString('es-CO')}`, 120, currentY + 15);
    doc.text(`AUDIENCIA: Tecnólogos en Contabilidad y Finanzas`, 120, currentY + 22);

    currentY += 34;
  } else {
    doc.setTextColor(...darkSlate);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Informe Técnico Generado el ${new Date().toLocaleDateString('es-CO')} | Proceso: ${moduleTitle}`, 14, currentY);
    currentY += 8;
  }

  // Module Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(moduleTitle.toUpperCase(), 14, currentY);
  currentY += 8;

  // Divider line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.8);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 10;

  // Summary Text / Introduction
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkSlate);
  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 28);
  doc.text(splitSummary, 14, currentY);
  currentY += splitSummary.length * 5 + 8;

  // Step-by-Step Breakdown Section
  if (steps && steps.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkSlate);
    doc.text('DESARROLLO PASO A PASO Y FÓRMULAS APLICADAS', 14, currentY);
    currentY += 6;

    steps.forEach((step, index) => {
      // Check page overflow
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(`${index + 1}. ${step.title}`, 14, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...grayText);
      const descLines = doc.splitTextToSize(step.description, pageWidth - 28);
      doc.text(descLines, 14, currentY);
      currentY += descLines.length * 4.5 + 2;

      // Formula Box
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, pageWidth - 28, 16, 'F');
      doc.setFont('courier', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`Fórmula: ${step.formula}`, 18, currentY + 6);
      if (step.substitution) {
        doc.text(`Sustitución: ${step.substitution}`, 18, currentY + 12);
      }
      currentY += 20;

      // Step Result
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(22, 101, 52); // Dark green
      doc.text(`→ Resultado Paso: ${step.result}`, 14, currentY);
      currentY += 8;
    });
  }

  // Data Table (if present, e.g. Amortization or Cash Flows)
  if (tableHeaders && tableData && tableData.length > 0) {
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkSlate);
    doc.text('TABLA DETALLADA DE RESULTADOS', 14, currentY);
    currentY += 6;

    autoTable(doc, {
      startY: currentY,
      head: [tableHeaders],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 0, 0],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 }
    });
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${pageCount} | Mora - Informe Contable y Financiero | Derechos reservados`,
      pageWidth / 2,
      288,
      { align: 'center' }
    );
  }

  // Save the PDF file
  const fileName = `Informe_${moduleTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(fileName);
}
