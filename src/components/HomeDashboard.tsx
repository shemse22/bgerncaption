import React, { useRef, useState } from 'react';
import {
  Upload,
  Sparkles,
  CheckCircle2,
  Play,
  Zap,
  Target,
  Layers,
  Globe,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Youtube,
  ArrowRight,
  Clock,
  Film,
  Sliders,
  Trash2,
  ChevronRight,
  Check,
} from 'lucide-react';
import { User, Project } from '../types';
import { formatTimeSeconds } from '../lib/subtitles';
import { DeleteProjectModal } from './DeleteProjectModal';
import { useAuthService } from './ClerkAuthProvider';
import { YouTubeShortsIcon, TikTokIcon, InstagramIcon, FacebookIcon } from './PlatformIcons';
import { SampleVideoShowcase } from './SampleVideoShowcase';
import { SampleVideo, INITIAL_PACKAGES, ALL_PLANS_INCLUDED_FEATURES } from '../lib/amharicData';

interface HomeDashboardProps {
  user: User;
  projects: Project[];
  onOpenUpload: (file?: File, sampleId?: string) => void;
  onOpenProject: (projectId: string) => void;
  onOpenWallet: () => void;
  onViewAllProjects: () => void;
  onOpenGoogleAuth?: () => void;
  onDeleteProject?: (projectId: string) => void;
  isAuthenticated?: boolean;
  onOpenSampleInEditor?: (sample: SampleVideo) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  user,
  projects,
  onOpenUpload,
  onOpenProject,
  onOpenWallet,
  onViewAllProjects,
  onOpenGoogleAuth,
  onDeleteProject,
  isAuthenticated,
  onOpenSampleInEditor,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showDemoVideoModal, setShowDemoVideoModal] = useState(false);

  const authService = useAuthService();
  const isAuthed = isAuthenticated !== undefined
    ? isAuthenticated
    : Boolean(authService.isSignedIn || user.provider === 'clerk' || user.provider === 'google');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      e.target.value = '';
      onOpenUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onOpenUpload(e.dataTransfer.files[0]);
    }
  };

  const handleYoutubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl) return;
    alert("Due to Google's strict anti-bot protections, direct YouTube link downloading is currently disabled to prevent server bans. \n\nPlease download the video to your device first using a free tool (like y2mate.com), and then upload the video file directly here!");
  };

  const handleDemoClick = () => {
    const el = document.getElementById('sample-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowDemoVideoModal(true);
    }
  };

  const recentProjects = projects.slice(0, 4);

  const features = [
    {
      id: 'speed',
      title: 'Super Fast',
      description: 'Generate subtitles in seconds, not hours. Save 90% of your editing time.',
      icon: Zap,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-400/10 border-amber-400/20',
    },
    {
      id: 'accuracy',
      title: 'High Accuracy',
      description: 'Trained specifically on Amharic speech patterns, accents, and local dialects.',
      icon: Target,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-400/10 border-cyan-400/20',
    },
    {
      id: 'formats',
      title: 'Multiple Formats',
      description: 'Export to SRT, VTT, burned-in video, or styled text for any platform.',
      icon: Layers,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-400/10 border-purple-400/20',
    },
    {
      id: 'everywhere',
      title: 'Works Everywhere',
      description: 'Optimized for YouTube, TikTok, Facebook, Instagram reels and stories.',
      icon: Globe,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-400/10 border-emerald-400/20',
    },
    {
      id: 'privacy',
      title: 'Privacy First',
      description: 'Your videos are processed securely and deleted after export. 100% private.',
      icon: ShieldCheck,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-400/10 border-blue-400/20',
    },
  ];

  const faqs = [
    {
      q: 'How accurate is the Amharic speech-to-text transcription?',
      a: 'Our deep learning models are fine-tuned on thousands of hours of diverse Ethiopian Amharic speech. It achieves over 95% accuracy on clear conversational audio, recognizing slang, idioms, and punctuation automatically.',
    },
    {
      q: 'Can I edit and customize the Amharic subtitles before exporting?',
      a: 'Yes! Our built-in Caption Editor allows you to tweak individual words, correct timestamps, change colors, choose fonts (such as Nyala, Abyssinica SIL, Kefa), and select dynamic animation styles.',
    },
    {
      q: 'What formats can I upload and export?',
      a: 'You can upload MP4, MOV, WebM, AVI, and MKV files up to 500MB. You can export clean SRT subtitle files, WebVTT files, or download complete burned-in videos with hardcoded subtitles ready for TikTok, Reels, and YouTube.',
    },
    {
      q: 'How do I top up minutes using Telebirr or CBE Birr?',
      a: 'Navigate to the Pricing tab, choose a package (e.g. 15 or 50 minutes), and transfer via Telebirr or CBE Birr. Upload your transaction screenshot or enter the transaction reference, and your balance will be credited promptly.',
    },
    {
      q: 'Is there a free trial to test with my own videos?',
      a: 'Yes! Every new account includes free transcription minutes and access to pre-loaded demo videos so you can experience the speed and quality immediately with zero commitment.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-purple-500 selection:text-white pb-20 md:pb-12">
      {/* 1. HERO SECTION */}
      <section id="top" className="relative overflow-hidden pt-6 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80" style={{contain: 'paint'}}>
        {/* Atmospheric ambient glow spheres */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-5%] w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          {/* Sign in prompt banner if guest */}
          {!isAuthed && (authService.isClerkConfigured || onOpenGoogleAuth) && (
            <div className="mb-8 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 via-indigo-900/50 to-slate-900/80 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div className="text-xs sm:text-sm">
                  <span className="font-bold text-white">Sign In to Save Projects</span>
                  <span className="text-slate-300 ml-1.5 hidden sm:inline">— Connect your account to save your Amharic caption projects and get free transcription minutes</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (authService.isClerkConfigured) {
                    authService.openSignIn();
                  } else if (onOpenGoogleAuth) {
                    onOpenGoogleAuth();
                  } else {
                    authService.openKeyModal();
                  }
                }}
                className="self-start sm:self-auto px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 touch-tap shrink-0"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Hero Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Headline, Benefits, Dual Input Card */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold backdrop-blur-md shadow-xs">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI-Powered Amharic Subtitle Generator</span>
              </div>

              {/* Heading */}
              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
                Turn Your Videos Into{' '}
                <span className="block bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                  Amharic Captions
                </span>
              </h1>

              {/* 4 Green Checkmarks row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-medium text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span>Fast & Accurate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span>AI Powered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span>100% Amharic</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span>Easy to Use</span>
                </div>
              </div>

              {/* DUAL INPUT CARD */}
              <div
                id="upload-section"
                className="rounded-3xl bg-[#131B2E]/95 border border-slate-700/80 p-4 sm:p-7 backdrop-blur-xl shadow-2xl shadow-purple-950/40 relative overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-11 gap-4 sm:gap-6 items-center">
                  {/* Left Side: Upload File */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-slate-600 hover:border-purple-400 bg-[#0C1220]/90 hover:bg-[#0E1528] rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 group flex flex-col items-center justify-center min-h-[160px]"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white mb-0.5">
                        Drag & drop or browse video
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">
                        MP4, MOV, AVI up to 500MB
                      </p>
                      <div className="flex flex-wrap justify-center items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-bold text-slate-200 shadow-xs hover:border-red-500/50 transition">
                          <YouTubeShortsIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>Shorts</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-bold text-slate-200 shadow-xs hover:border-cyan-400/50 transition">
                          <TikTokIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>TikTok</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-bold text-slate-200 shadow-xs hover:border-pink-500/50 transition">
                          <InstagramIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>Instagram</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-bold text-slate-200 shadow-xs hover:border-blue-500/50 transition">
                          <FacebookIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>Facebook</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-600 transition active:scale-95 touch-tap"
                      >
                        Choose File
                      </button>
                    </div>
                  </div>

                  {/* Center Divider: OR */}
                  <div className="md:col-span-1 flex items-center justify-center relative my-1 md:my-0">
                    <div className="hidden md:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-slate-700/80" />
                    <div className="block md:hidden w-full h-px bg-slate-700/80 absolute top-1/2 -translate-y-1/2" />
                    <span className="relative z-10 px-2.5 py-1 rounded-full bg-[#131B2E] border border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      OR
                    </span>
                  </div>

                  {/* Right Side: Paste YouTube Link */}
                  <div className="md:col-span-5 flex flex-col justify-center space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                      <div className="w-5 h-5 rounded-md bg-red-600/20 flex items-center justify-center text-red-500">
                        <Youtube className="w-3.5 h-3.5" />
                      </div>
                      <span>Paste YouTube link</span>
                    </div>

                    <form onSubmit={handleYoutubeSubmit} className="space-y-3">
                      <div className="relative">
                        <input
                          type="url"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="Paste YouTube link (e.g. https://youtu.be/...)"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C1220]/90 border border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-white placeholder:text-slate-500 outline-hidden transition"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-98 transition duration-150 touch-tap"
                      >
                        <span>Generate Captions</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>

                {/* Bottom link: Try our demo */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center">
                  <button
                    onClick={handleDemoClick}
                    className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 transition font-medium touch-tap"
                  >
                    <Play className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
                    <span>No video? Try our demo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Ethiopian Creator Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md lg:max-w-none rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-purple-950/40 group">
                {/* Glow ring */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

                {/* Creator image with handwriting & badge baked into high quality visual */}
                <img
                  src="/hero-creator.png"
                  alt="Top Ethiopian Content Creator creating better Amharic subtitles"
                  className="w-full h-auto object-cover select-none transition duration-300 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RECENT PROJECTS SECTION (IF USER HAS PROJECTS AND IS LOGGED IN) */}
      {isAuthed && projects.length > 0 && (
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                My Recent Projects ({projects.length})
              </h3>
            </div>
            <button
              onClick={onViewAllProjects}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
            >
              <span>View all projects</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {recentProjects.map((project) => {
              const isCompleted = project.status === 'completed';
              const isProcessing = project.status === 'processing';

              return (
                <div
                  key={project.id}
                  onClick={() => onOpenProject(project.id)}
                  className="group cursor-pointer rounded-2xl p-3 bg-[#131B2E]/80 border border-slate-800 hover:border-purple-500/50 transition-all duration-200 shadow-md flex flex-col justify-between"
                >
                  <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                    {project.thumbnailUrl ? (
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Film className="w-6 h-6" />
                      </div>
                    )}
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono text-white">
                      {formatTimeSeconds(project.duration)}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition truncate">
                      {project.title}
                    </h4>
                    <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
                      <span>{formatTimeSeconds(project.duration)}</span>
                      {isCompleted && (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Ready
                        </span>
                      )}
                      {isProcessing && (
                        <span className="text-purple-400 font-semibold flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          Processing
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProject(project.id);
                      }}
                      className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Edit Captions</span>
                    </button>
                    {onDeleteProject && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-red-400 transition"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. WHY CHOOSE US SECTION (FEATURES) */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/30">
            WHY CHOOSE US
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-4 tracking-tight">
            Everything You Need for Amharic Captions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2.5">
            Engineered specifically for Ethiopian content creators, video editors, podcasters, and media agencies.
          </p>
        </div>

        {/* 5 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const isFifth = idx === 4;

            return (
              <div
                key={feature.id}
                className={`rounded-2xl p-6 bg-[#131B2E]/90 border border-slate-800 hover:border-purple-500/40 hover:bg-[#151E33] transition-all duration-200 shadow-lg group ${
                  isFifth ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-4 ${feature.iconBg}`}>
                  <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-purple-300 transition">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. BOTTOM 2-COLUMN SECTION: SIMPLE STEPS & REAL EXAMPLES */}
      <section id="examples" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: SIMPLE STEPS / How It Works */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/30">
                SIMPLE STEPS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 tracking-tight">
                How It Works
              </h2>
            </div>

            {/* 3 Steps */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#131B2E]/80 border border-slate-800/80">
                <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/50 text-purple-300 font-extrabold text-sm flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Upload Your Video</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Drag & drop your video file or paste a YouTube link. We support all common formats.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#131B2E]/80 border border-slate-800/80">
                <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/50 text-purple-300 font-extrabold text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">AI Generates Captions</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Our Amharic speech-to-text AI creates accurate subtitles with perfect timing in seconds.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#131B2E]/80 border border-slate-800/80">
                <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/50 text-purple-300 font-extrabold text-sm flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Review & Export</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Edit text if needed, choose your style, and download SRT or export video directly.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onOpenUpload()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition active:scale-95 touch-tap text-center"
              >
                Get Started Free
              </button>
              <button
                onClick={() => setShowDemoVideoModal(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#131B2E] hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 touch-tap"
              >
                <Play className="w-4 h-4 fill-white text-white shrink-0" />
                <span>Watch How It Works (1 min)</span>
              </button>
            </div>
          </div>

          {/* Right Column: REAL EXAMPLES / See the Difference */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                REAL EXAMPLES
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 tracking-tight">
                See the Difference
              </h2>
            </div>

            {/* Before & After Comparison Card */}
            <div className="rounded-2xl p-4 sm:p-6 bg-[#131B2E]/95 border border-slate-800 shadow-2xl space-y-5">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                {/* Before Column */}
                <div className="space-y-2">
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video">
                    <img
                      src="/example-before.png"
                      alt="Before subtitles: creator without captions"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-medium text-center">
                    No captions — <span className="text-red-400 font-semibold">85% scroll past</span>
                  </p>
                </div>

                {/* After Column */}
                <div className="space-y-2">
                  <div className="relative rounded-xl overflow-hidden border border-purple-500/40 bg-slate-900 aspect-video shadow-md shadow-purple-900/20">
                    <img
                      src="/example-after.png"
                      alt="After: Ethiopian creator with clear burned Amharic subtitles"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300 font-medium text-center">
                    With captions — <span className="text-emerald-400 font-bold">3.5x more engagement</span>
                  </p>
                </div>
              </div>

              {/* Ready for all platforms row */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Ready for all platforms:</span>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-[#0C1220] border border-slate-800 text-red-500 font-bold text-[11px] flex items-center gap-1">
                    YouTube
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#0C1220] border border-slate-800 text-cyan-400 font-bold text-[11px] flex items-center gap-1">
                    TikTok
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#0C1220] border border-slate-800 text-blue-500 font-bold text-[11px] flex items-center gap-1">
                    Facebook
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#0C1220] border border-slate-800 text-pink-400 font-bold text-[11px] flex items-center gap-1">
                    Instagram
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Working Sample Video Showcase in Different Styles */}
        <div id="sample-showcase" className="mt-14 sm:mt-16 scroll-mt-20">
          <SampleVideoShowcase
            onOpenSampleInEditor={onOpenSampleInEditor}
            onOpenUpload={onOpenUpload}
            isAuthenticated={isAuthed}
            onRequireAuth={() => {
              if (authService.isClerkConfigured) {
                authService.openSignIn();
              } else if (onOpenGoogleAuth) {
                onOpenGoogleAuth();
              } else {
                authService.openKeyModal();
              }
            }}
          />
        </div>
      </section>

      {/* 5. PRICING & PACKAGES (Matching Design) */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-800/80 scroll-mt-20">
        <div className="text-center mb-12 space-y-3">
          <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/30">
            PRICING
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Choose the package that matches your content creation volume. Instant activation via Telebirr or CBE.
          </p>
        </div>

        {/* Top Banner: ALL PLANS INCLUDE */}
        <div className="rounded-2xl bg-[#111622] border border-slate-800/80 p-4 sm:p-5 flex flex-col md:flex-row items-center gap-4 sm:gap-6 shadow-xl mb-8">
          <div className="shrink-0 md:pr-6 md:border-r border-slate-800/80 text-center md:text-left">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              ALL PLANS INCLUDE
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 w-full">
            {ALL_PLANS_INCLUDED_FEATURES.map((feat) => (
              <div key={feat} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-200">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
          {INITIAL_PACKAGES.map((pkg) => {
            const isPopular = Boolean(pkg.popular);

            return (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between ${
                  isPopular
                    ? 'border-2 border-blue-500 bg-[#121c2e] ring-1 ring-blue-500/50 shadow-2xl shadow-blue-500/20 md:-translate-y-1'
                    : 'border border-slate-800/80 bg-[#131926] hover:border-slate-700 shadow-xl'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md shadow-blue-500/40 whitespace-nowrap">
                    {pkg.badge || 'MOST POPULAR'}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Plan Name */}
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {pkg.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {pkg.priceEtb}
                    </span>
                    <span className="text-xs font-bold text-slate-400 ml-1">
                      ETB
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="pt-2 flex items-center gap-2 text-slate-300 text-sm font-semibold">
                    <Clock className="w-4 h-4 text-slate-400 stroke-[2.2]" />
                    <span>{pkg.minutes} Minute</span>
                  </div>

                  {/* Credits */}
                  <div className="flex items-baseline gap-1.5 pt-0.5">
                    <span className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                      {pkg.credits?.toLocaleString() || '30,000'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      CREDITS
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-8">
                  <button
                    type="button"
                    onClick={onOpenWallet}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs transition active:scale-95 touch-tap flex items-center justify-center gap-1.5 shadow-md ${
                      isPopular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/40'
                        : 'bg-[#232936] hover:bg-[#2e3748] text-white border border-slate-700/50'
                    }`}
                  >
                    <span>{pkg.buttonText || `Get ${pkg.name}`}</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-b border-slate-800/80">
        <div className="text-center mb-12">
          <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/30">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Got questions about Amharic transcription, billing, or export? We have answers.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-[#131B2E]/90 border border-slate-800 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white hover:text-purple-300 transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-purple-900/60 via-indigo-900/50 to-purple-900/60 border border-purple-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Ready to Caption Your Next Video in Amharic?
            </h2>
            <p className="text-xs sm:text-sm text-purple-200">
              Join top Ethiopian creators on YouTube, TikTok, and Facebook. Start creating professional Amharic subtitles in seconds.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <button
                onClick={() => onOpenUpload()}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-purple-50 text-purple-900 font-extrabold text-xs sm:text-sm shadow-xl active:scale-95 transition touch-tap text-center"
              >
                Get Started Free
              </button>
              <button
                onClick={onOpenWallet}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-purple-950/60 hover:bg-purple-900/80 border border-purple-400/30 text-white font-bold text-xs sm:text-sm active:scale-95 transition touch-tap text-center"
              >
                View Pricing Plans
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-[10px]">
              BG
            </div>
            <span className="font-bold text-slate-300">Bgern</span>
            <span>— Your Video. In Amharic.</span>
          </div>

          <div className="flex items-center gap-5 text-slate-400 text-xs flex-wrap justify-center">
            <a href="#features" className="hover:text-white transition">Features</a>
            <button onClick={onOpenWallet} className="hover:text-white transition">Pricing</button>
            <a href="#examples" className="hover:text-white transition">Examples</a>
            <a href="#faq" className="hover:text-white transition font-medium text-purple-400 hover:text-purple-300">
              Frequently Asked Questions (FAQ)
            </a>
          </div>

          <p>© {new Date().getFullYear()} Bgern. Built for Ethiopian Creators.</p>
        </div>
      </footer>

      {/* Delete Project Modal */}
      {projectToDelete && (
        <DeleteProjectModal
          isOpen={Boolean(projectToDelete)}
          project={projectToDelete}
          onClose={() => setProjectToDelete(null)}
          onConfirmDelete={(projectId) => {
            if (onDeleteProject) {
              onDeleteProject(projectId);
            }
            setProjectToDelete(null);
          }}
        />
      )}

      {/* Demo Video Modal */}
      {showDemoVideoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={() => setShowDemoVideoModal(false)}
        >
          <div
            className="w-full max-w-4xl bg-[#131B2E] border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Interactive Amharic Caption Showcase</h3>
              </div>
              <button
                onClick={() => setShowDemoVideoModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕ Close
              </button>
            </div>

            <SampleVideoShowcase
              onOpenSampleInEditor={(sample) => {
                setShowDemoVideoModal(false);
                if (onOpenSampleInEditor) {
                  onOpenSampleInEditor(sample);
                }
              }}
              onOpenUpload={(f, sId) => {
                setShowDemoVideoModal(false);
                onOpenUpload(f, sId);
              }}
              isAuthenticated={isAuthed}
              onRequireAuth={() => {
                setShowDemoVideoModal(false);
                if (authService.isClerkConfigured) {
                  authService.openSignIn();
                } else if (onOpenGoogleAuth) {
                  onOpenGoogleAuth();
                } else {
                  authService.openKeyModal();
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
