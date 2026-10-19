import React from 'react';
import { cn } from "../../lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  if (!open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" 
        onClick={() => onOpenChange(false)} 
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-sm bg-white shadow-xl animate-in slide-in-from-right duration-300">
        {children}
      </div>
    </>
  );
}

export function SheetContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("h-full flex flex-col", className)}>
      {children}
    </div>
  );
}

export function SheetHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("p-6 flex flex-col gap-2", className)}>
      {children}
    </div>
  );
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  );
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-zinc-500", className)} {...props} />
  );
}

export function SheetTrigger({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer">
      {children}
    </div>
  );
}
