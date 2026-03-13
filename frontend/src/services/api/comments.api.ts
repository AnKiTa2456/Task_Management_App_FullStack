import { apiClient } from '../../lib/axios';
import type { Comment } from '../../types';

export const commentsApi = {
  getAll: (taskId: string) =>
    apiClient.get<{ data: Comment[] }>(`/tasks/${taskId}/comments`).then(r => r.data.data),

  create: (taskId: string, content: string) =>
    apiClient.post<{ data: Comment }>(`/tasks/${taskId}/comments`, { content }).then(r => r.data.data),

  update: (commentId: string, content: string) =>
    apiClient.patch<{ data: Comment }>(`/comments/${commentId}`, { content }).then(r => r.data.data),

  remove: (commentId: string) => apiClient.delete(`/comments/${commentId}`),
};
