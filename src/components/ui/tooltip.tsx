import * as React from "react"
import { cn } from "../../lib/utils"

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <div className="tooltip-provider">{children}</div>;
}

export function Tooltip({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const handleOpenChange = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    setIsOpen(val);
  };

  return (
    <div className="relative inline-block" 
         onMouseEnter={() => handleOpenChange(true)} 
         onMouseLeave={() => handleOpenChange(false)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { 
            onMouseEnter: () => handleOpenChange(true),
            onMouseLeave: () => handleOpenChange(false)
          });
        }
        return child;
      })}
      {isOpen && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50">
          {React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type === TooltipContent) {
              return child;
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

export function TooltipTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function TooltipContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-zinc-900 text-zinc-50 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap", className)}>
      {children}
    </div>
  );
}
