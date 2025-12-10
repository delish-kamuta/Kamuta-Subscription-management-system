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
    branch_id?: string | null;
  } | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ id: string; name: string; email: string; role: UserRole; customerType?: CustomerType | null; branch_id?: string | null; token?: string | null }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token ?? state.token ?? null;
      const { token, ...user } = action.payload;
      state.user = user;
      state.hydrated = true;
    },
    signup: (state, action: PayloadAction<{ id: string; name: string; email: string; role: UserRole; customerType?: CustomerType | null; branch_id?: string | null; token?: string | null }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token ?? state.token ?? null;
      const { token, ...user } = action.payload;
      state.user = user;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.hydrated = true;
    },
    updateUser: (state, action: PayloadAction<Partial<AuthState['user']>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    hydrate: (state, action: PayloadAction<{ token?: string | null; user?: AuthState['user'] | null } | undefined>) => {
      const payload = action.payload || {};
      state.token = payload.token ?? state.token ?? null;
      if (payload.user !== undefined) {
        state.user = payload.user;
      }
      state.isAuthenticated = Boolean(state.token);
      state.hydrated = true;
    },
  },
});

export const { login, signup, logout, updateUser, setToken, hydrate } = authSlice.actions;
export default authSlice.reducer;
