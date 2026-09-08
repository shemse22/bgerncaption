import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Play,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Languages,
  RefreshCw,
  Palette,
  Sliders,
  Image as ImageIcon,
  Upload,
  Film,
  FileVideo,
  Youtube,
  Smartphone,
  Monitor,
  Video,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { formatTimeSeconds } from '../lib/subtitles';
import {
  generateStylizedThumbnail,
  detectThemeFromTitle,
  COVER_THEMES,
  CoverTheme,
} from '../lib/thumbnailGenerator';
import { ThumbnailGeneratorModal } from './ThumbnailGeneratorModal';
import { SAMPLE_VIDEOS } from '../lib/amharicData';

import { CaptionLanguageOption, VideoAspectRatio, VideoPlatform, CaptionSegment } from '../types';
import { StorageAPI } from '../lib/storage';
import { TikTokIcon, YouTubeShortsIcon, InstagramIcon, ReelsIcon, FacebookIcon, YouTubeIcon } from './PlatformIcons';
import { SafeZoneOverlay, SafeZonePlatform } from './SafeZoneOverlay';

interface UploadModalProps {
  file?: File;
  sampleId?: string;
  userBalance: number; // in seconds
  isGoogleAuthenticated?: boolean;
  onRequireGoogleAuth?: () => void;
  onBack: () => void;
  onStartGeneration: (data: {
    title: string;
    videoUrl: string;
    file: File;
    thumbnailUrl?: string;
    duration: number;
    fileSizeMb: number;
    captionLanguage: string;
    captionMode: 'speech_amharic' | 'translate_amharic';
    aspectRatio?: VideoAspectRatio;
    platform?: VideoPlatform;
    preset?: string;
    initialSegments?: CaptionSegment[];
  }) => void;
  onOpenWallet: () => void;
  supportedLanguages?: CaptionLanguageOption[];
}

export const UploadModal: React.FC<UploadModalProps> = ({
  file,
  sampleId,
  userBalance,
  isGoogleAuthenticated = true,
  onRequireGoogleAuth,
  onBack,
  onStartGeneration,
  onOpenWallet,
  supportedLanguages,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(file || null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [duration, setDuration] = useState<number>(154);
  const [fileSizeMb, setFileSizeMb] = useState<number>(42.5);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [captionMode, setCaptionMode] = useState<'speech_amharic' | 'translate_amharic'>('speech_amharic');
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('9:16');
  const [platform, setPlatform] = useState<VideoPlatform>('tiktok');
  const [showSafeZone, setShowSafeZone] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  const filePickerRef = useRef<HTMLInputElement>(null);

  // Compute enabled caption languages configured by Admin (Default: Amharic only)
  const activeLanguages: CaptionLanguageOption[] = React.useMemo(() => {
    const list = supportedLanguages || StorageAPI.getSettings().supportedLanguages || [];
    const enabled = list.filter((l) => l.enabled);
    return enabled.length > 0
      ? enabled
      : [{ id: 'amharic', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', isDefault: true, enabled: true }];
  }, [supportedLanguages]);

  const [captionLanguage, setCaptionLanguage] = useState<string>(activeLanguages[0]?.name || 'Amharic');

  // Ensure selected language is valid if languages change
  useEffect(() => {
    if (!activeLanguages.some((l) => l.name.toLowerCase() === captionLanguage.toLowerCase())) {
      setCaptionLanguage(activeLanguages[0]?.name || 'Amharic');
    }
  }, [activeLanguages, captionLanguage]);

  // Thumbnail Generator State
  const [theme, setTheme] = useState<CoverTheme>('heritage');
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState<boolean>(false);
  const [showCoverModal, setShowCoverModal] = useState<boolean>(false);

  // Helper to generate cover thumbnail from title
  const triggerThumbnailGeneration = async (videoTitle: string, customTheme?: CoverTheme) => {
    setIsGeneratingThumbnail(true);
    try {
      const activeTheme = customTheme || detectThemeFromTitle(videoTitle);
      setTheme(activeTheme);
      const generated = await generateStylizedThumbnail({
        title: videoTitle,
        theme: activeTheme,
        durationSeconds: duration,
      });
      setThumbnailUrl(generated);
    } catch (err) {
      console.error('Failed to generate stylized thumbnail:', err);
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  const loadVideoFile = (f: File) => {
    setSelectedFile(f);
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
    setTitle(f.name.replace(/\.[^/.]+$/, ''));
    setFileSizeMb(Number((f.size / (1024 * 1024)).toFixed(1)));
    setIsDetecting(true);

    triggerThumbnailGeneration(f.name);

    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = url;

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        setDuration(120);
        setIsDetecting(false);
      }
    }, 1200);

    tempVideo.onloadedmetadata = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        const detected = Math.round(tempVideo.duration) || 120;
        setDuration(detected);

        // Auto-detect Aspect Ratio from native video dimensions
        const vw = tempVideo.videoWidth || 0;
        const vh = tempVideo.videoHeight || 0;
        if (vh > vw) {
          setAspectRatio('9:16');
          setPlatform('tiktok');
        } else {
          setAspectRatio('16:9');
          setPlatform('youtube');
        }

        setIsDetecting(false);
        triggerThumbnailGeneration(f.name);
      }
    };
    tempVideo.onerror = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        setDuration(120);
        setIsDetecting(false);
      }
    };
  };

  const [samplePreset, setSamplePreset] = useState<string | undefined>();
  const [sampleSegments, setSampleSegments] = useState<CaptionSegment[] | undefined>();

  const loadSampleVideo = (sample: typeof SAMPLE_VIDEOS[0]) => {
    const dummyBlob = new Blob(['sample-video'], { type: 'video/mp4' });
    const dummyFile = new File([dummyBlob], sample.title, { type: 'video/mp4' });
    setSelectedFile(dummyFile);
    setVideoUrl(sample.url);
    setTitle(sample.title.replace(/\.[^/.]+$/, ''));
    setDuration(sample.duration);
    setFileSizeMb(sample.fileSizeMb);
    setThumbnailUrl(sample.thumbnail);
    setSamplePreset(sample.presetKey);
    setSampleSegments(sample.defaultSegments);

    if (sample.aspectRatio) {
      setAspectRatio(sample.aspectRatio);
    } else if (sample.id === 'sample-2' || sample.title.toLowerCase().includes('tiktok') || sample.title.toLowerCase().includes('reel')) {
      setAspectRatio('9:16');
    } else {
      setAspectRatio('16:9');
    }

    if (sample.platform) {
      setPlatform(sample.platform);
    } else if (sample.aspectRatio === '9:16') {
      setPlatform('tiktok');
    } else {
      setPlatform('youtube');
    }

    setIsDetecting(false);
  };

  useEffect(() => {
    if (file) {
      setSamplePreset(undefined);
      setSampleSegments(undefined);
      loadVideoFile(file);
    } else if (sampleId) {
      const sample = SAMPLE_VIDEOS.find((s) => s.id === sampleId) || SAMPLE_VIDEOS[0];
      loadSampleVideo(sample);
    }
  }, [file, sampleId]);

  const isExpired = userBalance <= 0;
  const hasSufficientBalance = userBalance >= duration && userBalance > 0;

  const handleGenerate = () => {
    if (!selectedFile) {
      filePickerRef.current?.click();
      return;
    }

    if (!isGoogleAuthenticated && onRequireGoogleAuth) {
      onRequireGoogleAuth();
      return;
    }

    if (!hasSufficientBalance) {
      onOpenWallet();
      return;
    }

    onStartGeneration({
      title: title.trim() || selectedFile.name,
      videoUrl: videoUrl || SAMPLE_VIDEOS[0].url,
      file: selectedFile,
      thumbnailUrl,
      duration: duration || 120,
      fileSizeMb: fileSizeMb || 25,
      captionLanguage,
      captionMode,
      aspectRatio,
      platform,
      preset: samplePreset,
      initialSegments: sampleSegments,
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-28 md:pb-8">
      {/* Hidden File Picker */}
      <input
        ref={filePickerRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            loadVideoFile(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />

      {/* Top Bar with back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="min-h-[44px] px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white active:bg-slate-100 font-bold text-sm transition touch-tap"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Upload Video</span>
        </button>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900">
          Step 1 of 3
        </span>
      </div>

      {/* Video Preview Card OR Dropzone Picker */}
      {!videoUrl ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              loadVideoFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => filePickerRef.current?.click()}
          className="rounded-3xl border-2 border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/40 dark:bg-slate-900/80 p-8 sm:p-10 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/70 dark:hover:bg-slate-850 transition space-y-4"
        >
          <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Choose or Drop Video Here
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports MP4, WebM, MOV with automatic duration detection
            </p>
          </div>
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition"
          >
            Browse Video Files
          </button>

          {/* Quick sample videos */}
          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
            <p className="text-[11px] font-semibold text-slate-400 mb-2">Or test with a sample video:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SAMPLE_VIDEOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => loadSampleVideo(s)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-400 hover:text-blue-600 transition flex items-center gap-1.5 active:scale-95"
                >
                  <Film className="w-3.5 h-3.5 text-blue-500" />
                  <span>{s.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({formatTimeSeconds(s.duration)})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Dynamic Video Player Container */}
          {aspectRatio === '9:16' ? (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-[280px] sm:max-w-[310px] aspect-[9/16] rounded-[32px] sm:rounded-[38px] bg-slate-950 overflow-hidden shadow-2xl border-4 sm:border-[6px] border-slate-800 relative group flex items-center justify-center ring-1 ring-purple-500/30">
                {/* Phone Speaker Notch */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-900 rounded-full z-20 flex items-center justify-center pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                </div>
                {/* Top Controls: Safe Zone Toggle & Change Video */}
                <div className="absolute top-8 left-3 z-20 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowSafeZone(!showSafeZone)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold backdrop-blur-xs transition flex items-center gap-1 border active:scale-95 touch-tap cursor-pointer ${
                      showSafeZone
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                        : 'bg-black/70 hover:bg-black text-white border-white/20'
                    }`}
                    title="Toggle Platform Safe Zone Template"
                  >
                    {showSafeZone ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>Safe Zone</span>
                  </button>
                </div>

                {/* Exact Platform Safe Zone Overlay */}
                {showSafeZone && (
                  <SafeZoneOverlay
                    platform={platform === 'youtube' ? 'youtube' : platform === 'instagram' ? 'instagram' : 'tiktok'}
                    onChangePlatform={(p) => setPlatform(p)}
                    showGuidelines={true}
                  />
                )}

                <video
                  src={videoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />

                <button
                  type="button"
                  onClick={() => filePickerRef.current?.click()}
                  className="absolute top-8 right-3 z-20 px-2.5 py-1 rounded-xl bg-black/70 hover:bg-black text-white text-[10px] font-bold backdrop-blur-xs transition flex items-center gap-1 border border-white/20 active:scale-95 touch-tap"
                >
                  <Upload className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>
            </div>
          ) : aspectRatio === '1:1' ? (
            <div className="w-full max-w-[360px] mx-auto aspect-square rounded-3xl bg-slate-950 overflow-hidden shadow-xl border border-slate-800 relative group flex items-center justify-center">
              <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1 border border-white/10 pointer-events-none">
                <span>📸 Square Post (1:1)</span>
              </div>
              <video
                src={videoUrl}
                controls
                playsInline
                className="w-full h-full object-contain bg-black"
              />
              <button
                type="button"
                onClick={() => filePickerRef.current?.click()}
                className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-xl bg-black/70 hover:bg-black text-white text-[10px] font-bold backdrop-blur-xs transition flex items-center gap-1 border border-white/20 active:scale-95 touch-tap"
              >
                <Upload className="w-3 h-3" />
                <span>Change</span>
              </button>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-950 overflow-hidden shadow-xl border border-slate-800">
              <div className="relative aspect-video bg-black flex items-center justify-center group">
                <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1 border border-white/15 pointer-events-none">
                  {platform === 'youtube' && <span className="text-red-400">▶️ YouTube (16:9 Widescreen)</span>}
                  {platform === 'facebook' && <span className="text-blue-400">📘 Facebook Video (16:9)</span>}
                  {platform === 'tiktok' && <span>♪ Landscape Video (16:9)</span>}
                  {platform === 'instagram' && <span>📸 Landscape (16:9)</span>}
                </div>
                <video
                  src={videoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
                <button
                  type="button"
                  onClick={() => filePickerRef.current?.click()}
                  className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-bold backdrop-blur-xs transition flex items-center gap-1.5 border border-white/20 active:scale-95 touch-tap"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Change Video</span>
                </button>
              </div>
            </div>
          )}

          {/* Video metadata row */}
          <div className="p-3.5 rounded-2xl bg-slate-850 text-white flex items-center justify-between border border-slate-750">
            <div className="min-w-0 pr-2">
              <h4 className="text-xs sm:text-sm font-bold truncate text-slate-100">{title}</h4>
              <p className="text-[11px] text-slate-400">
                Duration: <span className="text-white font-mono font-bold">{formatTimeSeconds(duration)}</span> • Size: {fileSizeMb} MB • Ratio: <span className="text-purple-300 font-bold">{aspectRatio}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => filePickerRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-[10px] font-bold tracking-wider uppercase border border-blue-500/30 shrink-0 transition touch-tap"
            >
              Change
            </button>
          </div>

          {/* Video Sequence & Platform Selector */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-purple-500" />
                  <span>Video Sequence / Format (የቪዲዮ አይነት)</span>
                </label>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase tracking-wider">
                  {aspectRatio === '9:16' ? '⚡ Short Form (9:16)' : aspectRatio === '16:9' ? '🎬 Long Form (16:9)' : '⬛ Square (1:1)'}
                </span>
              </div>

              {/* Sequence ratio buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAspectRatio('9:16');
                    if (platform === 'youtube') setPlatform('tiktok');
                  }}
                  className={`p-3 rounded-2xl border text-center transition touch-tap active:scale-95 cursor-pointer ${
                    aspectRatio === '9:16'
                      ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20 shadow-xs font-bold'
                      : 'bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 font-black text-xs sm:text-sm">
                    <Smartphone className="w-4 h-4 text-purple-500" />
                    <span>Short 9:16</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate">
                    TikTok, Reels, Shorts
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAspectRatio('16:9');
                    setPlatform('youtube');
                  }}
                  className={`p-3 rounded-2xl border text-center transition touch-tap active:scale-95 cursor-pointer ${
                    aspectRatio === '16:9'
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs font-bold'
                      : 'bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 font-black text-xs sm:text-sm">
                    <Monitor className="w-4 h-4 text-blue-500" />
                    <span>Long 16:9</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate">
                    YouTube, Facebook
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAspectRatio('1:1');
                    setPlatform('instagram');
                  }}
                  className={`p-3 rounded-2xl border text-center transition touch-tap active:scale-95 cursor-pointer ${
                    aspectRatio === '1:1'
                      ? 'bg-pink-50 dark:bg-pink-950/50 border-pink-500 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20 shadow-xs font-bold'
                      : 'bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 font-black text-xs sm:text-sm">
                    <Sliders className="w-4 h-4 text-pink-500" />
                    <span>Square 1:1</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate">
                    Instagram Post
                  </p>
                </button>
              </div>
            </div>

            {/* Target Platform Presets */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                Target Platform Preset:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* YouTube */}
                <button
                  type="button"
                  onClick={() => {
                    setPlatform('youtube');
                    if (aspectRatio === '1:1') setAspectRatio('16:9');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition active:scale-95 touch-tap cursor-pointer ${
                    platform === 'youtube'
                      ? 'border-red-500 bg-red-50/80 dark:bg-red-950/40 text-red-600 dark:text-red-300 font-bold ring-1 ring-red-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 shadow-xs">
                    {aspectRatio === '9:16' ? <YouTubeShortsIcon className="w-full h-full" /> : <YouTubeIcon className="w-full h-full" />}
                  </div>
                  <div className="text-left leading-tight min-w-0">
                    <p className="text-xs font-bold truncate">YouTube</p>
                    <p className="text-[9px] text-slate-400 truncate">{aspectRatio === '9:16' ? 'Shorts' : 'Video'}</p>
                  </div>
                </button>

                {/* TikTok */}
                <button
                  type="button"
                  onClick={() => {
                    setPlatform('tiktok');
                    setAspectRatio('9:16');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition active:scale-95 touch-tap cursor-pointer ${
                    platform === 'tiktok'
                      ? 'border-cyan-500 bg-cyan-50/80 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-300 font-bold ring-1 ring-cyan-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 shadow-xs">
                    <TikTokIcon className="w-full h-full" />
                  </div>
                  <div className="text-left leading-tight min-w-0">
                    <p className="text-xs font-bold truncate">TikTok</p>
                    <p className="text-[9px] text-slate-400 truncate">9:16 Vertical</p>
                  </div>
                </button>

                {/* Instagram */}
                <button
                  type="button"
                  onClick={() => {
                    setPlatform('instagram');
                    if (aspectRatio === '16:9') setAspectRatio('9:16');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition active:scale-95 touch-tap cursor-pointer ${
                    platform === 'instagram'
                      ? 'border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 font-bold ring-1 ring-pink-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 shadow-xs">
                    <InstagramIcon className="w-full h-full" />
                  </div>
                  <div className="text-left leading-tight min-w-0">
                    <p className="text-xs font-bold truncate">Instagram</p>
                    <p className="text-[9px] text-slate-400 truncate">{aspectRatio === '1:1' ? 'Post' : 'Reels'}</p>
                  </div>
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={() => {
                    setPlatform('facebook');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition active:scale-95 touch-tap cursor-pointer ${
                    platform === 'facebook'
                      ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold ring-1 ring-blue-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 shadow-xs">
                    <FacebookIcon className="w-full h-full" />
                  </div>
                  <div className="text-left leading-tight min-w-0">
                    <p className="text-xs font-bold truncate">Facebook</p>
                    <p className="text-[9px] text-slate-400 truncate">{aspectRatio === '9:16' ? 'Reel' : 'Video'}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* IMMEDIATE PRIMARY "GENERATE CAPTIONS NOW" ACTION CARD */}
          <div
            className={`rounded-3xl border-2 p-5 shadow-2xl space-y-3 transition-all ${
              !hasSufficientBalance
                ? 'bg-gradient-to-r from-rose-950/90 via-slate-950/90 to-purple-950/90 border-rose-500/60 shadow-rose-900/30'
                : 'bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-blue-950/80 border-purple-500/50 shadow-purple-900/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      !hasSufficientBalance ? 'bg-rose-400' : 'bg-emerald-400'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      !hasSufficientBalance ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                  ></span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-white">
                  {!hasSufficientBalance
                    ? isExpired
                      ? 'Package Expired: 0 Minutes Remaining'
                      : 'Insufficient Package Balance'
                    : 'Video Ready to Generate Captions'}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-purple-300 bg-purple-900/50 px-2.5 py-1 rounded-full border border-purple-400/30">
                {aspectRatio} • {platform.toUpperCase()}
              </span>
            </div>

            <button
              id="instant-generate-captions-btn"
              type="button"
              onClick={handleGenerate}
              className={`w-full min-h-[54px] py-4 px-6 rounded-2xl text-white font-black text-base sm:text-lg shadow-xl flex items-center justify-center gap-3 active:scale-98 transition touch-tap cursor-pointer ${
                !hasSufficientBalance
                  ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 shadow-rose-600/40'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-purple-600/40'
              }`}
            >
              <Sparkles className="w-5 h-5 text-amber-300 animate-bounce" />
              <span>
                {!hasSufficientBalance
                  ? 'Package Expired — Upgrade to Generate'
                  : 'Generate Captions Now'}
              </span>
              <span className="text-purple-200 text-xs sm:text-sm font-semibold">
                {!hasSufficientBalance ? '| ፓኬጅ ያሻሽሉ' : '| ካፕሽን አመንጭ'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-300 px-1 pt-1">
              <span>
                {!hasSufficientBalance
                  ? `⚠️ Video needs ${formatTimeSeconds(duration)}`
                  : '⚡ Fast AI Speech-to-Text'}
              </span>
              <span>
                Available balance:{' '}
                <strong className={`font-mono ${!hasSufficientBalance ? 'text-rose-400' : 'text-white'}`}>
                  {formatTimeSeconds(userBalance)}
                </strong>
                {!hasSufficientBalance && (
                  <button
                    type="button"
                    onClick={onOpenWallet}
                    className="ml-2 underline text-amber-300 font-bold hover:text-white cursor-pointer"
                  >
                    Upgrade / Renew
                  </button>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Title & Stylized Cover Generator Section */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Video Title (የቪዲዮ ርዕስ)
            </label>
            <span className="text-[10px] font-semibold text-slate-400">
              Cover generated dynamically from title
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              const newT = e.target.value;
              setTitle(newT);
              triggerThumbnailGeneration(newT, theme);
            }}
            placeholder="Enter video title..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden transition"
          />
        </div>

        {/* Stylized Cover Card Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Stylized Project Cover
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                {COVER_THEMES[theme]?.nameAm || 'ቅርስ'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => triggerThumbnailGeneration(title)}
                disabled={isGeneratingThumbnail}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 touch-tap"
              >
                <RefreshCw className={`w-3 h-3 ${isGeneratingThumbnail ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCoverModal(true)}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 touch-tap"
              >
                <Sliders className="w-3 h-3" />
                <span>Customize</span>
              </button>
            </div>
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-sm group">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-xs">Generating cover from title...</span>
              </div>
            )}

            <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
              <span>{COVER_THEMES[theme]?.name}</span>
            </div>
          </div>

          {/* Quick Theme Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            {(Object.keys(COVER_THEMES) as CoverTheme[]).map((thm) => (
              <button
                key={thm}
                type="button"
                onClick={() => {
                  setTheme(thm);
                  triggerThumbnailGeneration(title, thm);
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition touch-tap shrink-0 ${
                  theme === thm
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {COVER_THEMES[thm].nameAm}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Caption Language Picker */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Caption Language (የካፕሽን ቋንቋ)
            </label>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400">
              {activeLanguages.length === 1 ? 'Amharic Default' : `${activeLanguages.length} Languages Available`}
            </span>
          </div>
          <div className="relative">
            <select
              value={captionLanguage}
              onChange={(e) => setCaptionLanguage(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden transition"
            >
              {activeLanguages.map((lang) => (
                <option key={lang.id} value={lang.name}>
                  {lang.flag || '🌐'} {lang.name} ({lang.nativeName}){lang.isDefault ? ' • Default' : ''}
                </option>
              ))}
            </select>
          </div>
          {activeLanguages.length === 1 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1.5 flex items-center gap-1">
              <span>ℹ️ Amharic is the default active caption language. Additional languages can be enabled by administrator.</span>
            </p>
          )}
        </div>

        {/* Caption Mode Radios */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">
            Caption Mode
          </label>
          <div className="space-y-2.5">
            <label
              onClick={() => setCaptionMode('speech_amharic')}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer active:scale-[0.99] touch-tap ${
                captionMode === 'speech_amharic'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <input
                type="radio"
                name="captionMode"
                checked={captionMode === 'speech_amharic'}
                onChange={() => setCaptionMode('speech_amharic')}
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Speech → Amharic</span>
                  <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.2 rounded-full">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                  Transcribes audio directly spoken in Amharic with accurate Ge'ez characters and punctuation.
                </p>
              </div>
            </label>

            <label
              onClick={() => setCaptionMode('translate_amharic')}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer active:scale-[0.99] touch-tap ${
                captionMode === 'translate_amharic'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <input
                type="radio"
                name="captionMode"
                checked={captionMode === 'translate_amharic'}
                onChange={() => setCaptionMode('translate_amharic')}
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Translate → Amharic</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                  Translates spoken English/foreign audio and generates fluent Amharic captions.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Estimated Usage vs Balance */}
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-2 ${
            hasSufficientBalance
              ? 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
          }`}
        >
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 font-bold truncate">
              {hasSufficientBalance ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
              <span className="truncate">Video duration: {formatTimeSeconds(duration)}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Your balance: <span className="font-mono font-bold text-slate-800 dark:text-white">{formatTimeSeconds(userBalance)}</span>
              {!hasSufficientBalance && ' (Generates available balance)'}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenWallet}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 active:scale-95 transition touch-tap shrink-0"
          >
            Get Minutes
          </button>
        </div>

        {/* Google Account Gate notice if unauthenticated */}
        {!isGoogleAuthenticated && (
          <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs shrink-0 border border-slate-200 dark:border-slate-700">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 dark:text-white truncate">Google Account Recommended</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Sign in with Google to keep and save all projects</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onRequireGoogleAuth}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 active:scale-95 transition shadow-xs shrink-0"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* Bottom Action Button */}
      <button
        id="generate-captions-btn"
        onClick={handleGenerate}
        disabled={!selectedFile}
        className={`w-full min-h-[52px] py-4 rounded-2xl text-white font-extrabold text-base shadow-xl flex items-center justify-center gap-2.5 transition-all touch-tap cursor-pointer ${
          !selectedFile
            ? 'bg-slate-400 cursor-not-allowed opacity-60'
            : !hasSufficientBalance
            ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 shadow-rose-500/25 active:scale-98'
            : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 shadow-purple-500/25 hover:from-purple-500 hover:to-blue-500 active:scale-98'
        }`}
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        <span>
          {!hasSufficientBalance
            ? 'Package Expired — Upgrade to Generate'
            : 'Generate Captions'}
        </span>
        <span className="text-purple-200 text-xs sm:text-sm font-normal">
          {!hasSufficientBalance ? '| ፓኬጅ ያሻሽሉ' : '| ካፕሽን አመንጭ'}
        </span>
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Stylized Thumbnail Generator Modal */}
      <ThumbnailGeneratorModal
        isOpen={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        initialTitle={title}
        initialThumbnailUrl={thumbnailUrl}
        durationSeconds={duration}
        onApplyCover={(newThumb) => {
          setThumbnailUrl(newThumb);
        }}
      />

      {/* Sticky Floating Bottom Bar for Instant Caption Generation */}
      {selectedFile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-t border-slate-800 p-3 sm:p-4 px-4 sm:px-8 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-white truncate">{title || selectedFile.name}</p>
              <p className="text-[11px] text-purple-300 truncate font-semibold">
                {aspectRatio === '9:16' ? '⚡ Short 9:16' : aspectRatio === '16:9' ? '🎬 Long 16:9' : '⬛ Square 1:1'} • {platform.toUpperCase()} • {formatTimeSeconds(duration)}
              </p>
            </div>
            <button
              id="sticky-generate-captions-btn"
              type="button"
              onClick={handleGenerate}
              className={`min-h-[44px] px-5 py-2.5 rounded-xl text-white font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 active:scale-95 transition shrink-0 touch-tap cursor-pointer ${
                !hasSufficientBalance
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-rose-600/40'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/40'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{!hasSufficientBalance ? 'Upgrade Package' : 'Generate Captions'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
