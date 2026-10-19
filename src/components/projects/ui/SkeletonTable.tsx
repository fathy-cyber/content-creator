import React from 'react';
import { cn } from '@/lib/utils';

type SkeletonTableProps = {
  rows: number;
  cols: number;
  className?: string;
};

export const SkeletonTable = ({ rows, cols, className }: SkeletonTableProps) => {
  return (
    <div className={cn("w-full space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 border-b border-slate-100">
          {Array.from({ length: cols }).map((_, j) => (
            <div 
              key={j} 
              className={cn(
                "h-4 bg-slate-100 animate-pulse rounded",
                j === 0 ? "w-1/4" : "w-1/6"
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  );
};
