'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type LogoProps = {
  className?: string;
  lightSrc?: string;
  darkSrc?: string;
  alt?: string;
  // Fixed sizing (intrinsic)
  width?: number;
  height?: number;
  // Responsive sizing (for intrinsic width/height)
  sizes?: string;
  // Fill mode: make the image fill a relatively positioned parent
  fill?: boolean;
  // Object fit
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;

  /**
   * Explicitly choose which logo variant to render.
   * Use 'light' or 'dark' to force that version, independent of any theme.
   */
  variant?: 'light' | 'dark';

  /**
   * Deprecated: kept for backward compatibility.
   * If provided, it behaves the same as variant.
   */
  forceTheme?: 'light' | 'dark';
};

export function Logo({
  className,
  lightSrc = '/assets/images/Logo_Light.png',
  darkSrc = '/assets/images/Logo_Dark.png',
  alt = 'Logo',
  width = 280,
  height = 40,
  sizes,
  fill = false,
  objectFit = 'contain',
  priority = true,
  variant, // new
  forceTheme, // deprecated alias
}: LogoProps) {
  // We no longer depend on next-themes; we simply respect variant/forceTheme
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Resolve which logo to show
  const choice = variant ?? forceTheme ?? 'light';
  const src = choice === 'dark' ? darkSrc : lightSrc;

  // Avoid hydration mismatch by delaying until mount when using fill layout
  if (!mounted) {
    if (fill) {
      return (
        <div
          className={className}
          style={{ position: 'relative' }}
          aria-hidden
        />
      );
    }
    return (
      <div
        className={className}
        style={{ width, height }}
        aria-hidden
      />
    );
  }

  if (fill) {
    // Parent must set size (e.g., className="relative h-12 w-40")
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={className ? `${className} object-${objectFit}` : `object-${objectFit}`}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
      style={{ objectFit }}
    />
  );
}