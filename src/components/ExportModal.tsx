import React, { useState } from 'react';
import {
  X,
  FileText,
  Video,
  Download,
  Share2,
  CheckCircle2,
  Sparkles,
  Loader2,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Film,
  ExternalLink,
} from 'lucide-react';
import { Project } from '../types';
import {
  generateSrt,
  generateVtt,
  downloadFile,
  downloadBlob,
  burnCaptionsIntoVideo,
  formatTimeSeconds,
} from '../lib/subtitles';

interface ExportModalProps {
  project: Project;
  onClose: () => void;
  onBackToProjects: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  onClose,
  onBackToProjects,
}) => {
  const [activeTab, setActiveTab] = useState<'captions' | 'video'>('captions');
  const [captionFormat, setCaptionFormat] = useState<'srt' | 'vtt'>('srt');
  const [videoQuality, setVideoQuality] = useState<'720p' | '1080p'>('1080p');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [renderedBlob, setRenderedBlob] = useState<Blob | null>(null);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [srtCopied, setSrtCopied] = useState<boolean>(false);
  const [srtDownloaded, setSrtDownloaded] = useState<boolean>(false);
  const [showSrtPreview, setShowSrtPreview] = useState<boolean>(false);

  // Generate SRT content
  const srtContent = generateSrt(project.segments);
  const vttContent = generateVtt(project.segments);

  // Handle direct standard .SRT export
  const handleDownloadSrt = () => {
    const filename = `${project.title.replace(/\.[^/.]+$/, '')}_amharic.srt`;
    downloadFile(filename, srtContent, 'text/plain;charset=utf-8');
    setSrtDownloaded(true);
    setTimeout(() => setSrtDownloaded(false), 2500);
  };

  const handleCopySrt = () => {
    navigator.clipboard.writeText(srtContent);
    setSrtCopied(true);
    setTimeout(() => setSrtCopied(false), 2000);
  };

  const handleDownloadVtt = () => {
    const filename = `${project.title.replace(/\.[^/.]+$/, '')}_amharic.vtt`;
    downloadFile(filename, vttContent, 'text/vtt;charset=utf-8');
  };

  // Handle Video Burning
  const handleBurnVideo = async () => {
    setIsExporting(true);
    setRenderProgress(10);
    setRenderError(null);

    try {
      const video = document.createElement('video');
      video.src = project.videoUrl;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;

      await new Promise((resolve) => {
        video.onloadeddata = resolve;
      });

      const blob = await burnCaptionsIntoVideo(
        video,
        project.segments,
        project.style,
        (progress) => setRenderProgress(progress)
      );

      setRenderedBlob(blob);
      setIsSuccess(true);
      setIsExporting(false);
    } catch (err) {
      console.error('Render video error:', err);
      setRenderError(err instanceof Error ? err.message : 'The video could not be rendered in this browser.');
      setIsExporting(false);
    }
  };

  const handleDownloadBurnedVideo = () => {
    if (renderedBlob) {
      const ext = renderedBlob.type.includes('mp4') ? 'mp4' : 'webm';
      downloadBlob(`${project.title.replace(/\.[^/.]+$/, '')}_captioned.${ext}`, renderedBlob);
    } else {
      const link = document.createElement('a');
      link.href = project.videoUrl;
      link.download = `${project.title.replace(/\.[^/.]+$/, '')}_captioned.mp4`;
      link.click();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Amharic Captions - ${project.title}`,
          text: `Check out the Amharic captioned video: ${project.title}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  // Sample SRT lines for the preview snippet (first 3 entries)
  const previewSrtText = srtContent.split('\n\n').slice(0, 3).join('\n\n');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border-t sm:border border-slate-100 dark:border-slate-800 space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Mobile bottom-sheet handle pill */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-1" />
        {!isSuccess ? (
          <>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">Export Captions & Video</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                    {project.segments.length} Amharic captions • {formatTimeSeconds(project.duration)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 active:bg-slate-200 transition touch-tap shrink-0"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Tabs: Caption File (.SRT / .VTT) vs Burn into Video */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100">
              <button
                id="tab-captions-btn"
                onClick={() => setActiveTab('captions')}
                className={`py-2 sm:py-2.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 touch-tap ${
                  activeTab === 'captions'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCode2 className="w-4 h-4" />
                <span className="truncate">Subtitle Files (.SRT)</span>
              </button>
              <button
                id="tab-video-btn"
                onClick={() => setActiveTab('video')}
                className={`py-2 sm:py-2.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 touch-tap ${
                  activeTab === 'video'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Film className="w-4 h-4" />
                <span className="truncate">Burn into Video</span>
              </button>
            </div>

            {/* TAB 1: Standalone Subtitle Files (Primary Focus on Standard .SRT) */}
            {activeTab === 'captions' && (
              <div className="space-y-4">
                {/* Standard .SRT Featured Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    captionFormat === 'srt'
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <label
                      onClick={() => setCaptionFormat('srt')}
                      className="flex items-start gap-3 cursor-pointer flex-1"
                    >
                      <input
                        type="radio"
                        name="captionFormat"
                        checked={captionFormat === 'srt'}
                        onChange={() => setCaptionFormat('srt')}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">Standard .SRT File</span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Standard SubRip subtitle file with UTF-8 Ge'ez encoding and millisecond timecodes.
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {['Premiere Pro', 'CapCut', 'DaVinci Resolve', 'YouTube Studio', 'VLC'].map((tool) => (
                            <span
                              key={tool}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/80 border border-slate-200 text-slate-600"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Quick Export .SRT Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                    <button
                      id="download-standard-srt-btn"
                      onClick={handleDownloadSrt}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
                    >
                      {srtDownloaded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>.SRT Downloaded!</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Export Standard .SRT File</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleCopySrt}
                      title="Copy SRT contents to clipboard"
                      className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                    >
                      {srtCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{srtCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* WebVTT Alternative Option */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    captionFormat === 'vtt'
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <label
                    onClick={() => setCaptionFormat('vtt')}
                    className="flex items-start gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="captionFormat"
                      checked={captionFormat === 'vtt'}
                      onChange={() => setCaptionFormat('vtt')}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">WebVTT (.VTT) File</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Formatted for HTML5 video players, web embedding, and modern social platforms.
                      </p>
                    </div>
                  </label>

                  {captionFormat === 'vtt' && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60">
                      <button
                        onClick={handleDownloadVtt}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export .VTT File</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Collapsible SRT Code Preview */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setShowSrtPreview(!showSrtPreview)}
                    className="w-full p-3 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Preview .SRT SubRip Format ({project.segments.length} entries)</span>
                    </div>
                    {showSrtPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showSrtPreview && (
                    <div className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-40 border-t border-slate-800 selection:bg-blue-600">
                      <pre className="whitespace-pre-wrap">{previewSrtText}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Video + Captions (Burn-in) */}
            {activeTab === 'video' && (
              <div className="space-y-4">
                {/* Secondary Callout to Export Standard .SRT right from Video tab */}
                <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-blue-950 block">Need the raw subtitle file?</span>
                    <p className="text-[11px] text-blue-700 truncate">Export a standard .srt file directly without rendering</p>
                  </div>
                  <button
                    onClick={handleDownloadSrt}
                    className="shrink-0 py-1.5 px-3 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download .SRT</span>
                  </button>
                </div>

                <label className="text-xs font-bold text-slate-700 block">Video Resolution Quality</label>
                <div className="space-y-2">
                  <label
                    onClick={() => setVideoQuality('720p')}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                      videoQuality === '720p'
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="quality"
                      checked={videoQuality === '720p'}
                      onChange={() => setVideoQuality('720p')}
                      className="mt-1 text-blue-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900">720p HD</span>
                      <p className="text-[11px] text-slate-500">Fast rendering, smaller file size.</p>
                    </div>
                  </label>

                  <label
                    onClick={() => setVideoQuality('1080p')}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                      videoQuality === '1080p'
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="quality"
                      checked={videoQuality === '1080p'}
                      onChange={() => setVideoQuality('1080p')}
                      className="mt-1 text-blue-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900">1080p Full HD</span>
                      <p className="text-[11px] text-slate-500">Crisp typography & maximum quality (Recommended).</p>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium">Render Font (የፊደል ቅርጽ):</span>
                  <span className="font-bold text-slate-800">{project.style.font || 'Easy Amharic Typing'}</span>
                </div>

                {isExporting ? (
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 text-center">
                    <div className="flex items-center justify-center gap-2 text-blue-700 text-xs font-bold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Burning Amharic Captions into Video...</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${renderProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">{renderProgress}% Complete</p>
                  </div>
                ) : (
                  <button
                    id="start-burn-video-btn"
                    onClick={handleBurnVideo}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Burn Captions & Export Video</span>
                  </button>
                )}
                {renderError && (
                  <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-medium text-red-700">
                    {renderError} Download the SRT or try a local MP4/WebM file in a browser that supports MediaRecorder.
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          /* SUCCESS SCREEN */
          <div className="text-center space-y-5 animate-in fade-in duration-300">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Your Captions & Video are Ready!</h3>
              <p className="text-xs text-slate-500">
                Download your burned MP4 video or grab the standalone standard .SRT file.
              </p>
            </div>

            {/* Video Summary Card */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-left">
              <img
                src={project.thumbnailUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'}
                alt={project.title}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">{project.title}</h4>
                <p className="text-[11px] text-slate-500">
                  {formatTimeSeconds(project.duration)} • {project.segments.length} Amharic captions
                </p>
              </div>
            </div>

            {/* Download Buttons Stack */}
            <div className="space-y-2 pt-1">
              {/* Primary Burned MP4 */}
              <button
                onClick={handleDownloadBurnedVideo}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Video className="w-4 h-4 text-yellow-400" />
                <span>Download Burned Video (.MP4)</span>
              </button>

              {/* Standard .SRT File Export */}
              <button
                id="success-download-srt-btn"
                onClick={handleDownloadSrt}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
              >
                {srtDownloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                <span>{srtDownloaded ? '.SRT File Downloaded!' : 'Download Standard .SRT File'}</span>
              </button>

              {/* WebVTT Option */}
              <button
                onClick={handleDownloadVtt}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Download WebVTT (.VTT)</span>
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                {shareCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{shareCopied ? 'Link Copied!' : 'Share Video'}</span>
              </button>
            </div>

            <button
              onClick={onBackToProjects}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition block mx-auto pt-2"
            >
              Back to Projects
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
