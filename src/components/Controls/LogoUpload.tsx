import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Trash2, ShieldAlert, Sparkles, Sliders } from 'lucide-react';
import { QRConfig } from '../../types/qr';
import { PRESET_LOGOS } from '../../utils/qrHelper';

interface LogoUploadProps {
  config: QRConfig;
  onChange: (updates: Partial<QRConfig>) => void;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ config, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file) return;
    if (!file.type.match(/image\/(png|jpeg|jpg|svg\+xml|webp)/i)) {
      alert('Por favor sube una imagen válida en formato PNG, JPG, SVG o WebP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange({
          logoUrl: result,
          logoFileName: file.name,
          hideBackgroundDots: true
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemoveLogo = () => {
    onChange({
      logoUrl: null,
      logoFileName: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const logoPercentage = Math.round(config.logoSize * 100);
  const isSafeSize = logoPercentage <= 26;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-600" />
          Logotipo Central (Opcional)
        </label>
        <span className="text-xs text-slate-400">PNG, JPG o SVG</span>
      </div>

      {/* Upload Zone */}
      {!config.logoUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                Haz clic o arrastra tu logo aquí
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Archivos recomendados: PNG con transparencia o vector SVG
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Logo Preview Card & Controls */
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden bg-checkerboard shadow-2xs">
                <img
                  src={config.logoUrl}
                  alt="Logo preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 truncate max-w-[180px]">
                  {config.logoFileName || 'Logotipo cargado'}
                </p>
                <p className="text-[11px] text-emerald-600 font-medium">
                  ✓ Incrustado en el centro del QR
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveLogo}
              className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
              title="Eliminar logo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <hr className="border-slate-200" />

          {/* Logo Size Control (Dynamic Proportion) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                Tamaño del Logo: <strong className="text-slate-900">{logoPercentage}%</strong>
              </span>
              <span className={`text-[11px] font-semibold ${isSafeSize ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isSafeSize ? 'Zona Segura (Nivel H)' : 'Área Máxima'}
              </span>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.30"
              step="0.01"
              value={config.logoSize}
              onChange={(e) => onChange({ logoSize: parseFloat(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>15% (Discreto)</span>
              <span>24% (Recomendado estándar)</span>
              <span>30% (Máx seguro)</span>
            </div>
          </div>

          {/* Margin around logo & Hide background dots */}
          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div>
              <label className="block text-slate-600 mb-1">
                Margen de seguridad: {config.logoMargin}px
              </label>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={config.logoMargin}
                onChange={(e) => onChange({ logoMargin: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
            <div className="flex items-center pt-3">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={config.hideBackgroundDots}
                  onChange={(e) => onChange({ hideBackgroundDots: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[11px]">Despejar fondo detrás del logo</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Preset sample logos for quick testing */}
      <div className="pt-1">
        <span className="text-xs text-slate-500 block mb-2">
          O prueba con un ícono de muestra:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_LOGOS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onChange({
                  logoUrl: preset.svgDataUri,
                  logoFileName: `${preset.name}.svg`,
                  hideBackgroundDots: true
                });
              }}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <img src={preset.svgDataUri} alt={preset.name} className="w-3.5 h-3.5" />
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
