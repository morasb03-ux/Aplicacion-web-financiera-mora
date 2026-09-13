import React, { useState } from 'react';
import {
  DiagramType,
  DiagramInput,
  DiagramResult,
  CompanyInfo,
  RatePeriodicity,
  CashFlowItem
} from '../types';
import { calculateEconomicDiagram } from '../utils/financialCalculations';
import { exportToPDF } from '../utils/pdfExport';
import { exportToTXT } from '../utils/txtExport';
import { formatCOP } from '../utils/formatters';
import { TimelineChart } from './TimelineChart';
import { LineChart, HelpCircle, FileText, Download, CheckCircle2, Play, Plus, Trash2 } from 'lucide-react';

interface EconomicDiagramModuleProps {
  companyInfo: CompanyInfo;
  onOpenHelp: (topicId: string) => void;
}

export const EconomicDiagramModule: React.FC<EconomicDiagramModuleProps> = ({
  companyInfo,
  onOpenHelp
}) => {
  const [diagramType, setDiagramType] = useState<DiagramType>('prestamo');

  // Input states
  const [principal, setPrincipal] = useState<string>('10000000');
  const [rate, setRate] = useState<string>('2');
  const [ratePeriodicity, setRatePeriodicity] = useState<RatePeriodicity>('mensual');
  const [periods, setPeriods] = useState<string>('12');
  const [annuityAmount, setAnnuityAmount] = useState<string>('945600');

  // Custom cash flows state for 'flujo-caja' option
  const [customFlows, setCustomFlows] = useState<CashFlowItem[]>([
    { period: 0, amount: 10000000, type: 'egreso', label: 'Inversión Inicial t=0' },
    { period: 1, amount: 3000000, type: 'ingreso', label: 'Ingreso Operativo t=1' },
    { period: 2, amount: 4000000, type: 'ingreso', label: 'Ingreso Operativo t=2' },
    { period: 3, amount: 5000000, type: 'ingreso', label: 'Ingreso Operativo t=3' },
    { period: 4, amount: 3500000, type: 'ingreso', label: 'Cierre de Proyecto t=4' },
  ]);

  const [result, setResult] = useState<DiagramResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const diagramTypesList: { id: DiagramType; label: string; desc: string }[] = [
    { id: 'prestamo', label: 'Préstamo', desc: 'Desembolso recibido en t=0 y reembolsos periódicos' },
    { id: 'inversion', label: 'Inversión', desc: 'Inyección inicial de capital y retorno futuro con utilidades' },
    { id: 'anualidad', label: 'Anualidad', desc: 'Serie de cuotas periódicas iguales en el tiempo' },
    { id: 'vp-vf', label: 'Valor Presente a Valor Futuro', desc: 'Línea de tiempo de capitalización de suma única' },
    { id: 'vf-vp', label: 'Valor Futuro a Valor Presente', desc: 'Línea de tiempo de actualización de suma única' },
    { id: 'flujo-caja', label: 'Flujo de Caja Personalizado', desc: 'Serie libre de ingresos (+) y egresos (-)' },
  ];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rVal = parseFloat(rate);
    const pVal = parseInt(periods, 10);
    const pPrinc = parseFloat(principal);

    if (isNaN(rVal) || rVal <= 0) {
      setError('Ingrese una tasa de interés válida.');
      return;
    }
    if (isNaN(pVal) || pVal <= 0 || pVal > 30) {
      setError('Ingrese un número de periodos entre 1 y 30 para visualización de la línea de tiempo.');
      return;
    }

    const inputData: DiagramInput = {
      type: diagramType,
      principal: isNaN(pPrinc) ? 0 : pPrinc,
      rate: rVal,
      ratePeriodicity,
      periods: pVal,
      annuityAmount: parseFloat(annuityAmount) || pPrinc,
      customFlows
    };

    const diagramRes = calculateEconomicDiagram(inputData);
    setResult(diagramRes);
  };

  const handleAddCustomFlow = () => {
    const nextP = customFlows.length;
    setCustomFlows([
      ...customFlows,
      { period: nextP, amount: 2000000, type: 'ingreso', label: `Flujo t=${nextP}` }
    ]);
  };

  const handleRemoveCustomFlow = (idx: number) => {
    setCustomFlows(customFlows.filter((_, i) => i !== idx));
  };

  const handleFlowChange = (idx: number, field: keyof CashFlowItem, val: any) => {
    const updated = [...customFlows];
    updated[idx] = { ...updated[idx], [field]: val };
    setCustomFlows(updated);
  };

  const handleExportPDF = () => {
    if (!result) return;
    const summary = `${result.summaryText} Tasa: ${rate}% ${ratePeriodicity} en ${periods} periodos.`;

    // Map table headers & data for cash flows
    const headers = ['Periodo (t)', 'Tipo de Transacción', 'Monto en COP', 'Etiqueta'];
    const data = result.flows.map(f => [
      `t = ${f.period}`,
      f.type.toUpperCase(),
      formatCOP(f.amount),
      f.label
    ]);

    exportToPDF(
      'Diagrama Económico y Línea de Tiempo',
      companyInfo,
      summary,
      result.steps,
      headers,
      data
    );
  };

  const handleExportTXT = () => {
    if (!result) return;
    const summary = `${result.summaryText} Tasa: ${rate}% ${ratePeriodicity} en ${periods} periodos.`;

    const headers = ['Periodo (t)', 'Tipo de Transacción', 'Monto en COP', 'Etiqueta'];
    const data = result.flows.map(f => [
      `t = ${f.period}`,
      f.type.toUpperCase(),
      formatCOP(f.amount),
      f.label
    ]);

    exportToTXT(
      'Diagrama Económico y Línea de Tiempo',
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
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">
                Módulo 3: Diagramas Económicos y Flujos
              </h2>
              <button
                onClick={() => onOpenHelp('economic-diagram')}
                className="p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                title="Ayuda y guía de este proceso"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Líneas de tiempo interactivas de ingeniería económica adaptadas al tipo de flujo.
            </p>
          </div>
        </div>
      </div>

      {/* Main Diagram Form */}
      <form onSubmit={handleCalculate} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        
        {/* Diagram Type Dropdown */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-red-400">
            Selecciona el Tipo de Diagrama Económico:
          </label>
          
          <select
            value={diagramType}
            onChange={(e) => {
              setDiagramType(e.target.value as DiagramType);
              setResult(null);
            }}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-semibold focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          >
            {diagramTypesList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label} — ({d.desc})
              </option>
            ))}
          </select>
        </div>

        {/* Inputs per diagram choice */}
        {diagramType !== 'flujo-caja' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {diagramType === 'prestamo' ? 'Monto del Préstamo Recibido ($)' : 'Monto Principal ($)'} *
              </label>
              <input
                type="number"
                step="any"
                required
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-red-600"
              />
            </div>

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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Número de Periodos (n) *
              </label>
              <input
                type="number"
                required
                max={30}
                value={periods}
                onChange={(e) => setPeriods(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-red-600"
              />
            </div>

            {diagramType === 'anualidad' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monto de la Anualidad Periódica ($) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={annuityAmount}
                  onChange={(e) => setAnnuityAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:border-red-600"
                />
              </div>
            )}

          </div>
        ) : (
          /* Custom cash flow inputs */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tasa de Descuento (%) *
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Periodicidad *
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
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Listado de Transacciones para el Flujo de Caja:
                </label>
                <button
                  type="button"
                  onClick={handleAddCustomFlow}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Transacción</span>
                </button>
              </div>

              <div className="space-y-2">
                {customFlows.map((flow, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 items-center">
                    <div className="sm:col-span-2 text-xs text-slate-400 font-mono">
                      Periodo t = {flow.period}
                    </div>

                    <div className="sm:col-span-3">
                      <select
                        value={flow.type}
                        onChange={(e) => handleFlowChange(idx, 'type', e.target.value)}
                        className="w-full bg-slate-900 text-slate-100 text-xs p-1.5 rounded-lg border border-slate-800"
                      >
                        <option value="ingreso">Ingreso (+ Entrada)</option>
                        <option value="egreso">Egreso (- Salida)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <input
                        type="number"
                        step="any"
                        value={flow.amount}
                        onChange={(e) => handleFlowChange(idx, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="Monto"
                        className="w-full bg-slate-900 text-slate-100 text-xs p-1.5 rounded-lg border border-slate-800 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={flow.label}
                        onChange={(e) => handleFlowChange(idx, 'label', e.target.value)}
                        placeholder="Etiqueta"
                        className="w-full bg-slate-900 text-slate-100 text-xs p-1.5 rounded-lg border border-slate-800"
                      />
                    </div>

                    <div className="sm:col-span-1 text-right">
                      {customFlows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomFlow(idx)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
          <span>Generar Diagrama Económico y Calcular Equivalencia</span>
        </button>

      </form>

      {/* Result Display & Timeline Chart */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Visual Interactive Timeline Chart Component */}
          <TimelineChart
            flows={result.flows}
            rate={parseFloat(rate)}
            periods={result.flows.length - 1}
          />

          {/* Main Summary Result Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            
            <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-950 to-red-950/80 border border-red-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 block mb-1">
                  Valor Calculado Principal:
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-mono tracking-tight">
                  {formatCOP(result.calculatedMainValue)}
                </div>
                <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
                  {result.summaryText}
                </p>
              </div>
            </div>

            {/* Action Export Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Procedimiento de Cálculo Explicado Paso a Paso</span>
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
