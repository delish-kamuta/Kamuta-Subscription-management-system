import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  listStoreItems,
  recordPurchase,
  issueToKitchen,
  recordCount,
  recordWaste,
  type StoreItem,
  type Purchase,
  type Issue,
  type PhysicalCount,
  type WasteEntry,
  type PurchasePayload,
  type IssuePayload,
  type CountPayload,
  type WastePayload,
} from "~/services/store";

interface StoreState {
  items: StoreItem[];
  loaded: boolean;
  loading: boolean;
  error?: string;
  lastFetched?: number;
  recentPurchases: Purchase[];
  recentIssues: Issue[];
  recentCounts: PhysicalCount[];
  recentWaste: WasteEntry[];
}

const initialState: StoreState = {
  items: [],
  loaded: false,
  loading: false,
  error: undefined,
  lastFetched: undefined,
  recentPurchases: [],
  recentIssues: [],
  recentCounts: [],
  recentWaste: [],
};

export const fetchStoreItemsThunk = createAsyncThunk(
  "store/fetchItems",
  async (_, { rejectWithValue }) => {
    try {
      return await listStoreItems();
    } catch (e: any) {
      return rejectWithValue(e?.message || "Unable to fetch store items");
    }
  }
);

export const recordPurchaseThunk = createAsyncThunk<Purchase, PurchasePayload>(
  "store/recordPurchase",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const purchase = await recordPurchase(payload);
      // Server updates avg_unit_cost / on-hand — refetch to pick that up.
      dispatch(fetchStoreItemsThunk());
      return purchase;
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to record purchase");
    }
  }
);

export const issueToKitchenThunk = createAsyncThunk<Issue, IssuePayload>(
  "store/issue",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const issue = await issueToKitchen(payload);
      dispatch(fetchStoreItemsThunk());
      return issue;
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to issue to kitchen");
    }
  }
);

export const recordCountThunk = createAsyncThunk<PhysicalCount, CountPayload>(
  "store/count",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const count = await recordCount(payload);
      dispatch(fetchStoreItemsThunk());
      return count;
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to record count");
    }
  }
);

export const recordWasteThunk = createAsyncThunk<WasteEntry, WastePayload>(
  "store/waste",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const entry = await recordWaste(payload);
      dispatch(fetchStoreItemsThunk());
      return entry;
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to record waste");
    }
  }
);

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    clearStoreError(state) {
      state.error = undefined;
    },
    upsertStoreItem(state, action: PayloadAction<StoreItem>) {
      const idx = state.items.findIndex((i) => i.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
      else state.items.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoreItemsThunk.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchStoreItemsThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.loaded = true;
        state.lastFetched = Date.now();
      })
      .addCase(fetchStoreItemsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch store items";
      })
      .addCase(recordPurchaseThunk.fulfilled, (state, action) => {
        state.recentPurchases.unshift(action.payload);
        state.recentPurchases = state.recentPurchases.slice(0, 20);
      })
      .addCase(issueToKitchenThunk.fulfilled, (state, action) => {
        state.recentIssues.unshift(action.payload);
        state.recentIssues = state.recentIssues.slice(0, 20);
      })
      .addCase(recordCountThunk.fulfilled, (state, action) => {
        state.recentCounts.unshift(action.payload);
        state.recentCounts = state.recentCounts.slice(0, 20);
      })
      .addCase(recordWasteThunk.fulfilled, (state, action) => {
        state.recentWaste.unshift(action.payload);
        state.recentWaste = state.recentWaste.slice(0, 20);
      });
  },
});

export const { clearStoreError, upsertStoreItem } = storeSlice.actions;
export default storeSlice.reducer;
