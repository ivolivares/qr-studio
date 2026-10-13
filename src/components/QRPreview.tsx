import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  ZoomIn, 
  Info, 
  Printer, 
  Maximize2, 
  ShieldCheck, 
  Sparkles,
  Layers
} from 'lucide-react';
import { QRConfig } from '../types/qr';
import { 
  buildQRCodeStylingOptions, 
  calculatePrintDimensions,
  encodeQRContent 
} from '../utils/qrHelper';

interface QRPreviewProps {
  config: QRConfig;
}

export const QRPreview: React.FC<QRPreviewProps> = ({ config }) => {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgressText, setExportProgressText] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize and update preview instance
  useEffect(() => {
    const previewOptions = buildQRCodeStylingOptions(config, 360, 'canvas');

    if (!qrInstanceRef.current) {
      qrInstanceRef.current = new QRCodeStyling(previewOptions);
      if (previewContainerRef.current) {
        previewContainerRef.current.innerHTML = '';
        qrInstanceRef.current.append(previewContainerRef.current);
      }
    } else {
      qrInstanceRef.current.update(previewOptions);
    }
  }, [config]);

  // Clean filename generator
  const getCleanFileName = (resolution: number, ext: string) => {
    const raw = config.contentCategory === 'url' ? config.rawText : config.contentCategory;
    const sanitized = raw
      .replace(/^https?:\/\//i, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 24) || 'qr_code';
    return `QR_UltraHD_${resolution}px_${sanitized}.${ext}`;
  };

  /**
   * Generates and downloads the QR code at the requested resolution.
   * For the 4096px requirement, creates a dedicated canvas at exact 4096 x 4096 px.
   */
  const handleDownload = async (size: number, format: 'png' | 'svg' | 'jpeg' = 'png') => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgressText(
      format === 'svg'
        ? 'Generando Vector SVG...'
        : `Renderizando ${size} × ${size} px...`
    );

    try {
      // Build dedicated high-resolution styling instance
      const exportOptions = buildQRCodeStylingOptions(
        config,
        size,
        format === 'svg' ? 'svg' : 'canvas'
      );
      const highResQr = new QRCodeStyling(exportOptions);

      const baseName = `QR_UltraHD_${format === 'svg' ? 'Vector' : `${size}px`}`;
      
      // Use qr-code-styling's native download helper
      await highResQr.download({
        name: baseName,
        extension: format
      });
    } catch (err) {
      console.error('Error al exportar QR en alta resolución:', err);
      // Fallback manual blob trigger
      try {
        const fallbackQr = new QRCodeStyling(
          buildQRCodeStylingOptions(config, size, format === 'svg' ? 'svg' : 'canvas')
        );
        const blob = await fallbackQr.getRawData(format);
        if (blob) {
          const url = URL.createObjectURL(blob as Blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = getCleanFileName(size, format);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      } catch (fallbackErr) {
        console.error('Fallback export error:', fallbackErr);
      }
    } finally {
      setIsExporting(false);
      setExportProgressText('');
    }
  };

  /**
   * Copies the high-resolution QR directly to clipboard as PNG image.
   */
  const handleCopyToClipboard = async () => {
    try {
      const copyQr = new QRCodeStyling(buildQRCodeStylingOptions(config, 2048, 'canvas'));
      const blob = await copyQr.getRawData('png');
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob as Blob })
        ]);
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2500);
      }
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  // Physical print calculations for 4096px
  const print300 = calculatePrintDimensions(4096, 300);
  const print150 = calculatePrintDimensions(4096, 150);
  const print72 = calculatePrintDimensions(4096, 72);

  return (
    <div className="space-y-4">
      {/* Main Preview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Previsualización en Vivo
            </h2>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Tiempo Real
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 text-xs font-medium"
              title="Copiar imagen al portapapeles"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copiar PNG</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Expandir previsualización"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Canvas Stage */}
        <div className="relative flex items-center justify-center p-6 sm:p-8 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
          {/* Subtle checkerboard underneath to demonstrate transparency */}
          <div className="relative p-4 rounded-xl shadow-xs bg-white/40">
            <div
              className={`rounded-lg overflow-hidden transition-all duration-300 ${
                config.isTransparent ? 'bg-checkerboard' : ''
              }`}
              style={{
                backgroundColor: config.isTransparent ? 'transparent' : config.bgColor
              }}
            >
              <div
                ref={previewContainerRef}
                className="flex items-center justify-center [&>canvas]:max-w-full [&>canvas]:h-auto [&>canvas]:block"
              />
            </div>
          </div>

          {/* Quick badge indicating transparency status */}
          {config.isTransparent && (
            <div className="absolute bottom-2 right-2 text-[10px] font-medium text-slate-600 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-200/80 shadow-2xs">
              Canal Alfa Transparente
            </div>
          )}
        </div>

        {/* PRIMARY CTA: Botón de descarga 4096px */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={isExporting}
            onClick={() => handleDownload(4096, 'png')}
            className={`w-full py-4 px-6 rounded-xl font-bold text-white text-base shadow-md transition-all flex items-center justify-center gap-3 ${
              isExporting
                ? 'bg-blue-400 cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] hover:shadow-lg'
            }`}
          >
            {isExporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{exportProgressText || 'Generando QR (4096px)...'}</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 stroke-[2.5]" />
                <span>Descargar QR (4096px)</span>
                <span className="text-xs font-normal opacity-90 ml-1 px-2 py-0.5 rounded bg-blue-700/60">
                  PNG Ultra HD
                </span>
              </>
            )}
          </button>

          {/* Secondary Download Actions: SVG, 2048px, 1024px */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleDownload(4096, 'svg')}
              className="py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
              title="Descargar archivo vectorial SVG para Adobe Illustrator o CorelDraw"
            >
              <FileCode className="w-3.5 h-3.5 text-purple-600" />
              <span>SVG Vector</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleDownload(2048, 'png')}
              className="py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
              title="Descargar en resolución 2048 x 2048 px"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>2048px (2K)</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleDownload(1024, 'png')}
              className="py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
              title="Descargar en resolución 1024 x 1024 px"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>1024px (Web)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Technical Print Specifications Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Guía de Impresión & Gigantografías
            </h3>
          </div>
          <span className="text-[11px] font-mono text-blue-400 bg-blue-950/70 px-2 py-0.5 rounded border border-blue-900">
            4096 × 4096 px (16.7 MP)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              300 DPI (Offset)
            </span>
            <span className="text-sm font-bold text-white block mt-0.5">
              {print300.centimeters} cm
            </span>
            <span className="text-[10px] text-slate-400">
              Catálogos y flyers
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
            <span className="text-[10px] uppercase font-semibold text-blue-400 block">
              150 DPI (Plóter)
            </span>
            <span className="text-sm font-bold text-blue-200 block mt-0.5">
              {print150.centimeters} cm
            </span>
            <span className="text-[10px] text-slate-400">
              Gigantografías y pendones
            </span>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
            <span className="text-[10px] uppercase font-semibold text-emerald-400 block">
              72 DPI (Vallas)
            </span>
            <span className="text-sm font-bold text-emerald-200 block mt-0.5">
              {print72.centimeters} cm
            </span>
            <span className="text-[10px] text-slate-400">
              Carteles gran formato
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-[11px] text-slate-400 bg-slate-800/40 rounded-xl p-3 border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">Garantía de Lectura:</strong> Codificado con{' '}
            <strong className="text-emerald-300">Nivel H (30%)</strong>. Permite recuperar el código incluso si el logo cubre hasta el 25% del área central o ante suciedad, rasgaduras o reflejos en impresiones exteriores.
          </p>
        </div>
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-sm font-bold text-slate-900">
                Vista de Alta Fidelidad
              </h4>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded"
              >
                Cerrar (Esc)
              </button>
            </div>
            <div 
              className={`p-6 rounded-xl flex items-center justify-center ${
                config.isTransparent ? 'bg-checkerboard' : ''
              }`}
              style={{
                backgroundColor: config.isTransparent ? 'transparent' : config.bgColor
              }}
            >
              <div className="[&>canvas]:max-w-full [&>canvas]:h-auto shadow-md">
                {/* Reuses preview container in clone if needed */}
                <div
                  ref={(node) => {
                    if (node && !node.hasChildNodes()) {
                      const fullQr = new QRCodeStyling(buildQRCodeStylingOptions(config, 400, 'canvas'));
                      fullQr.append(node);
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsFullscreen(false);
                  handleDownload(4096, 'png');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar QR (4096px)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
