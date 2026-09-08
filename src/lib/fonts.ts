export interface AmharicFontOption {
  id: string;
  name: string;
  nativeName: string;
  badge: string;
  description: string;
  previewSample: string;
  category: 'sans' | 'serif' | 'calligraphy' | 'phonetic';
  cssStack: string;
}

export const AMHARIC_FONTS: AmharicFontOption[] = [
  {
    id: 'Easy Amharic Typing',
    name: 'Easy Amharic Typing',
    nativeName: 'ቀሊል አማርኛ መተየቢያ',
    badge: 'Popular',
    description: 'Crisp, easy phonetic readability with optimal social video contrast',
    previewSample: 'ሰላም ለሁላችሁ',
    category: 'phonetic',
    cssStack: "'Easy Amharic Typing', 'Abyssinica SIL', 'Noto Sans Ethiopic', sans-serif",
  },
  {
    id: 'Noto Sans Ethiopic',
    name: 'Noto Sans Ethiopic',
    nativeName: 'ኖቶ ሳንስ ኢትዮጲክ',
    badge: 'Modern',
    description: 'Google’s ultra-clean sans-serif designed for high-resolution screens',
    previewSample: 'ሰላም ለሁላችሁ',
    category: 'sans',
    cssStack: "'Noto Sans Ethiopic', sans-serif",
  },
  {
    id: 'Noto Serif Ethiopic',
    name: 'Noto Serif Ethiopic',
    nativeName: 'ኖቶ ሰሪፍ ኢትዮጲክ',
    badge: 'Classic',
    description: 'Refined classical book serif for documentaries and cinematic captions',
    previewSample: 'ሰላም ለሁላችሁ',
    category: 'serif',
    cssStack: "'Noto Serif Ethiopic', 'Abyssinica SIL', serif",
  },
  {
    id: 'Abyssinica',
    name: 'Abyssinica (Abyssinica SIL)',
    nativeName: 'አቢሲኒካ (Abyssinica SIL)',
    badge: 'Calligraphic',
    description: 'Authentic calligraphic Ge’ez glyphs crafted by SIL International',
    previewSample: 'ሰላም ለሁላችሁ',
    category: 'calligraphy',
    cssStack: "'Abyssinica SIL', 'Abyssinica', serif",
  },
  {
    id: 'Nyala',
    name: 'Nyala',
    nativeName: 'ኒያላ',
    badge: 'Standard',
    description: 'Traditional Ethiopian desktop publishing font',
    previewSample: 'ሰላም ለሁላችሁ',
    category: 'sans',
    cssStack: "'Nyala', 'Noto Sans Ethiopic', sans-serif",
  },
];

/**
 * Returns the CSS font stack for a given font ID
 */
export function getFontCssStack(fontId?: string): string {
  if (!fontId) return "'Noto Sans Ethiopic', sans-serif";

  switch (fontId) {
    case 'Easy Amharic Typing':
      return "'Easy Amharic Typing', 'Abyssinica SIL', 'Noto Sans Ethiopic', sans-serif";
    case 'Abyssinica':
    case 'Abyssinica SIL':
      return "'Abyssinica SIL', 'Abyssinica', serif";
    case 'Noto Serif Ethiopic':
      return "'Noto Serif Ethiopic', 'Abyssinica SIL', serif";
    case 'Nyala':
      return "'Nyala', 'Noto Sans Ethiopic', sans-serif";
    case 'Noto Sans Ethiopic':
      return "'Noto Sans Ethiopic', sans-serif";
    default:
      return `${fontId}, 'Noto Sans Ethiopic', sans-serif`;
  }
}
