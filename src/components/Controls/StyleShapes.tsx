import React from 'react';
import { Shapes, Grid, Box } from 'lucide-react';
import { QRConfig, DotShapeType, CornerSquareShapeType, CornerDotShapeType } from '../../types/qr';

interface StyleShapesProps {
  config: QRConfig;
  onChange: (updates: Partial<QRConfig>) => void;
}

export const StyleShapes: React.FC<StyleShapesProps> = ({ config, onChange }) => {
  const dotShapes: { id: DotShapeType; label: string; preview: string }[] = [
    { id: 'square', label: 'Cuadrado Clásico', preview: '■' },
    { id: 'rounded', label: 'Redondeado', preview: '▢' },
    { id: 'dots', label: 'Puntos Circulares', preview: '●' },
    { id: 'extra-rounded', label: 'Extra Curvo', preview: '⬤' },
    { id: 'classy', label: 'Classy', preview: '◆' },
    { id: 'classy-rounded', label: 'Classy Suave', preview: '◈' },
  ];

  const cornerSquares: { id: CornerSquareShapeType; label: string }[] = [
    { id: 'square', label: 'Cuadrado' },
    { id: 'extra-rounded', label: 'Redondeado' },
    { id: 'dot', label: 'Circular' },
  ];

  const cornerDots: { id: CornerDotShapeType; label: string }[] = [
    { id: 'square', label: 'Cuadrado' },
    { id: 'dot', label: 'Circular' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Shapes className="w-4 h-4 text-blue-600" />
          Patrón y Geometría
        </label>
        <span className="text-xs text-slate-400">Estilo de módulos</span>
      </div>

      {/* Dot Style Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-700">
          Forma de los Puntos (Dots)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {dotShapes.map((dot) => (
            <button
              key={dot.id}
              type="button"
              onClick={() => onChange({ dotShape: dot.id })}
              className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                config.dotShape === dot.id
                  ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-2xs font-semibold'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
              }`}
            >
              <span className="text-lg leading-none">{dot.preview}</span>
              <span className="text-[10px] leading-tight truncate w-full">{dot.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Corner Shapes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Marco de Esquina (Corner Square)
          </label>
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
            {cornerSquares.map((sq) => (
              <button
                key={sq.id}
                type="button"
                onClick={() => onChange({ cornerSquareShape: sq.id })}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                  config.cornerSquareShape === sq.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sq.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Punto Interior de Esquina (Corner Dot)
          </label>
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
            {cornerDots.map((cd) => (
              <button
                key={cd.id}
                type="button"
                onClick={() => onChange({ cornerDotShape: cd.id })}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                  config.cornerDotShape === cd.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cd.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Margin / Padding Slider */}
      <div className="pt-1">
        <div className="flex justify-between text-xs text-slate-700 mb-1">
          <span className="font-medium">Zona Silenciosa (Margen Exterior)</span>
          <span className="font-semibold text-slate-900">{config.margin} px</span>
        </div>
        <input
          type="range"
          min="0"
          max="35"
          step="1"
          value={config.margin}
          onChange={(e) => onChange({ margin: Number(e.target.value) })}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>0px (Al borde)</span>
          <span>12px (Recomendado estándar)</span>
          <span>35px (Margen amplio)</span>
        </div>
      </div>
    </div>
  );
};
