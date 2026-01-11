import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { DeleteGalleryImage } from '../shared/ActionButtons/Delete';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

interface GalleryImageCardProps {
  id: string;
  image_url: string;
  title: string;
  description: string;
  categories: Category[];
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}

export default function GalleryImageCard({
  id,
  image_url,
  title,
  description,
  categories,
  isAdmin = false,
  onDelete,
}: GalleryImageCardProps) {
  return (
    <div className="group relative bg-bg-primary rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 h-full border-2 border-border-default hover:border-interactive-active overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Image */}
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src={image_url}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col space-y-4 flex-1">
          {/* Title */}
          <h3 className="text-xl font-bold text-text-primary line-clamp-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-text-body leading-relaxed line-clamp-3 flex-1">
            {description}
          </p>

          {/* Categories */}
          {isAdmin && categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category: any) => (
                <Badge
                  key={category.id}
                  variant="default"
                  className="text-xs"
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Admin Action Buttons */}
          {isAdmin && (
            <div className="flex flex-row gap-2 w-full justify-center pt-2 border-t border-border-default">
              <div className='w-full'>
                <Link href={`/dashboard/gallery-images/edit/${id}`}>
                  <button
                    className="w-full flex-1 p-2 rounded-lg bg-interactive-active/15 hover:bg-interactive-active/25 text-interactive-active hover:text-interactive-active-700 transition-colors duration-300 flex items-center justify-center gap-2"
                    aria-label="Edit gallery image"
                  >
                    <Pencil className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                </Link>
              </div>
              <div className='w-full'>
                <DeleteGalleryImage imageId={id} variant="large" onDelete={onDelete} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
