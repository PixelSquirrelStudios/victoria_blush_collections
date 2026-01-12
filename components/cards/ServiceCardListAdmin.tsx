import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { DeleteService } from '../shared/ActionButtons/Delete';

interface Category {
  id: string;
  name: string;
}

interface ServiceCardListAdminProps {
  id: string;
  icon: string;
  title: string;
  price: string;
  categories: Category[];
  highlight?: boolean;
  onDelete?: (id: string) => void;
}

export default function ServiceCardListAdmin({
  id,
  icon,
  title,
  price,
  categories,
  highlight = false,
  onDelete,
}: ServiceCardListAdminProps) {
  return (
    <div className={`
      group relative bg-bg-primary rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300
      border ${highlight ? 'border-interactive-active' : 'border-border-default'} hover:border-interactive-active
    `}>
      {highlight && (
        <div className="absolute -top-2 -right-2">
          <span className="bg-interactive-active text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wide">
            Popular
          </span>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-4">
        {/* Icon */}
        <div className="shrink-0">
          <Image
            src={icon}
            alt={title}
            width={48}
            height={48}
            className="w-12 h-12 object-contain opacity-90"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-text-primary mb-2">
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

        {/* Price */}
        <div className="flex-shrink-0 text-right">
          <p className="text-2xl font-bold text-text-primary">
            {price}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex gap-2">
          <Link href={`/dashboard/services/edit/${id}`}>
            <button
              className="p-2 rounded-lg bg-interactive-active/15 hover:bg-interactive-active/25 text-interactive-active-600 hover:text-interactive-active-700 transition-colors duration-300"
              aria-label="Edit service"
            >
              <Pencil className="w-5 h-5" />
            </button>
          </Link>
          <DeleteService serviceId={id} variant="admin" onDelete={onDelete} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden flex-col gap-3">
        {/* Icon, Title and Categories */}
        <div className="flex gap-3">
          <div className="shrink-0">
            <Image
              src={icon}
              alt={title}
              width={48}
              height={48}
              className="w-12 h-12 object-contain opacity-90"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-text-primary mb-2">
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

        {/* Price and Action Buttons */}
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-text-primary">
            {price}
          </p>
          <div className="flex gap-2">
            <Link href={`/dashboard/services/edit/${id}`}>
              <button
                className="p-2 rounded-lg bg-interactive-active/15 hover:bg-interactive-active/25 text-interactive-active-600 hover:text-interactive-active-700 transition-colors duration-300"
                aria-label="Edit service"
              >
                <Pencil className="w-5 h-5" />
              </button>
            </Link>
            <DeleteService serviceId={id} variant="admin" onDelete={onDelete} />
          </div>
        </div>
      </div>
    </div>
  );
}
