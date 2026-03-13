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
import type { Board } from '../../../types';

// ── Mock mode (works without a backend) ──────────────────────────────────────
const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

const MOCK_USER = {
  id: 'user-1', email: 'demo@example.com', name: 'Demo User',
  createdAt: '2024-01-01T00:00:00Z',
};

const MOCK_BOARDS: Board[] = [
  {
    id: 'board-1',
    name: 'Website Redesign',
    description: 'Complete redesign of the company website',
    background: '#6366f1',
    isPrivate: false,
    owner: MOCK_USER,
    createdAt: '2024-01-01T00:00:00Z',
    columns: [
      {
        id: 'col-1', name: 'To Do', position: 0, color: '#94a3b8',
        tasks: [
          {
            id: 'task-1', title: 'Design homepage mockup', columnId: 'col-1',
            description: 'Create wireframes for the new homepage',
            status: 'TODO', priority: 'HIGH', position: 0,
            labels: [], creator: MOCK_USER, comments: [],
            createdAt: '2024-01-05T00:00:00Z', updatedAt: '2024-01-05T00:00:00Z',
          },
          {
            id: 'task-2', title: 'Write copy for About page', columnId: 'col-1',
            status: 'TODO', priority: 'MEDIUM', position: 1,
            labels: [], creator: MOCK_USER, comments: [],
            createdAt: '2024-01-06T00:00:00Z', updatedAt: '2024-01-06T00:00:00Z',
          },
        ],
      },
      {
        id: 'col-2', name: 'In Progress', position: 1, color: '#f59e0b',
        tasks: [
          {
            id: 'task-3', title: 'Set up CI/CD pipeline', columnId: 'col-2',
            description: 'Configure GitHub Actions for automated testing and deployment',
            status: 'IN_PROGRESS', priority: 'URGENT', position: 0,
            labels: [], creator: MOCK_USER, assignee: MOCK_USER, comments: [],
            createdAt: '2024-01-03T00:00:00Z', updatedAt: '2024-01-07T00:00:00Z',
          },
          {
            id: 'task-4', title: 'Integrate payment gateway', columnId: 'col-2',
            status: 'IN_PROGRESS', priority: 'HIGH', position: 1,
            labels: [], creator: MOCK_USER, comments: [],
            createdAt: '2024-01-04T00:00:00Z', updatedAt: '2024-01-08T00:00:00Z',
          },
        ],
      },
      {
        id: 'col-3', name: 'In Review', position: 2, color: '#8b5cf6',
        tasks: [
          {
            id: 'task-5', title: 'Authentication flow', columnId: 'col-3',
            description: 'Login, register, and password reset flows',
            status: 'IN_REVIEW', priority: 'HIGH', position: 0,
            labels: [], creator: MOCK_USER, assignee: MOCK_USER, comments: [],
            createdAt: '2024-01-02T00:00:00Z', updatedAt: '2024-01-09T00:00:00Z',
          },
        ],
      },
      {
        id: 'col-4', name: 'Done', position: 3, color: '#10b981',
        tasks: [
          {
            id: 'task-6', title: 'Project setup & scaffolding', columnId: 'col-4',
            status: 'DONE', priority: 'LOW', position: 0,
            labels: [], creator: MOCK_USER, comments: [],
            createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-04T00:00:00Z',
          },
          {
            id: 'task-7', title: 'Database schema design', columnId: 'col-4',
            status: 'DONE', priority: 'MEDIUM', position: 1,
            labels: [], creator: MOCK_USER, assignee: MOCK_USER, comments: [],
            createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-05T00:00:00Z',
          },
        ],
      },
    ],
  },
  {
    id: 'board-2',
    name: 'Mobile App v2',
    description: 'React Native app second version',
    background: '#10b981',
    isPrivate: false,
    owner: MOCK_USER,
    createdAt: '2024-01-10T00:00:00Z',
    columns: [
      {
        id: 'col-5', name: 'Backlog', position: 0, color: '#94a3b8',
        tasks: [
          {
            id: 'task-8', title: 'Push notifications', columnId: 'col-5',
            status: 'TODO', priority: 'MEDIUM', position: 0,
            labels: [], creator: MOCK_USER, comments: [],
            createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-01-10T00:00:00Z',
          },
        ],
      },
      {
        id: 'col-6', name: 'In Progress', position: 1, color: '#f59e0b',
        tasks: [
          {
            id: 'task-9', title: 'Dark mode support', columnId: 'col-6',
            status: 'IN_PROGRESS', priority: 'HIGH', position: 0,
            labels: [], creator: MOCK_USER, comments: [],
            createdAt: '2024-01-11T00:00:00Z', updatedAt: '2024-01-11T00:00:00Z',
          },
        ],
      },
      {
        id: 'col-7', name: 'Done', position: 2, color: '#10b981',
        tasks: [],
      },
    ],
  },
  {
    id: 'board-3',
    name: 'API Refactor',
    description: 'Clean up and optimise the backend API',
    background: '#f59e0b',
    isPrivate: true,
    owner: MOCK_USER,
    createdAt: '2024-01-15T00:00:00Z',
    columns: [
      {
        id: 'col-8', name: 'Todo', position: 0, color: '#94a3b8',
        tasks: [
          {
            id: 'task-10', title: 'Rate limiting middleware', columnId: 'col-8',
            status: 'TODO', priority: 'URGENT', position: 0,
            labels: [], creator: MOCK_USER, comments: [],
            createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z',
          },
        ],
      },
      {
        id: 'col-9', name: 'In Progress', position: 1, color: '#f59e0b',
        tasks: [],
      },
      {
        id: 'col-10', name: 'Done', position: 2, color: '#10b981',
        tasks: [],
      },
    ],
  },
];

function mockGetBoards(): Promise<Board[]> {
  return new Promise(resolve => setTimeout(() => resolve(MOCK_BOARDS), 400));
}

function mockGetBoard(boardId: string): Promise<Board> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      const board = MOCK_BOARDS.find(b => b.id === boardId);
      if (board) { resolve(board); } else { reject(new Error('Board not found')); }
    }, 400),
  );
}

export function useBoards() {
  return useQuery({
    queryKey: QUERY_KEYS.boards,
    queryFn:  MOCK_AUTH ? mockGetBoards : boardsApi.getAll,
  });
}

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.board(boardId),
    queryFn:  MOCK_AUTH ? () => mockGetBoard(boardId) : () => boardsApi.getOne(boardId),
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
