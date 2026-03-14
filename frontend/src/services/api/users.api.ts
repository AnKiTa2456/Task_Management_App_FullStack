import { apiClient } from '../../lib/axios';
import type { User } from '../../types';

export interface UpdateProfileDto {
  name?:      string;
  avatarUrl?: string;
  bio?:       string;
}

export const usersApi = {
  search: (q: string) =>
    apiClient.get<{ data: User[] }>('/users/search', { params: { q } })
      .then(r => r.data.data),

  updateProfile: (dto: UpdateProfileDto) =>
    apiClient.patch<{ data: User }>('/users/profile', dto)
      .then(r => r.data.data),
};
