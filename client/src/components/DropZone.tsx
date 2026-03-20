import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

export function DropZone({ onFileSelect, disabled }: DropZoneProps) {
  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    },
    [onFileSelect, disabled]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden group
        ${
          disabled
            ? 'opacity-50 cursor-not-allowed border-white/5 bg-black/20'
            : 'cursor-pointer border-blue-400/30 hover:border-blue-400/60 bg-white/5 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]'
        }
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      <input
        type="file"
        id="fileInput"
        className="hidden"
        onChange={onChange}
        disabled={disabled}
      />
      <label
        htmlFor="fileInput"
        className={`flex flex-col items-center relative z-10 ${disabled ? '' : 'cursor-pointer'}`}
      >
        <div className={`p-4 rounded-full mb-6 transition-transform duration-300 ${disabled ? 'bg-white/5' : 'bg-blue-500/10 group-hover:scale-110 group-hover:bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]'}`}>
          <UploadCloud className={`w-12 h-12 ${disabled ? 'text-slate-500' : 'text-blue-400'}`} strokeWidth={1.5} />
        </div>
        <p className="text-white font-medium text-xl text-center tracking-wide">
          {disabled ? 'Transfer in Progress' : 'Drag & Drop your file'}
        </p>
        {!disabled && (
          <p className="text-blue-300/80 text-sm mt-3 font-light tracking-wider uppercase">or click to browse</p>
        )}
      </label>
    </div>
  );
}
