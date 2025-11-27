import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { UserRole } from '~/types/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole | null;
  } | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ id: string; name: string; email: string; role: UserRole }>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    signup: (state, action: PayloadAction<{ id: string; name: string; email: string; role: UserRole }>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
    updateUser: (state, action: PayloadAction<Partial<AuthState['user']>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { login, signup, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
