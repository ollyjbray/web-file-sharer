import React from 'react';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const rounded = Math.round(progress);

  return (
    <div className="w-full mt-8 bg-black/20 p-5 rounded-2xl border border-white/5 shadow-inner relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
      <div className="flex justify-between items-end text-sm mb-3 relative z-10">
        <span className="text-slate-400 font-medium tracking-wider uppercase text-xs">Transfer Progress</span>
        <span className="text-blue-400 font-bold font-mono text-lg">{rounded}%</span>
      </div>
      <div className="w-full bg-slate-900/80 h-4 rounded-full overflow-hidden p-[2px] border border-white/5 relative z-10">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.8)] relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
