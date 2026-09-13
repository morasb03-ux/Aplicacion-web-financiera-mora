import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-slate-950 border-t border-slate-900 py-8 px-4 sm:px-6 lg:px-8 text-slate-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <span className="font-gothic text-2xl font-bold text-red-800">Mora</span>
          <span className="text-slate-600">|</span>
          <p className="text-slate-400">
            Derechos reservados © {new Date().getFullYear()} Mora - Gestión Contable e Información Financiera
          </p>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <a
            href="https://wa.me/573112858643"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-red-400 transition-colors"
          >
            <span>WhatsApp Soporte (+57 311 285 8643)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Precisión Matemática Garantizada</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
