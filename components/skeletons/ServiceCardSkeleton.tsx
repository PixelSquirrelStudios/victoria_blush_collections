export default function ServiceCardSkeleton() {
  return (
    <div className="group relative bg-bg-primary rounded-lg p-6 shadow-sm h-full border-2 border-border-default animate-pulse">
      <div className="flex flex-col items-center text-center space-y-4 h-full">
        {/* Icon Skeleton */}
        <div className="p-2">
          <div className="w-24 h-24 bg-bg-muted rounded-md" />
        </div>

        {/* Title Skeleton */}
        <div className="w-3/4 h-6 bg-bg-muted rounded" />

        {/* Description Skeleton */}
        <div className="space-y-2 min-h-12 px-10 flex-1 w-full">
          <div className="w-full h-4 bg-bg-muted rounded" />
          <div className="w-5/6 h-4 bg-bg-muted rounded mx-auto" />
        </div>

        {/* Price Skeleton - Always at bottom */}
        <div className="pt-4 border-t border-border-default w-full mt-auto">
          <div className="w-24 h-8 bg-bg-muted rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}
