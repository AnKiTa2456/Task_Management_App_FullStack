/**
 * features/boards/hooks/useBoards.ts
 *
 * WHAT: React Query hooks for boards CRUD.
 * WHY:  Components call useBoards() — not the API directly.
 *       Cache invalidation, optimistic updates, and Redux sync
 *       all live here, not scattered across pages.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { boardsApi } from '../../../services/api';
import { QUERY_KEYS } from '../../../utils/constants';
import type { CreateBoardDto } from '../../../services/api/boards.api';

export function useBoards() {
  return useQuery({
    queryKey: QUERY_KEYS.boards,
    queryFn:  boardsApi.getAll,
  });
}

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.board(boardId),
    queryFn:  () => boardsApi.getOne(boardId),
    enabled:  !!boardId,
  });
}

export function useCreateBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBoardDto) => boardsApi.create(dto),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.boards });
      toast.success('Board created!');
    },
  });
}

export function useUpdateBoard(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Partial<CreateBoardDto>) => boardsApi.update(boardId, dto),
    onSuccess: (updated) => {
      qc.setQueryData(QUERY_KEYS.board(boardId), updated);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.boards });
    },
  });
}

export function useDeleteBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => boardsApi.remove(boardId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.boards });
      toast.success('Board deleted');
    },
  });
}
