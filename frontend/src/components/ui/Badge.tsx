import { cn } from '../../utils/cn';
import type { Priority, TaskStatus } from '../../types';

// ─── Generic Badge ────────────────────────────────────────────────────────────

interface BadgeProps {
  children:   React.ReactNode;
  color?:     'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  className?: string;
}

const colors = {
  gray:   'bg-slate-100 text-slate-600',
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-emerald-100 text-emerald-700',
  yellow: 'bg-amber-100 text-amber-700',
  red:    'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  indigo: 'bg-brand-100 text-brand-700',
};

export function Badge({ children, color = 'gray', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        colors[color],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────

const priorityMap: Record<Priority, { label: string; color: BadgeProps['color'] }> = {
  LOW:    { label: 'Low',    color: 'gray'   },
  MEDIUM: { label: 'Medium', color: 'blue'   },
  HIGH:   { label: 'High',   color: 'yellow' },
  URGENT: { label: 'Urgent', color: 'red'    },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, color } = priorityMap[priority];
  return <Badge color={color}>{label}</Badge>;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusMap: Record<TaskStatus, { label: string; color: BadgeProps['color'] }> = {
  TODO:        { label: 'To Do',       color: 'gray'   },
  IN_PROGRESS: { label: 'In Progress', color: 'blue'   },
  IN_REVIEW:   { label: 'In Review',   color: 'purple' },
  DONE:        { label: 'Done',        color: 'green'  },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const { label, color } = statusMap[status];
  return <Badge color={color}>{label}</Badge>;
}
