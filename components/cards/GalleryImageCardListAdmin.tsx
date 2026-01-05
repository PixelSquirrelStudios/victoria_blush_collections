import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { DeleteGalleryImage } from '../shared/ActionButtons/Delete';

interface Category {
  id: string;
  name: string;
}

interface GalleryImageCardListAdminProps {
  id: string;
  image_url: string;
  title: string;
  categories: Category[];
}

export default function GalleryImageCardListAdmin({
  id,
  image_url,
  title,
  categories,
}: GalleryImageCardListAdminProps) {
  return (
    <div className="group relative bg-bg-primary rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-border-default hover:border-interactive-active">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-4">
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
          <h3 className="text-lg font-bold text-text-primary mb-2 truncate">
            {title}
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant="default"
                className="text-xs"
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex gap-2">
          <Link href={`/dashboard/gallery-images/edit/${id}`}>
            <button
              className="p-2 rounded-lg bg-interactive-active/15 hover:bg-interactive-active/25 text-interactive-active-600 hover:text-interactive-active-700 transition-colors duration-300"
              aria-label="Edit gallery image"
            >
              <Pencil className="w-5 h-5" />
            </button>
          </Link>
          <DeleteGalleryImage imageId={id} variant="admin" />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden flex-col gap-3">
        {/* Image, Title and Categories */}
        <div className="flex gap-3">
          <div className="shrink-0 relative w-16 h-16 rounded overflow-hidden">
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-wrap text-lg font-bold text-text-primary mb-2 truncate">
              {title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="text-xs"
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <Link href={`/dashboard/gallery-images/edit/${id}`}>
            <button
              className="p-2 rounded-lg bg-interactive-active/15 hover:bg-interactive-active/25 text-interactive-active-600 hover:text-interactive-active-700 transition-colors duration-300"
              aria-label="Edit gallery image"
            >
              <Pencil className="w-5 h-5" />
            </button>
          </Link>
          <DeleteGalleryImage imageId={id} variant="admin" />
        </div>
      </div>
    </div>
  );
}
