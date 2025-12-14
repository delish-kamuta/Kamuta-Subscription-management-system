import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { listPaymentsFromSubscriptions, type PaymentRow } from "~/services/subscriptions";
import type { RootState } from "./store";

interface PaymentsState {
  items: PaymentRow[];
  loading: boolean;
  loaded: boolean;
  error?: string | null;
  lastFetched?: number;
}

const initialState: PaymentsState = {
  items: [],
  loading: false,
  loaded: false,
  error: null,
  lastFetched: undefined,
};

export const fetchPaymentsThunk = createAsyncThunk<PaymentRow[], void, { state: RootState }>(
  "payments/fetch",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as any).auth?.token ?? null;
      const rows = await listPaymentsFromSubscriptions(token);
      return rows;
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to fetch payments");
    }
  }
);

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    setPayments(state, action: PayloadAction<PaymentRow[]>) {
      state.items = action.payload;
      state.loaded = true;
      state.loading = false;
      state.error = null;
      state.lastFetched = Date.now();
    },
    clearPayments(state) {
      state.items = [];
      state.loaded = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentsThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loaded = true;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchPaymentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch payments";
      });
  },
});

export const { setPayments, clearPayments } = paymentsSlice.actions;
export default paymentsSlice.reducer;
