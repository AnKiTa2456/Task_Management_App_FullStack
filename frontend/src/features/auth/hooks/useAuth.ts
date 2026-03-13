import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast           from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setCredentials, logout as logoutAction } from '../authSlice';
import { authApi } from '../../../services/api';
import type { LoginDto, RegisterDto, AuthResponse } from '../../../types';

// ── Mock mode (works without a backend) ──────────────────────────────────────
// Set VITE_MOCK_AUTH=true in your .env to skip the real API.
// Remove this once your NestJS backend is running.
const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

function mockRegister(dto: RegisterDto): Promise<AuthResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        accessToken: 'mock-token-' + Date.now(),
        user: {
          id:        'user-1',
          name:      dto.name,
          email:     dto.email,
          avatarUrl: undefined,
          createdAt: new Date().toISOString(),
        },
      });
    }, 600);
  });
}

function mockLogin(dto: LoginDto): Promise<AuthResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Accept any well-formed email + password longer than 5 chars
      if (dto.email.includes('@') && dto.password.length > 5) {
        resolve({
          accessToken: 'mock-token-' + Date.now(),
          user: {
            id:        'user-1',
            name:      dto.email.split('@')[0],
            email:     dto.email,
            avatarUrl: undefined,
            createdAt: new Date().toISOString(),
          },
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 600);
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export function useAuth() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const authState = useAppSelector(s => s.auth);

  const loginMutation = useMutation({
    mutationFn: (dto: LoginDto) =>
      MOCK_AUTH ? mockLogin(dto) : authApi.login(dto),
    onSuccess: (data: AuthResponse) => {
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      navigate('/dashboard');
      toast.success(`Welcome back, ${data.user.name}!`);
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ??
        (error as Error)?.message ??
        'Invalid email or password';
      toast.error(msg);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (dto: RegisterDto) =>
      MOCK_AUTH ? mockRegister(dto) : authApi.register(dto),
    onSuccess: (data: AuthResponse) => {
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      navigate('/dashboard');
      toast.success(`Account created! Welcome, ${data.user.name} 🎉`);
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ??
        (error as Error)?.message ??
        'Registration failed. Please try again.';
      toast.error(msg);
    },
  });

  const logout = () => {
    if (!MOCK_AUTH) authApi.logout().catch(() => null);
    dispatch(logoutAction());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return {
    user:            authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoggingIn:     loginMutation.isPending,
    isRegistering:   registerMutation.isPending,
    login:           loginMutation.mutate,
    register:        registerMutation.mutate,
    logout,
  };
}
