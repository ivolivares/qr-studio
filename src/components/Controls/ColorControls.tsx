import React from 'react';
import { Palette, Sparkles, Layers, Sliders, EyeOff } from 'lucide-react';
import { QRConfig } from '../../types/qr';
import { POPULAR_COLORS, POPULAR_BACKGROUNDS } from '../../utils/qrHelper';

interface ColorControlsProps {
  config: QRConfig;
  onChange: (updates: Partial<QRConfig>) => void;
}

export const ColorControls: React.FC<ColorControlsProps> = ({ config, onChange }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Palette className="w-4 h-4 text-blue-600" />
          Colores y Transparencia
        </label>
        <span className="text-xs text-slate-400">Personalización visual</span>
      </div>

      {/* 1. Foreground Color (Color Principal) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">
            Color Principal (Puntos y Patrón)
          </span>
          <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
            <input
              type="checkbox"
              checked={config.isGradient}
              onChange={(e) => onChange({ isGradient: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Efecto Degradado</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          {/* Main Color Picker */}
          <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
            <input
              type="color"
              value={config.fgColor}
              onChange={(e) => onChange({ fgColor: e.target.value })}
              className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
              title="Seleccionar color principal"
            />
            <input
              type="text"
              value={config.fgColor}
              onChange={(e) => onChange({ fgColor: e.target.value })}
              placeholder="#000000"
              maxLength={7}
              className="w-24 text-xs font-mono font-medium text-slate-800 bg-transparent focus:outline-none uppercase"
            />
            <span className="text-xs text-slate-400 ml-auto mr-1">Principal</span>
          </div>

          {/* Secondary Color if Gradient */}
          {config.isGradient && (
            <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-lg p-1.5 animate-fadeIn">
              <input
                type="color"
                value={config.fgColor2}
                onChange={(e) => onChange({ fgColor2: e.target.value })}
                className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                title="Seleccionar color secundario de degradado"
              />
              <input
                type="text"
                value={config.fgColor2}
                onChange={(e) => onChange({ fgColor2: e.target.value })}
                placeholder="#2563eb"
                maxLength={7}
                className="w-24 text-xs font-mono font-medium text-slate-800 bg-transparent focus:outline-none uppercase"
              />
              <span className="text-xs text-slate-400 ml-auto mr-1">Secundario</span>
            </div>
          )}
        </div>

        {/* Gradient Settings (if active) */}
        {config.isGradient && (
          <div className="grid grid-cols-2 gap-3 pt-1 p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 text-xs">
            <div>
              <label className="block text-slate-600 mb-1">Tipo de Degradado</label>
              <select
                value={config.gradientType}
                onChange={(e) => onChange({ gradientType: e.target.value as 'linear' | 'radial' })}
                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
              >
                <option value="linear">Lineal</option>
                <option value="radial">Radial (Centro hacia afuera)</option>
              </select>
            </div>
            {config.gradientType === 'linear' && (
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Ángulo</span>
                  <span>{config.gradientAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={config.gradientAngle}
                  onChange={(e) => onChange({ gradientAngle: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
            )}
          </div>
        )}

        {/* Quick color swatches */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 mr-1">Rápidos:</span>
          {POPULAR_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange({ fgColor: c.value })}
              className={`w-5 h-5 rounded-md border transition-transform ${
                config.fgColor === c.value ? 'scale-115 ring-2 ring-blue-500 ring-offset-1' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* 2. Transparent Background Toggle & Background Color Picker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-medium text-slate-700 block">
              Color de Fondo (Background)
            </label>
            <span className="text-[11px] text-slate-400">
              {config.isTransparent ? 'Transparencia activa para superposición' : 'Fondo sólido del código'}
            </span>
          </div>

          {/* Toggle / Checkbox Fondo Transparente */}
          <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={config.isTransparent}
              onChange={(e) => onChange({ isTransparent: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-xs font-semibold text-slate-800">
              Fondo Transparente
            </span>
          </label>
        </div>

        {/* Visual disabled state when transparent is enabled */}
        <div className={`transition-all duration-200 ${config.isTransparent ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
              <input
                type="color"
                disabled={config.isTransparent}
                value={config.bgColor}
                onChange={(e) => onChange({ bgColor: e.target.value })}
                className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent disabled:cursor-not-allowed"
                title="Seleccionar color de fondo"
              />
              <input
                type="text"
                disabled={config.isTransparent}
                value={config.bgColor}
                onChange={(e) => onChange({ bgColor: e.target.value })}
                placeholder="#ffffff"
                maxLength={7}
                className="w-24 text-xs font-mono font-medium text-slate-800 bg-transparent focus:outline-none uppercase disabled:cursor-not-allowed"
              />
              <span className="text-xs text-slate-400 ml-auto mr-1">Fondo</span>
            </div>

            <div className="flex items-center gap-1.5">
              {POPULAR_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.value}
                  type="button"
                  disabled={config.isTransparent}
                  onClick={() => onChange({ bgColor: bg.value })}
                  className={`w-6 h-6 rounded-md border border-slate-300 transition-transform ${
                    config.bgColor === bg.value ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                  }`}
                  style={{ backgroundColor: bg.value }}
                  title={bg.name}
                />
              ))}
            </div>
          </div>
        </div>

        {config.isTransparent && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50/70 border border-amber-200/80 rounded-lg text-[11px] text-amber-800">
            <EyeOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <strong>Fondo transparente habilitado:</strong> El selector de fondo está desactivado. El PNG exportado a 4096px contendrá canal Alfa transparente perfecto para montajes sobre empaques, vinilos o fondos fotográficos.
            </span>
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* 3. Custom Corner Colors (Opcional avanzado) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">
            Colores Personalizados de Esquinas (Marcadores)
          </span>
          <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
            <input
              type="checkbox"
              checked={config.customCornerColors}
              onChange={(e) => onChange({ customCornerColors: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Diferenciar esquinas</span>
          </label>
        </div>

        {config.customCornerColors && (
          <div className="grid grid-cols-2 gap-3 pt-1 animate-fadeIn">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Marco Exterior (Square)</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                <input
                  type="color"
                  value={config.cornerSquareColor}
                  onChange={(e) => onChange({ cornerSquareColor: e.target.value })}
                  className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={config.cornerSquareColor}
                  onChange={(e) => onChange({ cornerSquareColor: e.target.value })}
                  className="w-18 text-xs font-mono uppercase bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Punto Central (Dot)</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
                <input
                  type="color"
                  value={config.cornerDotColor}
                  onChange={(e) => onChange({ cornerDotColor: e.target.value })}
                  className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={config.cornerDotColor}
                  onChange={(e) => onChange({ cornerDotColor: e.target.value })}
                  className="w-18 text-xs font-mono uppercase bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
