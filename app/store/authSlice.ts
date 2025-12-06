import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { UserRole, CustomerType } from '~/types/auth';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole | null;
    customerType?: CustomerType | null;
  } | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ id: string; name: string; email: string; role: UserRole; customerType?: CustomerType | null; token?: string | null }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token ?? state.token ?? null;
      const { token, ...user } = action.payload;
      state.user = user;
    },
    signup: (state, action: PayloadAction<{ id: string; name: string; email: string; role: UserRole; customerType?: CustomerType | null; token?: string | null }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token ?? state.token ?? null;
      const { token, ...user } = action.payload;
      state.user = user;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
    updateUser: (state, action: PayloadAction<Partial<AuthState['user']>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
  },
});

export const { login, signup, logout, updateUser, setToken } = authSlice.actions;
export default authSlice.reducer;
