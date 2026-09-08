import React from 'react';
import { Sparkles, Sliders, Type, Palette, AlignVerticalJustifyCenter, Square, Check, ArrowUp, ArrowDown, Zap, Crown, Flame, Crosshair } from 'lucide-react';
import { CaptionStyle, CaptionPreset, CaptionPosition, CaptionBackground, TextAnimationIn, TextAnimationOut, HighlightStyle } from '../types';
import { STYLE_PRESETS } from '../lib/amharicData';
import { AMHARIC_FONTS, getFontCssStack } from '../lib/fonts';

interface StylePanelProps {
  style: CaptionStyle;
  onChangeStyle: (newStyle: CaptionStyle) => void;
}

export const StylePanel: React.FC<StylePanelProps> = ({ style, onChangeStyle }) => {
  const presets: { id: CaptionPreset; label: string; previewText: string; bgClass: string; textClass: string; badge?: string }[] = [
    { id: 'up', label: 'Up (ቀና)', previewText: 'እንደምን ↑', bgClass: 'bg-gradient-to-t from-sky-950 to-slate-900 border border-sky-400/40', textClass: 'text-sky-200 font-black', badge: 'Pop Up' },
    { id: 'down', label: 'Down (ወደታች)', previewText: 'እንደምን ↓', bgClass: 'bg-gradient-to-b from-amber-950/90 to-slate-900 border border-amber-400/40', textClass: 'text-amber-300 font-black', badge: 'Drop' },
    { id: 'sparkle-duo', label: 'Sparkle Duo-O', previewText: '✦ እንደምን ✦', bgClass: 'bg-gradient-to-r from-purple-950 via-slate-900 to-cyan-950 border border-purple-400/50', textClass: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-200 to-cyan-300 font-black', badge: 'Sparkle' },
    { id: 'dotted-selection', label: 'Dotted Box', previewText: '⋮ እንደምን ⋮', bgClass: 'bg-slate-950 border-2 border-dashed border-cyan-400', textClass: 'text-cyan-300 font-mono font-bold', badge: 'Focus' },
    { id: 'real-gold', label: 'Real Gold', previewText: 'ወርቅ', bgClass: 'bg-black border border-amber-500/70 shadow-amber-500/20 shadow-xs', textClass: 'text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-300 to-amber-600 font-black', badge: 'Luxury' },
    { id: 'red-string', label: 'Red String', previewText: '— እንደምን —', bgClass: 'bg-black border-b-2 border-red-500', textClass: 'text-white font-bold', badge: 'Trending' },
    { id: 'bold', label: 'Bold Yellow', previewText: 'እንደምን አደራችሁ', bgClass: 'bg-black', textClass: 'text-yellow-400 font-black' },
    { id: 'tiktok', label: 'TikTok Glow', previewText: 'እንደምን አደራችሁ', bgClass: 'bg-gradient-to-r from-pink-500/20 to-cyan-500/20', textClass: 'text-white font-black' },
    { id: 'modern', label: 'Modern', previewText: 'እንደምን አደራችሁ', bgClass: 'bg-slate-800/80', textClass: 'text-white font-sans' },
    { id: 'minimal', label: 'Minimal', previewText: 'እንደምን አደራችሁ', bgClass: 'bg-transparent', textClass: 'text-slate-100 font-medium drop-shadow' },
    { id: 'youtube', label: 'YouTube Red', previewText: 'እንደምን አደራችሁ', bgClass: 'bg-red-600/90', textClass: 'text-white font-bold' },
    { id: 'classic', label: 'Classic Serif', previewText: 'እንደምን አደራችሁ', bgClass: 'bg-amber-950/80', textClass: 'text-amber-200 font-serif' },
  ];

  const colors = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Yellow', hex: '#FACC15' },
    { name: 'Cyan', hex: '#38BDF8' },
    { name: 'Green', hex: '#4ADE80' },
    { name: 'Red', hex: '#F87171' },
    { name: 'Orange', hex: '#FB923C' },
    { name: 'Gold', hex: '#FDE047' },
  ];

  const handleApplyPreset = (presetKey: CaptionPreset) => {
    const presetData = STYLE_PRESETS[presetKey];
    if (presetData) {
      onChangeStyle({
        ...style,
        ...presetData,
        preset: presetKey,
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Style Presets Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Style Presets (ቅጦች)
          </label>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
            12 Pro Styles
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {presets.map((p) => {
            const isSelected = style.preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p.id)}
                className={`relative flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-2xl border transition-all text-center active:scale-95 touch-tap cursor-pointer ${
                  isSelected
                    ? 'border-purple-600 dark:border-purple-400 bg-purple-50/70 dark:bg-purple-950/40 shadow-sm ring-1 ring-purple-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                {/* Mini Visual Preview */}
                <div className={`w-full py-2 px-1 rounded-lg ${p.bgClass} flex items-center justify-center mb-1.5 shadow-inner min-h-[34px]`}>
                  <span className={`text-[11px] leading-tight truncate ${p.textClass}`}>
                    {p.previewText}
                  </span>
                </div>
                <div className="w-full flex items-center justify-between px-0.5">
                  <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-800 dark:text-slate-200'}`}>
                    {p.label}
                  </span>
                  {p.badge && (
                    <span className="text-[8px] font-extrabold px-1 rounded-sm bg-purple-500/20 text-purple-400 uppercase">
                      {p.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Family Selection */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 block">
            Amharic Font Family (የፊደል ቅርጽ)
          </label>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
            4 Ethiopic Typefaces
          </span>
        </div>

        {/* Visual Font Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AMHARIC_FONTS.map((font) => {
            const isSelected = style.font === font.id || (font.id === 'Abyssinica' && style.font === 'Abyssinica SIL');
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => onChangeStyle({ ...style, font: font.id })}
                className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] touch-tap relative flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {font.name}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase shrink-0">
                    {font.badge}
                  </span>
                </div>

                {/* Amharic Script Preview */}
                <div
                  className="text-base sm:text-lg font-bold text-slate-800 my-0.5"
                  style={{ fontFamily: font.cssStack }}
                >
                  {font.previewSample}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="truncate">{font.nativeName}</span>
                  {isSelected && (
                    <span className="text-blue-600 flex items-center gap-0.5 font-bold shrink-0">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dropdown Alternative */}
        <select
          value={style.font}
          onChange={(e) => onChangeStyle({ ...style, font: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden"
        >
          <option value="Easy Amharic Typing">Easy Amharic Typing (ቀሊል አማርኛ መተየቢያ)</option>
          <option value="Noto Sans Ethiopic">Noto Sans Ethiopic (ኖቶ ሳንስ ኢትዮጲክ - Modern)</option>
          <option value="Noto Serif Ethiopic">Noto Serif Ethiopic (ኖቶ ሰሪፍ ኢትዮጲክ - Classic)</option>
          <option value="Abyssinica">Abyssinica / Abyssinica SIL (አቢሲኒካ - Calligraphic)</option>
          <option value="Nyala">Nyala (ኒያላ - Standard Windows)</option>
          <option value="system-ui">System Sans-Serif</option>
        </select>
      </div>

      {/* Font Size Stepper & Slider */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700">Font Size</label>
          <span className="text-xs font-mono font-bold text-slate-600">{style.size}px</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="22"
            max="64"
            value={style.size}
            onChange={(e) => onChangeStyle({ ...style, size: Number(e.target.value) })}
            className="flex-1 accent-blue-600 h-2 sm:h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0">
            <button
              onClick={() => onChangeStyle({ ...style, size: Math.max(20, style.size - 2) })}
              className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-xs hover:bg-slate-100 font-bold active:bg-slate-200 transition touch-tap"
            >
              -
            </button>
            <span className="px-2 text-xs font-mono font-bold">{style.size}</span>
            <button
              onClick={() => onChangeStyle({ ...style, size: Math.min(72, style.size + 2) })}
              className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-xs hover:bg-slate-100 font-bold active:bg-slate-200 transition touch-tap"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1.5">
          Text Color
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {colors.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => onChangeStyle({ ...style, color: c.hex })}
              className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full border transition-all active:scale-95 touch-tap ${
                style.color.toLowerCase() === c.hex.toLowerCase()
                  ? 'ring-2 ring-blue-600 ring-offset-2 scale-110 shadow-xs'
                  : 'hover:scale-105 border-slate-200'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
          <input
            type="color"
            value={style.color}
            onChange={(e) => onChangeStyle({ ...style, color: e.target.value })}
            className="w-9 h-9 sm:w-8 sm:h-8 rounded-full border border-slate-200 cursor-pointer overflow-hidden p-0 active:scale-95 touch-tap"
            title="Custom Hex Color"
          />
        </div>
      </div>

      {/* Background Style: None / Semi / Solid */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1.5">
          Background Box
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['none', 'semi', 'solid'] as CaptionBackground[]).map((bg) => (
            <button
              key={bg}
              type="button"
              onClick={() => onChangeStyle({ ...style, background: bg })}
              className={`min-h-[42px] py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all active:scale-95 touch-tap ${
                style.background === bg
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {bg}
            </button>
          ))}
        </div>
      </div>

      {/* Position: Top / Center / Bottom */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
          Vertical Position (አቀማመጥ)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['top', 'center', 'bottom'] as CaptionPosition[]).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => onChangeStyle({ ...style, position: pos })}
              className={`min-h-[38px] py-1.5 px-3 rounded-xl border text-xs font-bold capitalize transition-all active:scale-95 touch-tap ${
                style.position === pos
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Outline Width Slider */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Outline Stroke (የመስመር ውፍረት)</label>
          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">{style.outline}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="6"
          step="1"
          value={style.outline}
          onChange={(e) => onChangeStyle({ ...style, outline: Number(e.target.value) })}
          className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
        />
      </div>

      {/* Text Animations & Effects Section (የጽሁፍ አኒሜሽን እና ድምቀት) */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Text Animation (የጽሁፍ አኒሜሽን)
            </label>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            In & Out Kinetic
          </span>
        </div>

        {/* Animate In Controls */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <ArrowUp className="w-3 h-3 text-sky-500" />
              Animate In (መግቢያ አኒሜሽን)
            </span>
            <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase">
              {style.animateIn || 'up'}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {(
              [
                { id: 'up', label: 'Up (ቀና)', icon: '↑' },
                { id: 'down', label: 'Down (ታች)', icon: '↓' },
                { id: 'bounce', label: 'Bounce', icon: '⚡' },
                { id: 'zoom', label: 'Zoom', icon: '🔍' },
                { id: 'fade', label: 'Fade', icon: '🌫️' },
                { id: 'none', label: 'None', icon: '✕' },
              ] as { id: TextAnimationIn; label: string; icon: string }[]
            ).map((opt) => {
              const isSelected = (style.animateIn || 'up') === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeStyle({ ...style, animateIn: opt.id })}
                  className={`py-1.5 px-1.5 rounded-xl border text-[11px] font-bold transition-all active:scale-95 touch-tap flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? 'bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-500/30 ring-1 ring-sky-400'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs">{opt.icon}</span>
                  <span className="truncate max-w-full text-[10px]">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Animate Out Controls */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <ArrowDown className="w-3 h-3 text-purple-500" />
              Animate Out (መውጫ አኒሜሽን)
            </span>
            <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase">
              {style.animateOut || 'fade'}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {(
              [
                { id: 'down', label: 'Down (ታች)', icon: '↓' },
                { id: 'up', label: 'Up (ቀና)', icon: '↑' },
                { id: 'fade', label: 'Fade', icon: '🌫️' },
                { id: 'zoom', label: 'Zoom Out', icon: '🔍' },
                { id: 'none', label: 'None', icon: '✕' },
              ] as { id: TextAnimationOut; label: string; icon: string }[]
            ).map((opt) => {
              const isSelected = (style.animateOut || 'fade') === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeStyle({ ...style, animateOut: opt.id })}
                  className={`py-1.5 px-1.5 rounded-xl border text-[11px] font-bold transition-all active:scale-95 touch-tap flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/30 ring-1 ring-purple-400'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs">{opt.icon}</span>
                  <span className="truncate max-w-full text-[10px]">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Animation Speed */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              Animation Speed (ፍጥነት)
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 capitalize">
              {style.animationSpeed || 'normal'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'fast', label: 'Fast (0.2s)', badge: '⚡ Viral' },
                { id: 'normal', label: 'Normal (0.35s)', badge: 'Standard' },
                { id: 'slow', label: 'Slow (0.5s)', badge: 'Smooth' },
              ] as const
            ).map((spd) => {
              const isSelected = (style.animationSpeed || 'normal') === spd.id;
              return (
                <button
                  key={spd.id}
                  type="button"
                  onClick={() => onChangeStyle({ ...style, animationSpeed: spd.id })}
                  className={`py-1.5 px-2 rounded-xl border text-xs font-bold transition-all active:scale-95 touch-tap text-center ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div>{spd.label}</div>
                  <div className="text-[9px] opacity-75 font-normal">{spd.badge}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spoken Word Highlight & Visual Effect */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              Word Highlight Style (የተነገረ ቃል ድምቀት)
            </label>
            <button
              type="button"
              onClick={() => onChangeStyle({ ...style, highlightWord: !style.highlightWord })}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition cursor-pointer ${
                style.highlightWord
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
            >
              {style.highlightWord ? '● Active' : '○ Off'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(
              [
                { id: 'default', label: 'Yellow Glow', icon: '🌟', borderClass: 'border-yellow-400/60' },
                { id: 'sparkle', label: 'Sparkle Duo-O', icon: '✦', borderClass: 'border-purple-400/60' },
                { id: 'dotted', label: 'Dotted Box', icon: '⋮', borderClass: 'border-cyan-400/60' },
                { id: 'gold', label: 'Real Gold', icon: '👑', borderClass: 'border-amber-400/60' },
                { id: 'red-string', label: 'Red String', icon: '🎗️', borderClass: 'border-red-500/60' },
              ] as { id: HighlightStyle; label: string; icon: string; borderClass: string }[]
            ).map((hl) => {
              const isSelected = (style.highlightStyle || 'default') === hl.id;
              return (
                <button
                  key={hl.id}
                  type="button"
                  onClick={() => onChangeStyle({ ...style, highlightStyle: hl.id, highlightWord: true })}
                  className={`p-2 rounded-xl border text-left transition-all active:scale-95 touch-tap flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? `bg-blue-50/80 dark:bg-blue-950/50 border-blue-600 dark:border-blue-400 ring-1 ring-blue-500 shadow-xs`
                      : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700`
                  }`}
                >
                  <span className="text-sm shrink-0">{hl.icon}</span>
                  <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    {hl.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
