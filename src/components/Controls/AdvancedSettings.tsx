import React from 'react';
import { Sliders, ShieldCheck, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import { QRConfig } from '../../types/qr';

interface AdvancedSettingsProps {
  config: QRConfig;
  onChange: (updates: Partial<QRConfig>) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ config, onChange }) => {
  const levels: {
    id: 'L' | 'M' | 'Q' | 'H';
    label: string;
    recovery: string;
    description: string;
    maxRecommendedLogo: number;
  }[] = [
    {
      id: 'L',
      label: 'Nivel L (Low)',
      recovery: '~7%',
      description: 'Menor densidad de puntos. Para textos largos sin logo.',
      maxRecommendedLogo: 0.10,
    },
    {
      id: 'M',
      label: 'Nivel M (Medium)',
      recovery: '~15%',
      description: 'Estándar para web. Admite logos muy discretos.',
      maxRecommendedLogo: 0.16,
    },
    {
      id: 'Q',
      label: 'Nivel Q (Quartile)',
      recovery: '~25%',
      description: 'Alta tolerancia. Adecuado para logos medianos.',
      maxRecommendedLogo: 0.22,
    },
    {
      id: 'H',
      label: 'Nivel H (High)',
      recovery: '~30%',
      description: 'Máxima redundancia. Esencial para gigantografías y logos grandes.',
      maxRecommendedLogo: 0.30,
    },
  ];

  const currentLevelConfig = levels.find((l) => l.id === config.errorCorrectionLevel) || levels[3];
  const hasLogo = Boolean(config.logoUrl);
  const logoPercentage = Math.round(config.logoSize * 100);

  // Incompatibility check between Error Correction Level and Logo Size
  const isLogoTooBigForLevel = hasLogo && config.logoSize > currentLevelConfig.maxRecommendedLogo;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Ajustes Avanzados: Corrección de Errores y Calibración
        </label>
        <span className="text-xs text-slate-400">Reed-Solomon ECC</span>
      </div>

      {/* 1. Selector de Nivel de Corrección de Errores */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">
            Nivel de Corrección de Errores (ECC)
          </span>
          <span className="text-xs font-semibold text-blue-600">
            Recuperación: {currentLevelConfig.recovery}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {levels.map((lvl) => {
            const isSelected = config.errorCorrectionLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => onChange({ errorCorrectionLevel: lvl.id })}
                className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{lvl.id}</span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">{lvl.recovery}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-700 block mt-0.5">
                    {lvl.label.split(' ')[1]}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-tight line-clamp-2">
                  {lvl.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Warning if logo exceeds error correction threshold */}
      {isLogoTooBigForLevel && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs flex items-start gap-2.5 text-rose-800 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">
              Riesgo de Ilegibilidad: El logo ocupa el {logoPercentage}% pero el Nivel {config.errorCorrectionLevel} solo tolera {currentLevelConfig.recovery}.
            </p>
            <p className="text-[11px] text-rose-700">
              Te recomendamos cambiar al <strong className="underline cursor-pointer" onClick={() => onChange({ errorCorrectionLevel: 'H' })}>Nivel H (30%)</strong> o reducir el tamaño del logo para garantizar que cualquier cámara pueda escanearlo.
            </p>
          </div>
        </div>
      )}

      {/* 2. Ajuste Fino del Tamaño del Logo (Si hay logo activo) */}
      {hasLogo && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              Ajuste Fino del Logo: <strong className="text-blue-700">{logoPercentage}%</strong> del ancho del QR
            </span>
            <span className="text-[11px] text-slate-500">
              Máx recomendado para nivel {config.errorCorrectionLevel}: {Math.round(currentLevelConfig.maxRecommendedLogo * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0.10"
            max="0.32"
            step="0.005"
            value={config.logoSize}
            onChange={(e) => onChange({ logoSize: parseFloat(e.target.value) })}
            className="w-full accent-blue-600 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-400">
            <span>10% (Muy pequeño)</span>
            <span>20% (Discreto)</span>
            <span>24% (Estándar Seguro)</span>
            <span>30% (Máx Nivel H)</span>
          </div>
        </div>
      )}

      {/* Explicación Técnica */}
      <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>¿Cómo influye el nivel ECC?</strong> A mayor corrección (H), el código genera más cuadritos (módulos) para redundancia, haciendo el QR más denso pero invulnerable a manchas, rasguños y la oclusión del logo central.
        </p>
      </div>
    </div>
  );
};
