import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:   string;
  error?:   string;
  leftIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className, id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900',
              'placeholder:text-slate-400 focus:outline-none focus:ring-2',
              'transition-colors duration-150 h-9',
              leftIcon && 'pl-9',
              error
                ? 'border-red-400 focus:ring-red-300'
                : 'border-slate-300 focus:ring-brand-400 focus:border-brand-400',
              className,
            )}
            {...rest}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
