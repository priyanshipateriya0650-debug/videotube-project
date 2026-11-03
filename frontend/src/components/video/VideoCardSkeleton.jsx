import React from 'react';

/**
 * Shimmer loading skeleton for video cards.
 * Matches VideoCard layout and dimensions with the light theme palette.
 */
export default function VideoCardSkeleton() {
  return (
    <div className="flex flex-col bg-[#F8FAFC] rounded-xl overflow-hidden border border-slate-200/80 animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="aspect-video w-full bg-slate-200/80" />

      {/* Info Skeleton */}
      <div className="p-3.5 flex gap-3">
        {/* Avatar Skeleton */}
        <div className="w-9 h-9 rounded-full bg-slate-200/80 flex-shrink-0" />

        {/* Text Lines */}
        <div className="flex-1 space-y-2">
          {/* Title line 1 */}
          <div className="h-3.5 bg-slate-200/80 rounded w-5/6" />
          {/* Title line 2 */}
          <div className="h-3 bg-slate-200/70 rounded w-3/5" />
          {/* Channel & views */}
          <div className="h-2.5 bg-slate-200/60 rounded w-2/5 mt-2" />
        </div>
      </div>
    </div>
  );
}
