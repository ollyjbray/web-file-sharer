
import type { ConnectionStatus } from '../hooks/useWebRTC';
import { CheckCircle2, AlertCircle, Wifi, Loader2 } from 'lucide-react';

interface StatusIndicatorProps {
  status: ConnectionStatus;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'Disconnected':
        return { icon: <AlertCircle className="w-4 h-4" strokeWidth={2.5} />, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'shadow-[0_0_15px_rgba(248,113,113,0.15)]' };
      case 'Connecting':
        return { icon: <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.15)]' };
      case 'Connected':
        return { icon: <Wifi className="w-4 h-4" strokeWidth={2.5} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.15)]' };
      case 'Transferring':
        return { icon: <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]' };
      case 'Complete':
        return { icon: <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]' };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center space-x-2.5 px-5 py-2 rounded-full ${config.bg} ${config.color} border ${config.border} ${config.glow} transition-colors duration-300 backdrop-blur-md`}>
      <span className="relative flex h-3 w-3 items-center justify-center mr-1">
        {(status === 'Connecting' || status === 'Transferring') ? (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-40"></span>
        ) : null}
        <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
      </span>
      {config.icon}
      <span className="font-semibold text-sm tracking-wide uppercase">{status}</span>
    </div>
  );
}
