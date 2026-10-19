import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

type KpiCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  borderColor: string;
  valueColor?: string;
  icon?: LucideIcon;
  className?: string;
};

export const KpiCard = ({ label, value, sub, borderColor, valueColor = 'text-slate-900', icon: Icon, className }: KpiCardProps) => {
  return (
    <div className={cn(
      "bg-white p-4 rounded-lg border border-slate-200 border-l-4 shadow-sm",
      borderColor,
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      </div>
      <div className={cn("text-2xl font-bold", valueColor)}>
        {value}
      </div>
      {sub && (
        <div className="text-xs text-slate-400 mt-1">{sub}</div>
      )}
    </div>
  );
};
