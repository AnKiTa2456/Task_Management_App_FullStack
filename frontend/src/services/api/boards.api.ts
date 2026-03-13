import { apiClient } from '../../lib/axios';
import type { Board, Column } from '../../types';

export interface CreateBoardDto {
  name:         string;
  description?: string;
  background?:  string;
  isPrivate?:   boolean;
  teamId?:      string;
}

export interface CreateColumnDto {
  name:   string;
  color?: string;
}

export const boardsApi = {
  getAll: () =>
    apiClient.get<{ data: Board[] }>('/boards').then(r => r.data.data),

  getOne: (boardId: string) =>
    apiClient.get<{ data: Board }>(`/boards/${boardId}`).then(r => r.data.data),

  create: (dto: CreateBoardDto) =>
    apiClient.post<{ data: Board }>('/boards', dto).then(r => r.data.data),

  update: (boardId: string, dto: Partial<CreateBoardDto>) =>
    apiClient.patch<{ data: Board }>(`/boards/${boardId}`, dto).then(r => r.data.data),

  remove: (boardId: string) => apiClient.delete(`/boards/${boardId}`),

  addColumn: (boardId: string, dto: CreateColumnDto) =>
    apiClient.post<{ data: Column }>(`/boards/${boardId}/columns`, dto).then(r => r.data.data),

  removeColumn: (columnId: string) => apiClient.delete(`/boards/columns/${columnId}`),
};
