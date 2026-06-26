export function LoadingSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col h-full animate-pulse">
      <div className="aspect-square w-full mb-4 rounded-xl bg-border"></div>
      <div className="w-24 h-6 bg-border rounded-full mb-2"></div>
      <div className="w-full h-6 bg-border rounded mb-2"></div>
      <div className="w-2/3 h-6 bg-border rounded mb-3"></div>
      <div className="flex gap-1 mb-3">
        <div className="w-12 h-4 bg-border rounded"></div>
        <div className="w-16 h-4 bg-border rounded"></div>
      </div>
      <div className="mt-auto pt-4 border-t border-border">
        <div className="w-20 h-8 bg-border rounded mb-3"></div>
        <div className="w-full h-10 bg-border rounded-lg"></div>
      </div>
    </div>
  );
}
