/**
 * components/ui/Textarea.tsx
 * WHERE USED: Task description field, comment composer.
 */

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <textarea
        ref={ref}
        rows={3}
        className={cn(
          'w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm',
          'text-slate-900 outline-none transition placeholder:text-slate-400',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          'disabled:cursor-not-allowed disabled:bg-slate-50',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  ),
);

Textarea.displayName = 'Textarea';
