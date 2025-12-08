'use client';
import { useEffect, useState } from 'react';

export default function LoadingOverlay() {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);

  // Animate progress bar
  useEffect(() => {
    let frame: number | undefined;
    if (show && progress < 100) {
      frame = window.setTimeout(() => {
        setProgress((p) => Math.min(p + Math.random() * 8 + 2, 100));
      }, 30);
    }
    return () => {
      if (frame) clearTimeout(frame);
    };
  }, [progress, show]);

  // Hide after progress completes
  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(t);
    }
  }, [progress]);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[99999] flex items-center justify-center"
    >
      {/* Soft, elegant gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-50 via-rose-50 to-white dark:from-neutral-900 dark:via-neutral-900/90 dark:to-black" />

      {/* Subtle vignette and blur for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/5 backdrop-blur-[1px]" />

      {/* Content */}
      <div className="relative mx-6 flex w-full max-w-sm flex-col items-center rounded-2xl border border-white/40 bg-white/60 p-6 shadow-lg shadow-rose-200/30 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:shadow-black/30">
        <div className="text-center">
          <p className="text-sm tracking-wide text-neutral-700 dark:text-neutral-200">
            Preparing your experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-800"
            aria-label="Loading progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-right text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
}