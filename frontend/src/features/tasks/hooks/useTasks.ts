/**
 * features/tasks/hooks/useTasks.ts
 *
 * WHAT: React Query hooks for task CRUD, move, and assign operations.
 * WHY:  All mutation side-effects (cache updates, Redux dispatch, toasts)
 *       live here so TaskCard and TaskForm stay presentation-only.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { moveTask as moveTaskInStore }    from '../tasksSlice';
import { tasksApi }    from '../../../services/api';
import { QUERY_KEYS }  from '../../../utils/constants';
import type { CreateTaskDto, UpdateTaskDto, MoveTaskDto, TaskFilters } from '../../../services/api/tasks.api';

export function useTasks(boardId: string, filters?: TaskFilters) {
  const storeFilters = useAppSelector(s => s.tasks.filters);
  return useQuery({
    queryKey: [...QUERY_KEYS.tasks(boardId), storeFilters],
    queryFn:  () => tasksApi.getAll(boardId, { status: storeFilters.status ?? undefined, priority: storeFilters.priority ?? undefined, assigneeId: storeFilters.assigneeId ?? undefined, search: storeFilters.search || undefined, ...filters }),
    enabled:  !!boardId,
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.task(taskId),
    queryFn:  () => tasksApi.getOne(taskId),
    enabled:  !!taskId,
  });
}

export function useCreateTask(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTaskDto) => tasksApi.create(boardId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.board(boardId) });
      toast.success('Task created');
    },
  });
}

export function useUpdateTask(taskId: string, boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateTaskDto) => tasksApi.update(taskId, dto),
    onSuccess: (updated) => {
      qc.setQueryData(QUERY_KEYS.task(taskId), updated);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.board(boardId) });
    },
  });
}

export function useMoveTask(boardId: string) {
  const qc       = useQueryClient();
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: ({ taskId, dto }: { taskId: string; dto: MoveTaskDto }) =>
      tasksApi.move(taskId, dto),
    // Optimistic update: update Redux immediately, sync React Query after
    onMutate: ({ taskId, dto: { columnId, position } }) => {
      dispatch(
        moveTaskInStore({
          taskId,
          fromColumnId: '',   // resolved in slice
          toColumnId:   columnId,
          newPosition:  position,
        }),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.board(boardId) });
    },
    onError: () => {
      // On error refetch to reset to server state
      qc.invalidateQueries({ queryKey: QUERY_KEYS.board(boardId) });
      toast.error('Failed to move task');
    },
  });
}

export function useDeleteTask(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.remove(taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.board(boardId) });
      toast.success('Task deleted');
    },
  });
}
