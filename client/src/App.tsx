import { useState, useEffect, useRef } from 'react';
import { useWebRTC } from './hooks/useWebRTC';
import { DropZone } from './components/DropZone';
import { ProgressBar } from './components/ProgressBar';
import { StatusIndicator } from './components/StatusIndicator';
import { ArrowRight, Copy, Check, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

function App() {
  const { status, progress, roomId, connect, sendFile, disconnect } = useWebRTC();
  const [joinId, setJoinId] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(true);
  const autoJoinedRef = useRef(false);

  // Auto-join from URL param (e.g. ?room=abc123 from QR scan)
  useEffect(() => {
    if (autoJoinedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      autoJoinedRef.current = true;
      // Clean the URL so refreshing doesn't re-join
      window.history.replaceState({}, '', window.location.pathname);
      connect(roomParam);
    }
  }, [connect]);

  const handleShareClick = () => {
    connect();
  };

  const handleJoinClick = () => {
    if (joinId.trim()) {
      connect(joinId.trim());
    }
  };

  const handleCopyCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="split-viewport">

      {/* ─── Left: Hero Panel ─────────────────────────────── */}
      <div className="hero-panel gradient-mesh">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="relative z-10 flex flex-col gap-8">
          {/* Branding */}
          <div className="animate-fade-up">
            <p className="text-sm font-semibold tracking-[0.3em] uppercase text-[var(--color-accent-cyan)] mb-4">
              Peer-to-Peer
            </p>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/50">
                Peer
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent-blue)] via-[var(--color-accent-purple)] to-[var(--color-accent-pink)]">
                Share
              </span>
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-[var(--color-text-muted)] text-base sm:text-lg max-w-xs leading-relaxed animate-fade-up animate-delay-100">
            Encrypted file transfers directly between browsers.
          </p>

          {/* Status pill */}
          <div className="animate-fade-up animate-delay-200">
            <StatusIndicator status={status} />
          </div>

          {/* Decorative info */}
          <div className="mt-auto pt-12 animate-fade-up animate-delay-300">
            <div className="flex gap-8 text-xs text-[var(--color-text-muted)] tracking-widest uppercase">
              <span>WebRTC</span>
              <span>·</span>
              <span>E2E Encrypted</span>
              <span>·</span>
              <span>No File Limit</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right: Action Panel ──────────────────────────── */}
      <div className="action-panel">
        <div className="panel-divider" />

        {/* Disconnect button — top-right corner */}
        {status !== 'Disconnected' && (
          <button
            onClick={disconnect}
            className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:text-red-400 rounded-full border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 transition-all duration-300 tracking-widest uppercase"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Leave
          </button>
        )}

        <div className="relative z-10 flex flex-col gap-8 max-w-lg mx-auto w-full">

          {/* ─── Disconnected state ────────────────────────── */}
          {status === 'Disconnected' && (
            <div className="flex flex-col gap-8">
              {/* Section heading */}
              <div className="animate-fade-up">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
                  Start sharing
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Create a room or join an existing one with a code.
                </p>
              </div>

              {/* Create room button */}
              <button
                onClick={handleShareClick}
                className="group relative w-full py-5 px-8 rounded-2xl font-medium text-lg text-white transition-all duration-300 overflow-hidden animate-fade-up animate-delay-100 gradient-border"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-purple))',
                }}
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Create a Room
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 animate-fade-up animate-delay-200">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="text-[10px] font-semibold tracking-[0.25em] text-[var(--color-text-muted)] uppercase">
                  or join
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {/* Join room */}
              <div className="flex gap-3 animate-fade-up animate-delay-300">
                <input
                  type="text"
                  placeholder="Room code"
                  className="flex-1 min-w-0 bg-white/[0.03] border border-white/[0.06] text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-purple)]/40 focus:border-[var(--color-accent-purple)]/40 placeholder:text-[var(--color-text-muted)] transition-all text-center tracking-[0.15em] font-mono text-lg"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinClick()}
                />
                <button
                  onClick={handleJoinClick}
                  className="px-6 py-4 bg-white/[0.04] hover:bg-white/[0.08] text-white font-medium rounded-xl transition-all duration-200 border border-white/[0.06] hover:border-white/[0.12] text-sm tracking-widest uppercase"
                >
                  Join
                </button>
              </div>
            </div>
          )}

          {/* ─── Connected / Connecting / Transferring ─────── */}
          {status !== 'Disconnected' && (
            <div className="flex flex-col gap-8">

              {/* Room code display */}
              {roomId && (
                <div className="animate-fade-up">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-[0.2em] font-semibold">
                      Room Code
                    </p>
                    <button
                      onClick={() => setShowQR(!showQR)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wider uppercase transition-all duration-200 border ${
                        showQR
                          ? 'text-[var(--color-accent-cyan)] border-[var(--color-accent-cyan)]/20 bg-[var(--color-accent-cyan)]/5'
                          : 'text-[var(--color-text-muted)] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      QR
                    </button>
                  </div>

                  <div
                    onClick={handleCopyCode}
                    className="group surface-card flex items-center justify-between px-6 py-5 cursor-pointer hover:border-white/10 transition-all duration-300"
                  >
                    <span className="text-3xl sm:text-4xl font-mono font-bold tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)]">
                      {roomId}
                    </span>
                    <span className="text-[var(--color-text-muted)] group-hover:text-white transition-colors">
                      {copied ? (
                        <Check className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </span>
                  </div>

                  {/* QR Code */}
                  {showQR && (
                    <div className="mt-4 surface-card p-6 flex flex-col items-center gap-4 animate-fade-up">
                      <div className="bg-white p-3 rounded-xl">
                        <QRCodeSVG
                          value={`${window.location.origin}${window.location.pathname}?room=${roomId}`}
                          size={160}
                          bgColor="#ffffff"
                          fgColor="#050510"
                          level="M"
                        />
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] tracking-wider">
                        Scan to join this room
                      </p>
                    </div>
                  )}

                  {status === 'Connecting' && (
                    <div className="flex items-center gap-3 mt-4 text-sm text-[var(--color-text-muted)]">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-cyan)] opacity-60" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent-cyan)]" />
                      </span>
                      Waiting for peer to connect…
                    </div>
                  )}
                </div>
              )}

              {/* Drop zone */}
              <div className="animate-fade-up animate-delay-100">
                <DropZone
                  onFileSelect={sendFile}
                  disabled={status !== 'Connected'}
                />
              </div>

              {/* Progress */}
              {(progress > 0 || status === 'Transferring') && (
                <div className="animate-fade-up animate-delay-200">
                  <ProgressBar progress={progress} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
