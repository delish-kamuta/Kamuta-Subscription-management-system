import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { listStudentSubscriptions } from '~/services/subscriptions';
import type { SubscriptionItem } from '~/hooks/useSubscriptionFilters';

interface SubscriptionsState {
  items: SubscriptionItem[];
  loading: boolean;
  error: string | null;
  hydrated: boolean;
}

const initialState: SubscriptionsState = {
  items: [],
  loading: false,
  error: null,
  hydrated: false,
};

export const fetchSubscriptions = createAsyncThunk<SubscriptionItem[], { token: string | null }>(
  'subscriptions/fetch',
  async ({ token }, { rejectWithValue }) => {
    try {
      const data = await listStudentSubscriptions(token);
      return data;
    } catch (e: any) {
      return rejectWithValue(e.message || String(e));
    }
  }
);

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setSubscriptions: (state, action: PayloadAction<SubscriptionItem[]>) => {
      state.items = action.payload;
      state.hydrated = true;
    },
    upsertSubscription: (state, action: PayloadAction<SubscriptionItem>) => {
      const idx = state.items.findIndex((s) => s.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload; else state.items.unshift(action.payload);
    },
    clearSubscriptions: (state) => {
      state.items = [];
      state.hydrated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; state.hydrated = true; })
      .addCase(fetchSubscriptions.rejected, (state, action: any) => { state.loading = false; state.error = action.payload || 'Failed to fetch subscriptions'; });
  }
});

export const { setSubscriptions, upsertSubscription, clearSubscriptions } = subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;