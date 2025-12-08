import { Icon } from 'lucide-react';
import Image from 'next/image';

interface PriceListCardProps {
  icon: string;
  title: string;
  description: string;
  price: string;
  highlight?: boolean;
}

export default function PriceListCard({
  icon,
  title,
  description,
  price,
  highlight = false
}: PriceListCardProps) {
  return (
    <div className={`
      group relative bg-bg-primary rounded-lg p-6 shadow-sm hover:shadow-xl transition-all duration-300
      border-2 ${highlight ? 'border-brand-secondary-hover' : 'border-border-default'} hover:border-brand-secondary-hover
    `}>
      {highlight && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-rose-400 text-white text-xs font-bold px-4 py-1 rounded uppercase tracking-wide">
            Popular
          </span>
        </div>
      )}

      <div className="flex flex-col items-center text-center space-y-4">
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
        <p className="text-sm text-text-body leading-relaxed min-h-12 px-10">
          {description}
        </p>

        {/* Price */}
        <div className="pt-4 border-t border-border-default w-full">
          <p className="text-2xl font-bold text-text-primary">
            {price}
          </p>
        </div>
      </div>
    </div>
  );
}
