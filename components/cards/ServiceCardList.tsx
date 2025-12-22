import Image from 'next/image';

interface ServiceCardListProps {
  icon: string;
  title: string;
  description: string;
  price: string;
  highlight?: boolean;
}

export default function ServiceCardList({
  icon,
  title,
  description,
  price,
  highlight = false
}: ServiceCardListProps) {
  return (
    <div className={`
      group relative bg-bg-primary rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300
      border ${highlight ? 'border-interactive-active' : 'border-border-default'} hover:border-interactive-active
      flex items-center gap-4
    `}>
      {highlight && (
        <div className="absolute -top-2 -right-2">
          <span className="bg-interactive-active text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wide">
            Popular
          </span>
        </div>
      )}

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
        <h3 className="text-lg font-bold text-text-primary mb-1">
          {title}
        </h3>
        <p className="text-sm text-text-body">
          {description}
        </p>
      </div>

      {/* Price */}
      <div className="flex-shrink-0 text-right">
        <p className="text-2xl font-bold text-text-primary">
          {price}
        </p>
      </div>
    </div>
  );
}
