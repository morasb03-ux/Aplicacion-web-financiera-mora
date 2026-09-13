import { CompanyInfo } from '../types';

export function exportToTXT(
  moduleTitle: string,
  companyInfo: CompanyInfo,
  summaryText: string,
  steps: { title: string; description: string; formula: string; substitution: string | undefined; result: string }[],
  tableHeaders?: string[],
  tableData?: (string | number)[][]
) {
  let content = '========================================================================\n';
  content += '           MORA - SISTEMA DE INFORMACIÓN FINANCIERA Y CONTABLE          \n';
  content += '========================================================================\n\n';

  if (companyInfo.companyName || companyInfo.nit) {
    content += 'INFORMACIÓN DE LA EMPRESA / INSTITUCIÓN:\n';
    content += `• Empresa/Institución : ${companyInfo.companyName || 'N/A'}\n`;
    content += `• NIT                 : ${companyInfo.nit || 'N/A'}\n`;
    content += `• Dirección           : ${companyInfo.address || 'N/A'}\n`;
    content += `• Proceso Generado    : ${companyInfo.processType || moduleTitle}\n`;
    content += `• Fecha de Emisión    : ${new Date().toLocaleDateString('es-CO')}\n`;
    content += `• Audiencia Objetivo  : Tecnólogos de Contabilidad y Finanzas\n`;
    content += '------------------------------------------------------------------------\n\n';
  } else {
    content += `PROCESO: ${moduleTitle}\n`;
    content += `FECHA DE EMISIÓN: ${new Date().toLocaleDateString('es-CO')}\n`;
    content += '------------------------------------------------------------------------\n\n';
  }

  content += `RESUMEN DEL CÁLCULO:\n${summaryText}\n\n`;

  if (steps && steps.length > 0) {
    content += '========================================================================\n';
    content += 'DESARROLLO PASO A PASO Y FÓRMULAS MATEMÁTICAS:\n';
    content += '========================================================================\n\n';

    steps.forEach((step, idx) => {
      content += `PASO ${idx + 1}: ${step.title.toUpperCase()}\n`;
      content += `Descripción : ${step.description}\n`;
      content += `Fórmula     : ${step.formula}\n`;
      if (step.substitution) {
        content += `Sustitución : ${step.substitution}\n`;
      }
      content += `Resultado   : ${step.result}\n`;
      content += '------------------------------------------------------------------------\n';
    });
    content += '\n';
  }

  if (tableHeaders && tableData && tableData.length > 0) {
    content += '========================================================================\n';
    content += 'TABLA DETALLADA DE DATOS Y RESULTADOS:\n';
    content += '========================================================================\n\n';

    content += tableHeaders.join(' | ') + '\n';
    content += tableHeaders.map(() => '----------------').join('-|-') + '\n';

    tableData.forEach(row => {
      content += row.join(' | ') + '\n';
    });
    content += '\n';
  }

  content += '========================================================================\n';
  content += 'Derechos reservados © Mora - Gestión Contable e Información Financiera\n';
  content += '========================================================================\n';

  // Trigger file download
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Informe_${moduleTitle.replace(/\s+/g, '_')}_${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
