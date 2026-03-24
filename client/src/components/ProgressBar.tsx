interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const rounded = Math.round(progress);

  return (
    <div className="w-full">
      {/* Label row */}
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-xs text-[var(--color-text-muted)] font-semibold tracking-[0.2em] uppercase">
          Transferring
        </span>
        <span className="text-sm font-mono font-bold text-white tabular-nums">
          {rounded}%
        </span>
      </div>

      {/* Track */}
      <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden border border-white/[0.04]">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--color-accent-blue), var(--color-accent-purple))',
          }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
