import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { listStudentSubscriptions, listWorkerSubscriptions } from '~/services/subscriptions';
import type { SubscriptionItem } from '~/hooks/useSubscriptionFilters';

interface AllSubscriptionsState {
  items: SubscriptionItem[];
  loading: boolean;
  error: string | null;
  hydrated: boolean;
}

const initialState: AllSubscriptionsState = {
  items: [],
  loading: false,
  error: null,
  hydrated: false,
};

export const fetchAllSubscriptions = createAsyncThunk<SubscriptionItem[], { token: string | null }>(
  'allSubscriptions/fetch',
  async ({ token }, { rejectWithValue }) => {
    try {
      const [students, workers] = await Promise.all([
        listStudentSubscriptions(token),
        listWorkerSubscriptions(token)
      ]);
      return [...students, ...workers];
    } catch (e: any) {
      return rejectWithValue(e.message || String(e));
    }
  }
);

const allSubscriptionsSlice = createSlice({
  name: 'allSubscriptions',
  initialState,
  reducers: {
    clearAllSubscriptions: (state) => {
      state.items = [];
      state.hydrated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSubscriptions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllSubscriptions.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; state.hydrated = true; })
      .addCase(fetchAllSubscriptions.rejected, (state, action: any) => { state.loading = false; state.error = action.payload || 'Failed to fetch subscriptions'; });
  }
});

export const { clearAllSubscriptions } = allSubscriptionsSlice.actions;
export default allSubscriptionsSlice.reducer;
