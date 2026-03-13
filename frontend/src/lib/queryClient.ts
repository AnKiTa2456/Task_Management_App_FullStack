/**
 * lib/queryClient.ts
 *
 * WHAT: Configured React Query client instance.
 * WHY:  Centralises retry logic, cache time, and error handling.
 *       Every useQuery / useMutation in the app inherits these defaults.
 *
 * Key decisions:
 *   staleTime: 60s  → prevents duplicate fetches on tab re-focus
 *   retry: 1        → only retry 401/5xx once (interceptor handles token refresh)
 *   retryDelay     → exponential back-off capped at 10s
 */

import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          60 * 1000,    // data is "fresh" for 60 seconds
      gcTime:             5 * 60 * 1000, // garbage-collect after 5 minutes idle
      retry:              1,
      retryDelay:         (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      refetchOnWindowFocus: true,
    },
    mutations: {
      onError: (error: unknown) => {
        const msg =
          (error as { response?: { data?: { error?: { message?: string | string[] } } } })
            ?.response?.data?.error?.message
            ?? 'Something went wrong';
        toast.error(Array.isArray(msg) ? msg[0] : msg);
      },
    },
  },
});
