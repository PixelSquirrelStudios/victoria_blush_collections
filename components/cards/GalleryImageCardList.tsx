import Image from 'next/image';

interface GalleryImageCardListProps {
  image_url: string;
  title: string;
  description: string;
}

export default function GalleryImageCardList({
  image_url,
  title,
  description
}: GalleryImageCardListProps) {
  return (
    <div className="group relative bg-bg-primary rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border-default hover:border-interactive-active flex items-center gap-4">
      {/* Image Thumbnail */}
      <div className="shrink-0 relative w-16 h-16 rounded overflow-hidden">
        <Image
          src={image_url}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-text-primary mb-1 truncate">
          {title}
        </h3>
        <p className="text-sm text-text-body line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
}
