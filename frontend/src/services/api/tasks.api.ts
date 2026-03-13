import { apiClient } from '../../lib/axios';
import type { Task, Priority, TaskStatus, PaginatedResponse } from '../../types';

export interface CreateTaskDto {
  title:        string;
  description?: string;
  columnId:     string;
  priority?:    Priority;
  dueDate?:     string;
  assigneeId?:  string;
  labelIds?:    string[];
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: TaskStatus;
}

export interface MoveTaskDto {
  columnId: string;
  position: number;
}

export interface TaskFilters {
  status?:     TaskStatus;
  priority?:   Priority;
  assigneeId?: string;
  search?:     string;
  page?:       number;
  limit?:      number;
}

export const tasksApi = {
  getAll: (boardId: string, filters?: TaskFilters) =>
    apiClient.get<{ data: PaginatedResponse<Task> }>(`/boards/${boardId}/tasks`, { params: filters })
      .then(r => r.data.data),

  getOne: (taskId: string) =>
    apiClient.get<{ data: Task }>(`/tasks/${taskId}`).then(r => r.data.data),

  create: (boardId: string, dto: CreateTaskDto) =>
    apiClient.post<{ data: Task }>(`/boards/${boardId}/tasks`, dto).then(r => r.data.data),

  update: (taskId: string, dto: UpdateTaskDto) =>
    apiClient.patch<{ data: Task }>(`/tasks/${taskId}`, dto).then(r => r.data.data),

  move: (taskId: string, dto: MoveTaskDto) =>
    apiClient.patch<{ data: Task }>(`/tasks/${taskId}/move`, dto).then(r => r.data.data),

  assign: (taskId: string, assigneeId: string | null) =>
    apiClient.patch<{ data: Task }>(`/tasks/${taskId}/assign`, { assigneeId }).then(r => r.data.data),

  remove: (taskId: string) => apiClient.delete(`/tasks/${taskId}`),
};
