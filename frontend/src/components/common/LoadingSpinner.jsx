const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} rounded-full border-2 border-surface-700 border-t-brand-500 animate-spin`}
      />
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-surface-700 border-t-brand-500 animate-spin" />
      <p className="text-white/40 text-sm">Loading…</p>
    </div>
  </div>
);

export const PostSkeleton = () => (
  <div className="card p-4 space-y-3">
    <div className="flex items-center gap-3">
      <div className="skeleton w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-32 rounded" />
        <div className="skeleton h-2 w-20 rounded" />
      </div>
    </div>
    <div className="skeleton h-4 w-full rounded" />
    <div className="skeleton h-4 w-3/4 rounded" />
    <div className="skeleton h-48 w-full rounded-xl" />
  </div>
);

export default LoadingSpinner;
