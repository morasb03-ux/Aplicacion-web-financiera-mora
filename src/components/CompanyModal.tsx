import React, { useState } from 'react';
import { CompanyInfo } from '../types';
import { Building2, X, Check } from 'lucide-react';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyInfo: CompanyInfo;
  onSave: (info: CompanyInfo) => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  companyInfo,
  onSave
}) => {
  const [formData, setFormData] = useState<CompanyInfo>(companyInfo);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-950/80 border border-red-900 text-red-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">Datos de la Empresa o Institución</h3>
              <p className="text-xs text-slate-400">Campos opcionales para personalizar la exportación de informes PDF/TXT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nombre de Empresa / Institución
            </label>
            <input
              type="text"
              placeholder="Ej: Servicios Contables Mora S.A.S."
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              NIT / Identificación Tributaria
            </label>
            <input
              type="text"
              placeholder="Ej: 900.123.456-7"
              value={formData.nit}
              onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Dirección
            </label>
            <input
              type="text"
              placeholder="Ej: Calle 100 # 15-20, Bogotá D.C."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tipo de Proceso Contable Generado (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Informe de Amortización de Crédito Comercial"
              value={formData.processType}
              onChange={(e) => setFormData({ ...formData, processType: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-red-900 hover:bg-red-800 transition-all shadow-lg shadow-red-950/60"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Datos</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
