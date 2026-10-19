import React from 'react';
import { cn } from '@/lib/utils';
import { TaskPriority } from '@/types/project.types';

type PriorityBadgeProps = {
  priority: TaskPriority;
  className?: string;
};

const priorityConfig: Record<TaskPriority, { color: string; label: string }> = {
  low: { color: 'bg-blue-100 text-blue-700', label: 'Low' },
  medium: { color: 'bg-green-100 text-green-700', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-700', label: 'High' },
  critical: { color: 'bg-red-100 text-red-700', label: 'Critical' },
};

export const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
  const config = priorityConfig[priority] || priorityConfig['low'];
  
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
      config.color,
      className
    )}>
      {config.label}
    </span>
  );
};
