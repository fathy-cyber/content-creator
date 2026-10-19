import React from 'react';
import { cn } from '@/lib/utils';

type ProgressBarProps = {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  colorAuto?: boolean;
  className?: string;
};

export const ProgressBar = ({ value, size = 'sm', showLabel = false, colorAuto = false, className }: ProgressBarProps) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  const getColor = () => {
    if (!colorAuto) return 'bg-blue-600';
    if (clampedValue >= 80) return 'bg-green-500';
    if (clampedValue >= 50) return 'bg-blue-500';
    if (clampedValue >= 20) return 'bg-yellow-500';
    return 'bg-slate-300';
  };

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full bg-slate-100 rounded-full overflow-hidden", heightClasses[size])}>
        <div 
          className={cn("h-full transition-all duration-500 ease-out", getColor())}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-500 mt-1 block text-right font-medium">
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
};
