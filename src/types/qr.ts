export type DotShapeType = 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
export type CornerSquareShapeType = 'square' | 'dot' | 'extra-rounded';
export type CornerDotShapeType = 'square' | 'dot';

export type ExportFormat = 'png' | 'svg' | 'jpeg' | 'webp';
export type ExportResolution = 4096 | 2048 | 1024 | 512;

export type ContentCategory = 'url' | 'text' | 'wifi' | 'vcard' | 'email';

export interface WifiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  jobTitle: string;
  website: string;
}

export interface QRConfig {
  contentCategory: ContentCategory;
  rawText: string;
  wifi: WifiData;
  vcard: VCardData;
  email: {
    address: string;
    subject: string;
    body: string;
  };
  
  // Colors & Background
  fgColor: string;
  fgColor2: string;
  isGradient: boolean;
  gradientType: 'linear' | 'radial';
  gradientAngle: number;
  
  bgColor: string;
  isTransparent: boolean;
  
  // Custom corner colors
  customCornerColors: boolean;
  cornerSquareColor: string;
  cornerDotColor: string;
  
  // Shapes
  dotShape: DotShapeType;
  cornerSquareShape: CornerSquareShapeType;
  cornerDotShape: CornerDotShapeType;
  
  // Padding & Sizing
  margin: number; // in pixels
  
  // Logo
  logoUrl: string | null;
  logoFileName: string | null;
  logoSize: number; // 0.15 to 0.32 (percentage of QR width, default 0.24)
  logoMargin: number; // padding around logo
  hideBackgroundDots: boolean;
}
