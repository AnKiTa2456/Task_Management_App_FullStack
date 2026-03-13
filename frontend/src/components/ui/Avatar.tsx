import { cn } from '../../utils/cn';

interface AvatarProps {
  name:       string;
  src?:       string;
  size?:      'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
};

const colors = [
  'bg-purple-500', 'bg-blue-500', 'bg-green-500',
  'bg-pink-500',   'bg-amber-500', 'bg-indigo-500',
];

function getColor(name: string) {
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover', sizes[size], className)}
      />
    );
  }
  return (
    <span
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0',
        sizes[size],
        getColor(name),
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
