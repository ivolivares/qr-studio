import { Options } from 'qr-code-styling';
import { QRConfig, QRHistoryItem } from '../types/qr';

/**
 * Builds the string payload based on the selected content category.
 */
export function encodeQRContent(config: QRConfig): string {
  switch (config.contentCategory) {
    case 'url':
    case 'text':
      return config.rawText.trim() || 'https://google.com';

    case 'wifi': {
      const { ssid, password, encryption, hidden } = config.wifi;
      const cleanSsid = ssid.trim();
      if (!cleanSsid) return 'WIFI:S:MyNetwork;T:WPA;P:password;;';
      return `WIFI:S:${cleanSsid};T:${encryption};P:${password};${hidden ? 'H:true;' : ''};`;
    }

    case 'email': {
      const { address, subject, body } = config.email;
      if (!address.trim()) return 'mailto:contacto@ejemplo.com';
      const params = new URLSearchParams();
      if (subject) params.set('subject', subject);
      if (body) params.set('body', body);
      const query = params.toString();
      return `mailto:${address.trim()}${query ? `?${query}` : ''}`;
    }

    case 'vcard': {
      const { firstName, lastName, phone, email, company, jobTitle, website } = config.vcard;
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lastName || ''};${firstName || ''};;;`,
        `FN:${[firstName, lastName].filter(Boolean).join(' ') || 'Contacto'}`,
        company ? `ORG:${company}` : '',
        jobTitle ? `TITLE:${jobTitle}` : '',
        phone ? `TEL;TYPE=CELL:${phone}` : '',
        email ? `EMAIL:${email}` : '',
        website ? `URL:${website}` : '',
        'END:VCARD'
      ].filter(Boolean).join('\n');
    }

    default:
      return config.rawText || 'https://google.com';
  }
}

/**
 * Generates options for qr-code-styling given a QRConfig and pixel dimension.
 */
export function buildQRCodeStylingOptions(config: QRConfig, size: number, type: 'canvas' | 'svg' = 'canvas'): Partial<Options> {
  const content = encodeQRContent(config);

  // Gradient options
  const gradient = config.isGradient
    ? {
        type: config.gradientType,
        rotation: (config.gradientAngle * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: config.fgColor },
          { offset: 1, color: config.fgColor2 || config.fgColor }
        ]
      }
    : undefined;

  // Relative margin calculation: scale margin proportionally to canvas size
  // Default base margin is 10px on a 400px canvas (~2.5% of width)
  const proportionalMargin = Math.round((config.margin / 400) * size);

  return {
    width: size,
    height: size,
    type: type,
    data: content,
    margin: proportionalMargin,
    qrOptions: {
      typeNumber: 0, // automatic sizing based on payload length
      mode: 'Byte',
      errorCorrectionLevel: config.errorCorrectionLevel || 'H' // Configurable: L (7%), M (15%), Q (25%), H (30%)
    },
    image: config.logoUrl || undefined,
    imageOptions: {
      hideBackgroundDots: config.hideBackgroundDots,
      imageSize: config.logoSize,
      margin: Math.round((config.logoMargin / 400) * size),
      crossOrigin: 'anonymous'
    },
    dotsOptions: {
      type: config.dotShape,
      color: config.isGradient ? undefined : config.fgColor,
      gradient: gradient
    },
    backgroundOptions: {
      color: config.isTransparent ? 'transparent' : config.bgColor
    },
    cornersSquareOptions: {
      type: config.cornerSquareShape,
      color: config.customCornerColors ? config.cornerSquareColor : (config.isGradient ? config.fgColor : config.fgColor)
    },
    cornersDotOptions: {
      type: config.cornerDotShape,
      color: config.customCornerColors ? config.cornerDotColor : (config.isGradient ? config.fgColor2 : config.fgColor)
    }
  };
}

/**
 * Calculates physical printed dimensions given resolution and DPI.
 */
export function calculatePrintDimensions(pixels: number, dpi: number) {
  const inches = pixels / dpi;
  const centimeters = inches * 2.54;
  return {
    inches: inches.toFixed(1),
    centimeters: centimeters.toFixed(1)
  };
}

/**
 * Preset logo samples (inlined clean SVG data URIs) so users can test immediately.
 */
export const PRESET_LOGOS = [
  {
    id: 'web',
    name: 'Web / Globo',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`
  },
  {
    id: 'wifi',
    name: 'Wi-Fi',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="%23059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`
  },
  {
    id: 'shop',
    name: 'Tienda',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="%23ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`
  },
  {
    id: 'star',
    name: 'Estrella',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="%23eab308" stroke="%23ca8a04" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  },
  {
    id: 'link',
    name: 'Enlace',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="%237c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`
  }
];

export const POPULAR_COLORS = [
  { name: 'Negro Profundo', value: '#000000' },
  { name: 'Azul Marino', value: '#0f172a' },
  { name: 'Azul Real', value: '#2563eb' },
  { name: 'Verde Esmeralda', value: '#059669' },
  { name: 'Púrpura', value: '#7c3aed' },
  { name: 'Borgoña', value: '#9f1239' },
  { name: 'Naranja Cobre', value: '#c2410c' }
];

export const POPULAR_BACKGROUNDS = [
  { name: 'Blanco Puro', value: '#ffffff' },
  { name: 'Gris Ártico', value: '#f8fafc' },
  { name: 'Crema / Marfil', value: '#fffbeb' },
  { name: 'Hielo Suave', value: '#f0fdf4' }
];

/**
 * URL validation result with actionable feedback and auto-prefix suggestion.
 */
export interface UrlValidationResult {
  isValid: boolean;
  status: 'valid' | 'missing-protocol' | 'invalid-format' | 'empty';
  message: string;
  suggestedUrl: string | null;
}

export function validateUrl(rawUrl: string): UrlValidationResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return {
      isValid: false,
      status: 'empty',
      message: 'Ingresa una dirección web o URL antes de generar el código.',
      suggestedUrl: null
    };
  }

  // Check if it has protocol
  const hasProtocol = /^(https?|ftp):\/\//i.test(trimmed);
  const testUrl = hasProtocol ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(testUrl);
    const hostname = parsed.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const hasValidDomain = isLocalhost || (hostname.includes('.') && !hostname.startsWith('.') && !hostname.endsWith('.'));

    if (!hasValidDomain) {
      return {
        isValid: false,
        status: 'invalid-format',
        message: 'El dominio ingresado no parece válido. Debe incluir extensión (ej. empresa.com).',
        suggestedUrl: null
      };
    }

    if (!hasProtocol) {
      return {
        isValid: false,
        status: 'missing-protocol',
        message: 'Falta el protocolo seguro "https://". Sin él, algunos escáneres no abrirán el enlace directo.',
        suggestedUrl: `https://${trimmed}`
      };
    }

    return {
      isValid: true,
      status: 'valid',
      message: 'URL válida y verificada.',
      suggestedUrl: null
    };
  } catch {
    return {
      isValid: false,
      status: 'invalid-format',
      message: 'El formato de la dirección web no es válido.',
      suggestedUrl: null
    };
  }
}

const HISTORY_STORAGE_KEY = 'qr_studio_history_v1';
const MAX_HISTORY_ITEMS = 25;

export function getQRHistory(): QRHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QRHistoryItem[];
  } catch (err) {
    console.error('Error al leer historial de LocalStorage:', err);
    return [];
  }
}

export function saveQRToHistory(item: Omit<QRHistoryItem, 'id' | 'timestamp' | 'dateFormatted'>): QRHistoryItem[] {
  try {
    const existing = getQRHistory();
    const now = new Date();
    const newItem: QRHistoryItem = {
      ...item,
      id: `qr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      dateFormatted: now.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updated = [newItem, ...existing.filter((i) => i.payload !== item.payload)].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error al guardar en LocalStorage:', err);
    return [];
  }
}

export function deleteQRFromHistory(id: string): QRHistoryItem[] {
  try {
    const existing = getQRHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error al eliminar de LocalStorage:', err);
    return [];
  }
}

export function clearQRHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.error('Error al limpiar LocalStorage:', err);
  }
}

