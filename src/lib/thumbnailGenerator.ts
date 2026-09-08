import { getFontCssStack } from './fonts';

export type CoverTheme = 'heritage' | 'tech' | 'cinematic' | 'midnight' | 'creator' | 'nature';

export interface CoverThemeConfig {
  id: CoverTheme;
  name: string;
  nameAm: string;
  tagline: string;
  categoryTag: string;
  bgGradient: [string, string, string];
  accentColor: string;
  glowColor: string;
  textColor: string;
  amharicSub: string;
}

export const COVER_THEMES: Record<CoverTheme, CoverThemeConfig> = {
  heritage: {
    id: 'heritage',
    name: 'Ethiopic Heritage',
    nameAm: 'ባህላዊ ቅርስ',
    tagline: 'Warm terracotta, gold & Ethiopian emerald motifs',
    categoryTag: 'ባህል • HERITAGE',
    bgGradient: ['#1c1007', '#3d1c06', '#0f2416'],
    accentColor: '#F59E0B', // Amber Gold
    glowColor: 'rgba(245, 158, 11, 0.35)',
    textColor: '#FEF3C7',
    amharicSub: 'የኢትዮጵያ ባህል እና ቅርስ ማስታወሻ',
  },
  tech: {
    id: 'tech',
    name: 'Addis Cyber Tech',
    nameAm: 'ዘመናዊ ቴክኖሎጂ',
    tagline: 'Deep navy, neon cyan & futuristic circuit accents',
    categoryTag: 'ቴክኖሎጂ • TECH & AI',
    bgGradient: ['#030712', '#0f172a', '#1e1b4b'],
    accentColor: '#38BDF8', // Sky Blue
    glowColor: 'rgba(56, 189, 248, 0.4)',
    textColor: '#F0F9FF',
    amharicSub: 'የዲጂታል ፈጠራ እና የቴክኖሎጂ አድማስ',
  },
  cinematic: {
    id: 'cinematic',
    name: 'Golden Hour Cinema',
    nameAm: 'ወርቃማ ሲኒማ',
    tagline: 'Warm amber spotlights & anamorphic film flare',
    categoryTag: 'ሲኒማ • CINEMATIC',
    bgGradient: ['#0f0b08', '#2b1810', '#1c130d'],
    accentColor: '#FBBF24', // Warm Gold
    glowColor: 'rgba(251, 191, 36, 0.3)',
    textColor: '#FFFBEB',
    amharicSub: 'ልዩ ዘጋቢ እና ጥበባዊ የቪዲዮ ዝግጅት',
  },
  creator: {
    id: 'creator',
    name: 'Vibrant Creator',
    nameAm: 'ፈጣሪ እና ቪሎግ',
    tagline: 'Energetic coral, magenta & vivid viral social styling',
    categoryTag: 'ቪሎግ • CREATOR & VLOG',
    bgGradient: ['#180324', '#3b0764', '#4c0519'],
    accentColor: '#EC4899', // Pink / Coral
    glowColor: 'rgba(236, 72, 153, 0.45)',
    textColor: '#FDF2F8',
    amharicSub: 'ማራኪ እና ተወዳጅ የፈጠራ ይዘት',
  },
  nature: {
    id: 'nature',
    name: 'Simien Landscape',
    nameAm: 'የተፈጥሮ ውበት',
    tagline: 'Highland emerald hills, misty skies & golden light',
    categoryTag: 'ተፈጥሮ • NATURE & TRAVEL',
    bgGradient: ['#061a14', '#064e3b', '#14382c'],
    accentColor: '#34D399', // Emerald
    glowColor: 'rgba(52, 211, 153, 0.35)',
    textColor: '#ECFDF5',
    amharicSub: 'ውብ የኢትዮጵያ የተፈጥሮ ስፍራዎች',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Studio',
    nameAm: 'ጥቁር ፕሪሚየም',
    tagline: 'Monochrome obsidian slate with silver highlights',
    categoryTag: 'ቃለ-መጠይቅ • INTERVIEW & SHOW',
    bgGradient: ['#020617', '#0f172a', '#1e293b'],
    accentColor: '#818CF8', // Indigo
    glowColor: 'rgba(129, 140, 248, 0.3)',
    textColor: '#FFFFFF',
    amharicSub: 'ልዩ የውይይት እና የቃለ-መጠይቅ ፕሮግራም',
  },
};

/**
 * Intelligent topic detector from title string
 */
export function detectThemeFromTitle(title: string): CoverTheme {
  const lower = title.toLowerCase();

  if (
    lower.includes('coffee') ||
    lower.includes('buna') ||
    lower.includes('culture') ||
    lower.includes('heritage') ||
    lower.includes('traditional') ||
    lower.includes('habesha') ||
    lower.includes('ባህል') ||
    lower.includes('ቡና') ||
    lower.includes('ቅርስ') ||
    lower.includes('ሀገር')
  ) {
    return 'heritage';
  }

  if (
    lower.includes('tech') ||
    lower.includes('code') ||
    lower.includes('ai') ||
    lower.includes('software') ||
    lower.includes('digital') ||
    lower.includes('presentation') ||
    lower.includes('computer') ||
    lower.includes('future') ||
    lower.includes('ቴክኖሎጂ') ||
    lower.includes('ኮምፒውተር') ||
    lower.includes('ዲጂታል')
  ) {
    return 'tech';
  }

  if (
    lower.includes('interview') ||
    lower.includes('podcast') ||
    lower.includes('talk') ||
    lower.includes('show') ||
    lower.includes('discussion') ||
    lower.includes('ቃለ') ||
    lower.includes('መጠይቅ') ||
    lower.includes('ውይይት')
  ) {
    return 'midnight';
  }

  if (
    lower.includes('music') ||
    lower.includes('song') ||
    lower.includes('dance') ||
    lower.includes('vlog') ||
    lower.includes('tiktok') ||
    lower.includes('viral') ||
    lower.includes('fun') ||
    lower.includes('ሙዚቃ') ||
    lower.includes('ዘፈን') ||
    lower.includes('ዳንስ') ||
    lower.includes('ቪሎግ')
  ) {
    return 'creator';
  }

  if (
    lower.includes('travel') ||
    lower.includes('nature') ||
    lower.includes('mountain') ||
    lower.includes('addis') ||
    lower.includes('trip') ||
    lower.includes('tour') ||
    lower.includes('ከተማ') ||
    lower.includes('ተራራ') ||
    lower.includes('ጉዞ')
  ) {
    return 'nature';
  }

  // Consistent deterministic fallback based on string length and char code
  const themes: CoverTheme[] = ['cinematic', 'heritage', 'tech', 'creator', 'nature', 'midnight'];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  return themes[Math.abs(hash) % themes.length];
}

/**
 * Formats a raw file name into a clean, human-readable display title
 */
export function formatDisplayTitle(rawTitle: string): string {
  if (!rawTitle) return 'Untiled Video';
  return rawTitle
    .replace(/\.(mp4|mov|webm|mkv|avi)$/i, '')
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => (word.length > 2 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

export interface ThumbnailGeneratorOptions {
  title: string;
  subtitle?: string;
  theme?: CoverTheme;
  customFont?: string;
  videoFrame?: HTMLVideoElement | null;
  durationSeconds?: number;
}

/**
 * Draws stylized authentic Ethiopian Tibeb cross-stitch pattern borders
 */
function drawTibebBorder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  accentColor: string
) {
  const barHeight = 14;
  const segments = Math.floor(width / 24);

  // Top Tibeb Bar
  for (let i = 0; i < segments; i++) {
    const x = i * 24;
    const colors = [accentColor, '#EF4444', '#10B981', '#F59E0B'];
    const color = colors[i % colors.length];

    ctx.fillStyle = color;
    // Diamond motif
    ctx.beginPath();
    ctx.moveTo(x + 12, 0);
    ctx.lineTo(x + 24, barHeight / 2);
    ctx.lineTo(x + 12, barHeight);
    ctx.lineTo(x, barHeight / 2);
    ctx.closePath();
    ctx.fill();
  }

  // Subtle bottom accent line
  const grad = ctx.createLinearGradient(0, height - 6, width, height - 6);
  grad.addColorStop(0, 'rgba(16, 185, 129, 0.8)'); // Green
  grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.9)'); // Gold
  grad.addColorStop(1, 'rgba(239, 68, 68, 0.8)'); // Red
  ctx.fillStyle = grad;
  ctx.fillRect(0, height - 6, width, 6);
}

/**
 * Generates a high-resolution 1280x720 stylized cover image on an HTML5 canvas
 * and returns it as a high-quality data URL.
 */
export async function generateStylizedThumbnail(
  options: ThumbnailGeneratorOptions
): Promise<string> {
  const {
    title,
    subtitle,
    theme = detectThemeFromTitle(title),
    customFont = 'Easy Amharic Typing',
    videoFrame,
    durationSeconds,
  } = options;

  const config = COVER_THEMES[theme] || COVER_THEMES.cinematic;
  const cleanTitle = formatDisplayTitle(title);
  const displaySubtitle = subtitle || config.amharicSub;

  const width = 1280;
  const height = 720;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Ensure web fonts are ready if available
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      // Ignore font wait error
    }
  }

  // 1. Background layer
  if (videoFrame && videoFrame.videoWidth > 0) {
    // Draw video frame with darkening overlay
    ctx.drawImage(videoFrame, 0, 0, width, height);

    // Apply color tint & atmospheric dark gradient
    const overlayGrad = ctx.createLinearGradient(0, 0, 0, height);
    overlayGrad.addColorStop(0, 'rgba(10, 15, 29, 0.65)');
    overlayGrad.addColorStop(0.5, 'rgba(10, 15, 29, 0.78)');
    overlayGrad.addColorStop(1, 'rgba(10, 15, 29, 0.95)');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Dynamic procedural rich multi-stop gradient
    const bgGrad = ctx.createRadialGradient(
      width * 0.7,
      height * 0.3,
      100,
      width * 0.5,
      height * 0.5,
      width * 0.8
    );
    bgGrad.addColorStop(0, config.bgGradient[1]);
    bgGrad.addColorStop(0.5, config.bgGradient[2]);
    bgGrad.addColorStop(1, config.bgGradient[0]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Additional secondary gradient for depth
    const angleGrad = ctx.createLinearGradient(0, height, width, 0);
    angleGrad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    angleGrad.addColorStop(0.5, 'transparent');
    angleGrad.addColorStop(1, config.glowColor);
    ctx.fillStyle = angleGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Decorative Background Geometry / Theme Watermarks
  ctx.save();
  if (theme === 'heritage') {
    // Traditional Ethiopian Jebena Coffee Pot / Mesob silhouette motif
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.lineWidth = 3;
    // Circular mesob halo
    ctx.beginPath();
    ctx.arc(width - 200, height / 2, 260, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(width - 200, height / 2, 200, 0, Math.PI * 2);
    ctx.stroke();

    // Traditional cross hatchings
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(width - 200 + Math.cos(angle) * 160, height / 2 + Math.sin(angle) * 160);
      ctx.lineTo(width - 200 + Math.cos(angle) * 260, height / 2 + Math.sin(angle) * 260);
      ctx.stroke();
    }
  } else if (theme === 'tech') {
    // Futuristic cyber perspective grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= width; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 120, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    // Glowing tech beacon
    const techGlow = ctx.createRadialGradient(width - 240, 220, 20, width - 240, 220, 180);
    techGlow.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    techGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = techGlow;
    ctx.beginPath();
    ctx.arc(width - 240, 220, 180, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'creator') {
    // Dynamic angled vibrant energy streaks
    ctx.fillStyle = 'rgba(236, 72, 153, 0.08)';
    ctx.beginPath();
    ctx.moveTo(width * 0.4, 0);
    ctx.lineTo(width * 0.75, 0);
    ctx.lineTo(width * 0.55, height);
    ctx.lineTo(width * 0.2, height);
    ctx.closePath();
    ctx.fill();

    const pinkGlow = ctx.createRadialGradient(width - 150, 150, 10, width - 150, 150, 250);
    pinkGlow.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
    pinkGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = pinkGlow;
    ctx.beginPath();
    ctx.arc(width - 150, 150, 250, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'nature') {
    // Simien mountain silhouettes in background
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.beginPath();
    ctx.moveTo(width * 0.35, height);
    ctx.lineTo(width * 0.6, height - 320);
    ctx.lineTo(width * 0.8, height - 160);
    ctx.lineTo(width * 0.95, height - 280);
    ctx.lineTo(width, height - 240);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
  } else {
    // Cinematic anamorphic lens flare beam
    const flareGrad = ctx.createLinearGradient(0, height * 0.45, width, height * 0.45);
    flareGrad.addColorStop(0, 'transparent');
    flareGrad.addColorStop(0.3, 'rgba(251, 191, 36, 0.05)');
    flareGrad.addColorStop(0.65, 'rgba(251, 191, 36, 0.35)');
    flareGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.8)');
    flareGrad.addColorStop(0.75, 'rgba(251, 191, 36, 0.35)');
    flareGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = flareGrad;
    ctx.fillRect(0, height * 0.44, width, 12);
  }
  ctx.restore();

  // 3. Ethiopian Tibeb Cultural Border along edges
  drawTibebBorder(ctx, width, height, config.accentColor);

  // 4. Subtle Film Grain & Vignette
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.35,
    width / 2,
    height / 2,
    width * 0.75
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // 5. Typography Rendering
  const leftMargin = 96;
  let currentY = 160;

  // Category Tag Badge Pill
  ctx.save();
  ctx.font = 'bold 22px Plus Jakarta Sans, sans-serif';
  const tagText = config.categoryTag;
  const tagMetrics = ctx.measureText(tagText);
  const tagWidth = tagMetrics.width + 36;
  const tagHeight = 44;

  // Badge background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.strokeStyle = config.accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(leftMargin, currentY - 32, tagWidth, tagHeight, 22);
  ctx.fill();
  ctx.stroke();

  // Badge Text
  ctx.fillStyle = config.accentColor;
  ctx.fillText(tagText, leftMargin + 18, currentY - 3);
  ctx.restore();

  currentY += 80;

  // Main Title (English & Amharic Title)
  ctx.save();
  const fontCss = getFontCssStack(customFont);
  ctx.font = `800 64px ${fontCss}, "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = config.textColor;

  // Title drop shadow for maximum punchy legibility
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 6;

  // Wrap title if longer than max width
  const maxTitleWidth = width - leftMargin * 2 - 120;
  const words = cleanTitle.split(' ');
  let line = '';
  const lines: string[] = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxTitleWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  // Draw at most 2 lines
  const displayLines = lines.slice(0, 2);
  displayLines.forEach((textLine, i) => {
    ctx.fillText(textLine, leftMargin, currentY + i * 74);
  });
  ctx.restore();

  currentY += displayLines.length * 74 + 18;

  // Amharic Subtitle Line
  ctx.save();
  ctx.font = `600 32px "Noto Sans Ethiopic", "Easy Amharic Typing", sans-serif`;
  ctx.fillStyle = config.accentColor;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 10;
  ctx.fillText(displaySubtitle, leftMargin, currentY);
  ctx.restore();

  // 6. Bottom Brand & Studio Bar
  const bottomY = height - 64;

  // Studio Logo / Watermark
  ctx.save();
  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillText('አማርኛ ካፕሽን • AMHARIC CAPTION STUDIO', leftMargin, bottomY);

  // Decorative Ge'ez punctuation flourish
  ctx.font = '800 24px "Noto Sans Ethiopic", sans-serif';
  ctx.fillStyle = config.accentColor;
  ctx.fillText(' ፡ ። ፡ ', leftMargin + 430, bottomY);

  // Play / Duration badge on right if duration provided
  if (durationSeconds) {
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    const durStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} HD`;

    ctx.font = 'bold 20px monospace';
    const durMetrics = ctx.measureText(durStr);
    const badgeW = durMetrics.width + 32;
    const badgeH = 38;
    const badgeX = width - leftMargin - badgeW;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(badgeX, bottomY - 26, badgeW, badgeH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(durStr, badgeX + 16, bottomY - 2);
  }
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
}
