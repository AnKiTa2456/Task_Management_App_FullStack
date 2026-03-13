/**
 * components/ui/Tooltip.tsx
 * WHERE USED: Avatar stacks, icon buttons, truncated text labels.
 */

import { useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface TooltipProps {
  content:   string;
  children:  ReactNode;
  side?:     'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const POSITION: Record<string, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full  left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full  top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md',
            'bg-slate-900 px-2 py-1 text-xs text-white shadow-lg',
            'animate-fade-in',
            POSITION[side],
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
