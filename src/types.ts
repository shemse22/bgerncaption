export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  googleOriginalAvatar?: string;
  role: Role;
  availableMinutes: number; // in seconds or decimal minutes
  plan: 'free' | 'lite' | 'plus' | 'pro' | 'max' | 'starter' | 'creator' | string;
  status: 'active' | 'suspended';
  createdAt: string;
  provider?: 'clerk' | 'google' | 'guest';
  clerkId?: string;
  googleId?: string;
  bio?: string;
  channelHandle?: string;
  preferredLanguage?: string;
  autoGenerateThumbnails?: boolean;
}

export interface CaptionSegment {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;  // Amharic text
}

export type CaptionPreset =
  | 'modern'
  | 'bold'
  | 'tiktok'
  | 'minimal'
  | 'youtube'
  | 'classic'
  | 'up'
  | 'down'
  | 'sparkle-duo'
  | 'dotted-selection'
  | 'real-gold'
  | 'red-string'
  | 'karaoke'
  | 'neon'
  | 'typewriter';

export type CaptionPosition = 'top' | 'center' | 'bottom';
export type CaptionBackground = 'none' | 'semi' | 'solid';

export type TextAnimationIn = 'up' | 'down' | 'fade' | 'zoom' | 'bounce' | 'none';
export type TextAnimationOut = 'down' | 'up' | 'fade' | 'zoom' | 'none';
export type HighlightStyle = 'default' | 'sparkle' | 'dotted' | 'gold' | 'red-string' | 'karaoke' | 'neon';

export interface CaptionStyle {
  preset: CaptionPreset;
  font: string;
  size: number; // in px, e.g. 48
  color: string; // hex color e.g. #FFFFFF
  background: CaptionBackground;
  backgroundOpacity: number; // 0.0 - 1.0
  position: CaptionPosition;
  outline: number; // in px, 0 - 6
  outlineColor: string;
  highlightWord?: boolean;
  animateIn?: TextAnimationIn;
  animateOut?: TextAnimationOut;
  animationSpeed?: 'slow' | 'normal' | 'fast';
  highlightStyle?: HighlightStyle;
  
  // Custom Fonts
  customFontUrl?: string;
  customFontName?: string;

  // Watermarks
  watermarkEnabled?: boolean;
  watermarkText?: string;
  watermarkImage?: string;
  watermarkPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  watermarkOpacity?: number;
}

export type ProjectStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type VideoAspectRatio = '9:16' | '16:9' | '1:1';
export type VideoPlatform = 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'auto';

export interface Project {
  id: string;
  userId: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number; // duration in seconds (e.g. 154 = 02:34)
  fileSizeMb: number;
  status: ProjectStatus;
  progress: number; // 0 - 100
  captionLanguage: string;
  captionMode: 'speech_amharic' | 'translate_amharic';
  aspectRatio?: VideoAspectRatio;
  platform?: VideoPlatform;
  segments: CaptionSegment[];
  style: CaptionStyle;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'free_signup' | 'payment_package' | 'video_deduction' | 'admin_adjustment';

export interface MinuteTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  description: string;
  minutesChange: number; // positive or negative, e.g. +3.00, -2.57
  formattedChange: string; // e.g. "+03:00" or "-02:34"
  createdAt: string;
  referenceId?: string; // paymentId or projectId
}

export interface PricingPackage {
  id: string;
  name: string;
  minutes: number;
  priceEtb: number;
  credits?: number;
  popular?: boolean;
  badge?: string;
  buttonText?: string;
  features: string[];
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  packageId: string;
  packageName: string;
  minutes: number;
  amountEtb: number;
  paymentMethod: 'Telebirr' | 'CBE' | 'Awash Bank' | 'Awash' | 'Chapa' | string;
  referenceNumber: string;
  receiptUrl: string;
  status: PaymentStatus;
  submittedAt: string;
  reviewedAt?: string;
  adminNote?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'project' | 'payment' | 'wallet' | 'price' | 'system';
  actionUrl?: string;
}

export interface ManualPaymentPlatform {
  id: string;
  name: string; // e.g. "Telebirr", "Commercial Bank of Ethiopia (CBE)", "Awash Bank", "Bank of Abyssinia"
  accountNumber: string;
  accountHolder: string;
  instructions?: string;
  badge?: string;
  isActive: boolean;
}

export interface CaptionLanguageOption {
  id: string;
  name: string; // e.g. "Amharic", "Tigrinya", "Afaan Oromo"
  nativeName: string; // e.g. "አማርኛ", "ትግርኛ", "Afaan Oromoo"
  flag?: string;
  isDefault?: boolean;
  enabled: boolean;
}

export interface SystemSettings {
  freeMinutes: number;
  maxUploadMb: number;
  supportedFormats: string[];
  telebirrAccount: string;
  cbeAccount: string;
  paymentPlatforms: ManualPaymentPlatform[];
  supportedLanguages: CaptionLanguageOption[];
  packages: PricingPackage[];
  maintenanceMode: boolean;
  geminiApiKey?: string;
  geminiModel?: string;
  adminUsername?: string;
  adminEmail?: string;
  adminPassword?: string;
}
