import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "~/lib/api";

export interface BranchItem { 
  id: string; 
  name?: string;
  campus?: string;
  student_regular_price?: number;
  student_vip_price?: number;
  student_vvip_price?: number;
  worker_regular_price?: number;
  worker_vip_price?: number;
  worker_vvip_price?: number;
  student_leader_regular_price?: number;
  student_leader_vip_price?: number;
  student_leader_vvip_price?: number;
  irregular_student_regular_price?: number;
  irregular_student_vip_price?: number;
  irregular_student_vvip_price?: number;
  irregular_worker_regular_price?: number;
  irregular_worker_vip_price?: number;
  irregular_worker_vvip_price?: number;
}
interface BranchesState {
  items: BranchItem[];
  loaded: boolean;
  loading: boolean;
  error?: string;
  lastFetched?: number;
}

const initialState: BranchesState = {
  items: [],
  loaded: false,
  loading: false,
  error: undefined,
  lastFetched: undefined,
};

export const fetchBranchesThunk = createAsyncThunk(
  "branches/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient<any>("/branches");
      const list = Array.isArray(data?.data) ? data.data : [];
      return list.map((b: any) => ({ 
        id: String(b.id), 
        name: String(b.name || ""),
        campus: String(b.campus || ""),
        student_regular_price: Number(b.student_regular_price) || 0,
        student_vip_price: Number(b.student_vip_price) || 0,
        student_vvip_price: Number(b.student_vvip_price) || 0,
        worker_regular_price: Number(b.worker_regular_price) || 0,
        worker_vip_price: Number(b.worker_vip_price) || 0,
        worker_vvip_price: Number(b.worker_vvip_price) || 0,
        student_leader_regular_price: Number(b.student_leader_regular_price) || 0,
        student_leader_vip_price: Number(b.student_leader_vip_price) || 0,
        student_leader_vvip_price: Number(b.student_leader_vvip_price) || 0,
        irregular_student_regular_price: Number(b.irregular_student_regular_price) || 0,
        irregular_student_vip_price: Number(b.irregular_student_vip_price) || 0,
        irregular_student_vvip_price: Number(b.irregular_student_vvip_price) || 0,
        irregular_worker_regular_price: Number(b.irregular_worker_regular_price) || 0,
        irregular_worker_vip_price: Number(b.irregular_worker_vip_price) || 0,
        irregular_worker_vvip_price: Number(b.irregular_worker_vvip_price) || 0,
      })) as BranchItem[];
    } catch (e: any) {
      return rejectWithValue(e?.message || "Unable to fetch branches");
    }
  }
);

const branchesSlice = createSlice({
  name: "branches",
  initialState,
  reducers: {
    addBranchOptimistic(state, action: { payload: BranchItem }) {
      state.items.unshift(action.payload);
    },
    updateBranchOptimistic(state, action: { payload: BranchItem }) {
      const index = state.items.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    removeBranchOptimistic(state, action: { payload: string }) {
      state.items = state.items.filter((b) => b.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranchesThunk.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchBranchesThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.loaded = true;
        state.lastFetched = Date.now();
      })
      .addCase(fetchBranchesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch branches";
      });
  },
});

export const { addBranchOptimistic, updateBranchOptimistic, removeBranchOptimistic } = branchesSlice.actions;
export default branchesSlice.reducer;