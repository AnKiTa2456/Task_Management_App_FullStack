import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import Spinner from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?:    'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?:    React.ReactNode;
}

const variants = {
  primary:   'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400',
  ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  outline:   'border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400',
};

const sizes = {
  sm:  'text-xs px-3 py-1.5 h-7',
  md:  'text-sm px-4 py-2 h-9',
  lg:  'text-sm px-5 py-2.5 h-11',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors duration-150',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
export default Button;
