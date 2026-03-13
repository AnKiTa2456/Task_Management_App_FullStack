import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Team } from '../../types';

interface TeamsState {
  items:      Team[];
  activeTeam: Team | null;
  isLoading:  boolean;
}

const initialState: TeamsState = { items: [], activeTeam: null, isLoading: false };

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setTeams(state, action: PayloadAction<Team[]>) {
      state.items     = action.payload;
      state.isLoading = false;
    },
    setActiveTeam(state, action: PayloadAction<Team>) {
      state.activeTeam = action.payload;
    },
    addTeam(state, action: PayloadAction<Team>) {
      state.items.unshift(action.payload);
    },
    setTeamsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setTeams, setActiveTeam, addTeam, setTeamsLoading } = teamsSlice.actions;
export default teamsSlice.reducer;
