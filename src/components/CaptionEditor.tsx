import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  Maximize,
  Sliders,
  Plus,
  Trash2,
  Download,
  Save,
  Sparkles,
  Check,
  Languages,
  Keyboard,
  Type,
  CornerDownLeft,
  Smartphone,
  Monitor,
  Eye,
  EyeOff,
  Youtube,
} from 'lucide-react';
import { Project, CaptionSegment, CaptionStyle, VideoAspectRatio, VideoPlatform } from '../types';
import { formatTimeSeconds } from '../lib/subtitles';
import { AMHARIC_PUNCTUATION } from '../lib/amharicData';
import { getFontCssStack } from '../lib/fonts';
import { transliterateToAmharic } from '../lib/amharicTransliteration';
import { StylePanel } from './StylePanel';
import { DeleteProjectModal } from './DeleteProjectModal';
import { SafeZoneOverlay, SafeZonePlatform } from './SafeZoneOverlay';
import { TikTokIcon, YouTubeShortsIcon, ReelsIcon } from './PlatformIcons';

interface CaptionEditorProps {
  project: Project;
  onSave: (updatedProject: Project) => void;
  onExport: (project: Project) => void;
  onBack: () => void;
  onDeleteProject?: (projectId: string) => void;
}

export const CaptionEditor: React.FC<CaptionEditorProps> = ({
  project,
  onSave,
  onExport,
  onBack,
  onDeleteProject,
}) => {
  const [segments, setSegments] = useState<CaptionSegment[]>(project.segments || []);
  const [style, setStyle] = useState<CaptionStyle>(project.style);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(project.duration || 10);
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>(project.aspectRatio || '9:16');
  const [platform, setPlatform] = useState<VideoPlatform>(project.platform || 'tiktok');
  const [safeZonePlatform, setSafeZonePlatform] = useState<SafeZonePlatform>(
    project.platform === 'youtube' ? 'youtube' : project.platform === 'instagram' ? 'instagram' : 'tiktok'
  );
  const [showSafeZone, setShowSafeZone] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showStylePanel, setShowStylePanel] = useState<boolean>(true);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [saveSuccessToast, setSaveSuccessToast] = useState<boolean>(false);
  const [showEasyTyping, setShowEasyTyping] = useState<boolean>(false);
  const [phoneticInput, setPhoneticInput] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Sequential playback states
  const [isLoopingSequence, setIsLoopingSequence] = useState<boolean>(false);
  const [isAutoScroll, setIsAutoScroll] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const activeInputRef = useRef<HTMLTextAreaElement>(null);
  const segmentsListRef = useRef<HTMLDivElement>(null);
  const segmentCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Sync state when project changes
  useEffect(() => {
    setSegments(project.segments || []);
    setStyle(project.style);
    setDuration(project.duration || 10);
    setAspectRatio(project.aspectRatio || '9:16');
    setPlatform(project.platform || 'tiktok');
    if (project.platform === 'youtube') setSafeZonePlatform('youtube');
    else if (project.platform === 'instagram') setSafeZonePlatform('instagram');
    else setSafeZonePlatform('tiktok');
  }, [project]);

  // Find active caption for current playback time
  const activeCaption = segments.find(
    (seg) => currentTime >= seg.start && currentTime <= seg.end
  );

  // Video time update listener with sequence looping
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }

      // Loop current sequence if enabled
      if (isLoopingSequence && activeCaption && time >= activeCaption.end) {
        videoRef.current.currentTime = activeCaption.start;
        setCurrentTime(activeCaption.start);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekTo = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(seconds, duration));
    setCurrentTime(seconds);
  };

  // Play a specific sequence directly
  const playSegment = (seg: CaptionSegment) => {
    setActiveSegmentId(seg.id);
    seekTo(seg.start);
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Jump to previous sequence
  const goToPrevSequence = () => {
    if (segments.length === 0) return;
    const sorted = [...segments].sort((a, b) => a.start - b.start);
    const currentIndex = sorted.findIndex((s) => s.id === activeSegmentId);
    const target = currentIndex > 0 ? sorted[currentIndex - 1] : sorted[sorted.length - 1];
    playSegment(target);
  };

  // Jump to next sequence
  const goToNextSequence = () => {
    if (segments.length === 0) return;
    const sorted = [...segments].sort((a, b) => a.start - b.start);
    const currentIndex = sorted.findIndex((s) => s.id === activeSegmentId);
    const target = currentIndex >= 0 && currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : sorted[0];
    playSegment(target);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    seekTo(newProgress * duration);
  };

  // Auto highlight and auto-scroll active sequence into view
  useEffect(() => {
    if (activeCaption) {
      setActiveSegmentId(activeCaption.id);

      if (isAutoScroll && segmentsListRef.current) {
        const card = segmentCardRefs.current[activeCaption.id];
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }, [activeCaption, isAutoScroll]);

  // Segment operations
  const updateSegmentText = (id: string, text: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, text } : s))
    );
  };

  const updateSegmentTime = (id: string, field: 'start' | 'end', val: number) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: Math.max(0, val) } : s))
    );
  };

  const addSegment = () => {
    const lastSeg = segments[segments.length - 1];
    const newStart = lastSeg ? Number((lastSeg.end + 0.3).toFixed(1)) : 0;
    const newEnd = Number((newStart + 3.5).toFixed(1));
    const newSeg: CaptionSegment = {
      id: `seg-${Date.now()}`,
      start: newStart,
      end: newEnd,
      text: 'አዲስ ካፕሽን እዚህ ይጻፉ...',
    };
    const updated = [...segments, newSeg];
    setSegments(updated);
    setActiveSegmentId(newSeg.id);
    seekTo(newStart);
  };

  const deleteSegment = (id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  };

  // Insert Ge'ez punctuation into active segment
  const insertPunctuation = (char: string) => {
    if (!activeSegmentId) {
      if (segments.length > 0) {
        updateSegmentText(segments[0].id, segments[0].text + char);
      }
      return;
    }
    const current = segments.find((s) => s.id === activeSegmentId);
    if (current) {
      updateSegmentText(activeSegmentId, current.text + char);
    }
  };

  // AI Refine Amharic punctuation and formatting
  const handleAIRefine = () => {
    const refined = segments.map((seg) => {
      let t = seg.text.trim();
      // Ensure Ethiopian full stop at end if not present
      if (!t.endsWith('።') && !t.endsWith('!') && !t.endsWith('?')) {
        t += '።';
      }
      return { ...seg, text: t };
    });
    setSegments(refined);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 2500);
  };

  const handleSaveAll = () => {
    const updated: Project = {
      ...project,
      segments,
      style,
      duration,
      aspectRatio,
      platform,
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 2500);
  };

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      {/* Top action header (Image 1 screen 5) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs sm:text-sm transition active:scale-95 touch-tap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Edit Captions</span>
            <span className="xs:hidden">Back</span>
          </button>

          {/* Video Sequence & Safe Zone Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setAspectRatio('9:16')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition touch-tap cursor-pointer ${
                aspectRatio === '9:16'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
              title="Short Form 9:16 (TikTok, Reels, Shorts)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16</span>
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio('16:9')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition touch-tap cursor-pointer ${
                aspectRatio === '16:9'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
              title="Long Form 16:9 (YouTube, Facebook)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>16:9</span>
            </button>
            {aspectRatio === '9:16' && (
              <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-850 p-0.5 rounded-xl border border-slate-300 dark:border-slate-750">
                <button
                  type="button"
                  onClick={() => setShowSafeZone(!showSafeZone)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition touch-tap cursor-pointer ${
                    showSafeZone
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title="Toggle Safe Zone Overlay"
                >
                  {showSafeZone ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Safe Zone</span>
                </button>

                {showSafeZone && (
                  <div className="flex items-center gap-0.5 pr-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSafeZonePlatform('tiktok');
                        setPlatform('tiktok');
                      }}
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                        safeZonePlatform === 'tiktok'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="TikTok Exact Template"
                    >
                      <TikTokIcon className="w-3 h-3" />
                      <span className="hidden md:inline">TikTok</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSafeZonePlatform('youtube');
                        setPlatform('youtube');
                      }}
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                        safeZonePlatform === 'youtube'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="YouTube Shorts Exact Template"
                    >
                      <YouTubeShortsIcon className="w-3 h-3" />
                      <span className="hidden md:inline">Shorts</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSafeZonePlatform('instagram');
                        setPlatform('instagram');
                      }}
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                        safeZonePlatform === 'instagram'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Instagram Reels Exact Template"
                    >
                      <ReelsIcon className="w-3 h-3" />
                      <span className="hidden md:inline">Reels</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onDeleteProject && (
            <button
              id="editor-delete-project-btn"
              onClick={() => setShowDeleteModal(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition active:scale-95 touch-tap flex items-center gap-1"
              title="Delete Project Video"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}

          <button
            onClick={() => setShowStylePanel(!showStylePanel)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition active:scale-95 touch-tap ${
              showStylePanel
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Style</span>
          </button>

          <button
            id="save-captions-btn"
            onClick={handleSaveAll}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition active:scale-95 shadow-xs touch-tap"
          >
            {saveSuccessToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saveSuccessToast ? 'Saved!' : 'Save'}</span>
          </button>

          <button
            id="export-captions-btn"
            onClick={() => onExport({ ...project, segments, style })}
            className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition active:scale-95 shadow-md shadow-blue-500/20 touch-tap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Video Player + Timeline (Left) & Styling Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Video Player & Subtitle Canvas Container */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          <div className={aspectRatio === '9:16' ? 'flex justify-center w-full' : ''}>
            <div
              className={`relative bg-slate-950 overflow-hidden shadow-xl sm:shadow-2xl border border-slate-900 flex items-center justify-center ${
                aspectRatio === '9:16'
                  ? 'w-full max-w-[310px] sm:max-w-[330px] aspect-[9/16] rounded-[32px] sm:rounded-[38px] border-4 sm:border-[6px] ring-1 ring-purple-500/30'
                  : 'w-full aspect-video rounded-2xl sm:rounded-3xl'
              }`}
            >
              {/* Phone Speaker Notch for 9:16 */}
              {aspectRatio === '9:16' && (
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-900 rounded-full z-20 flex items-center justify-center pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                </div>
              )}

              {/* EXACT PLATFORM SAFE ZONE OVERLAY FOR TIKTOK, YOUTUBE SHORTS, AND REELS */}
              {aspectRatio === '9:16' && showSafeZone && (
                <SafeZoneOverlay
                  platform={safeZonePlatform}
                  onChangePlatform={(p) => {
                    setSafeZonePlatform(p);
                    setPlatform(p);
                  }}
                  showGuidelines={true}
                />
              )}

              {/* HTML5 Video Element */}
              <video
                ref={videoRef}
                src={project.videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-contain bg-black"
                playsInline
              />

              {/* WATERMARK OVERLAY */}
              {style.watermarkEnabled !== false && (
                <div 
                  className={`absolute z-10 pointer-events-none opacity-${Math.round((style.watermarkOpacity ?? 1) * 100)} ${
                    (style.watermarkPosition || 'top-right') === 'top-left' ? 'top-4 left-4' :
                    (style.watermarkPosition || 'top-right') === 'top-right' ? 'top-4 right-4' :
                    (style.watermarkPosition || 'top-right') === 'bottom-left' ? 'bottom-20 left-4' :
                    'bottom-20 right-4'
                  }`}
                >
                  {style.watermarkImage ? (
                    <img src={style.watermarkImage} alt="Watermark" className="h-6 sm:h-8 object-contain opacity-80" />
                  ) : (
                    <span className="text-white/80 font-bold text-xs sm:text-sm drop-shadow-md bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm">
                      {style.watermarkText || 'bgern.com'}
                    </span>
                  )}
                </div>
              )}

              {/* LIVE STYLED AMHARIC CAPTION OVERLAY WITH SEQUENTIAL WORD HIGHLIGHT & IN/OUT ANIMATIONS */}
              {activeCaption && activeCaption.text && (() => {
                const segDuration = Math.max(0.2, activeCaption.end - activeCaption.start);
                const elapsed = Math.max(0, currentTime - activeCaption.start);
                const remaining = Math.max(0, activeCaption.end - currentTime);
                const animSpeed = style.animationSpeed || 'normal';
                const animDuration = animSpeed === 'fast' ? 0.2 : animSpeed === 'slow' ? 0.45 : 0.3;
                const animateIn = style.animateIn || 'up';
                const animateOut = style.animateOut || 'fade';
                const highlightStyle = style.highlightStyle || (
                  style.preset === 'sparkle-duo' ? 'sparkle' :
                  style.preset === 'dotted-selection' ? 'dotted' :
                  style.preset === 'real-gold' ? 'gold' :
                  style.preset === 'red-string' ? 'red-string' : 'default'
                );

                let animOpacity = 1;
                let animTransform = 'translateY(0px) scale(1)';

                // Entry Animation phase
                if (elapsed < animDuration && animateIn !== 'none') {
                  const progress = Math.min(1, elapsed / animDuration);
                  if (animateIn === 'up') {
                    const offset = (1 - progress) * 24;
                    animTransform = `translateY(${offset}px) scale(${0.92 + progress * 0.08})`;
                    animOpacity = progress;
                  } else if (animateIn === 'down') {
                    const offset = -(1 - progress) * 24;
                    animTransform = `translateY(${offset}px) scale(${0.92 + progress * 0.08})`;
                    animOpacity = progress;
                  } else if (animateIn === 'bounce') {
                    animTransform = `scale(${0.7 + progress * 0.3}) translateY(${Math.sin(progress * Math.PI) * -8}px)`;
                    animOpacity = Math.min(1, progress * 1.3);
                  } else if (animateIn === 'zoom') {
                    animTransform = `scale(${0.7 + progress * 0.3})`;
                    animOpacity = progress;
                  } else if (animateIn === 'fade') {
                    animOpacity = progress;
                  }
                }
                // Exit Animation phase
                else if (remaining < animDuration && remaining >= 0 && animateOut !== 'none') {
                  const outProgress = Math.max(0, remaining / animDuration);
                  if (animateOut === 'down') {
                    const offset = (1 - outProgress) * 24;
                    animTransform = `translateY(${offset}px) scale(${0.92 + outProgress * 0.08})`;
                    animOpacity = outProgress;
                  } else if (animateOut === 'up') {
                    const offset = -(1 - outProgress) * 24;
                    animTransform = `translateY(${offset}px) scale(${0.92 + outProgress * 0.08})`;
                    animOpacity = outProgress;
                  } else if (animateOut === 'zoom') {
                    animTransform = `scale(${0.7 + outProgress * 0.3})`;
                    animOpacity = outProgress;
                  } else if (animateOut === 'fade') {
                    animOpacity = outProgress;
                  }
                }

                // Preset-specific outer container styling
                let containerExtraClasses = '';
                if (style.preset === 'sparkle-duo' || highlightStyle === 'sparkle') {
                  containerExtraClasses = 'ring-1 ring-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.35)]';
                } else if (style.preset === 'dotted-selection' || highlightStyle === 'dotted') {
                  containerExtraClasses = 'border-2 border-dashed border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]';
                } else if (style.preset === 'real-gold' || highlightStyle === 'gold') {
                  containerExtraClasses = 'border border-amber-500/70 shadow-[0_0_25px_rgba(245,158,11,0.35)]';
                } else if (style.preset === 'red-string' || highlightStyle === 'red-string') {
                  containerExtraClasses = 'border-b-2 border-red-500/90 shadow-[0_4px_15px_rgba(239,68,68,0.3)]';
                }

                let rawText = activeCaption.text.trim();
                const words = rawText.split(/\s+/).filter(Boolean);
                const ratio = Math.min(0.999, elapsed / segDuration);
                let activeWordIdx = Math.floor(ratio * words.length);

                if (Array.isArray(activeCaption.words) && activeCaption.words.length > 0) {
                  const matchedIdx = activeCaption.words.findIndex(
                    (w) => currentTime >= w.start && currentTime <= w.end
                  );
                  if (matchedIdx !== -1) {
                    activeWordIdx = matchedIdx;
                  }
                }
                
                if (style.preset === 'typewriter') {
                  const charCount = Math.max(1, Math.floor(ratio * rawText.length));
                  rawText = rawText.slice(0, charCount);
                }

                return (
                  <div
                    className={`absolute left-0 right-0 px-3 sm:px-6 flex justify-center pointer-events-none transition-all duration-75 z-20 ${
                      style.position === 'top'
                        ? aspectRatio === '9:16' ? 'top-14 sm:top-16' : 'top-4 sm:top-8'
                        : style.position === 'center'
                        ? 'top-1/2 -translate-y-1/2'
                        : aspectRatio === '9:16' ? 'bottom-16 sm:bottom-20' : 'bottom-8 sm:bottom-12'
                    }`}
                  >
                    <div
                      className={`max-w-[94%] sm:max-w-[90%] text-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl transition-all duration-100 ${
                        style.background === 'semi' ? 'backdrop-blur-xs' : ''
                      } ${containerExtraClasses}`}
                      style={{
                        backgroundColor:
                          style.background === 'solid'
                            ? `rgba(0,0,0,${style.backgroundOpacity ?? 0.85})`
                            : style.background === 'semi'
                            ? `rgba(15,23,42,${style.backgroundOpacity ?? 0.65})`
                            : 'transparent',
                        fontFamily: getFontCssStack(style.font),
                        fontSize: `clamp(13px, ${aspectRatio === '9:16' ? '4.5vw' : '3.8vw'}, ${style.size}px)`,
                        color: style.color || '#FFFFFF',
                        WebkitTextStroke:
                          style.outline > 0
                            ? `${style.outline}px ${style.outlineColor || '#000000'}`
                            : 'none',
                        lineHeight: '1.35',
                        opacity: animOpacity,
                        transform: animTransform,
                      }}
                    >
                      {/* Render words with active style */}
                      {words.length <= 1 || !style.highlightWord
                        ? (
                            <span className={
                              highlightStyle === 'gold'
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)] font-black'
                                : highlightStyle === 'sparkle'
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-200 to-cyan-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] font-black'
                                : ''
                            }>
                              {highlightStyle === 'sparkle' && <span className="text-cyan-300 mr-1 text-xs">✦</span>}
                              {rawText}
                              {highlightStyle === 'sparkle' && <span className="text-fuchsia-300 ml-1 text-xs">✦</span>}
                            </span>
                          )
                        : words.map((word, wIdx) => {
                            const isWordActive = wIdx === activeWordIdx;
                            if (!isWordActive) {
                              return (
                                <span key={wIdx} className="inline-block mx-1 opacity-80">
                                  {word}
                                </span>
                              );
                            }

                            // Active word rendering based on highlightStyle
                            if (highlightStyle === 'gold') {
                              return (
                                <span
                                  key={wIdx}
                                  className="inline-block mx-1 scale-110 font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-300 to-amber-600 drop-shadow-[0_2px_10px_rgba(245,158,11,0.8)] transition-all duration-100"
                                >
                                  {word}
                                </span>
                              );
                            }

                            if (highlightStyle === 'sparkle') {
                              return (
                                <span
                                  key={wIdx}
                                  className="inline-flex items-center mx-1 scale-110 font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-100 to-cyan-300 drop-shadow-[0_0_12px_rgba(192,132,252,0.8)] transition-all duration-100"
                                >
                                  <span className="text-cyan-300 text-[10px] animate-ping mr-0.5 select-none">✦</span>
                                  {word}
                                  <span className="text-fuchsia-400 text-[10px] animate-pulse ml-0.5 select-none">✦</span>
                                </span>
                              );
                            }

                            if (highlightStyle === 'dotted') {
                              return (
                                <span
                                  key={wIdx}
                                  className="inline-block mx-1 px-1.5 py-0.5 rounded-lg border-2 border-dashed border-cyan-400 bg-cyan-950/70 text-cyan-200 font-mono font-bold scale-105 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-100"
                                >
                                  {word}
                                </span>
                              );
                            }

                            if (highlightStyle === 'red-string') {
                              return (
                                <span
                                  key={wIdx}
                                  className="inline-block mx-1 font-black text-white scale-110 relative pb-1 border-b-4 border-red-500 drop-shadow-[0_2px_8px_rgba(239,68,68,0.7)] transition-all duration-100"
                                >
                                  {word}
                                </span>
                              );
                            }

                            if (highlightStyle === 'neon') {
                              return (
                                <span
                                  key={wIdx}
                                  className="inline-block mx-1 scale-110 font-black text-white drop-shadow-[0_0_12px_rgba(236,72,153,0.9)] transition-all duration-100"
                                >
                                  {word}
                                </span>
                              );
                            }

                            if (highlightStyle === 'karaoke') {
                              return (
                                <span
                                  key={wIdx}
                                  className="inline-block mx-1 scale-110 font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200 transition-all duration-100"
                                >
                                  {word}
                                </span>
                              );
                            }

                            // Default highlight: vibrant yellow glow with kinetic pop
                            return (
                              <span
                                key={wIdx}
                                className="inline-block mx-1 text-yellow-300 scale-110 font-black drop-shadow-[0_2px_8px_rgba(234,179,8,0.7)] transition-all duration-100"
                              >
                                {word}
                              </span>
                            );
                          })}
                    </div>
                  </div>
                );
              })()}

            {/* In-Video Overlay Play Button when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all backdrop-blur-xs touch-tap"
                aria-label="Play video"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white translate-x-0.5" />
              </button>
            )}

            {/* Bottom Controls Bar inside Video Player with Sequential Navigation */}
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={goToPrevSequence}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-white/20 active:bg-white/30 transition touch-tap"
                  title="Previous Sequence (⏮)"
                  aria-label="Previous sequence"
                >
                  <SkipBack className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 active:bg-white/40 transition touch-tap"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>

                <button
                  type="button"
                  onClick={goToNextSequence}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-white/20 active:bg-white/30 transition touch-tap"
                  title="Next Sequence (⏭)"
                  aria-label="Next sequence"
                >
                  <SkipForward className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsLoopingSequence(!isLoopingSequence)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition touch-tap ${
                    isLoopingSequence
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'hover:bg-white/20 text-white/80'
                  }`}
                  title={isLoopingSequence ? 'Looping Current Sequence (On)' : 'Loop Current Sequence (Off)'}
                  aria-label="Loop current sequence"
                >
                  <Repeat className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => seekTo(0)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-white/20 active:bg-white/30 transition touch-tap"
                  title="Restart from 0:00"
                  aria-label="Restart video"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <span className="font-mono text-[10px] sm:text-[11px] font-bold ml-1">
                  {formatTimeSeconds(currentTime)} / {formatTimeSeconds(duration)}
                </span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 active:bg-white/30 transition touch-tap"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.requestFullscreen) {
                        videoRef.current.requestFullscreen();
                      }
                    }
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 active:bg-white/30 transition touch-tap"
                  aria-label="Fullscreen"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

          {/* Interactive Timeline Scrubber with caption cues (Image 1 screen 5) */}
          <div className="rounded-2xl bg-white p-2.5 sm:p-3 border border-slate-100 shadow-xs space-y-2">
            <div
              ref={timelineRef}
              onClick={handleTimelineClick}
              className="relative w-full h-9 sm:h-8 bg-slate-100 rounded-xl cursor-pointer overflow-hidden flex items-center touch-tap"
            >
              {/* Segments marker cues on timeline */}
              {segments.map((s) => {
                const startPct = (s.start / duration) * 100;
                const widthPct = Math.max(1, ((s.end - s.start) / duration) * 100);
                const isCurrent = currentTime >= s.start && currentTime <= s.end;
                return (
                  <div
                    key={s.id}
                    style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                    className={`absolute h-4 sm:h-4 rounded-md transition-all ${
                      isCurrent
                        ? 'bg-blue-600 shadow-sm ring-1 ring-white z-10'
                        : 'bg-blue-200 hover:bg-blue-300'
                    }`}
                    title={`${formatTimeSeconds(s.start)} - ${formatTimeSeconds(s.end)}: ${s.text}`}
                  />
                );
              })}

              {/* Current Playhead Scrubber Bar */}
              <div
                style={{ left: `${(currentTime / duration) * 100}%` }}
                className="absolute top-0 bottom-0 w-1 bg-red-500 z-20 shadow-md pointer-events-none"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 -ml-1.25 -mt-0.5 shadow-sm" />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-mono">
              <span>00:00</span>
              <span className="text-slate-600 font-medium text-[10px] sm:text-[11px] truncate px-1">
                Tap timeline to scrub frame
              </span>
              <span>{formatTimeSeconds(duration)}</span>
            </div>
          </div>

          {/* Ge'ez Punctuation Shortcut Bar for effortless typing */}
          <div className="rounded-2xl bg-slate-50 p-2 sm:p-2.5 border border-slate-200/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar touch-pan-x">
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1 shrink-0">
                Ge'ez:
              </span>
              {AMHARIC_PUNCTUATION.map((p) => (
                <button
                  key={p.char}
                  type="button"
                  onClick={() => insertPunctuation(p.char)}
                  className="min-w-[36px] h-9 sm:min-w-[32px] sm:h-8 rounded-xl bg-white hover:bg-blue-50 active:bg-blue-100 hover:text-blue-700 active:scale-95 border border-slate-200 text-sm sm:text-base font-bold text-slate-800 transition flex items-center justify-center shadow-2xs touch-tap"
                  title={p.name}
                >
                  {p.char}
                </button>
              ))}
            </div>

            <button
              onClick={handleAIRefine}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95 text-[11px] font-bold border border-indigo-200 transition shrink-0 touch-tap"
              title="AI Amharic formatting and punctuation cleanup"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Polish</span>
            </button>
          </div>
        </div>

        {/* Right Section: Caption Segments Editor OR Style Panel */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-4">
          {/* Mobile Switcher Tab Bar (visible on mobile only) */}
          <div className="flex lg:hidden bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setShowStylePanel(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition touch-tap ${
                !showStylePanel ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              📝 Captions ({segments.length})
            </button>
            <button
              type="button"
              onClick={() => setShowStylePanel(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition touch-tap ${
                showStylePanel ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              🎨 Caption Style
            </button>
          </div>
          {showStylePanel ? (
            <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Caption Style Engine</h3>
                </div>
                <button
                  onClick={() => setShowStylePanel(false)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  View Segments
                </button>
              </div>
              <StylePanel style={style} onChangeStyle={setStyle} />
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Caption Segments</h3>
                  <p className="text-[11px] text-slate-400">{segments.length} Amharic sentences</p>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Auto-scroll toggle pill */}
                  <button
                    type="button"
                    onClick={() => setIsAutoScroll(!isAutoScroll)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition active:scale-95 touch-tap ${
                      isAutoScroll
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                    title="Automatically scroll list to follow active sequence"
                  >
                    <span>Auto-Scroll: {isAutoScroll ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Current Font Badge with Quick Switch */}
                  <button
                    onClick={() => setShowStylePanel(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition active:scale-95 touch-tap"
                    title="Change Amharic Font"
                  >
                    <Type className="w-3.5 h-3.5 text-blue-600" />
                    <span className="max-w-[100px] truncate">{style.font || 'Easy Amharic Typing'}</span>
                  </button>

                  {/* Easy Amharic Typing Helper Toggle */}
                  <button
                    onClick={() => setShowEasyTyping(!showEasyTyping)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition active:scale-95 touch-tap ${
                      showEasyTyping
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                    }`}
                    title="Easy Amharic Phonetic Typing Tool"
                  >
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>Easy Typing</span>
                  </button>
                </div>
              </div>

              {/* Easy Amharic Typing Assistant Helper Drawer */}
              {showEasyTyping && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Keyboard className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">
                        Easy Amharic Typing (የቀሊል አማርኛ መተየቢያ)
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-700 bg-white/80 px-2 py-0.5 rounded-full border border-blue-200/50">
                      Phonetic Keyboard
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-tight">
                    Type phonetically in English (e.g., <code className="bg-white px-1 py-0.2 rounded font-mono text-blue-700 font-bold">selam</code>, <code className="bg-white px-1 py-0.2 rounded font-mono text-blue-700 font-bold">tena yistillign</code>) to generate Amharic Ge'ez script:
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type here in English (e.g. selam, amharic, konjo)..."
                      value={phoneticInput}
                      onChange={(e) => setPhoneticInput(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const amharicConverted = transliterateToAmharic(phoneticInput);
                        if (!amharicConverted) return;

                        if (activeSegmentId) {
                          const seg = segments.find((s) => s.id === activeSegmentId);
                          if (seg) {
                            const newText = seg.text ? `${seg.text} ${amharicConverted}` : amharicConverted;
                            updateSegmentText(activeSegmentId, newText);
                          }
                        } else if (segments.length > 0) {
                          const lastSeg = segments[segments.length - 1];
                          const newText = lastSeg.text ? `${lastSeg.text} ${amharicConverted}` : amharicConverted;
                          updateSegmentText(lastSeg.id, newText);
                        }
                        setPhoneticInput('');
                      }}
                      disabled={!phoneticInput.trim()}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-bold transition flex items-center gap-1 shrink-0"
                    >
                      <CornerDownLeft className="w-3.5 h-3.5" />
                      <span>Insert</span>
                    </button>
                  </div>

                  {phoneticInput && (
                    <div className="p-2.5 rounded-xl bg-white border border-blue-200 flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        Converted:{' '}
                        <span
                          className="font-bold text-slate-900 text-sm ml-1"
                          style={{ fontFamily: getFontCssStack(style.font) }}
                        >
                          {transliterateToAmharic(phoneticInput)}
                        </span>
                      </div>
                      <span className="text-[10px] text-blue-600 font-bold">
                        Font: {style.font || 'Easy Amharic Typing'}
                      </span>
                    </div>
                  )}

                  {/* Quick sample chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[
                      { latin: 'selam', geez: 'ሰላም' },
                      { latin: 'amharic', geez: 'አማርኛ' },
                      { latin: 'betam konjo', geez: 'በጣም ቆንጆ' },
                      { latin: 'amesegenalehu', geez: 'አመሰግናለሁ' },
                      { latin: 'tiru new', geez: 'ጥሩ ነው' },
                    ].map((sample) => (
                      <button
                        key={sample.latin}
                        type="button"
                        onClick={() => setPhoneticInput(sample.latin)}
                        className="px-2 py-0.5 rounded-lg bg-white/90 hover:bg-white text-[10px] font-semibold text-slate-700 border border-slate-200 hover:border-blue-300 transition"
                      >
                        {sample.latin} ({sample.geez})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Segments List with Auto-Scroll Support */}
              <div ref={segmentsListRef} className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                {segments.map((seg, idx) => {
                  const isCurrent = activeSegmentId === seg.id;
                  const segDuration = Math.max(0.1, seg.end - seg.start);
                  const progressPct = isCurrent
                    ? Math.max(0, Math.min(100, ((currentTime - seg.start) / segDuration) * 100))
                    : 0;

                  return (
                    <div
                      key={seg.id}
                      ref={(el) => {
                        segmentCardRefs.current[seg.id] = el;
                      }}
                      onClick={() => playSegment(seg)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-xs ring-1 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      {/* Segment header: timestamps & actions */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center ${
                            isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                            {formatTimeSeconds(seg.start)} - {formatTimeSeconds(seg.end)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playSegment(seg);
                            }}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-blue-50 transition touch-tap"
                            title="Play this sequence"
                            aria-label="Play sequence"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSegment(seg.id);
                            }}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 active:bg-red-100 transition touch-tap"
                            title="Delete sequence"
                            aria-label="Delete sequence"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Live Playback Progress Bar for Current Sequence */}
                      {isCurrent && (
                        <div className="w-full bg-blue-200/60 dark:bg-blue-900/50 rounded-full h-1 overflow-hidden mb-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-400 h-full rounded-full transition-all duration-75"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      )}

                      {/* Amharic Text Input */}
                      <textarea
                        rows={2}
                        value={seg.text}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateSegmentText(seg.id, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 p-2.5 text-base sm:text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:outline-hidden transition"
                        style={{ fontFamily: getFontCssStack(style.font) }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Add Caption Button */}
              <button
                id="add-caption-segment-btn"
                onClick={addSegment}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Add Caption (+ አዲስ ሰሪዝ አክል)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Project Modal */}
      {showDeleteModal && (
        <DeleteProjectModal
          isOpen={showDeleteModal}
          project={project}
          onClose={() => setShowDeleteModal(false)}
          onConfirmDelete={(projectId) => {
            if (onDeleteProject) {
              onDeleteProject(projectId);
            }
            onBack();
          }}
        />
      )}
    </div>
  );
};
