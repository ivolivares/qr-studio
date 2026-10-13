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
  Layers,
  BookmarkPlus,
  Keyboard,
  Command,
  X
} from 'lucide-react';
import { QRConfig } from '../types/qr';
import { 
  buildQRCodeStylingOptions, 
  calculatePrintDimensions,
  encodeQRContent 
} from '../utils/qrHelper';

interface QRPreviewProps {
  config: QRConfig;
  onSaveToHistory?: (thumbnailDataUrl: string) => void;
}

export const QRPreview: React.FC<QRPreviewProps> = ({ config, onSaveToHistory }) => {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgressText, setExportProgressText] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

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
      // Automatically save to local storage history on download
      const canvas = previewContainerRef.current?.querySelector('canvas');
      if (canvas && onSaveToHistory) {
        try {
          const thumb = canvas.toDataURL('image/png');
          onSaveToHistory(thumb);
        } catch (e) {
          console.warn('Could not generate thumbnail for history:', e);
        }
      }
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

          const canvas = previewContainerRef.current?.querySelector('canvas');
          if (canvas && onSaveToHistory) {
            onSaveToHistory(canvas.toDataURL('image/png'));
          }
        }
      } catch (fallbackErr) {
        console.error('Fallback export error:', fallbackErr);
      }
    } finally {
      setIsExporting(false);
      setExportProgressText('');
    }
  };

  const handleManualSave = () => {
    const canvas = previewContainerRef.current?.querySelector('canvas');
    if (canvas && onSaveToHistory) {
      try {
        const thumb = canvas.toDataURL('image/png');
        onSaveToHistory(thumb);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2200);
      } catch (e) {
        console.warn('Failed manual history save:', e);
      }
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

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        (activeEl as HTMLElement).isContentEditable
      );

      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + D -> Descargar PNG 4096px
      if (modifier && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        handleDownload(4096, 'png');
        return;
      }

      // Cmd/Ctrl + S -> Descargar SVG Vectorial (o con Shift -> Guardar en Historial)
      if (modifier && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (e.shiftKey) {
          handleManualSave();
        } else {
          handleDownload(4096, 'svg');
        }
        return;
      }

      // '?' -> Alternar atajos de teclado (cuando no se escribe en inputs)
      if (!isInput && (e.key === '?' || e.key === '¿')) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config, isExporting, isMac]);

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
            {onSaveToHistory && (
              <button
                type="button"
                onClick={handleManualSave}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 text-xs font-medium"
                title="Guardar este QR en el historial local"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">¡Guardado!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3.5 h-3.5 text-blue-600" />
                    <span>Guardar</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 text-xs font-medium"
              title="Copiar imagen al portapapeles"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">¡Copiado!</span>
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

        {/* DUAL PRIMARY ACTIONS: PNG (4096px) & SVG (Vectorial) */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Botón PNG 4096px */}
            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleDownload(4096, 'png')}
              className={`py-3.5 px-4 rounded-xl font-bold text-white text-sm shadow-md transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                isExporting
                  ? 'bg-blue-400 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Descargar PNG (4096px)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-normal text-blue-100">
                <span className="bg-blue-700/80 px-1.5 py-0.2 rounded text-[10px]">Ultra HD · 16.7 MP</span>
                <kbd className="bg-blue-900/70 border border-blue-400/30 px-1.5 py-0.2 rounded font-mono text-[10px] text-white">
                  {isMac ? '⌘D' : 'Ctrl+D'}
                </kbd>
              </div>
            </button>

            {/* 2. Botón SVG Vectorial (Infinito) */}
            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleDownload(4096, 'svg')}
              className={`py-3.5 px-4 rounded-xl font-bold text-white text-sm shadow-md transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                isExporting
                  ? 'bg-purple-400 cursor-wait'
                  : 'bg-purple-600 hover:bg-purple-700 active:scale-[0.99] hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 stroke-[2.5]" />
                <span>Descargar SVG (Vector)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-normal text-purple-100">
                <span className="bg-purple-700/80 px-1.5 py-0.2 rounded text-[10px]">Escalado Infinito</span>
                <kbd className="bg-purple-900/70 border border-purple-400/30 px-1.5 py-0.2 rounded font-mono text-[10px] text-white">
                  {isMac ? '⌘S' : 'Ctrl+S'}
                </kbd>
              </div>
            </button>
          </div>

          {/* Sub-actions: Web resolutions & Keyboard shortcuts trigger */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">Otras resoluciones:</span>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleDownload(2048, 'png')}
                className="px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                title="Descargar en resolución 2048 x 2048 px"
              >
                2048px (2K)
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => handleDownload(1024, 'png')}
                className="px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                title="Descargar en resolución 1024 x 1024 px"
              >
                1024px (Web)
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowShortcutsModal(true)}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded border border-slate-200/80 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Ver atajos de teclado disponibles"
            >
              <Keyboard className="w-3.5 h-3.5 text-slate-500" />
              <span>Atajos</span>
              <kbd className="bg-slate-200 text-slate-600 px-1 rounded text-[9px] font-mono">?</kbd>
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

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Keyboard className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-bold">Atajos de Teclado</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Usa estos atajos rápidos para acelerar tu flujo de trabajo de diseño y producción:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-150">
                <span className="font-medium text-slate-700">Descargar PNG (4096px)</span>
                <kbd className="px-2 py-1 rounded bg-white border border-slate-300 font-mono text-[11px] font-semibold text-slate-800 shadow-2xs">
                  {isMac ? '⌘ + D' : 'Ctrl + D'}
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-150">
                <span className="font-medium text-slate-700">Descargar SVG (Vectorial)</span>
                <kbd className="px-2 py-1 rounded bg-white border border-slate-300 font-mono text-[11px] font-semibold text-slate-800 shadow-2xs">
                  {isMac ? '⌘ + S' : 'Ctrl + S'}
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-150">
                <span className="font-medium text-slate-700">Guardar en Historial Local</span>
                <kbd className="px-2 py-1 rounded bg-white border border-slate-300 font-mono text-[11px] font-semibold text-slate-800 shadow-2xs">
                  {isMac ? '⌘ + ⇧ + S' : 'Ctrl + Shift + S'}
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-150">
                <span className="font-medium text-slate-700">Abrir / Cerrar Atajos</span>
                <kbd className="px-2 py-1 rounded bg-white border border-slate-300 font-mono text-[11px] font-semibold text-slate-800 shadow-2xs">
                  ?
                </kbd>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};
