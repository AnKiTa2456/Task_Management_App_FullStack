import type { ReactNode } from 'react';
import Button from '../ui/Button';

interface EmptyStateProps {
  icon?:        ReactNode;
  title:        string;
  description?: string;
  action?:      { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          {icon}
        </div>
      )}
      <div>
        <p className="font-semibold text-slate-700">{title}</p>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
