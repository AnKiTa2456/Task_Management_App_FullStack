import { apiClient } from '../../lib/axios';
import type { Activity } from '../../types';

export const activityApi = {
  getTaskActivity: (taskId: string) =>
    apiClient
      .get<{ data: Activity[] }>(`/tasks/${taskId}/activity`)
      .then(r => r.data.data),

  getBoardActivity: (boardId: string, page = 1, limit = 30) =>
    apiClient
      .get<{ data: { activities: Activity[]; meta: Record<string, number> } }>(
        `/boards/${boardId}/activity`,
        { params: { page, limit } },
      )
      .then(r => r.data.data),
};
