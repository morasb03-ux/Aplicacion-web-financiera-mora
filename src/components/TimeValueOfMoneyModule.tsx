import React, { useState } from 'react';
import {
  TVMOption,
  TVMInput,
  TVMResult,
  CompanyInfo,
  RatePeriodicity
} from '../types';
import { calculateTVM } from '../utils/financialCalculations';
import { exportToPDF } from '../utils/pdfExport';
import { exportToTXT } from '../utils/txtExport';
import { formatCOP } from '../utils/formatters';
import { Clock, HelpCircle, FileText, Download, CheckCircle2, Play, Plus, Trash2 } from 'lucide-react';

interface TimeValueOfMoneyModuleProps {
  companyInfo: CompanyInfo;
  onOpenHelp: (topicId: string) => void;
}

export const TimeValueOfMoneyModule: React.FC<TimeValueOfMoneyModuleProps> = ({
  companyInfo,
  onOpenHelp
}) => {
  const [option, setOption] = useState<TVMOption>('vf');

  // Input states
  const [vp, setVp] = useState<string>('5000000');
  const [vf, setVf] = useState<string>('7000000');
  const [rate, setRate] = useState<string>('1.5');
  const [periods, setPeriods] = useState<string>('12');
  const [ratePeriodicity, setRatePeriodicity] = useState<RatePeriodicity>('mensual');
  
  // Annuity specific
  const [annuityPayment, setAnnuityPayment] = useState<string>('500000');
  const [annuityType, setAnnuityType] = useState<'vencida' | 'anticipada'>('vencida');

  // NPV specific
  const [initialInvestment, setInitialInvestment] = useState<string>('10000000');
  const [cashFlows, setCashFlows] = useState<string[]>(['3000000', '4000000', '5000000', '3500000']);

  const [result, setResult] = useState<TVMResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const optionsList: { id: TVMOption; label: string; desc: string }[] = [
    { id: 'vf', label: 'Valor Futuro (VF)', desc: 'Capitalización de un monto actual a una tasa y tiempo' },
    { id: 'vp', label: 'Valor Presente (VP)', desc: 'Descuento de una cantidad futura a dinero hoy' },
    { id: 'vpn', label: 'Valor Presente Neto (VPN)', desc: 'Evaluación de flujos de caja descontados menos inversión' },
    { id: 'interes', label: 'Interés Generado (I)', desc: 'Diferencia monetaria ganada entre VF y VP' },
    { id: 'vp-anualidad', label: 'VP de Anualidad', desc: 'Equivalencia actual de una serie de pagos periódicos' },
    { id: 'vf-anualidad', label: 'VF de Anualidad', desc: 'Monto acumulado futuro de ahorros o cuotas constantes' },
  ];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rVal = parseFloat(rate);
    const pVal = parseInt(periods, 10);

    if (isNaN(rVal) || rVal <= 0) {
      setError('Por favor ingrese una tasa de interés válida.');
      return;
    }
    if (isNaN(pVal) || pVal <= 0) {
      setError('Por favor ingrese un número de periodos válido mayor a cero.');
      return;
    }

    const inputData: TVMInput = {
      option,
      rate: rVal,
      periods: pVal,
      ratePeriodicity
    };

    if (option === 'vf') {
      const vpVal = parseFloat(vp);
      if (isNaN(vpVal) || vpVal <= 0) {
        setError('Ingrese un Valor Presente válido.');
        return;
      }
      inputData.vp = vpVal;
    } else if (option === 'vp') {
      const vfVal = parseFloat(vf);
      if (isNaN(vfVal) || vfVal <= 0) {
        setError('Ingrese un Valor Futuro válido.');
        return;
      }
      inputData.vf = vfVal;
    } else if (option === 'interes') {
      const vpVal = parseFloat(vp);
      if (isNaN(vpVal) || vpVal <= 0) {
        setError('Ingrese un Valor Presente válido.');
        return;
      }
      inputData.vp = vpVal;
    } else if (option === 'vp-anualidad' || option === 'vf-anualidad') {
      const aVal = parseFloat(annuityPayment);
      if (isNaN(aVal) || aVal <= 0) {
        setError('Ingrese el monto de la cuota periódica.');
        return;
      }
      inputData.annuityPayment = aVal;
      inputData.annuityType = annuityType;
    } else if (option === 'vpn') {
      const invVal = parseFloat(initialInvestment);
      if (isNaN(invVal) || invVal < 0) {
        setError('Ingrese una inversión inicial válida.');
        return;
      }
      const numFlows = cashFlows.map(f => parseFloat(f)).filter(f => !isNaN(f));
      if (numFlows.length === 0) {
        setError('Ingrese al menos un flujo de caja.');
        return;
      }
      inputData.initialInvestment = invVal;
      inputData.cashFlows = numFlows;
    }

    const tvmRes = calculateTVM(inputData);
    setResult(tvmRes);
  };

  const handleAddFlow = () => {
    setCashFlows([...cashFlows, '2000000']);
  };

  const handleRemoveFlow = (index: number) => {
    setCashFlows(cashFlows.filter((_, i) => i !== index));
  };

  const handleFlowChange = (index: number, val: string) => {
    const updated = [...cashFlows];
    updated[index] = val;
    setCashFlows(updated);
  };

  const handleExportPDF = () => {
    if (!result) return;
    const summary = `Cálculo de ${result.label}. Resultado Final: ${formatCOP(result.finalValue)}. Tasa aplicada: ${rate}% ${ratePeriodicity} durante ${periods} periodos.`;

    exportToPDF(
      `Valor del Dinero en el Tiempo - ${result.label}`,
      companyInfo,
      summary,
      result.steps
    );
  };

  const handleExportTXT = () => {
    if (!result) return;
    const summary = `Cálculo de ${result.label}. Resultado Final: ${formatCOP(result.finalValue)}. Tasa aplicada: ${rate}% ${ratePeriodicity} durante ${periods} periodos.`;

    exportToTXT(
      `Valor del Dinero en el Tiempo - ${result.label}`,
      companyInfo,
      summary,
      result.steps
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-900 text-red-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">
                Módulo 2: Valor del Dinero en el Tiempo
              </h2>
              <button
                onClick={() => onOpenHelp('tvm')}
                className="p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title="Ayuda y guía de este proceso"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Evaluación matemática de capitalización, descuento, VPN y series uniformes.
            </p>
          </div>
        </div>
      </div>

      {/* Option Selector Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <label className="block text-xs font-bold uppercase tracking-wider text-red-400">
          Selecciona el Cálculo a Realizar:
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {optionsList.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setOption(opt.id);
                setResult(null);
              }}
              className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                option === opt.id
                  ? 'bg-red-950/80 border-red-700 text-slate-100 shadow-lg shadow-red-950/50 ring-1 ring-red-600'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="font-bold text-xs">{opt.label}</div>
              <div className="text-[11px] text-slate-400 mt-1 leading-snug">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Form for TVM Inputs */}
      <form onSubmit={handleCalculate} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Campos de Entrada para: <span className="text-red-400">{optionsList.find(o => o.id === option)?.label}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Rate input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tasa de Interés Periódica (%) *
            </label>
            <input
              type="number"
              step="any"
              required
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Rate Periodicity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Periodicidad de la Tasa *
            </label>
            <select
              value={ratePeriodicity}
              onChange={(e) => setRatePeriodicity(e.target.value as RatePeriodicity)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-red-600"
            >
              <option value="mensual">Mensual</option>
              <option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>

          {/* Periods count */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Número de Periodos (n) *
            </label>
            <input
              type="number"
              required
              value={periods}
              onChange={(e) => setPeriods(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Conditional inputs */}
          {(option === 'vf' || option === 'interes') && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Valor Presente / Capital Inicial (VP) ($) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={vp}
                onChange={(e) => setVp(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-red-600"
              />
            </div>
          )}

          {option === 'vp' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Valor Futuro Objetivo (VF) ($) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={vf}
                onChange={(e) => setVf(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-red-600"
              />
            </div>
          )}

          {(option === 'vp-anualidad' || option === 'vf-anualidad') && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monto de la Cuota Periódica (A) ($) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={annuityPayment}
                  onChange={(e) => setAnnuityPayment(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo de Anualidad *
                </label>
                <select
                  value={annuityType}
                  onChange={(e) => setAnnuityType(e.target.value as 'vencida' | 'anticipada')}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-red-600"
                >
                  <option value="vencida">Anualidad Vencida (Al final del periodo)</option>
                  <option value="anticipada">Anualidad Anticipada (Al inicio del periodo)</option>
                </select>
              </div>
            </>
          )}

        </div>

        {/* VPN Cash Flows List */}
        {option === 'vpn' && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Inversión Inicial en Periodo 0 ($) *
              </label>
              <input
                type="number"
                step="any"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(e.target.value)}
                className="w-full max-w-xs px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Flujos Netos de Caja por Periodo ($):
                </label>
                <button
                  type="button"
                  onClick={handleAddFlow}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Periodo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {cashFlows.map((flow, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 font-mono">P{idx + 1}:</span>
                    <input
                      type="number"
                      step="any"
                      value={flow}
                      onChange={(e) => handleFlowChange(idx, e.target.value)}
                      className="w-full bg-transparent text-slate-100 text-xs font-mono focus:outline-none"
                    />
                    {cashFlows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFlow(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
          <span>Calcular {optionsList.find(o => o.id === option)?.label} Exacto</span>
        </button>

      </form>

      {/* Result Display */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl animate-fade-in">
          
          {/* Main Prominent COP Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-950 to-red-950/80 border border-red-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-400 block mb-1">
                Resultado Exacto en Pesos Colombianos:
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-mono tracking-tight">
                {formatCOP(result.finalValue)}
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1">
                {result.label}
              </p>
            </div>
          </div>

          {/* Action Export Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Desarrollo de Fórmulas Matemáticas</span>
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

          {/* Steps Display */}
          <div className="space-y-4">
            {result.steps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-300">{step.description}</p>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 font-mono text-xs space-y-1">
                  <p className="text-slate-400">
                    <span className="text-slate-500 font-semibold">Fórmula: </span>
                    <span className="text-slate-200">{step.formula}</span>
                  </p>
                  <p className="text-slate-400 whitespace-pre-line">
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
      )}

    </div>
  );
};
