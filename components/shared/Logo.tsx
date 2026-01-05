import Image from 'next/image';

type LogoProps = {
  className?: string;
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
  // Keep priority, default to true to avoid lazy loading
};

export function Logo({
  className,
  alt = 'Logo',
  width = 280,
  height = 40,
  sizes,
  fill = false,
  objectFit = 'contain',
}: LogoProps) {
  const src = '/assets/images/Logo_Light.png';

  if (fill) {
    // Parent must set size (e.g., className="relative h-12 w-40")
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority
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
      priority
      className={className}
      style={{ objectFit, width: 'auto', height: 'auto' }}
    />
  );
}