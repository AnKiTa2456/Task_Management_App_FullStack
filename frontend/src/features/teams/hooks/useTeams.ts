/**
 * features/teams/hooks/useTeams.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { teamsApi }   from '../../../services/api';
import { QUERY_KEYS } from '../../../utils/constants';
import type { Role }  from '../../../types';

export function useTeams() {
  return useQuery({ queryKey: QUERY_KEYS.teams, queryFn: teamsApi.getAll });
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.team(teamId),
    queryFn:  () => teamsApi.getOne(teamId),
    enabled:  !!teamId,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teamsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.teams });
      toast.success('Team created!');
    },
  });
}

export function useInviteMember(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role?: Role }) =>
      teamsApi.invite(teamId, email, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.team(teamId) });
      toast.success('Invitation sent!');
    },
  });
}

export function useRemoveMember(teamId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => teamsApi.removeMember(teamId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.team(teamId) });
      toast.success('Member removed');
    },
  });
}
