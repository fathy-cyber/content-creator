import React from 'react';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  status: string;
  type: 'project' | 'task' | 'milestone' | 'timesheet' | 'billing' | 'payment';
  className?: string;
};

const statusConfig: Record<string, { color: string; dot: string }> = {
  // Project
  active: { color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  archived: { color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
  completed: { color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  
  // Task / General
  todo: { color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
  in_progress: { color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  review: { color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  done: { color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  
  // Milestone
  pending: { color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
  cancelled: { color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  
  // Timesheet
  draft: { color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
  submitted: { color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  approved: { color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  rejected: { color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  
  // Billing/Payment
  not_started: { color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
  billed: { color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  paid: { color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  overdue: { color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  partial: { color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig['todo'];
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      config.color,
      className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", config.dot)} />
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
};
