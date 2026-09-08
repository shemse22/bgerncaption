import React from 'react';
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { formatTimeSeconds } from '../lib/subtitles';
import { TranscriptionStage } from '../lib/transcription';

interface GeneratingViewProps { title: string; duration: number; progress: number; stage: TranscriptionStage; error?: string; onOpenProject: () => void; onBack: () => void; }
const steps: { label: string; stage: TranscriptionStage }[] = [
  { label: 'Uploading video', stage: 'uploading' },
  { label: 'Transcribing speech', stage: 'transcribing' },
  { label: 'Creating timed Amharic captions', stage: 'finalizing' },
];

export const GeneratingView: React.FC<GeneratingViewProps> = ({ title, duration, progress, stage, error, onOpenProject, onBack }) => {
  const currentIndex = steps.findIndex((step) => step.stage === stage);
  const complete = progress === 100 && !error;
  return <div className="max-w-md mx-auto py-10 px-4 text-center space-y-6 animate-in fade-in duration-300">
    <div className={`relative mx-auto w-24 h-24 rounded-3xl border flex items-center justify-center shadow-xl ${error ? 'bg-red-50 border-red-200 text-red-600' : complete ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-blue-50/80 border-blue-200 text-blue-600'}`}>
      {error ? <AlertCircle className="w-11 h-11" /> : complete ? <CheckCircle2 className="w-11 h-11" /> : <Loader2 className="w-11 h-11 animate-spin" />}
    </div>
    <div className="space-y-2"><h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{error ? 'Caption Generation Failed' : complete ? 'Your Captions Are Ready' : 'Generating Your Captions'}</h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed break-words">{error || (complete ? `${title} was transcribed successfully.` : 'Progress reflects the actual upload and transcription request; it does not estimate time artificially.')}</p></div>
    <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-xs text-left space-y-3.5">
      {steps.map((step, index) => { const done = complete || index < currentIndex; const current = !complete && !error && index === currentIndex; return <div key={step.stage} className="flex items-center justify-between text-xs"><div className="flex items-center gap-3">{done ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : current ? <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />}<span className={done ? 'font-semibold text-slate-800' : current ? 'text-blue-600 font-bold' : 'text-slate-400'}>{step.label}</span></div>{done && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Done</span>}{current && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">In progress</span>}</div>; })}
    </div>
    {!error && <div className="space-y-2"><div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden"><div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} /></div><div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500"><span>{progress}%</span><span>{formatTimeSeconds(duration)}</span></div></div>}
    {complete ? <button onClick={onOpenProject} className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition">Open caption editor <ArrowRight className="w-4 h-4" /></button> : error ? <button onClick={onBack} className="px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition">Back to projects</button> : <p className="text-[11px] text-slate-400">Keep this page open until the transcription request finishes.</p>}
  </div>;
};
