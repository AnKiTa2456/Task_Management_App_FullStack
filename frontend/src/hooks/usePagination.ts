/**
 * hooks/usePagination.ts
 *
 * WHAT: Manages page/limit state and returns helpers for a paginated list.
 * WHERE USED: Task list, team members table, activity feed.
 *
 * Example:
 *   const { page, limit, goTo, next, prev } = usePagination();
 *   const { data } = useQuery(['tasks', page], () => tasksApi.getAll(boardId, { page, limit }));
 */

import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?:  number;
  initialLimit?: number;
}

export function usePagination({
  initialPage  = 1,
  initialLimit = 20,
}: UsePaginationOptions = {}) {
  const [page,  setPage]  = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const goTo = useCallback((p: number) => setPage(Math.max(1, p)), []);
  const next = useCallback(() => setPage(p => p + 1), []);
  const prev = useCallback(() => setPage(p => Math.max(1, p - 1)), []);
  const reset = useCallback(() => setPage(1), []);

  return { page, limit, setPage, setLimit, goTo, next, prev, reset } as const;
}
