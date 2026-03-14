// ─── Enums ────────────────────────────────────────────────────────────────────

export type TaskStatus   = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type Priority     = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type Role         = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type ActivityType =
  | 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_MOVED' | 'TASK_DELETED'
  | 'TASK_ASSIGNED' | 'TASK_UNASSIGNED'
  | 'COMMENT_ADDED' | 'COMMENT_EDITED' | 'COMMENT_DELETED'
  | 'MEMBER_ADDED'  | 'MEMBER_REMOVED' | 'MEMBER_ROLE_CHANGED'
  | 'BOARD_CREATED' | 'BOARD_UPDATED'
  | 'COLUMN_CREATED' | 'COLUMN_DELETED';

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export interface LoginDto {
  email:    string;
  password: string;
}

export interface RegisterDto {
  name:     string;
  email:    string;
  password: string;
}

export interface AuthResponse {
  user:        User;
  accessToken: string;
}

export type UserProfile = User;

// ─── Core Models ──────────────────────────────────────────────────────────────

export interface User {
  id:        string;
  email:     string;
  name:      string;
  avatarUrl?: string;
  bio?:       string;
  createdAt: string;
}

export interface Team {
  id:          string;
  name:        string;
  slug:        string;
  description?: string;
  members:     TeamMember[];
}

export interface TeamMember {
  id:       string;
  role:     Role;
  joinedAt: string;
  user:     User;
}

export interface Board {
  id:          string;
  name:        string;
  description?: string;
  background?:  string;
  isPrivate:   boolean;
  owner:       User;
  columns:     Column[];
  createdAt:   string;
}

export interface Column {
  id:       string;
  name:     string;
  position: number;
  color?:   string;
  tasks:    Task[];
}

export interface Task {
  id:           string;
  title:        string;
  description?: string;
  status:       TaskStatus;
  priority:     Priority;
  position:     number;
  dueDate?:     string;
  labels:       Label[];
  assignee?:    User;
  creator:      User;
  columnId:     string;
  comments?:    Comment[];
  createdAt:    string;
  updatedAt:    string;
}

export interface Comment {
  id:        string;
  content:   string;
  author:    User;
  createdAt: string;
  updatedAt: string;
  isEdited:  boolean;
}

export interface Label {
  id:    string;
  name:  string;
  color: string;
}

export interface Activity {
  id:        string;
  type:      ActivityType;
  metadata:  Record<string, unknown>;
  user:      User;
  task?:     Pick<Task, 'id' | 'title'>;
  createdAt: string;
}

// ─── API Shapes ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total:    number;
    page:     number;
    limit:    number;
    lastPage: number;
  };
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalTasks:      number;
  completedTasks:  number;
  inProgressTasks: number;
  overdueTasks:    number;
  completionRate:  number;
  tasksByPriority: Record<Priority, number>;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface Notification {
  id:      string;
  message: string;
  type:    'success' | 'error' | 'info';
}
