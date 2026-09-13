import React, { useState } from 'react';
import {
  RateInput,
  RateTarget,
  RateConversionResult,
  CompanyInfo,
  RateType,
  RatePeriodicity,
  RateModality
} from '../types';
import { calculateRateConversion } from '../utils/financialCalculations';
import { exportToPDF } from '../utils/pdfExport';
import { exportToTXT } from '../utils/txtExport';
import { formatPercent } from '../utils/formatters';
import { Calculator, HelpCircle, FileText, Download, CheckCircle2, RefreshCw } from 'lucide-react';

interface RateConversionModuleProps {
  companyInfo: CompanyInfo;
  onOpenHelp: (topicId: string) => void;
}

export const RateConversionModule: React.FC<RateConversionModuleProps> = ({
  companyInfo,
  onOpenHelp
}) => {
  // Source Rate Form State
  const [sourceValue, setSourceValue] = useState<string>('24');
  const [sourceType, setSourceType] = useState<RateType>('nominal');
  const [sourcePeriodicity, setSourcePeriodicity] = useState<RatePeriodicity>('mensual');
  const [sourceModality, setSourceModality] = useState<RateModality>('vencida');

  // Target Rate Form State
  const [targetType, setTargetType] = useState<RateType>('efectiva');
  const [targetPeriodicity, setTargetPeriodicity] = useState<RatePeriodicity>('anual');
  const [targetModality, setTargetModality] = useState<RateModality>('vencida');

  // Calculated Result State
  const [result, setResult] = useState<RateConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = parseFloat(sourceValue);
    if (isNaN(val) || val <= 0) {
      setError('Por favor ingrese un número de tasa válido mayor a cero.');
      return;
    }

    const source: RateInput = {
      value: val,
      type: sourceType,
      periodicity: sourcePeriodicity,
      modality: sourceModality
    };

    const target: RateTarget = {
      type: targetType,
      periodicity: targetPeriodicity,
      modality: targetModality
    };

    const conversionResult = calculateRateConversion(source, target);
    setResult(conversionResult);
  };

  const handleExportPDF = () => {
    if (!result) return;
    const summary = `Conversión de Tasa ${result.sourceRate.value}% ${result.sourceRate.type} ${result.sourceRate.periodicity} ${result.sourceRate.modality} → Resultado: ${formatPercent(result.calculatedRate, 4)} ${result.targetRate.type} ${result.targetRate.periodicity} ${result.targetRate.modality}. Tasa Efectiva Anual Equivalente: ${formatPercent(result.effectiveAnnualRate, 4)}.`;

    exportToPDF(
      'Conversión de Tasas de Interés',
      companyInfo,
      summary,
      result.steps
    );
  };

  const handleExportTXT = () => {
    if (!result) return;
    const summary = `Conversión de Tasa ${result.sourceRate.value}% ${result.sourceRate.type} ${result.sourceRate.periodicity} ${result.sourceRate.modality} → Resultado: ${formatPercent(result.calculatedRate, 4)} ${result.targetRate.type} ${result.targetRate.periodicity} ${result.targetRate.modality}. Tasa Efectiva Anual Equivalente: ${formatPercent(result.effectiveAnnualRate, 4)}.`;

    exportToTXT(
      'Conversión de Tasas de Interés',
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
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">
                Módulo 1: Conversión de Tasas de Interés
              </h2>
              <button
                onClick={() => onOpenHelp('rate-conversion')}
                className="p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title="Ayuda y guía de este proceso"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Transformación matemática entre tasas nominales, efectivas, vencidas y anticipadas.
            </p>
          </div>
        </div>
      </div>

      {/* Main Conversion Form Grid */}
      <form onSubmit={handleCalculate} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Form 1: Source Rate (Tasa de Origen) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
              <span>1. Tasa de Origen (A Convertir)</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">FORM 1</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Número de la tasa (Valor Porcentual %) *
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="Ej: 24"
              value={sourceValue}
              onChange={(e) => setSourceValue(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Tasa *
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as RateType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-red-600"
              >
                <option value="nominal">Nominal</option>
                <option value="efectiva">Efectiva</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Periodicidad *
              </label>
              <select
                value={sourcePeriodicity}
                onChange={(e) => setSourcePeriodicity(e.target.value as RatePeriodicity)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-red-600"
              >
                <option value="diaria">Diaria (360 días)</option>
                <option value="mensual">Mensual (12/año)</option>
                <option value="trimestral">Trimestral (4/año)</option>
                <option value="semestral">Semestral (2/año)</option>
                <option value="anual">Anual (1/año)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Modalidad *
              </label>
              <select
                value={sourceModality}
                onChange={(e) => setSourceModality(e.target.value as RateModality)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-red-600"
              >
                <option value="vencida">Vencida</option>
                <option value="anticipada">Anticipada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form 2: Target Rate Specification (Tasa Destino Requerida) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
              <span>2. Tasa Destino (Especificación Requerida)</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">FORM 2</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo Destino *
              </label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as RateType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-red-600"
              >
                <option value="nominal">Nominal</option>
                <option value="efectiva">Efectiva</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Periodicidad Destino *
              </label>
              <select
                value={targetPeriodicity}
                onChange={(e) => setTargetPeriodicity(e.target.value as RatePeriodicity)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-red-600"
              >
                <option value="diaria">Diaria (360 días)</option>
                <option value="mensual">Mensual (12/año)</option>
                <option value="trimestral">Trimestral (4/año)</option>
                <option value="semestral">Semestral (2/año)</option>
                <option value="anual">Anual (1/año)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Modalidad Destino *
              </label>
              <select
                value={targetModality}
                onChange={(e) => setTargetModality(e.target.value as RateModality)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-red-600"
              >
                <option value="vencida">Vencida</option>
                <option value="anticipada">Anticipada</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-400 bg-rose-950/50 border border-rose-900 p-2.5 rounded-xl">
              {error}
            </p>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-900 hover:bg-red-800 text-white font-semibold text-sm transition-all shadow-lg shadow-red-950/80 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Calcular Conversión de Tasa Exacta</span>
            </button>
          </div>
        </div>

      </form>

      {/* Result Display Section */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl animate-fade-in">
          
          {/* Main Prominent Result Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-950 to-red-950/80 border border-red-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-400 block mb-1">
                Resultado de la Tasa Convertida:
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-mono tracking-tight">
                {formatPercent(result.calculatedRate, 4)}
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1">
                Tasa {result.targetRate.type.toUpperCase()} {result.targetRate.periodicity.toUpperCase()} {result.targetRate.modality.toUpperCase()}
              </p>
            </div>

            <div className="text-right sm:border-l border-slate-800 sm:pl-6">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                Tasa Efectiva Anual (EA) Equivalente:
              </span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {formatPercent(result.effectiveAnnualRate, 4)}
              </span>
            </div>
          </div>

          {/* Action Export Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Desarrollo Matemático Paso a Paso</span>
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

          {/* Steps Display List */}
          <div className="space-y-4">
            {result.steps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
                    {step.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">Paso {idx + 1}</span>
                </div>

                <p className="text-xs text-slate-300">
                  {step.description}
                </p>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 font-mono text-xs space-y-1">
                  <p className="text-slate-400">
                    <span className="text-slate-500 font-semibold">Fórmula: </span>
                    <span className="text-slate-200">{step.formula}</span>
                  </p>
                  <p className="text-slate-400">
                    <span className="text-slate-500 font-semibold">Valores: </span>
                    <span className="text-slate-300">{step.values}</span>
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
