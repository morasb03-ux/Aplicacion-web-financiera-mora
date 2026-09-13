import React from 'react';
import { helpTopics } from '../data/helpData';
import { HelpCircle, X, CheckCircle2, ArrowRight } from 'lucide-react';

interface HelpModalProps {
  topicId: string | null;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ topicId, onClose }) => {
  if (!topicId) return null;

  const topic = helpTopics[topicId];
  if (!topic) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-950/80 border border-red-900/80 text-red-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">{topic.title}</h3>
              <p className="text-xs text-red-400 font-medium">Guía Pedagógica y Conceptos Clave</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Definition */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
              1. Definición del Proceso Contable
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {topic.definition}
            </p>
          </div>

          {/* Requirements */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
              2. Requisitos según el Tipo de Cálculo
            </h4>
            <ul className="space-y-2">
              {topic.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Guide Example */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
              3. Ejemplo Guía para Diligenciar Datos
            </h4>
            
            <p className="text-xs font-medium text-slate-200">
              <span className="text-slate-400">Escenario: </span>
              {topic.example.scenario}
            </p>

            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Datos de Entrada Sugeridos:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(topic.example.inputs).map(([key, val]) => (
                  <div key={key} className="flex justify-between p-1.5 rounded bg-slate-950 border border-slate-800/60">
                    <span className="text-slate-400">{key}:</span>
                    <span className="font-semibold text-slate-200">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-emerald-300 text-xs flex items-start gap-2">
              <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Resultado Esperado: </span>
                <span>{topic.example.expectedOutcome}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-red-900 hover:bg-red-800 transition-colors shadow-md"
          >
            Entendido, ir a diligenciar
          </button>
        </div>

      </div>
    </div>
  );
};
