import React, { useState } from 'react';
import { Header } from './components/Header';
import { ContentInput } from './components/Controls/ContentInput';
import { ColorControls } from './components/Controls/ColorControls';
import { LogoUpload } from './components/Controls/LogoUpload';
import { StyleShapes } from './components/Controls/StyleShapes';
import { QRPreview } from './components/QRPreview';
import { QRConfig } from './types/qr';
import { RotateCcw, Sparkles, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

const INITIAL_CONFIG: QRConfig = {
  contentCategory: 'url',
  rawText: 'https://ejemplo.com',
  wifi: {
    ssid: 'Oficina_Principal',
    password: 'Password2026',
    encryption: 'WPA',
    hidden: false,
  },
  vcard: {
    firstName: 'Alejandro',
    lastName: 'Morales',
    phone: '+56 9 8765 4321',
    email: 'contacto@estudio.com',
    company: 'Estudio Creativo',
    jobTitle: 'Director de Arte',
    website: 'https://estudio.com',
  },
  email: {
    address: 'hola@empresa.com',
    subject: 'Solicitud de Presupuesto',
    body: 'Hola, me gustaría solicitar información sobre...',
  },

  // Colors & Transparency
  fgColor: '#0f172a',
  fgColor2: '#2563eb',
  isGradient: false,
  gradientType: 'linear',
  gradientAngle: 45,

  bgColor: '#ffffff',
  isTransparent: false,

  customCornerColors: false,
  cornerSquareColor: '#0f172a',
  cornerDotColor: '#2563eb',

  // Geometry
  dotShape: 'rounded',
  cornerSquareShape: 'extra-rounded',
  cornerDotShape: 'dot',

  // Sizing & Margin
  margin: 12,

  // Logo
  logoUrl: null,
  logoFileName: null,
  logoSize: 0.24, // 24% of QR code width (safe area)
  logoMargin: 4,
  hideBackgroundDots: true,
};

export default function App() {
  const [config, setConfig] = useState<QRConfig>(INITIAL_CONFIG);

  const handleConfigChange = (updates: Partial<QRConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleReset = () => {
    setConfig(INITIAL_CONFIG);
  };

  // Quick Preset Styles
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'classic':
        handleConfigChange({
          fgColor: '#000000',
          bgColor: '#ffffff',
          isTransparent: false,
          isGradient: false,
          dotShape: 'square',
          cornerSquareShape: 'square',
          cornerDotShape: 'square',
          margin: 15,
        });
        break;
      case 'modern-blue':
        handleConfigChange({
          fgColor: '#1e3a8a',
          fgColor2: '#0284c7',
          isGradient: true,
          gradientType: 'linear',
          gradientAngle: 45,
          bgColor: '#ffffff',
          isTransparent: false,
          dotShape: 'rounded',
          cornerSquareShape: 'extra-rounded',
          cornerDotShape: 'dot',
          margin: 12,
        });
        break;
      case 'transparent-clean':
        handleConfigChange({
          isTransparent: true,
          fgColor: '#111827',
          isGradient: false,
          dotShape: 'dots',
          cornerSquareShape: 'extra-rounded',
          cornerDotShape: 'dot',
          margin: 12,
        });
        break;
      case 'emerald-luxury':
        handleConfigChange({
          fgColor: '#064e3b',
          fgColor2: '#059669',
          isGradient: true,
          gradientType: 'radial',
          bgColor: '#ffffff',
          isTransparent: false,
          dotShape: 'classy-rounded',
          cornerSquareShape: 'extra-rounded',
          cornerDotShape: 'dot',
          margin: 14,
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Style Presets Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:px-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Estilos Rápidos:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <button
              type="button"
              onClick={() => applyPreset('classic')}
              className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 font-medium text-slate-700 transition-colors"
            >
              Impresión Clásica
            </button>
            <button
              type="button"
              onClick={() => applyPreset('modern-blue')}
              className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 font-medium text-slate-700 transition-colors"
            >
              Degradado Corporativo
            </button>
            <button
              type="button"
              onClick={() => applyPreset('transparent-clean')}
              className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 font-medium text-slate-700 transition-colors"
            >
              Fondo Transparente
            </button>
            <button
              type="button"
              onClick={() => applyPreset('emerald-luxury')}
              className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 font-medium text-slate-700 transition-colors"
            >
              Esmeralda Elegante
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors ml-auto sm:ml-0"
            title="Restablecer valores por defecto"
          >
            <RotateCcw className="w-3 h-3" />
            Restablecer
          </button>
        </div>

        {/* Workspace 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Form Controls (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Base URL / Content */}
            <ContentInput config={config} onChange={handleConfigChange} />

            {/* 2. Colors & Transparency */}
            <ColorControls config={config} onChange={handleConfigChange} />

            {/* 3. Logo Upload & Dynamic Size */}
            <LogoUpload config={config} onChange={handleConfigChange} />

            {/* 4. Shapes & Geometry */}
            <StyleShapes config={config} onChange={handleConfigChange} />
          </div>

          {/* Right Column: Sticky Preview & 4096px CTA (5 cols on lg) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-5">
            <QRPreview config={config} />
          </div>
        </div>

        {/* Technical FAQ & Printing Guide Accordion/Notes */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            Preguntas Frecuentes y Estándares de Impresión
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 pt-2">
            <div className="space-y-1.5">
              <h4 className="font-semibold text-slate-800">¿Por qué 4096 × 4096 píxeles?</h4>
              <p className="leading-relaxed">
                4096px equivale a 16.7 megapíxeles. Esta resolución garantiza que los bordes de los módulos QR permanezcan 100% nítidos incluso en lonas de más de 1.5 metros de ancho o impresiones fine-art a 300 DPI sin pixelación alguna.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-semibold text-slate-800">Fondo Transparente en PNG</h4>
              <p className="leading-relaxed">
                Al activar el fondo transparente, el archivo se guarda con canal Alfa de 32 bits. Puedes colocar el código sobre vinilos transparentes, fotos de fondo o empaques troquelados sin que quede un recuadro blanco alrededor.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-semibold text-slate-800">Margen de Seguridad del Logo</h4>
              <p className="leading-relaxed">
                La aplicación utiliza de forma obligatoria el Nivel de Corrección 'H' (30%). El área segura de logo recomendada es del 20% al 25% para asegurar que cualquier lector de smartphone o terminal industrial lo lea al instante.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong>QR Studio Ultra HD</strong> — Generador de Códigos QR para Imprenta y Gigantografías en 4096px.
          </p>
          <p className="text-slate-400">
            Procesamiento 100% Client-Side en el Navegador con Canvas & Vector SVG.
          </p>
        </div>
      </footer>
    </div>
  );
}
