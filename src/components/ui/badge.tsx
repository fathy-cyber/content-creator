import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps {
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  children?: React.ReactNode;
}

function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          'border-transparent bg-zinc-900 text-zinc-50': variant === 'default',
          'border-transparent bg-zinc-100 text-zinc-900': variant === 'secondary',
          'border-zinc-200 bg-transparent text-zinc-900': variant === 'outline',
          'border-transparent bg-rose-600 text-zinc-50': variant === 'destructive',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge }
