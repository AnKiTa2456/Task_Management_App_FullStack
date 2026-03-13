import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';
import { PriorityBadge } from '../ui/Badge';
import Avatar from '../ui/Avatar';
import type { Task } from '../../types';
import { formatDate, isOverdue } from '../../utils/formatDate';
import { useAppDispatch } from '../../app/hooks';
import { setSelectedTask } from '../../features/tasks/tasksSlice';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const dispatch = useAppDispatch();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.4 : 1,
  };

  const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== 'DONE';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'task-card group',
        isDragging && 'ring-2 ring-brand-400 ring-offset-1',
      )}
      onClick={() => dispatch(setSelectedTask(task))}
    >
      {/* Drag handle + Priority */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <PriorityBadge priority={task.priority} />
        <div
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing
                     p-0.5 rounded text-slate-300 hover:text-slate-500 transition-opacity"
        >
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
            <circle cx="5" cy="4"  r="1.5" />
            <circle cx="5" cy="9"  r="1.5" />
            <circle cx="5" cy="14" r="1.5" />
            <circle cx="11" cy="4"  r="1.5" />
            <circle cx="11" cy="9"  r="1.5" />
            <circle cx="11" cy="14" r="1.5" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug mb-2 line-clamp-2">
        {task.title}
      </p>

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map(l => (
            <span
              key={l.id}
              className="h-1.5 w-8 rounded-full"
              style={{ backgroundColor: l.color }}
              title={l.name}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
          {task.comments.length > 0 && (
            <span className="flex items-center gap-0.5 text-xs">
              <MessageSquare size={12} />
              {task.comments.length}
            </span>
          )}
          {task.dueDate && (
            <span
              className={cn(
                'flex items-center gap-0.5 text-xs',
                overdue && 'text-red-500',
              )}
            >
              <Calendar size={12} />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        {task.assignee && (
          <Avatar name={task.assignee.name} src={task.assignee.avatarUrl} size="xs" />
        )}
      </div>
    </div>
  );
}
