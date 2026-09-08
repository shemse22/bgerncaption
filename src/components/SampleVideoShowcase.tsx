import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Sliders,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { SAMPLE_VIDEOS, SampleVideo, STYLE_PRESETS } from '../lib/amharicData';
import { SafeZoneOverlay, SafeZonePlatform } from './SafeZoneOverlay';
import { formatTimeSeconds } from '../lib/subtitles';
import { TikTokIcon, YouTubeShortsIcon, InstagramIcon } from './PlatformIcons';

interface SampleVideoShowcaseProps {
  onOpenSampleInEditor?: (sample: SampleVideo) => void;
  onOpenUpload?: (file?: File, sampleId?: string) => void;
  isAuthenticated?: boolean;
  onRequireAuth?: () => void;
}

export const SampleVideoShowcase: React.FC<SampleVideoShowcaseProps> = ({
  onOpenSampleInEditor,
  onOpenUpload,
  isAuthenticated = false,
  onRequireAuth,
}) => {
  const [activeSampleId, setActiveSampleId] = useState<string>('sample-gold');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Default muted for smooth browser playback
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(15);
  const [safeZone, setSafeZone] = useState<SafeZonePlatform | 'none'>('none');

  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const activeSample =
    SAMPLE_VIDEOS.find((s) => s.id === activeSampleId) || SAMPLE_VIDEOS[0];
  const activePreset =
    STYLE_PRESETS[activeSample.presetKey as keyof typeof STYLE_PRESETS] ||
    STYLE_PRESETS['real-gold'];

  // Update video src when active sample changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      videoRef.current.load();
    }
  }, [activeSampleId]);

  // Sync current time with requestAnimationFrame for smooth subtitle animations
  useEffect(() => {
    const updateTime = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(updateTime);
      }
    };

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(updateTime);
    } else if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying]);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Playback blocked:', err));
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => undefined);
    }
  };

  // Find currently active caption segment based on video time
  const currentSegment = activeSample.defaultSegments.find(
    (seg) => currentTime >= seg.start && currentTime <= seg.end
  );

  // Compute animated caption styling
  let activeCaptionWordIdx = -1;
  let animOpacity = 1;
  let animTransform = 'none';

  if (currentSegment) {
    const segDuration = currentSegment.end - currentSegment.start;
    const elapsed = currentTime - currentSegment.start;
    const remaining = currentSegment.end - currentTime;
    const animDuration = 0.28;

    // Word highlighting
    const words = currentSegment.text.trim().split(/\s+/).filter(Boolean);
    const ratio = Math.min(0.999, elapsed / segDuration);
    activeCaptionWordIdx = Math.floor(ratio * words.length);

    // In Animation
    if (elapsed < animDuration && activePreset.animateIn !== 'none') {
      const p = Math.min(1, elapsed / animDuration);
      if (activePreset.animateIn === 'bounce') {
        const scale = p < 0.6 ? 0.7 + p * 0.7 : 1.12 - (p - 0.6) * 0.3;
        animTransform = `scale(${scale})`;
        animOpacity = p;
      } else if (activePreset.animateIn === 'up') {
        const offset = (1 - p) * 22;
        animTransform = `translateY(${offset}px) scale(${0.92 + p * 0.08})`;
        animOpacity = p;
      } else if (activePreset.animateIn === 'fade') {
        animOpacity = p;
      }
    }
    // Out Animation
    else if (remaining < animDuration && remaining >= 0 && activePreset.animateOut !== 'none') {
      const outP = Math.max(0, remaining / animDuration);
      if (activePreset.animateOut === 'down') {
        const offset = (1 - outP) * 22;
        animTransform = `translateY(${offset}px) scale(${0.92 + outP * 0.08})`;
        animOpacity = outP;
      } else if (activePreset.animateOut === 'fade') {
        animOpacity = outP;
      }
    }
  }

  // Preset container borders & glow styling
  let containerExtraStyle = '';
  if (activePreset.highlightStyle === 'gold') {
    containerExtraStyle = 'border border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.45)]';
  } else if (activePreset.highlightStyle === 'sparkle') {
    containerExtraStyle = 'ring-1 ring-fuchsia-500/60 shadow-[0_0_25px_rgba(217,70,239,0.4)]';
  } else if (activePreset.highlightStyle === 'red-string') {
    containerExtraStyle = 'border-b-4 border-red-500 shadow-[0_4px_20px_rgba(239,68,68,0.45)]';
  } else if (activePreset.highlightStyle === 'dotted') {
    containerExtraStyle = 'border-2 border-dashed border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.45)]';
  } else {
    containerExtraStyle = 'shadow-2xl';
  }

  const handleEditorClick = () => {
    if (!isAuthenticated && onRequireAuth) {
      onRequireAuth();
      return;
    }
    if (onOpenSampleInEditor) {
      onOpenSampleInEditor(activeSample);
    }
  };

  const handleUploadWithStyle = () => {
    if (onOpenUpload) {
      onOpenUpload(undefined, activeSample.id);
    }
  };

  return (
    <div className="rounded-3xl bg-[#131B2E]/95 border border-slate-700/80 p-5 sm:p-7 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Interactive Showcase
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Real Live Video & Captions</span>
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white mt-1">
            Working Sample Captions in Different Styles
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click each style to preview live Amharic text animations, kinetic entrance, and word highlights.
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleEditorClick}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition active:scale-95 touch-tap"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Try in Caption Editor</span>
          </button>
        </div>
      </div>

      {/* Style Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {SAMPLE_VIDEOS.map((sample) => {
          const isActive = sample.id === activeSampleId;
          return (
            <button
              key={sample.id}
              onClick={() => setActiveSampleId(sample.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-2 shrink-0 touch-tap ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 scale-102 border border-purple-400/50'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80'
              }`}
            >
              <span>{sample.styleName || sample.title}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />}
            </button>
          );
        })}
      </div>

      {/* Main Video Stage & Style Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Video Player Display Container */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[9/16] rounded-3xl overflow-hidden bg-slate-950 border border-slate-700 shadow-2xl select-none group">
            {/* HTML5 Native Video Element */}
            <video
              ref={videoRef}
              src={activeSample.url}
              playsInline
              loop
              muted={isMuted}
              onLoadedMetadata={(e) => {
                const vid = e.currentTarget;
                setDuration(vid.duration || 15);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={handleTogglePlay}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* SafeZone Overlay */}
            {safeZone !== 'none' && (
              <SafeZoneOverlay platform={safeZone} />
            )}

            {/* Live Subtitle Overlay */}
            {currentSegment && (
              <div
                className={`absolute left-0 right-0 px-4 flex justify-center pointer-events-none transition-all duration-75 z-20 ${
                  activePreset.position === 'top'
                    ? 'top-14 sm:top-16'
                    : activePreset.position === 'center'
                    ? 'top-1/2 -translate-y-1/2'
                    : 'bottom-20 sm:bottom-24'
                }`}
              >
                <div
                  className={`max-w-[92%] text-center px-4 py-2 rounded-2xl transition-all duration-100 backdrop-blur-xs ${containerExtraStyle}`}
                  style={{
                    backgroundColor:
                      activePreset.background === 'solid'
                        ? `rgba(0,0,0,${activePreset.backgroundOpacity ?? 0.85})`
                        : activePreset.background === 'semi'
                        ? `rgba(15,23,42,${activePreset.backgroundOpacity ?? 0.65})`
                        : 'rgba(0,0,0,0.65)',
                    fontSize: `clamp(14px, 4.5vw, ${activePreset.size || 40}px)`,
                    color: activePreset.color || '#FFFFFF',
                    WebkitTextStroke:
                      (activePreset.outline || 0) > 0
                        ? `${activePreset.outline}px ${activePreset.outlineColor || '#000000'}`
                        : 'none',
                    lineHeight: '1.35',
                    opacity: animOpacity,
                    transform: animTransform,
                  }}
                >
                  {/* Words rendering with style-specific active highlights */}
                  {currentSegment.text.split(/\s+/).filter(Boolean).map((word, wIdx) => {
                    const isWordActive = wIdx === activeCaptionWordIdx;

                    if (!isWordActive) {
                      return (
                        <span key={wIdx} className="inline-block mx-1 opacity-80">
                          {word}
                        </span>
                      );
                    }

                    // Gold Style
                    if (activePreset.highlightStyle === 'gold') {
                      return (
                        <span
                          key={wIdx}
                          className="inline-block mx-1 font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 scale-110 drop-shadow-[0_2px_12px_rgba(245,158,11,0.9)] animate-pulse"
                        >
                          {word}
                        </span>
                      );
                    }

                    // Sparkle Style
                    if (activePreset.highlightStyle === 'sparkle') {
                      return (
                        <span
                          key={wIdx}
                          className="inline-block mx-1 font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-200 to-cyan-300 scale-110 drop-shadow-[0_0_12px_rgba(168,85,247,0.9)]"
                        >
                          <span className="text-cyan-300 text-xs mr-0.5">✦</span>
                          {word}
                          <span className="text-fuchsia-300 text-xs ml-0.5">✦</span>
                        </span>
                      );
                    }

                    // Red String Style
                    if (activePreset.highlightStyle === 'red-string') {
                      return (
                        <span
                          key={wIdx}
                          className="inline-block mx-1 font-black text-white bg-red-600 px-2 py-0.5 rounded-lg shadow-[0_2px_10px_rgba(239,68,68,0.8)] scale-105"
                        >
                          {word}
                        </span>
                      );
                    }

                    // Dotted Box Style
                    if (activePreset.highlightStyle === 'dotted') {
                      return (
                        <span
                          key={wIdx}
                          className="inline-block mx-1 font-black text-cyan-300 border-2 border-dotted border-cyan-300 px-1.5 py-0.5 rounded-md shadow-[0_0_10px_rgba(34,211,238,0.7)] scale-105"
                        >
                          {word}
                        </span>
                      );
                    }

                    // Default Up Kinetic or standard highlight
                    return (
                      <span
                        key={wIdx}
                        className="inline-block mx-1 font-black text-yellow-300 scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Play/Pause Large Center Overlay Button */}
            {!isPlaying && (
              <button
                onClick={handleTogglePlay}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl transition transform hover:scale-110 active:scale-95 touch-tap z-30"
                aria-label="Play video"
              >
                <Play className="w-8 h-8 fill-white ml-1" />
              </button>
            )}

            {/* Bottom Gradient for controls visibility */}
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

            {/* Floating Player Controls Bar */}
            <div className="absolute bottom-2 inset-x-2 p-2.5 rounded-2xl bg-black/75 backdrop-blur-md border border-slate-700/80 flex items-center gap-2.5 z-30 text-white">
              {/* Play/Pause toggle */}
              <button
                onClick={handleTogglePlay}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-white transition active:scale-90"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              {/* Restart */}
              <button
                onClick={handleRestart}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-90"
                title="Restart"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Scrubber Range */}
              <input
                type="range"
                min={0}
                max={duration || 15}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 accent-purple-500 h-1.5 rounded-lg bg-slate-700 cursor-pointer"
              />

              {/* Time display */}
              <span className="font-mono text-[10px] text-slate-300 whitespace-nowrap">
                {formatTimeSeconds(currentTime)} / {formatTimeSeconds(duration)}
              </span>

              {/* Volume toggle */}
              <button
                onClick={handleToggleMute}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-90"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Info Column: Style Breakdown & Platform Template switcher */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Style Spec Card */}
          <div className="rounded-2xl p-5 bg-[#0C1220]/90 border border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Style Blueprint
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-950 border border-purple-800 text-[11px] font-mono text-purple-300">
                Preset: {activeSample.presetKey}
              </span>
            </div>

            <h4 className="text-lg font-black text-white">
              {activeSample.styleName}
            </h4>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Entrance Animation</span>
                <span className="font-semibold text-cyan-300 capitalize">
                  {activePreset.animateIn} Slide / Pop
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Exit Animation</span>
                <span className="font-semibold text-cyan-300 capitalize">
                  {activePreset.animateOut} Fade / Drop
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Word Highlight Style</span>
                <span className="font-semibold text-amber-300 capitalize">
                  {activePreset.highlightStyle || 'Standard'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Recommended Platform</span>
                <span className="font-semibold text-white capitalize flex items-center gap-1.5">
                  {activeSample.platform === 'tiktok' && <TikTokIcon className="w-3.5 h-3.5" />}
                  {activeSample.platform === 'youtube' && <YouTubeShortsIcon className="w-3.5 h-3.5" />}
                  {activeSample.platform === 'instagram' && <InstagramIcon className="w-3.5 h-3.5" />}
                  <span>{activeSample.platform}</span>
                </span>
              </div>
            </div>

            {/* Platform Safe Zone Preview Selector */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Simulate Platform Safe Zone
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {([
                  { id: 'none', label: 'None' },
                  { id: 'tiktok', label: 'TikTok' },
                  { id: 'youtube', label: 'Shorts' },
                  { id: 'instagram', label: 'Reels' },
                ] as const).map((item) => {
                  const isSel = safeZone === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSafeZone(item.id)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                        isSel
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750 border border-slate-700/60'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5">
            <button
              onClick={handleEditorClick}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-98 transition duration-150 touch-tap"
            >
              <Sliders className="w-4 h-4" />
              <span>Customize this Sample in Editor</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={handleUploadWithStyle}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition active:scale-98 touch-tap"
            >
              <span>Upload My Video with this Style</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

