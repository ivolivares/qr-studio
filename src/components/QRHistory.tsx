import React from 'react';
import { History, Trash2, Download, ExternalLink, RefreshCw, Layers, Check } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';
import { QRHistoryItem, QRConfig } from '../types/qr';
import { buildQRCodeStylingOptions } from '../utils/qrHelper';

interface QRHistoryProps {
  history: QRHistoryItem[];
  onSelect: (config: QRConfig) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export const QRHistory: React.FC<QRHistoryProps> = ({ history, onSelect, onDelete, onClear }) => {
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const handleDownloadDirect = async (item: QRHistoryItem) => {
    setDownloadingId(item.id);
    try {
      const exportOptions = buildQRCodeStylingOptions(item.config, 4096, 'canvas');
      const exportQr = new QRCodeStyling(exportOptions);
      await exportQr.download({
        name: `QR_UltraHD_4096px_${item.id}`,
        extension: 'png',
      });
    } catch (err) {
      console.error('Error al descargar desde el historial:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-2 shadow-2xs">
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <History className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-bold text-slate-800">Sin Códigos QR en el Historial</h4>
        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
          Cada vez que descargues o guardes un código QR en alta resolución, se archivará automáticamente en tu navegador con su miniatura, fecha y configuración.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Historial de Códigos Generados
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {history.length} {history.length === 1 ? 'código' : 'códigos'}
          </span>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors hover:underline"
        >
          Borrar todo
        </button>
      </div>

      {/* Grid of history cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all shadow-2xs group"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs bg-checkerboard">
              <img
                src={item.thumbnailDataUrl}
                alt={item.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Info & Actions */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-1">
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                  {item.category.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {item.dateFormatted}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-900 truncate" title={item.payload}>
                {item.payload}
              </p>

              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => onSelect(item.config)}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline"
                  title="Cargar esta configuración en el editor"
                >
                  <RefreshCw className="w-3 h-3" />
                  Editar
                </button>

                <span className="text-slate-300">·</span>

                <button
                  type="button"
                  disabled={downloadingId === item.id}
                  onClick={() => handleDownloadDirect(item)}
                  className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 hover:underline"
                  title="Descargar versión de 4096px directamente"
                >
                  <Download className="w-3 h-3" />
                  {downloadingId === item.id ? 'Descargando...' : 'Descargar 4096px'}
                </button>

                <span className="text-slate-300">·</span>

                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="text-rose-500 hover:text-rose-700 transition-colors ml-auto p-0.5"
                  title="Eliminar este código del historial"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
