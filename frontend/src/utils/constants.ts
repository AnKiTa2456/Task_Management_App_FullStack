/**
 * utils/constants.ts
 *
 * WHAT: App-wide constant values (label maps, color maps, limits).
 * WHY:  Single source of truth — change a label or colour here,
 *       every component that uses it updates automatically.
 */

import type { Priority, TaskStatus, Role } from '../types';

// ─── Priority ─────────────────────────────────────────────────────────────────

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW:    'Low',
  MEDIUM: 'Medium',
  HIGH:   'High',
  URGENT: 'Urgent',
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  LOW:    'bg-slate-100  text-slate-600',
  MEDIUM: 'bg-blue-100   text-blue-700',
  HIGH:   'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100    text-red-700',
};

export const PRIORITY_DOT: Record<Priority, string> = {
  LOW:    'bg-slate-400',
  MEDIUM: 'bg-blue-500',
  HIGH:   'bg-orange-500',
  URGENT: 'bg-red-500',
};

// ─── Status ───────────────────────────────────────────────────────────────────

export const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO:        'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW:   'In Review',
  DONE:        'Done',
};

export const STATUS_COLOR: Record<TaskStatus, string> = {
  TODO:        'bg-slate-100  text-slate-600',
  IN_PROGRESS: 'bg-blue-100   text-blue-700',
  IN_REVIEW:   'bg-purple-100 text-purple-700',
  DONE:        'bg-green-100  text-green-700',
};

// ─── Roles ────────────────────────────────────────────────────────────────────

export const ROLE_LABEL: Record<Role, string> = {
  OWNER:  'Owner',
  ADMIN:  'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;

// ─── Query keys  (centralise React Query keys to avoid typos) ─────────────────

export const QUERY_KEYS = {
  boards:      ['boards']                        as const,
  board:       (id: string) => ['boards', id]    as const,
  tasks:       (boardId: string) => ['tasks', boardId] as const,
  task:        (id: string) => ['task', id]      as const,
  comments:     (taskId: string) => ['comments', taskId]      as const,
  taskActivity: (taskId: string) => ['activity', 'task', taskId] as const,
  teams:        ['teams']                                   as const,
  team:        (id: string) => ['teams', id]     as const,
  me:          ['me']                            as const,
  dashboard:   ['dashboard']                     as const,
};
