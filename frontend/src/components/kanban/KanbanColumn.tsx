import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';
import TaskCard from './TaskCard';
import type { Column } from '../../types';

interface KanbanColumnProps {
  column:     Column;
  onAddTask?: (columnId: string) => void;
}

const COLUMN_HEADER_COLORS: Record<string, string> = {
  TODO:        'bg-slate-400',
  IN_PROGRESS: 'bg-blue-500',
  IN_REVIEW:   'bg-amber-500',
  DONE:        'bg-emerald-500',
};

export default function KanbanColumn({ column, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const colorKey = column.name.toUpperCase().replace(' ', '_');
  const dotColor = COLUMN_HEADER_COLORS[colorKey] ?? 'bg-slate-400';

  return (
    <div className={cn('kanban-column', isOver && 'ring-2 ring-brand-400 ring-inset')}>
      {/* Column header */}
      <div className="flex items-center justify-between px-1 mb-1">
        <div className="flex items-center gap-2">
          <span className={cn('w-2.5 h-2.5 rounded-full', dotColor)} />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{column.name}</h3>
          <span className="text-xs text-slate-400 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 rounded-md px-1.5 py-0.5 font-medium">
            {column.tasks.length}
          </span>
        </div>
        <button className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <MoreHorizontal size={15} />
        </button>
      </div>

      {/* Droppable task list */}
      <SortableContext items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex flex-col gap-2 flex-1 min-h-[80px] rounded-lg p-1 transition-colors',
            isOver && 'bg-brand-50 dark:bg-brand-900/20',
          )}
        >
          {column.tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>

      {/* Add task button */}
      <button
        onClick={() => onAddTask?.(column.id)}
        className={cn(
          'flex items-center gap-1.5 w-full px-2 py-1.5 mt-1 rounded-lg',
          'text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200',
          'transition-colors font-medium',
        )}
      >
        <Plus size={14} />
        Add task
      </button>
    </div>
  );
}
