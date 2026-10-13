import React from 'react';
import { QrCode, Sparkles, Printer, CheckCircle2 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                QR Studio <span className="text-blue-600 font-extrabold">Ultra HD</span>
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                4096 × 4096 px
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Generador profesional para gigantografías, imprenta y cartelería de gran formato
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nivel de Corrección <strong>'H' (30%)</strong></span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>Listo para Plóter & Offset</span>
          </div>
        </div>
      </div>
    </header>
  );
};
