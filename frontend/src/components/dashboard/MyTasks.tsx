import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { PriorityBadge } from '../ui/Badge';
import { formatDate, isOverdue } from '../../utils/formatDate';
import { cn } from '../../utils/cn';
import type { Task } from '../../types';

// Demo data — replace with real React Query data
const DEMO_TASKS: Task[] = [
  {
    id: '1', title: 'Fix authentication bug in login page', status: 'IN_PROGRESS',
    priority: 'URGENT', position: 0, columnId: 'col1', labels: [], comments: [],
    creator: { id: '1', name: 'You', email: 'me@example.com', createdAt: '' },
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: '', updatedAt: new Date().toISOString(),
  },
  {
    id: '2', title: 'Design new onboarding flow for mobile', status: 'TODO',
    priority: 'HIGH', position: 1, columnId: 'col1', labels: [], comments: [],
    creator: { id: '1', name: 'You', email: 'me@example.com', createdAt: '' },
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    createdAt: '', updatedAt: new Date().toISOString(),
  },
  {
    id: '3', title: 'Write unit tests for auth module', status: 'IN_REVIEW',
    priority: 'MEDIUM', position: 2, columnId: 'col2', labels: [], comments: [],
    creator: { id: '1', name: 'You', email: 'me@example.com', createdAt: '' },
    createdAt: '', updatedAt: new Date().toISOString(),
  },
  {
    id: '4', title: 'Update API documentation', status: 'DONE',
    priority: 'LOW', position: 3, columnId: 'col3', labels: [], comments: [],
    creator: { id: '1', name: 'You', email: 'me@example.com', createdAt: '' },
    createdAt: '', updatedAt: new Date().toISOString(),
  },
];

const STATUS_ICON: Record<string, React.ReactNode> = {
  TODO:        <Circle size={16} className="text-slate-400" />,
  IN_PROGRESS: <Clock size={16} className="text-blue-500" />,
  IN_REVIEW:   <Clock size={16} className="text-amber-500" />,
  DONE:        <CheckCircle2 size={16} className="text-emerald-500" />,
};

export default function MyTasks({ tasks = DEMO_TASKS }: { tasks?: Task[] }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">My Tasks</h3>
        <button className="text-xs text-brand-600 hover:underline font-medium">View all</button>
      </div>

      <div className="space-y-1">
        {tasks.map(task => {
          const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== 'DONE';
          return (
            <div
              key={task.id}
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer group"
            >
              <span className="flex-shrink-0">{STATUS_ICON[task.status]}</span>

              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm text-slate-700 truncate',
                  task.status === 'DONE' && 'line-through text-slate-400',
                )}>
                  {task.title}
                </p>
                {task.dueDate && (
                  <p className={cn('text-xs mt-0.5', overdue ? 'text-red-500' : 'text-slate-400')}>
                    {overdue ? 'Overdue · ' : ''}{formatDate(task.dueDate)}
                  </p>
                )}
              </div>

              <PriorityBadge priority={task.priority} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
