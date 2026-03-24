import type { ConnectionStatus } from '../hooks/useWebRTC';

interface StatusIndicatorProps {
  status: ConnectionStatus;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'Disconnected':
        return { color: '#f87171', label: 'Offline' };
      case 'Connecting':
        return { color: '#facc15', label: 'Connecting' };
      case 'Connected':
        return { color: '#34d399', label: 'Connected' };
      case 'Transferring':
        return { color: 'var(--color-accent-blue)', label: 'Transferring' };
      case 'Complete':
        return { color: 'var(--color-accent-purple)', label: 'Complete' };
    }
  };

  const config = getStatusConfig();
  const isAnimating = status === 'Connecting' || status === 'Transferring';

  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-2.5 w-2.5">
        {isAnimating && (
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
            style={{ backgroundColor: config.color }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-2.5 w-2.5"
          style={{ backgroundColor: config.color }}
        />
      </span>
      <span
        className="text-xs font-semibold tracking-[0.2em] uppercase"
        style={{ color: config.color }}
      >
        {config.label}
      </span>
    </div>
  );
}
