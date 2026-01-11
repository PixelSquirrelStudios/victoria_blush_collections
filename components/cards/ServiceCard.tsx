import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { DeleteService } from '../shared/ActionButtons/Delete';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

interface ServiceCardProps {
  id: string;
  icon: string;
  title: string;
  description: string;
  price: string;
  categories: Category[];
  highlight?: boolean;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}

export default function ServiceCard({
  id,
  icon,
  title,
  description,
  price,
  categories,
  highlight = false,
  isAdmin = false,
  onDelete,
}: ServiceCardProps) {
  return (
    <div className={`
      group relative bg-bg-primary rounded-lg p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full 
      border-2 ${highlight ? 'border-interactive-active' : 'border-border-default'} hover:border-interactive-active
    `}>
      {highlight && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-interactive-active text-white text-xs font-bold px-4 py-1 rounded uppercase tracking-wide">
            Popular
          </span>
        </div>
      )}

      <div className="flex flex-col items-center text-center space-y-4 h-full">
        {/* Icon */}
        <div className='p-2'>
          <Image
            src={icon}
            alt={title}
            width={96}
            height={96}
            className={`w-24 h-24 object-contain ${highlight ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'
              }`}
          />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-text-primary">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-text-body leading-relaxed min-h-12 px-10 flex-1">
          {description}
        </p>

        {/* Categories */}
        {isAdmin && categories && categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cs: any) => cs.categories).filter(Boolean).map((category: any) => (
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

        {/* Price - Always at bottom */}
        <div className="pt-4 border-t border-border-default w-full mt-auto">
          <p className="text-2xl font-bold text-text-primary">
            {price}
          </p>
        </div>

        {/* Admin Action Buttons */}
        {isAdmin && (
          <div className="flex flex-row gap-2 w-full justify-center pt-2">
            <div className='w-full'>

              <Link href={`/dashboard/services/edit/${id}`}>
                <button
                  className="w-full flex-1 p-2 rounded-lg bg-interactive-active/15 hover:bg-interactive-active/25 text-interactive-active hover:text-interactive-active-700 transition-colors duration-300 flex items-center justify-center gap-2"
                  aria-label="Edit service"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
              </Link>
            </div>
            <div className='w-full'>
              <DeleteService serviceId={id} variant="large" onDelete={onDelete} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
