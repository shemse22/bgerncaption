import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  RefreshCw,
  Download,
  Check,
  Palette,
  Type,
  Layout,
  Sliders,
} from 'lucide-react';
import {
  COVER_THEMES,
  CoverTheme,
  generateStylizedThumbnail,
  detectThemeFromTitle,
  formatDisplayTitle,
} from '../lib/thumbnailGenerator';
import { AMHARIC_FONTS } from '../lib/fonts';

interface ThumbnailGeneratorModalProps {
  initialTitle: string;
  initialThumbnailUrl?: string;
  durationSeconds?: number;
  isOpen: boolean;
  onClose: () => void;
  onApplyCover: (thumbnailUrl: string) => void;
}

export const ThumbnailGeneratorModal: React.FC<ThumbnailGeneratorModalProps> = ({
  initialTitle,
  initialThumbnailUrl,
  durationSeconds,
  isOpen,
  onClose,
  onApplyCover,
}) => {
  const [title, setTitle] = useState<string>(() => formatDisplayTitle(initialTitle));
  const [theme, setTheme] = useState<CoverTheme>(() => detectThemeFromTitle(initialTitle));
  const [subtitle, setSubtitle] = useState<string>(() => COVER_THEMES[detectThemeFromTitle(initialTitle)].amharicSub);
  const [selectedFont, setSelectedFont] = useState<string>('Easy Amharic Typing');
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string>(initialThumbnailUrl || '');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync state when initialTitle changes
  useEffect(() => {
    if (initialTitle) {
      const clean = formatDisplayTitle(initialTitle);
      setTitle(clean);
      const detected = detectThemeFromTitle(initialTitle);
      setTheme(detected);
      setSubtitle(COVER_THEMES[detected].amharicSub);
    }
  }, [initialTitle]);

  // Generate thumbnail whenever parameters change
  const handleRegenerate = async (customTheme?: CoverTheme) => {
    setIsGenerating(true);
    try {
      const currentTheme = customTheme || theme;
      const dataUrl = await generateStylizedThumbnail({
        title,
        subtitle: subtitle || COVER_THEMES[currentTheme].amharicSub,
        theme: currentTheme,
        customFont: selectedFont,
        durationSeconds,
      });
      setGeneratedThumbnail(dataUrl);
    } catch (err) {
      console.error('Failed to generate thumbnail:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleRegenerate();
    }
  }, [isOpen, theme, selectedFont]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (generatedThumbnail) {
      onApplyCover(generatedThumbnail);
      onClose();
    }
  };

  const handleDownload = () => {
    if (!generatedThumbnail) return;
    const a = document.createElement('a');
    a.href = generatedThumbnail;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_cover.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Stylized Project Cover Generator
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                የቪዲዮ ማራኪ የፊት ሽፋን ማመንጫ (Amharic & English Covers)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition touch-tap"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Live Preview Display Card */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Cover Art Preview (16:9 HD)
              </span>
              <button
                onClick={() => handleRegenerate()}
                disabled={isGenerating}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline touch-tap"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md group">
              {generatedThumbnail ? (
                <img
                  src={generatedThumbnail}
                  alt={title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-101"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="text-xs">Synthesizing stylized cover artwork...</span>
                </div>
              )}

              {/* Theme Badge Overlay in preview */}
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold">
                {COVER_THEMES[theme].nameAm}
              </div>
            </div>
          </div>

          {/* Theme Selector Palette */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
              <Palette className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Select Stylized Aesthetic Theme</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(COVER_THEMES) as CoverTheme[]).map((themeKey) => {
                const conf = COVER_THEMES[themeKey];
                const isSelected = theme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => {
                      setTheme(themeKey);
                      setSubtitle(conf.amharicSub);
                      handleRegenerate(themeKey);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all touch-tap flex flex-col justify-between min-h-[64px] ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/60 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {conf.name}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 truncate">
                      {conf.nameAm}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Subtitle Customization Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Video Title (ዋና ርዕስ)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleRegenerate()}
                placeholder="e.g. Ethiopian Coffee Story"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Amharic Subtitle (ንዑስ ርዕስ)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                onBlur={() => handleRegenerate()}
                placeholder="e.g. የኢትዮጵያ ባህል እና ታሪክ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Typography Font Picker */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
              <Type className="w-3.5 h-3.5 text-amber-500" />
              <span>Cover Typography Style</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {AMHARIC_FONTS.slice(0, 4).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFont(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition touch-tap ${
                    selectedFont === f.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 touch-tap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download HD Image</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition touch-tap"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply to Project</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
