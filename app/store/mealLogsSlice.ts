import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { listMealLogs, type MealLogItem, type MealLogsQuery } from "~/services/mealLogs";

interface MealLogsState {
  items: MealLogItem[];
  loaded: boolean;
  loading: boolean;
  error?: string;
  lastFetched?: number;
}

const initialState: MealLogsState = {
  items: [],
  loaded: false,
  loading: false,
  error: undefined,
  lastFetched: undefined,
};

export const fetchMealLogsThunk = createAsyncThunk(
  "mealLogs/fetch",
  async (query: MealLogsQuery, { rejectWithValue }) => {
    try {
      // 1. Fetch first page with large limit request
      const initialQuery = { ...query, page: 1, per_page: 100 };
      const res = await listMealLogs(initialQuery);
      
      if (!res.success) {
        return rejectWithValue(res.message || "Failed to fetch meal logs");
      }

      let allItems: MealLogItem[] = [];
      const firstPageData = res.data || [];
      
      // Normalize data
      if (Array.isArray(firstPageData)) {
        allItems = firstPageData;
      } else if (typeof firstPageData === 'object' && (firstPageData as any).data) {
         // handle nested data key case if API returns { data: { data: [] } }
         allItems = (firstPageData as any).data || [];
      }

      // 2. Check pagination and fetch remaining if needed
      const pagination = res.pagination || (res.data as any)?.pagination;
      if (pagination && pagination.total_pages > 1) {
        const promises = [];
        for (let p = 2; p <= pagination.total_pages; p++) {
          promises.push(listMealLogs({ ...query, page: p, per_page: 100 }));
        }
        
        const results = await Promise.all(promises);
        results.forEach(r => {
          if (r.success && r.data) {
             const items = Array.isArray(r.data) ? r.data : (r.data as any).data || [];
             allItems = [...allItems, ...items];
          }
        });
      }

      return allItems;
    } catch (e: any) {
      return rejectWithValue(e?.message || "Unable to fetch meal logs");
    }
  }
);

const mealLogsSlice = createSlice({
  name: "mealLogs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMealLogsThunk.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchMealLogsThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.loaded = true;
        state.lastFetched = Date.now();
      })
      .addCase(fetchMealLogsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch meal logs";
      });
  },
});

export default mealLogsSlice.reducer;
