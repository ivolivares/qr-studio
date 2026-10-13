import React from 'react';
import { Globe, FileText, Wifi, Contact, Mail, Link as LinkIcon, ClipboardCheck } from 'lucide-react';
import { QRConfig, ContentCategory } from '../../types/qr';

interface ContentInputProps {
  config: QRConfig;
  onChange: (updates: Partial<QRConfig>) => void;
}

export const ContentInput: React.FC<ContentInputProps> = ({ config, onChange }) => {
  const tabs: { id: ContentCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'url', label: 'URL / Web', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'text', label: 'Texto', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'wifi', label: 'Wi-Fi', icon: <Wifi className="w-3.5 h-3.5" /> },
    { id: 'vcard', label: 'Contacto (vCard)', icon: <Contact className="w-3.5 h-3.5" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5" /> },
  ];

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange({ rawText: text });
      }
    } catch {
      // clipboard access denied, ignore
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-blue-600" />
          Contenido del Código QR
        </label>
        <span className="text-xs text-slate-400">Datos a codificar</span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg text-xs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange({ contentCategory: tab.id })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              config.contentCategory === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* URL or Plain Text */}
      {(config.contentCategory === 'url' || config.contentCategory === 'text') && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={config.rawText}
              onChange={(e) => onChange({ rawText: e.target.value })}
              placeholder={config.contentCategory === 'url' ? 'https://tu-sitio-web.com' : 'Escribe el texto o mensaje aquí...'}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all pr-20"
            />
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="absolute right-2 top-2 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-2xs"
              title="Pegar del portapapeles"
            >
              <ClipboardCheck className="w-3 h-3 text-slate-500" />
              Pegar
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              {config.contentCategory === 'url'
                ? 'Ejemplo: https://tuempresa.com/catalogo-2026'
                : `${config.rawText.length} caracteres`}
            </span>
            {config.rawText.startsWith('http') && (
              <span className="text-emerald-600 font-medium">✓ URL válida</span>
            )}
          </div>
        </div>
      )}

      {/* Wi-Fi Form */}
      {config.contentCategory === 'wifi' && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nombre de Red (SSID)</label>
              <input
                type="text"
                value={config.wifi.ssid}
                onChange={(e) => onChange({ wifi: { ...config.wifi, ssid: e.target.value } })}
                placeholder="MiRed_5G"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contraseña</label>
              <input
                type="text"
                value={config.wifi.password}
                onChange={(e) => onChange({ wifi: { ...config.wifi, password: e.target.value } })}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-700">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="encryption"
                checked={config.wifi.encryption === 'WPA'}
                onChange={() => onChange({ wifi: { ...config.wifi, encryption: 'WPA' } })}
                className="text-blue-600"
              />
              WPA / WPA2 / WPA3
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="encryption"
                checked={config.wifi.encryption === 'nopass'}
                onChange={() => onChange({ wifi: { ...config.wifi, encryption: 'nopass' } })}
                className="text-blue-600"
              />
              Red Abierta (Sin clave)
            </label>
          </div>
        </div>
      )}

      {/* vCard Form */}
      {config.contentCategory === 'vcard' && (
        <div className="space-y-2.5 pt-1">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nombre</label>
              <input
                type="text"
                value={config.vcard.firstName}
                onChange={(e) => onChange({ vcard: { ...config.vcard, firstName: e.target.value } })}
                placeholder="Carlos"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Apellidos</label>
              <input
                type="text"
                value={config.vcard.lastName}
                onChange={(e) => onChange({ vcard: { ...config.vcard, lastName: e.target.value } })}
                placeholder="González"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={config.vcard.phone}
                onChange={(e) => onChange({ vcard: { ...config.vcard, phone: e.target.value } })}
                placeholder="+56 9 1234 5678"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={config.vcard.email}
                onChange={(e) => onChange({ vcard: { ...config.vcard, email: e.target.value } })}
                placeholder="carlos@empresa.com"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Empresa</label>
              <input
                type="text"
                value={config.vcard.company}
                onChange={(e) => onChange({ vcard: { ...config.vcard, company: e.target.value } })}
                placeholder="Estudio Creativo"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Sitio Web</label>
              <input
                type="text"
                value={config.vcard.website}
                onChange={(e) => onChange({ vcard: { ...config.vcard, website: e.target.value } })}
                placeholder="https://empresa.com"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Email Form */}
      {config.contentCategory === 'email' && (
        <div className="space-y-2.5 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Correo Electrónico Destino</label>
            <input
              type="email"
              value={config.email.address}
              onChange={(e) => onChange({ email: { ...config.email, address: e.target.value } })}
              placeholder="contacto@miempresa.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Asunto Predefinido (Opcional)</label>
            <input
              type="text"
              value={config.email.subject}
              onChange={(e) => onChange({ email: { ...config.email, subject: e.target.value } })}
              placeholder="Consulta sobre servicios"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};
