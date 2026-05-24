export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
  return (
    <div className="flex items-center justify-center">
      <div className={${s} animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600} />
    </div>
  );
}
