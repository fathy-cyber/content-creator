import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "../../lib/utils"

export function DropdownMenu({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  const handleOpenChange = (val: boolean) => {
    if (val && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX
      });
    }
    if (onOpenChange) onOpenChange(val);
    setIsOpen(val);
  };

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleOpenChange(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        contentRef.current && !contentRef.current.contains(target)
      ) {
        handleOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const childrenArray = React.Children.toArray(children);
  const trigger = childrenArray.find(child => 
    React.isValidElement(child) && child.type === DropdownMenuTrigger
  );
  const content = childrenArray.find(child => 
    React.isValidElement(child) && child.type === DropdownMenuContent
  );

  return (
    <div className="relative inline-block text-left">
      {trigger && React.cloneElement(trigger as React.ReactElement<any>, { 
        ref: triggerRef,
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          if (trigger.props.onClick) trigger.props.onClick(e);
          handleOpenChange(!isOpen);
        } 
      })}
      {isOpen && content && createPortal(
        <div 
          ref={contentRef}
          className="fixed mt-2 w-48 origin-top-right rounded-md border border-zinc-200 bg-white shadow-lg z-[100] py-1"
          style={{ 
            top: position.top, 
            left: position.left,
            transform: 'translateX(-100%)' 
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  );
}

export function DropdownMenuTrigger({ children, ...props }: any) {
  return <div {...props} className="inline-block">{children}</div>;
}

export function DropdownMenuContent({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col">{children}</div>;
}

export function DropdownMenuItem({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 cursor-pointer transition-colors", className)} 
      {...props}
    >
      {children}
    </div>
  );
}
