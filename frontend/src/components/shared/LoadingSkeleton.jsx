const LoadingSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`animate-pulse space-y-3 ${className}`}>
    {Array.from({ length: lines }, (_, i) => (
      <div key={i} className={`h-4 bg-gray-700/50 rounded ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
    ))}
  </div>
);

export const CardSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl border border-gray-800 bg-gray-900/50 p-6 space-y-4 ${className}`}>
    <div className="h-5 bg-gray-700/50 rounded w-2/3" />
    <div className="space-y-2">
      <div className="h-3 bg-gray-700/50 rounded w-full" />
      <div className="h-3 bg-gray-700/50 rounded w-5/6" />
      <div className="h-3 bg-gray-700/50 rounded w-4/6" />
    </div>
    <div className="flex gap-2">
      <div className="h-6 w-16 bg-gray-700/50 rounded-full" />
      <div className="h-6 w-20 bg-gray-700/50 rounded-full" />
    </div>
  </div>
);

export default LoadingSkeleton;
