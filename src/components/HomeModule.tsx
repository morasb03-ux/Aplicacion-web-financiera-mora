import React from 'react';
import { ModuleType } from '../types';
import { Calculator, Clock, LineChart, Table2, ArrowRight, ShieldCheck, Download, GraduationCap } from 'lucide-react';

interface HomeModuleProps {
  setCurrentModule: (mod: ModuleType) => void;
}

export const HomeModule: React.FC<HomeModuleProps> = ({ setCurrentModule }) => {
  const modules = [
    {
      id: 'rate-conversion' as ModuleType,
      title: 'Módulo 1: Conversión de Tasas',
      subtitle: 'Nominal, Efectiva, Vencida y Anticipada',
      description: 'Transformación exacta entre tasas de interés con desarrollo algebraico paso a paso, equivalencia de tasas efectivas anuales y periódicas.',
      icon: Calculator,
      badge: 'Fórmulas Paso a Paso'
    },
    {
      id: 'tvm' as ModuleType,
      title: 'Módulo 2: Valor del Dinero en el Tiempo',
      subtitle: 'VP, VF, VPN, Intereses y Anualidades',
      description: 'Cálculo de capitalización, actualización de flujos de caja, Valor Presente Neto (VPN) y rentabilidades de anualidades vencidas o anticipadas.',
      icon: Clock,
      badge: 'Matemática Financiera'
    },
    {
      id: 'economic-diagram' as ModuleType,
      title: 'Módulo 3: Diagramas Económicos',
      subtitle: 'Líneas de Tiempo e Ingeniería Económica',
      description: 'Representación gráfica e interactiva de entradas (+) y salidas (-) de caja a lo largo del tiempo para préstamos, inversiones y flujos.',
      icon: LineChart,
      badge: 'Visualizador Interactivo'
    },
    {
      id: 'amortization' as ModuleType,
      title: 'Módulo 4: Tablas de Amortización',
      subtitle: 'Sistema Francés y Sistema Alemán',
      description: 'Generación completa de tablas de amortización de créditos con seguro de vida opcional, calendario comercial de 360 días y desglose detallado.',
      icon: Table2,
      badge: '10 Columnas Formateadas'
    }
  ];

  return (
    <div className="space-y-12 animate-fade-in">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-red-950/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-900/80 text-red-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-red-400" />
            <span>Diseñado para Tecnólogos en Contabilidad y Finanzas</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
            Gestión Contable e <span className="text-red-700">Información Financiera</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Plataforma interactiva especializada en procesos de ingeniería económica y contabilidad financiera. 
            Realiza cálculos matemáticos exactos con desarrollo fórmula a fórmula y exportación directa de informes técnicos en formato <strong className="text-slate-100">PDF y TXT</strong>.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Precisión Mínima de 2 Decimales</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <Download className="w-4 h-4 text-red-400" />
              <span>Informes con Membrete Empresarial</span>
            </div>
          </div>

        </div>
      </div>

      {/* Grid of Modules */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-slate-100">
            Módulos Contables Disponibles
          </h2>
          <span className="text-xs text-slate-400">Selecciona un módulo para comenzar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => setCurrentModule(mod.id)}
                className="group relative bg-slate-900/90 border border-slate-800 hover:border-red-800 rounded-2xl p-6 transition-all cursor-pointer hover:shadow-2xl hover:shadow-red-950/30 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-red-500 group-hover:bg-red-950/80 group-hover:border-red-800 group-hover:text-red-300 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-red-400 bg-red-950/40 border border-red-900/50 px-2.5 py-1 rounded-full">
                      {mod.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-red-400 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      {mod.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {mod.description}
                  </p>

                </div>

                <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-red-500 group-hover:text-red-400">
                  <span>Ingresar al Módulo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
