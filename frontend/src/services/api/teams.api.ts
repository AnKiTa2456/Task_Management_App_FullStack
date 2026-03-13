import { apiClient } from '../../lib/axios';
import type { Team, TeamMember, Role } from '../../types';

export const teamsApi = {
  getAll: () =>
    apiClient.get<{ data: Team[] }>('/teams').then(r => r.data.data),

  getOne: (teamId: string) =>
    apiClient.get<{ data: Team }>(`/teams/${teamId}`).then(r => r.data.data),

  create: (data: { name: string; slug: string; description?: string }) =>
    apiClient.post<{ data: Team }>('/teams', data).then(r => r.data.data),

  update: (teamId: string, data: Partial<{ name: string; description: string }>) =>
    apiClient.patch<{ data: Team }>(`/teams/${teamId}`, data).then(r => r.data.data),

  invite: (teamId: string, email: string, role?: Role) =>
    apiClient.post<{ data: TeamMember }>(`/teams/${teamId}/members`, { email, role }).then(r => r.data.data),

  updateMemberRole: (teamId: string, userId: string, role: Role) =>
    apiClient.patch(`/teams/${teamId}/members/${userId}`, { role }),

  removeMember: (teamId: string, userId: string) =>
    apiClient.delete(`/teams/${teamId}/members/${userId}`),
};
