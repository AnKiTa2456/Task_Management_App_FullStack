import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { commentsApi } from '../../../services/api';
import { activityApi } from '../../../services/api/activity.api';
import { QUERY_KEYS }  from '../../../utils/constants';

export function useComments(taskId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.comments(taskId),
    queryFn:  () => commentsApi.getAll(taskId),
    enabled:  !!taskId,
  });
}

export function useTaskActivity(taskId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.taskActivity(taskId),
    queryFn:  () => activityApi.getTaskActivity(taskId),
    enabled:  !!taskId,
  });
}

export function useAddComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => commentsApi.create(taskId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.comments(taskId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.taskActivity(taskId) });
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });
}

export function useEditComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      commentsApi.update(commentId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.comments(taskId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.taskActivity(taskId) });
      toast.success('Comment updated');
    },
    onError: () => {
      toast.error('Failed to update comment');
    },
  });
}

export function useDeleteComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentsApi.remove(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.comments(taskId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.taskActivity(taskId) });
      toast.success('Comment deleted');
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });
}
