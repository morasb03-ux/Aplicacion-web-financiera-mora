import React from 'react';
import { ModuleType, CompanyInfo } from '../types';
import { Building2, Calculator, Clock, LineChart, Table2, Home, ExternalLink } from 'lucide-react';

interface HeaderProps {
  currentModule: ModuleType;
  setCurrentModule: (mod: ModuleType) => void;
  companyInfo: CompanyInfo;
  onOpenCompanyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  setCurrentModule,
  companyInfo,
  onOpenCompanyModal
}) => {
  const navItems = [
    { id: 'home' as ModuleType, label: 'Inicio', icon: Home },
    { id: 'rate-conversion' as ModuleType, label: 'Conversión de Tasas', icon: Calculator },
    { id: 'tvm' as ModuleType, label: 'Valor del Dinero', icon: Clock },
    { id: 'economic-diagram' as ModuleType, label: 'Diagrama Económico', icon: LineChart },
    { id: 'amortization' as ModuleType, label: 'Amortización', icon: Table2 },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Gothic Fixed Title Logo "Mora" in dark red */}
          <a
            href="https://wa.me/573112858643"
            target="_blank"
            rel="noopener noreferrer"
            title="Contacto directo por WhatsApp"
            className="flex items-center gap-2 group transition-all"
          >
            <span className="font-gothic text-3xl sm:text-4xl font-bold tracking-wider text-red-800 group-hover:text-red-600 transition-colors drop-shadow-[0_2px_10px_rgba(139,0,0,0.5)]">
              Mora
            </span>
            <span className="hidden sm:inline-block text-[10px] font-semibold tracking-widest text-red-500 uppercase bg-red-950/50 border border-red-900/60 px-2 py-0.5 rounded-full group-hover:border-red-600 transition-colors">
              Finanzas
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-red-700 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentModule(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-red-950/80 text-red-200 border border-red-800/80 shadow-md shadow-red-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Company Config Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCompanyModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-all shadow-sm"
              title="Configurar datos de empresa para informes"
            >
              <Building2 className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">
                {companyInfo.companyName ? companyInfo.companyName : 'Datos de Empresa'}
              </span>
              <span className="sm:hidden">Empresa</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-800/80 overflow-x-auto scrollbar-none gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentModule(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-950/80 text-red-200 border border-red-800/80'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
