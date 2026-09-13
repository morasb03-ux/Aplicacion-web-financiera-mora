import React, { useState } from 'react';
import {
  AmortizationSystem,
  RateUnit,
  PeriodUnit,
  AmortizationInput,
  AmortizationResult,
  CompanyInfo
} from '../types';
import { calculateAmortization } from '../utils/financialCalculations';
import { exportToPDF } from '../utils/pdfExport';
import { exportToTXT } from '../utils/txtExport';
import { formatCOP, formatPercent } from '../utils/formatters';
import { Table2, HelpCircle, FileText, Download, CheckCircle2, Play, Calendar, DollarSign } from 'lucide-react';

interface AmortizationModuleProps {
  companyInfo: CompanyInfo;
  onOpenHelp: (topicId: string) => void;
}

export const AmortizationModule: React.FC<AmortizationModuleProps> = ({
  companyInfo,
  onOpenHelp
}) => {
  // Amortization System choice
  const [system, setSystem] = useState<AmortizationSystem>('frances');

  // Input states
  const [loanAmount, setLoanAmount] = useState<string>('12000000');
  
  // Rate toggle & value
  const [rateUnit, setRateUnit] = useState<RateUnit>('anual');
  const [rateValue, setRateValue] = useState<string>('24');

  // Period toggle & value
  const [periodUnit, setPeriodUnit] = useState<PeriodUnit>('meses');
  const [periodValue, setPeriodValue] = useState<string>('12');

  // Optional Monthly Insurance & Loan Date
  const [monthlyInsurance, setMonthlyInsurance] = useState<string>('15000');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [result, setResult] = useState<AmortizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = parseFloat(loanAmount);
    const rVal = parseFloat(rateValue);
    const pVal = parseInt(periodValue, 10);
    const insVal = parseFloat(monthlyInsurance) || 0;

    if (isNaN(amount) || amount <= 0) {
      setError('Por favor ingrese un monto del préstamo válido mayor a cero.');
      return;
    }
    if (isNaN(rVal) || rVal <= 0) {
      setError('Por favor ingrese una tasa de interés válida.');
      return;
    }
    if (isNaN(pVal) || pVal <= 0) {
      setError('Por favor ingrese un número de periodos válido.');
      return;
    }

    const inputData: AmortizationInput = {
      system,
      loanAmount: amount,
      rateValue: rVal,
      rateUnit,
      periodValue: pVal,
      periodUnit,
      monthlyInsurance: insVal,
      startDate
    };

    const amortRes = calculateAmortization(inputData);
    setResult(amortRes);
  };

  const handleExportPDF = () => {
    if (!result) return;
    const sysName = system === 'frances' ? 'Sistema Francés (Cuota Fija)' : 'Sistema Alemán (Cuota Decreciente)';
    const summary = `Tabla de Amortización bajo el ${sysName}. Monto: ${formatCOP(result.input.loanAmount)}, Tasa: ${result.input.rateValue}% ${result.input.rateUnit}, Plazo: ${result.input.periodValue} ${result.input.periodUnit} (${result.totalPeriodsMonths} meses). Total Pagado: ${formatCOP(result.totals.totalPaid)}, Total Intereses: ${formatCOP(result.totals.totalInterest)}.`;

    const headers = [
      'Fecha',
      'Per',
      'Val. Inicial',
      'Cuota',
      'Interés',
      'Capital',
      'Int. Acum',
      'Seguro',
      'Cap + Seg',
      'Saldo'
    ];

    const data = result.rows.map(r => [
      r.date,
      r.period.toString(),
      formatCOP(r.initialBalance),
      formatCOP(r.quota),
      formatCOP(r.interest),
      formatCOP(r.capital),
      formatCOP(r.accumulatedInterest),
      formatCOP(r.insurance),
      formatCOP(r.totalPayment),
      formatCOP(r.endingBalance)
    ]);

    exportToPDF(
      `Tabla de Amortización (${sysName})`,
      companyInfo,
      summary,
      result.steps,
      headers,
      data
    );
  };

  const handleExportTXT = () => {
    if (!result) return;
    const sysName = system === 'frances' ? 'Sistema Francés (Cuota Fija)' : 'Sistema Alemán (Cuota Decreciente)';
    const summary = `Tabla de Amortización bajo el ${sysName}. Monto: ${formatCOP(result.input.loanAmount)}, Tasa: ${result.input.rateValue}% ${result.input.rateUnit}, Plazo: ${result.input.periodValue} ${result.input.periodUnit} (${result.totalPeriodsMonths} meses). Total Pagado: ${formatCOP(result.totals.totalPaid)}, Total Intereses: ${formatCOP(result.totals.totalInterest)}.`;

    const headers = [
      'Fecha',
      'Periodo',
      'Valor Inicial',
      'Cuota Base',
      'Interés',
      'Capital',
      'Interés Acumulado',
      'Seguro',
      'Capital + Seguro',
      'Saldo Final'
    ];

    const data = result.rows.map(r => [
      r.date,
      r.period.toString(),
      formatCOP(r.initialBalance),
      formatCOP(r.quota),
      formatCOP(r.interest),
      formatCOP(r.capital),
      formatCOP(r.accumulatedInterest),
      formatCOP(r.insurance),
      formatCOP(r.totalPayment),
      formatCOP(r.endingBalance)
    ]);

    exportToTXT(
      `Tabla de Amortización (${sysName})`,
      companyInfo,
      summary,
      result.steps,
      headers,
      data
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-900 text-red-400">
            <Table2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">
                Módulo 4: Amortización de Créditos
              </h2>
              <button
                onClick={() => onOpenHelp('amortization')}
                className="p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title="Ayuda y guía de este proceso"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Generación exacta de cuadros de amortización (Sistema Francés y Alemán) con seguros y calendario comercial de 360 días.
            </p>
          </div>
        </div>
      </div>

      {/* Amortization System Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <label className="block text-xs font-bold uppercase tracking-wider text-red-400">
          Selecciona el Sistema de Amortización:
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setSystem('frances');
              setResult(null);
            }}
            className={`p-4 rounded-xl text-left border transition-all ${
              system === 'frances'
                ? 'bg-red-950/80 border-red-700 text-slate-100 shadow-lg ring-1 ring-red-600'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-sm">Cuota Fija (Sistema Francés)</div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              La cuota total se mantiene constante periodo a periodo. Los intereses bajan progresivamente y el abono a capital aumenta.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setSystem('aleman');
              setResult(null);
            }}
            className={`p-4 rounded-xl text-left border transition-all ${
              system === 'aleman'
                ? 'bg-red-950/80 border-red-700 text-slate-100 shadow-lg ring-1 ring-red-600'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-sm">Cuota Decreciente (Sistema Alemán)</div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              El abono a capital es constante en cada periodo. La cuota total disminuye periodo a periodo a medida que bajan los intereses.
            </p>
          </button>
        </div>
      </div>

      {/* Main Amortization Inputs Form */}
      <form onSubmit={handleCalculate} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Parámetros del Crédito
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Monto del préstamo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-red-400" />
              <span>Monto del Préstamo ($) *</span>
            </label>
            <input
              type="number"
              step="any"
              required
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Tasa de interés selector + input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Tasa de Interés *
              </label>
              <select
                value={rateUnit}
                onChange={(e) => setRateUnit(e.target.value as RateUnit)}
                className="bg-slate-950 text-red-400 text-xs font-semibold px-2 py-0.5 rounded border border-slate-800 focus:outline-none"
              >
                <option value="anual">Tasa anual</option>
                <option value="mensual">Tasa mensual</option>
              </select>
            </div>
            <input
              type="number"
              step="any"
              required
              value={rateValue}
              onChange={(e) => setRateValue(e.target.value)}
              placeholder={`Ingresar % ${rateUnit}`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Número de periodos selector + input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Número de Periodos *
              </label>
              <select
                value={periodUnit}
                onChange={(e) => setPeriodUnit(e.target.value as PeriodUnit)}
                className="bg-slate-950 text-red-400 text-xs font-semibold px-2 py-0.5 rounded border border-slate-800 focus:outline-none"
              >
                <option value="meses">Meses</option>
                <option value="anos">Años (360 días)</option>
              </select>
            </div>
            <input
              type="number"
              required
              value={periodValue}
              onChange={(e) => setPeriodValue(e.target.value)}
              placeholder={`Ingresar en ${periodUnit}`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Costo seguro mensual (opcional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Costo del Seguro Mensual ($) (Opcional)
            </label>
            <input
              type="number"
              step="any"
              value={monthlyInsurance}
              onChange={(e) => setMonthlyInsurance(e.target.value)}
              placeholder="Ej: 15000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Fecha del préstamo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-red-400" />
              <span>Fecha del Préstamo *</span>
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-red-600"
            />
          </div>

        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-400 bg-rose-950/50 border border-rose-900 p-2.5 rounded-xl">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-red-900 hover:bg-red-800 text-white font-semibold text-sm transition-all shadow-lg shadow-red-950/80 flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Generar Tabla de Amortización Completa</span>
        </button>

      </form>

      {/* Amortization Table & Explanations Display */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl animate-fade-in">
          
          {/* Summary Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Monto Solicitado:</span>
              <span className="text-lg font-bold text-slate-100 font-mono">{formatCOP(result.input.loanAmount)}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Total Pago Intereses:</span>
              <span className="text-lg font-bold text-rose-400 font-mono">{formatCOP(result.totals.totalInterest)}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Total Seguros:</span>
              <span className="text-lg font-bold text-amber-400 font-mono">{formatCOP(result.totals.totalInsurance)}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Total Pagado al Banco:</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{formatCOP(result.totals.totalPaid)}</span>
            </div>
          </div>

          {/* Export & Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Tabla de Amortización Completa ({result.rows.length - 1} Periodos)</span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-semibold transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Informe PDF</span>
              </button>
              <button
                onClick={handleExportTXT}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Exportar TXT</span>
              </button>
            </div>
          </div>

          {/* Interactive Amortization Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-red-950/80 text-red-200 border-b border-red-900/80 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3">Fecha</th>
                  <th className="p-3 text-center">Per</th>
                  <th className="p-3 text-right">Valor Inicial</th>
                  <th className="p-3 text-right">Cuota</th>
                  <th className="p-3 text-right text-rose-300">Interés</th>
                  <th className="p-3 text-right text-emerald-300">Capital</th>
                  <th className="p-3 text-right">Int. Acum.</th>
                  <th className="p-3 text-right">Seguro</th>
                  <th className="p-3 text-right font-bold text-white">Capital + Seguro</th>
                  <th className="p-3 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-slate-200 bg-slate-950/60">
                {result.rows.map((row) => (
                  <tr key={row.period} className="hover:bg-slate-900/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-300 font-sans">{row.date}</td>
                    <td className="p-3 text-center font-bold text-slate-400">{row.period}</td>
                    <td className="p-3 text-right">{formatCOP(row.initialBalance)}</td>
                    <td className="p-3 text-right font-semibold">{formatCOP(row.quota)}</td>
                    <td className="p-3 text-right text-rose-400">{formatCOP(row.interest)}</td>
                    <td className="p-3 text-right text-emerald-400">{formatCOP(row.capital)}</td>
                    <td className="p-3 text-right text-slate-400">{formatCOP(row.accumulatedInterest)}</td>
                    <td className="p-3 text-right text-amber-400/90">{formatCOP(row.insurance)}</td>
                    <td className="p-3 text-right font-bold text-slate-100">{formatCOP(row.totalPayment)}</td>
                    <td className="p-3 text-right font-semibold text-slate-300">{formatCOP(row.endingBalance)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-950 font-bold text-slate-100 border-t-2 border-red-900">
                  <td colSpan={3} className="p-3 uppercase text-red-400 font-sans">Totales Finales:</td>
                  <td className="p-3 text-right">{formatCOP(result.totals.totalPaid - result.totals.totalInsurance)}</td>
                  <td className="p-3 text-right text-rose-400">{formatCOP(result.totals.totalInterest)}</td>
                  <td className="p-3 text-right text-emerald-400">{formatCOP(result.totals.totalCapital)}</td>
                  <td className="p-3 text-right text-slate-400">-</td>
                  <td className="p-3 text-right text-amber-400">{formatCOP(result.totals.totalInsurance)}</td>
                  <td className="p-3 text-right text-emerald-400">{formatCOP(result.totals.totalPaid)}</td>
                  <td className="p-3 text-right">$0,00 COP</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Formula Breakdown Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Desarrollo de Fórmulas y Explicación Paso a Paso
            </h4>

            <div className="space-y-3">
              {result.steps.map((step, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h5 className="text-xs font-bold uppercase text-red-400">{step.title}</h5>
                  <p className="text-xs text-slate-300">{step.description}</p>
                  
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs space-y-1">
                    <p className="text-slate-400">
                      <span className="text-slate-500 font-semibold">Fórmula: </span>
                      <span className="text-slate-200">{step.formula}</span>
                    </p>
                    <p className="text-slate-400">
                      <span className="text-slate-500 font-semibold">Sustitución: </span>
                      <span className="text-slate-300">{step.substitution}</span>
                    </p>
                  </div>

                  <div className="text-xs font-bold text-emerald-400 pt-1">
                    → {step.result}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
