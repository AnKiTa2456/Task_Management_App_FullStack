import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface AuthState {
  user:            User | null;
  accessToken:     string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  error:           string | null;
}

const stored = localStorage.getItem('auth');
const parsedAuth: AuthState | null = stored ? JSON.parse(stored) : null;

// Wipe any stale mock-mode session so it never reaches the real backend
if (parsedAuth?.accessToken?.startsWith('mock-token-')) {
  localStorage.removeItem('auth');
}

const initial: AuthState =
  parsedAuth && !parsedAuth.accessToken?.startsWith('mock-token-')
    ? parsedAuth
    : { user: null, accessToken: null, isAuthenticated: false, isLoading: false, error: null };

const authSlice = createSlice({
  name: 'auth',
  initialState: initial,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; accessToken: string }>) {
      state.user            = action.payload.user;
      state.accessToken     = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error           = null;
      localStorage.setItem('auth', JSON.stringify(state));
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      localStorage.setItem('auth', JSON.stringify(state));
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error     = action.payload;
      state.isLoading = false;
    },
    logout(state) {
      state.user            = null;
      state.accessToken     = null;
      state.isAuthenticated = false;
      state.error           = null;
      localStorage.removeItem('auth');
    },
  },
});

export const { setCredentials, setAccessToken, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;
