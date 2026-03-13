import { useState } from 'react';
import {
  X, Calendar, Tag, User, Flag,
  MessageSquare, Clock,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setSelectedTask } from '../../features/tasks/tasksSlice';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { formatDate, formatRelative } from '../../utils/formatDate';
import { cn } from '../../utils/cn';
import { CommentList } from '../../features/comments/components/CommentList';
import { useTaskActivity } from '../../features/comments/hooks/useComments';
import { Skeleton } from '../ui/Skeleton';
import type { Activity } from '../../types';

// ─── Activity helpers ─────────────────────────────────────────────────────────

function activityLabel(a: Activity): string {
  const meta = a.metadata as Record<string, string>;
  switch (a.type) {
    case 'TASK_CREATED':    return 'created this task';
    case 'TASK_UPDATED':    return 'updated this task';
    case 'TASK_MOVED':      return `moved from "${meta.fromColumn}" → "${meta.toColumn}"`;
    case 'TASK_ASSIGNED':   return `assigned to ${meta.assigneeName ?? 'someone'}`;
    case 'TASK_UNASSIGNED': return 'removed the assignee';
    case 'COMMENT_ADDED':
      return `commented: "${(meta.preview ?? '').slice(0, 60)}${(meta.preview?.length ?? 0) >= 60 ? '…' : ''}"`;
    case 'COMMENT_EDITED':  return 'edited a comment';
    case 'COMMENT_DELETED': return 'deleted a comment';
    case 'MEMBER_ADDED':    return 'was added to the board';
    default:                return a.type.toLowerCase().replace(/_/g, ' ');
  }
}

function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <div className="flex gap-2.5 text-xs">
      <Avatar
        name={activity.user.name}
        src={activity.user.avatarUrl}
        size="xs"
        className="flex-shrink-0 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <p>
          <span className="font-semibold text-slate-700">{activity.user.name}</span>
          {' '}
          <span className="text-slate-500">{activityLabel(activity)}</span>
        </p>
        <p className="text-slate-400 mt-0.5">{formatRelative(activity.createdAt)}</p>
      </div>
    </div>
  );
}

function ActivityFeed({ taskId }: { taskId: string }) {
  const { data: activities = [], isLoading } = useTaskActivity(taskId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-2.5">
            <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-3/4 rounded" />
              <Skeleton className="h-2.5 w-1/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-6">No activity yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map(a => (
        <ActivityItem key={a.id} activity={a} />
      ))}
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

type Tab = 'comments' | 'activity';

function TabBar({
  active,
  onChange,
  commentCount,
}: {
  active:       Tab;
  onChange:     (t: Tab) => void;
  commentCount: number;
}) {
  return (
    <div className="flex border-b border-slate-100 flex-shrink-0">
      <button
        onClick={() => onChange('comments')}
        className={cn(
          'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
          active === 'comments'
            ? 'border-brand-600 text-brand-600'
            : 'border-transparent text-slate-500 hover:text-slate-700',
        )}
      >
        <MessageSquare size={14} />
        Comments
        {commentCount > 0 && (
          <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-1.5 py-0.5 leading-none">
            {commentCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onChange('activity')}
        className={cn(
          'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
          active === 'activity'
            ? 'border-brand-600 text-brand-600'
            : 'border-transparent text-slate-500 hover:text-slate-700',
        )}
      >
        <Clock size={14} />
        Activity
      </button>
    </div>
  );
}

// ─── TaskDetailPanel ──────────────────────────────────────────────────────────

export default function TaskDetailPanel() {
  const dispatch = useAppDispatch();
  const task = useAppSelector(s => s.tasks.selected);
  const [activeTab, setActiveTab] = useState<Tab>('comments');

  if (!task) return null;

  return (
    <>
      {/* Backdrop (mobile) */}
      <div
        className="fixed inset-0 bg-black/20 z-40 lg:hidden"
        onClick={() => dispatch(setSelectedTask(null))}
      />

      {/* Panel */}
      <aside
        className={cn(
          'fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50',
          'flex flex-col border-l border-slate-100 animate-slide-in',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <StatusBadge status={task.status} />
          <button
            onClick={() => dispatch(setSelectedTask(null))}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Task meta */}
          <div className="p-5 space-y-5 flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 leading-snug">
                {task.title}
              </h2>
              {task.description && (
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MetaItem icon={<Flag size={14} />} label="Priority">
                <PriorityBadge priority={task.priority} />
              </MetaItem>

              <MetaItem icon={<User size={14} />} label="Assignee">
                {task.assignee ? (
                  <div className="flex items-center gap-1.5">
                    <Avatar name={task.assignee.name} size="xs" />
                    <span className="text-xs text-slate-700">{task.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Unassigned</span>
                )}
              </MetaItem>

              {task.dueDate && (
                <MetaItem icon={<Calendar size={14} />} label="Due date">
                  <span className="text-xs text-slate-700">{formatDate(task.dueDate)}</span>
                </MetaItem>
              )}

              <MetaItem icon={<User size={14} />} label="Created by">
                <div className="flex items-center gap-1.5">
                  <Avatar name={task.creator.name} size="xs" />
                  <span className="text-xs text-slate-700">{task.creator.name}</span>
                </div>
              </MetaItem>
            </div>

            {task.labels.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                  <Tag size={13} /> Labels
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {task.labels.map(l => (
                    <span
                      key={l.id}
                      className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: l.color }}
                    >
                      {l.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100" />

          {/* Tabs */}
          <TabBar
            active={activeTab}
            onChange={setActiveTab}
            commentCount={task.comments.length}
          />

          <div className="p-5 flex-1">
            {activeTab === 'comments' ? (
              <CommentList taskId={task.id} />
            ) : (
              <ActivityFeed taskId={task.id} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400 flex-shrink-0">
          Updated {formatRelative(task.updatedAt)}
        </div>
      </aside>
    </>
  );
}

// ─── MetaItem ─────────────────────────────────────────────────────────────────

function MetaItem({
  icon,
  label,
  children,
}: {
  icon:     React.ReactNode;
  label:    string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <p className="text-xs text-slate-400 flex items-center gap-1 mb-1.5">
        {icon} {label}
      </p>
      {children}
    </div>
  );
}
