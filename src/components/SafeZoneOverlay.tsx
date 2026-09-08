import React from 'react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Search,
  MoreVertical,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Repeat2,
  Tv,
  Music2,
  Radio,
  Camera,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { TikTokIcon, YouTubeShortsIcon, ReelsIcon } from './PlatformIcons';

export type SafeZonePlatform = 'tiktok' | 'youtube' | 'instagram';

interface SafeZoneOverlayProps {
  platform: SafeZonePlatform;
  onChangePlatform?: (platform: SafeZonePlatform) => void;
  showGuidelines?: boolean;
}

export const SafeZoneOverlay: React.FC<SafeZoneOverlayProps> = ({
  platform,
  onChangePlatform,
  showGuidelines = true,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-15 select-none overflow-hidden flex flex-col justify-between">
      {/* Platform Switcher Badge (Interactive: pointer-events-auto) */}
      <div className="absolute top-2.5 right-2.5 z-30 pointer-events-auto flex items-center gap-1 bg-black/85 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-lg scale-90 sm:scale-100 origin-top-right">
        {(
          [
            { id: 'tiktok', label: 'TikTok', icon: TikTokIcon },
            { id: 'youtube', label: 'Shorts', icon: YouTubeShortsIcon },
            { id: 'instagram', label: 'Reels', icon: ReelsIcon },
          ] as const
        ).map((p) => {
          const isSelected = platform === p.id;
          const IconComp = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChangePlatform && onChangePlatform(p.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title={`Preview ${p.label} Safe Zone`}
            >
              <IconComp className="w-3.5 h-3.5 shrink-0" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. TIKTOK EXACT SAFE ZONE OVERLAY */}
      {platform === 'tiktok' && (
        <>
          {/* Top Bar: Live, Following / For You, Search */}
          <div className="pt-6 sm:pt-7 px-3 flex items-center justify-between text-white/90 text-xs drop-shadow-md">
            <div className="flex items-center gap-1 opacity-80">
              <Tv className="w-4 h-4" />
              <span className="text-[9px] font-bold uppercase tracking-wider">LIVE</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="text-white/60">Following</span>
              <span className="text-white relative pb-0.5 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3 after:h-0.5 after:bg-white after:rounded-full">
                For You
              </span>
            </div>
            <div className="w-6 h-6 flex items-center justify-center opacity-85">
              <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Central Safe Text Box Guideline */}
          {showGuidelines && (
            <div className="absolute inset-x-3 top-16 bottom-24 border-2 border-dashed border-cyan-400/50 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-[inset_0_0_20px_rgba(37,244,238,0.1)]">
              <div className="flex justify-between items-center text-[9px] font-mono text-cyan-300 bg-black/60 px-1.5 py-0.5 rounded-md self-start border border-cyan-400/30">
                <span>✦ TikTok 9:16 Safe Text Zone</span>
              </div>
              <div className="self-end text-[8px] font-mono text-cyan-300/80 bg-black/50 px-1 rounded">
                Keep captions within box
              </div>
            </div>
          )}

          {/* Right Action Rail */}
          <div className="absolute right-2 bottom-12 flex flex-col items-center gap-2.5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {/* Avatar + Plus */}
            <div className="relative mb-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white overflow-hidden bg-slate-800 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#FE2C55] text-white flex items-center justify-center text-[11px] font-black leading-none shadow-xs">
                +
              </div>
            </div>

            {/* Heart / Like */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 fill-white text-white drop-shadow-sm" />
              </div>
              <span className="text-[10px] font-bold">84.6K</span>
            </div>

            {/* Comment */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 fill-white text-white drop-shadow-sm" />
              </div>
              <span className="text-[10px] font-bold">2,391</span>
            </div>

            {/* Bookmark */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <Bookmark className="w-6 h-6 fill-white text-white drop-shadow-sm" />
              </div>
              <span className="text-[10px] font-bold">5,420</span>
            </div>

            {/* Share */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <Share2 className="w-6 h-6 fill-white text-white drop-shadow-sm" />
              </div>
              <span className="text-[10px] font-bold">1,180</span>
            </div>

            {/* Vinyl Record */}
            <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-950 p-1 flex items-center justify-center animate-spin duration-[4000ms]">
              <div className="w-4 h-4 rounded-full bg-slate-700 border border-white/50" />
            </div>
          </div>

          {/* Bottom Caption & Music Row */}
          <div className="p-3 pb-3 max-w-[75%] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black">@creator.ethiopia</span>
              <CheckCircle2 className="w-3 h-3 text-[#20D5EC] fill-[#20D5EC] text-slate-950" />
            </div>
            <p className="text-[11px] leading-tight font-medium text-white/95 line-clamp-2">
              የአማርኛ ቪዲዮ ካፕሽን በአዲሱ ስልት 🔥🇪🇹 #fyp #amharic #viral #ethiopia
            </p>
            <div className="flex items-center gap-1 text-[10px] text-white/80 pt-0.5">
              <Music2 className="w-3 h-3 animate-pulse" />
              <span className="truncate">♫ Original Sound - Ethiopian Music ♫</span>
            </div>
          </div>
        </>
      )}

      {/* 2. YOUTUBE SHORTS EXACT SAFE ZONE OVERLAY */}
      {platform === 'youtube' && (
        <>
          {/* Top Bar: Shorts Logo / Menu */}
          <div className="pt-6 sm:pt-7 px-3 flex items-center justify-between text-white drop-shadow-md">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-red-600 flex items-center justify-center">
                <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[6px] border-l-white border-b-[3px] border-b-transparent translate-x-0.5" />
              </div>
              <span className="text-xs font-black tracking-tight">Shorts</span>
            </div>
            <div className="flex items-center gap-2.5 opacity-90">
              <Search className="w-4 h-4" />
              <Camera className="w-4 h-4" />
              <MoreVertical className="w-4 h-4" />
            </div>
          </div>

          {/* Central Safe Text Box Guideline */}
          {showGuidelines && (
            <div className="absolute inset-x-3 top-16 bottom-24 border-2 border-dashed border-red-500/50 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]">
              <div className="flex justify-between items-center text-[9px] font-mono text-red-300 bg-black/60 px-1.5 py-0.5 rounded-md self-start border border-red-500/30">
                <span>▶ YouTube Shorts Safe Zone</span>
              </div>
              <div className="self-end text-[8px] font-mono text-red-300/80 bg-black/50 px-1 rounded">
                Avoid bottom subscribe bar
              </div>
            </div>
          )}

          {/* Right Action Rail */}
          <div className="absolute right-2 bottom-12 flex flex-col items-center gap-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {/* Like */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-xs flex items-center justify-center">
                <ThumbsUp className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold">128K</span>
            </div>

            {/* Dislike */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-xs flex items-center justify-center">
                <ThumbsDown className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-medium text-white/80">Dislike</span>
            </div>

            {/* Comment */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-xs flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold">3.4K</span>
            </div>

            {/* Share */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-xs flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-medium text-white/80">Share</span>
            </div>

            {/* Remix */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-xs flex items-center justify-center">
                <Repeat2 className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-medium text-white/80">Remix</span>
            </div>

            {/* Sound square */}
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/40 overflow-hidden shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&auto=format&fit=crop&q=80"
                alt="sound"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Bottom Channel & Subscribe Row */}
          <div className="p-3 pb-3 max-w-[76%] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-800 border border-white/40 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold truncate">@AddisShorts</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-black font-extrabold text-[10px] shrink-0">
                Subscribe
              </span>
            </div>
            <p className="text-[11px] leading-tight font-medium text-white/95 line-clamp-2">
              Best Amharic AI Subtitles Generator in seconds! ⚡🇪🇹 #shorts #ethiopia
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-white/80">
              <Music2 className="w-3 h-3" />
              <span className="truncate">Original audio - Ethiopian Creator</span>
            </div>
          </div>
        </>
      )}

      {/* 3. INSTAGRAM REELS EXACT SAFE ZONE OVERLAY */}
      {platform === 'instagram' && (
        <>
          {/* Top Bar: Reels Title, Camera */}
          <div className="pt-6 sm:pt-7 px-3 flex items-center justify-between text-white drop-shadow-md">
            <div className="flex items-center gap-1">
              <span className="text-sm font-black tracking-tight">Reels</span>
              <span className="text-[10px] opacity-75">▼</span>
            </div>
            <div className="opacity-90">
              <Camera className="w-4 h-4" />
            </div>
          </div>

          {/* Central Safe Text Box Guideline (includes 4:5 feed safe area preview) */}
          {showGuidelines && (
            <div className="absolute inset-x-3 top-14 bottom-22 border-2 border-dashed border-pink-400/50 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-[inset_0_0_20px_rgba(236,72,153,0.1)]">
              <div className="flex justify-between items-center text-[9px] font-mono text-pink-300 bg-black/60 px-1.5 py-0.5 rounded-md self-start border border-pink-400/30">
                <span>📸 Reels Safe Zone (4:5 Feed Safe)</span>
              </div>
              <div className="self-end text-[8px] font-mono text-pink-300/80 bg-black/50 px-1 rounded">
                Feed crop safe
              </div>
            </div>
          )}

          {/* Right Action Rail */}
          <div className="absolute right-2 bottom-10 flex flex-col items-center gap-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {/* Heart */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-[10px] font-bold">42.8K</span>
            </div>

            {/* Comment */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="text-[10px] font-bold">1,820</span>
            </div>

            {/* Paper Plane / Send */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <Send className="w-5 h-5 stroke-[1.8] -rotate-12 translate-x-0.5" />
              </div>
              <span className="text-[10px] font-bold">9,430</span>
            </div>

            {/* More dots */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <MoreHorizontal className="w-5 h-5" />
            </div>

            {/* Audio thumbnail with border */}
            <div className="w-7 h-7 rounded-lg border-2 border-white overflow-hidden shadow-xs bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=80&auto=format&fit=crop&q=80"
                alt="sound"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Bottom Profile & Audio Row */}
          <div className="p-3 pb-3 max-w-[76%] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80"
                  alt="avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-xs font-black truncate">reels_ethiopia</span>
              <button
                type="button"
                className="px-2 py-0.5 rounded-md border border-white/70 text-[10px] font-bold tracking-wide"
              >
                Follow
              </button>
            </div>
            <p className="text-[11px] leading-tight font-medium text-white/95 line-clamp-2">
              ድንቅ የአማርኛ ቪዲዮ ካፕሽን በአዲሱ ስልት ✨🇪🇹 #reels #ethiopia #habesha
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-white/80">
              <Music2 className="w-3 h-3" />
              <span className="truncate">Original audio • Trending sound</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

