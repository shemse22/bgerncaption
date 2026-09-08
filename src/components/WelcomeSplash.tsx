import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, Shield, Zap } from 'lucide-react';

interface WelcomeSplashProps {
  onGetStarted: () => void;
}

export const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onGetStarted }) => {
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center p-4 overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&auto=format&fit=crop&q=80"
          alt="Ethiopian landscape"
          className="w-full h-full object-cover object-center filter brightness-[0.25]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-blue-950/60" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-md w-full text-center px-4 py-8 space-y-6">
        {/* Logo Card */}
        <div className="inline-flex p-4 rounded-3xl bg-blue-600/30 border border-blue-400/40 backdrop-blur-md shadow-2xl shadow-blue-600/40">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-inner">
            <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9 text-white" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="14" x="3" y="5" rx="3" />
              <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none" />
              <line x1="7" y1="15" x2="11" y2="15" />
            </svg>
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>3 ነፃ ደቂቃዎች ተካቷል • 3 Free Minutes Included</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight font-sans">
            አማርኛ ካፕሽን <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-yellow-300">
              ጄኔሬተር
            </span>
          </h1>

          <p className="text-lg font-semibold text-slate-200">
            Turn your videos into professional Amharic captions
          </p>

          <p className="text-sm text-slate-400 font-medium font-sans">
            ቪዲዮዎን በቀላሉ ወደ አማርኛ ካፕሽን ይለውጡ
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 gap-2 text-left pt-2">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 backdrop-blur-xs">
            <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>ፈጣን የአማርኛ ንግግር ለይቶ ማወቅ</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 backdrop-blur-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>TikTok & YouTube ስታይሎች</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 backdrop-blur-xs">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>SRT / VTT ወደ ውጪ መላክ</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 backdrop-blur-xs">
            <Shield className="w-4 h-4 text-purple-400 shrink-0" />
            <span>ቀጥታ በቪዲዮው ላይ ማቃጠል (Burn)</span>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="pt-4">
          <button
            id="splash-get-started-btn"
            onClick={onGetStarted}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-bold text-base shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Get Started</span>
            <span className="text-blue-200">| ጀምር</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
