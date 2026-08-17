import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  listProducts,
  getCurrentSession,
  openSession,
  addReceipt,
  addWaste,
  closeSession,
  reopenSession,
  type Product,
  type ShopSession,
  type ReceivePayload,
  type WasteShopPayload,
  type ClosePayload,
} from "~/services/shop";

interface ShopState {
  products: Product[];
  productsLoaded: boolean;
  currentSession: ShopSession | null;
  loading: boolean;
  error?: string;
  lastFetched?: number;
}

const initialState: ShopState = {
  products: [],
  productsLoaded: false,
  currentSession: null,
  loading: false,
  error: undefined,
  lastFetched: undefined,
};

export const fetchProductsThunk = createAsyncThunk(
  "shop/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      return await listProducts();
    } catch (e: any) {
      return rejectWithValue(e?.message || "Unable to fetch products");
    }
  }
);

export const fetchCurrentSessionThunk = createAsyncThunk(
  "shop/fetchCurrentSession",
  async (_, { rejectWithValue }) => {
    try {
      return await getCurrentSession();
    } catch (e: any) {
      return rejectWithValue(e?.message || "Unable to fetch current session");
    }
  }
);

export const openSessionThunk = createAsyncThunk<
  ShopSession,
  { openedBy: { id?: string; name?: string } }
>(
  "shop/openSession",
  async ({ openedBy }, { rejectWithValue }) => {
    try {
      return await openSession(openedBy);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to open session");
    }
  }
);

export const addReceiptThunk = createAsyncThunk<
  ShopSession,
  { sessionId: string; payload: ReceivePayload }
>(
  "shop/addReceipt",
  async ({ sessionId, payload }, { rejectWithValue }) => {
    try {
      return await addReceipt(sessionId, payload);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to record receipt");
    }
  }
);

export const addWasteThunk = createAsyncThunk<
  ShopSession,
  { sessionId: string; payload: WasteShopPayload }
>(
  "shop/addWaste",
  async ({ sessionId, payload }, { rejectWithValue }) => {
    try {
      return await addWaste(sessionId, payload);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to record waste");
    }
  }
);

export const closeSessionThunk = createAsyncThunk<
  ShopSession,
  { sessionId: string; payload: ClosePayload; closedBy: { id?: string; name?: string } }
>(
  "shop/closeSession",
  async ({ sessionId, payload, closedBy }, { rejectWithValue }) => {
    try {
      return await closeSession(sessionId, payload, closedBy);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to close session");
    }
  }
);

export const reopenSessionThunk = createAsyncThunk<ShopSession, { sessionId: string }>(
  "shop/reopenSession",
  async ({ sessionId }, { rejectWithValue }) => {
    try {
      return await reopenSession(sessionId);
    } catch (e: any) {
      return rejectWithValue(e?.message || "Failed to reopen session");
    }
  }
);

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    clearShopError(state) {
      state.error = undefined;
    },
    setCurrentSession(state, action: PayloadAction<ShopSession | null>) {
      state.currentSession = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.products = action.payload;
        state.productsLoaded = true;
      })
      .addCase(fetchCurrentSessionThunk.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchCurrentSessionThunk.fulfilled, (state, action) => {
        state.currentSession = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchCurrentSessionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch current session";
      })
      .addCase(openSessionThunk.fulfilled, (state, action) => {
        state.currentSession = action.payload;
      })
      .addCase(openSessionThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to open session";
      })
      .addCase(addReceiptThunk.fulfilled, (state, action) => {
        state.currentSession = action.payload;
      })
      .addCase(addReceiptThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to record receipt";
      })
      .addCase(addWasteThunk.fulfilled, (state, action) => {
        state.currentSession = action.payload;
      })
      .addCase(addWasteThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to record waste";
      })
      .addCase(closeSessionThunk.fulfilled, (state, action) => {
        state.currentSession = action.payload;
      })
      .addCase(closeSessionThunk.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to close session";
      })
      .addCase(reopenSessionThunk.fulfilled, (state, action) => {
        state.currentSession = action.payload;
      });
  },
});

export const { clearShopError, setCurrentSession } = shopSlice.actions;
export default shopSlice.reducer;
