import React, { useState } from 'react';
import { CashFlowItem } from '../types';
import { formatCOP } from '../utils/formatters';
import { ArrowUp, ArrowDown, Circle } from 'lucide-react';

interface TimelineChartProps {
  flows: CashFlowItem[];
  rate: number;
  periods: number;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ flows, rate, periods }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);

  // Find max absolute amount for scaling arrow heights
  const maxAmount = Math.max(...flows.map(f => f.amount), 1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl overflow-hidden">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span>Visualización de Diagrama Económico (Línea del Tiempo)</span>
          </h4>
          <p className="text-xs text-slate-400">
            Tasa de interés: <strong className="text-red-400">{rate}%</strong> | Plazo: <strong className="text-slate-200">{periods} periodos</strong>
          </p>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-1 rounded-lg">
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Ingreso (+ Caja)</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400 bg-rose-950/40 border border-rose-900/60 px-2.5 py-1 rounded-lg">
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Egreso (- Caja)</span>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Canvas */}
      <div className="relative py-12 px-4 overflow-x-auto min-w-[600px] scrollbar-thin">
        
        {/* Central Horizontal Timeline Line */}
        <div className="absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-slate-700 via-red-900 to-slate-700 -translate-y-1/2 rounded-full z-0" />

        {/* Nodes along periods */}
        <div className="relative z-10 flex items-center justify-between">
          {flows.map((flow) => {
            const isSelected = selectedPeriod === flow.period;
            const isIngreso = flow.type === 'ingreso';
            const hasValue = flow.amount > 0;

            // Arrow height proportion
            const heightPercent = hasValue 
              ? Math.max(25, Math.min(80, (flow.amount / maxAmount) * 80)) 
              : 0;

            return (
              <div
                key={flow.period}
                onClick={() => setSelectedPeriod(flow.period)}
                className="flex flex-col items-center cursor-pointer group relative px-2"
                style={{ minWidth: '60px' }}
              >
                
                {/* Top Area for Upward Inflow Arrow */}
                <div className="h-24 flex flex-col justify-end items-center mb-2">
                  {hasValue && isIngreso && (
                    <div className="flex flex-col items-center animate-fade-in group-hover:scale-105 transition-transform">
                      <span className="text-[10px] font-bold text-emerald-400 bg-slate-950/90 border border-emerald-900/80 px-2 py-0.5 rounded-md shadow-md mb-1 whitespace-nowrap">
                        +{formatCOP(flow.amount)}
                      </span>
                      <div 
                        className="w-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t"
                        style={{ height: `${heightPercent}px` }}
                      />
                      <ArrowUp className="w-4 h-4 text-emerald-400 -mt-1" />
                    </div>
                  )}
                </div>

                {/* Node Point on Timeline */}
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isSelected
                      ? 'bg-red-600 text-white ring-4 ring-red-900 shadow-lg scale-110'
                      : 'bg-slate-900 text-slate-300 border-2 border-slate-700 group-hover:border-red-500'
                  }`}
                >
                  {flow.period}
                </div>
                <span className="text-[11px] font-medium text-slate-400 mt-1">
                  t = {flow.period}
                </span>

                {/* Bottom Area for Downward Outflow Arrow */}
                <div className="h-24 flex flex-col justify-start items-center mt-2">
                  {hasValue && !isIngreso && (
                    <div className="flex flex-col items-center animate-fade-in group-hover:scale-105 transition-transform">
                      <ArrowDown className="w-4 h-4 text-rose-400 -mb-1" />
                      <div 
                        className="w-1 bg-gradient-to-b from-rose-600 to-rose-400 rounded-b"
                        style={{ height: `${heightPercent}px` }}
                      />
                      <span className="text-[10px] font-bold text-rose-400 bg-slate-950/90 border border-rose-900/80 px-2 py-0.5 rounded-md shadow-md mt-1 whitespace-nowrap">
                        -{formatCOP(flow.amount)}
                      </span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Selected Period Detail Card */}
      {selectedPeriod !== null && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 animate-fade-in flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
              Detalle del Periodo t = {selectedPeriod}
            </span>
            <p className="text-sm font-semibold text-slate-200 mt-0.5">
              {flows.find(f => f.period === selectedPeriod)?.label}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Monto en este punto:</span>
            <span className={`text-base font-bold ${
              flows.find(f => f.period === selectedPeriod)?.type === 'ingreso' 
                ? 'text-emerald-400' 
                : 'text-rose-400'
            }`}>
              {formatCOP(flows.find(f => f.period === selectedPeriod)?.amount || 0)}
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
