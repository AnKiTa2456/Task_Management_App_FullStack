import { formatRelative } from '../../utils/formatDate';
import Avatar from '../ui/Avatar';
import type { Activity } from '../../types';

const DEMO_ACTIVITIES: Activity[] = [
  {
    id: '1', type: 'TASK_CREATED',
    metadata: {},
    user: { id: '1', name: 'Alex Morgan', email: 'alex@example.com', createdAt: '' },
    task: { id: 't1', title: 'Fix authentication bug' },
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2', type: 'TASK_MOVED',
    metadata: { from: 'To Do', to: 'In Progress' },
    user: { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', createdAt: '' },
    task: { id: 't2', title: 'Design new onboarding flow' },
    createdAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
  },
  {
    id: '3', type: 'COMMENT_ADDED',
    metadata: {},
    user: { id: '3', name: 'Jordan Lee', email: 'jordan@example.com', createdAt: '' },
    task: { id: 't3', title: 'API performance optimization' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '4', type: 'TASK_ASSIGNED',
    metadata: { assignee: 'You' },
    user: { id: '4', name: 'Morgan Blake', email: 'morgan@example.com', createdAt: '' },
    task: { id: 't4', title: 'Write unit tests for auth module' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

const ACTIVITY_LABELS: Record<string, string> = {
  TASK_CREATED:  'created task',
  TASK_MOVED:    'moved task',
  TASK_UPDATED:  'updated task',
  TASK_ASSIGNED: 'assigned task',
  COMMENT_ADDED: 'commented on',
  MEMBER_ADDED:  'joined the team',
};

export default function RecentActivity({ activities = DEMO_ACTIVITIES }: { activities?: Activity[] }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map(a => (
          <div key={a.id} className="flex items-start gap-3">
            <Avatar name={a.user.name} size="sm" className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-700">
                <span className="font-semibold">{a.user.name}</span>
                {' '}{ACTIVITY_LABELS[a.type]}{' '}
                {a.task && (
                  <span className="font-medium text-brand-600 cursor-pointer hover:underline">
                    {a.task.title}
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{formatRelative(a.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
