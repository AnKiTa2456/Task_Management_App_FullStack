import { apiClient } from '../../lib/axios';
import type { LoginDto, RegisterDto, AuthResponse, UserProfile } from '../../types';

export const authApi = {
  register: (dto: RegisterDto) =>
    apiClient.post<{ data: AuthResponse }>('/auth/register', dto)
      .then(r => r.data.data),

  login: (dto: LoginDto) =>
    apiClient.post<{ data: AuthResponse }>('/auth/login', dto)
      .then(r => r.data.data),

  refresh: () =>
    apiClient.post<{ data: { accessToken: string } }>('/auth/refresh')
      .then(r => r.data.data),

  logout: () => apiClient.post('/auth/logout'),

  getMe: () =>
    apiClient.get<{ data: UserProfile }>('/auth/me')
      .then(r => r.data.data),
};
