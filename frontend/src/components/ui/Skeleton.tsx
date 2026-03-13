/**
 * components/ui/Skeleton.tsx
 * WHERE USED: Loading state placeholders for cards, rows, and panels.
 * Replaces spinners when the shape of the incoming content is known.
 */

import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200 dark:bg-slate-700',
        className,
      )}
    />
  );
}

// ── Compound variants for common shapes ───────────────────────────────────────

Skeleton.Text = function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
};

Skeleton.Card = function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-card">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton.Text lines={2} />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
};

Skeleton.Avatar = function SkeletonAvatar({ size = 8 }: { size?: number }) {
  return <Skeleton className={`h-${size} w-${size} rounded-full`} />;
};
