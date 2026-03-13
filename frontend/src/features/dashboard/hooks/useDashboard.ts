/**
 * features/dashboard/hooks/useDashboard.ts
 * WHERE USED: DashboardPage — fetches stats + recent activity.
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import { QUERY_KEYS } from '../../../utils/constants';
import type { DashboardStats, Activity } from '../../../types';

export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn:  () =>
      apiClient
        .get<{ data: DashboardStats }>('/dashboard/stats')
        .then(r => r.data.data),
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: [...QUERY_KEYS.dashboard, 'activity', limit],
    queryFn:  () =>
      apiClient
        .get<{ data: Activity[] }>('/dashboard/activity', { params: { limit } })
        .then(r => r.data.data),
  });
}
