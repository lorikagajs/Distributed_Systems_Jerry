export function ProductCardSkeleton() {
  return (
    <div
      className="flex animate-pulse flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      aria-hidden
    >
      <div className="aspect-square bg-gray-200" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        <div className="mt-2 h-10 w-full rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}
