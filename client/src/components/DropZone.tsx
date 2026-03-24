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
      className={`relative rounded-2xl p-12 flex flex-col items-center justify-center transition-all duration-500 group overflow-hidden
        ${
          disabled
            ? 'opacity-40 cursor-not-allowed border border-white/[0.04] bg-white/[0.01]'
            : 'cursor-pointer gradient-border hover:shadow-[0_0_40px_rgba(79,125,247,0.08)]'
        }
      `}
    >
      {/* Hover glow layer */}
      {!disabled && (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-blue)]/[0.04] via-transparent to-[var(--color-accent-purple)]/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}

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
        <div
          className={`p-5 rounded-2xl mb-6 transition-all duration-500
            ${disabled
              ? 'bg-white/[0.03]'
              : 'bg-[var(--color-accent-blue)]/[0.08] group-hover:bg-[var(--color-accent-blue)]/[0.15] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(79,125,247,0.15)]'
            }`}
        >
          <UploadCloud
            className={`w-10 h-10 transition-colors duration-300 ${
              disabled ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-accent-blue)] group-hover:text-white'
            }`}
            strokeWidth={1.5}
          />
        </div>

        <p className="text-white/90 font-medium text-lg tracking-wide">
          {disabled ? 'Waiting for connection…' : 'Drag & drop your file'}
        </p>

        {!disabled && (
          <p className="text-[var(--color-text-muted)] text-xs mt-3 tracking-[0.2em] uppercase font-medium">
            or click to browse
          </p>
        )}
      </label>
    </div>
  );
}
