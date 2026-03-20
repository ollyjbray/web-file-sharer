import React, { useState } from 'react';
import { useWebRTC } from './hooks/useWebRTC';
import { DropZone } from './components/DropZone';
import { ProgressBar } from './components/ProgressBar';
import { StatusIndicator } from './components/StatusIndicator';
import { Share2 } from 'lucide-react';

function App() {
  const { status, progress, roomId, connect, sendFile, disconnect } = useWebRTC();
  const [joinId, setJoinId] = useState('');

  const handleShareClick = () => {
    connect();
  };

  const handleJoinClick = () => {
    if (joinId.trim()) {
      connect(joinId.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-[-10%] w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob pointer-events-none" />
      <div className="absolute top-0 right-[-10%] w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000 pointer-events-none" />

      <main className="w-full max-w-xl glass-panel rounded-[2rem] p-8 sm:p-10 z-10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"></div>

        <header className="flex flex-col items-center mb-10 relative z-10">
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl mb-5 border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <Share2 className="w-12 h-12 text-blue-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight mb-2">
            PeerShare
          </h1>
          <p className="text-slate-400 text-center text-sm sm:text-base font-light tracking-wide max-w-xs">
            Lightning fast, secure, peer-to-peer file sharing directly in your browser.
          </p>
        </header>

        <div className="flex justify-center mb-8">
          <StatusIndicator status={status} />
        </div>

        {status === 'Disconnected' && (
          <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center p-6 sm:p-8 glass-panel-light rounded-2xl">
              <button
                onClick={handleShareClick}
                className="group relative w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-lg rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Create a Transfer Room
                </span>
              </button>
              
              <div className="flex w-full items-center text-slate-500 my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                <span className="px-4 text-xs font-semibold tracking-widest text-slate-400 uppercase">or join</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
              </div>

              <div className="flex w-full space-x-3">
                <input
                  type="text"
                  placeholder="Enter Room Code"
                  className="flex-1 bg-black/20 border border-white/5 text-white px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder:text-slate-500 transition-all text-center tracking-widest font-mono text-lg"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinClick()}
                />
                <button
                  onClick={handleJoinClick}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all duration-200 border border-white/10 hover:border-white/20 uppercase tracking-wide text-sm"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}

        {(status !== 'Disconnected') && (
          <div className="space-y-6 relative z-10 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500">
            {roomId && (
              <div className="relative overflow-hidden text-center p-6 glass-panel-light rounded-2xl group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-50"></div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Your Room Code</p>
                <div className="inline-block bg-black/30 px-6 py-2 rounded-lg border border-white/5 shadow-inner">
                  <p className="text-3xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-[0.2em] font-bold select-all cursor-pointer">{roomId}</p>
                </div>
                {status === 'Connecting' && (
                  <p className="text-sm text-slate-400 mt-4 animate-pulse flex justify-center items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
                    Waiting for another peer...
                  </p>
                )}
              </div>
            )}

            <DropZone
              onFileSelect={sendFile}
              disabled={status !== 'Connected'}
            />

            {(progress > 0 || status === 'Transferring') && (
              <ProgressBar progress={progress} />
            )}

            <div className="flex justify-center mt-8">
              <button
                onClick={disconnect}
                className="group flex items-center gap-2 px-6 py-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
              >
                <span className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-red-500 transition-colors"></span>
                Disconnect & Leave Room
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
