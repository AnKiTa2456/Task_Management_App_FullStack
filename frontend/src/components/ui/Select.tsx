/**
 * components/ui/Select.tsx
 * WHERE USED: Priority filter, status selector, role picker in forms.
 */

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:   string;
  error?:   string;
  options:  { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm',
          'text-slate-900 outline-none transition',
          'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/20',
          className,
        )}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  ),
);

Select.displayName = 'Select';
