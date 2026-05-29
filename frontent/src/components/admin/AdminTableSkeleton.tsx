interface AdminTableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function AdminTableSkeleton({ rows = 6, cols = 5 }: AdminTableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="animate-pulse divide-y divide-gray-100">
        <div className="flex gap-4 bg-gray-50 px-4 py-3">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 flex-1 rounded bg-gray-200" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex gap-4 px-4 py-4">
            {Array.from({ length: cols }).map((_, col) => (
              <div key={col} className="h-4 flex-1 rounded bg-gray-100" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
