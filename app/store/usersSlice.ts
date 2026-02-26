import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '~/lib/api'
import type { Student } from '~/types/auth'

export interface UserItem {
  id: string
  full_name: string
  phone: string
  role: string
  branch_id: string
  created_at: string
  student?: Student
}

interface UsersState {
  items: UserItem[]
  loaded: boolean
  loading: boolean
  error?: string
  lastFetched?: number
}

const initialState: UsersState = {
  items: [],
  loaded: false,
  loading: false,
}

function extractTotal(data: any): number {
  if (!data || Array.isArray(data)) return 0;

  return (
    data?.meta?.total ??
    data?.pagination?.total_items ??
    data?.pagination?.totalItems ??
    data?.total ??
    data?.count ??
    data?.totalItems ??
    data?.data?.meta?.total ??
    data?.data?.pagination?.total_items ??
    data?.data?.total ??
    data?.data?.count ??
    0
  );
}

function extractTotalPages(data: any): number {
  if (!data || Array.isArray(data)) return 1;

  return (
    data?.meta?.totalPages ??
    data?.pagination?.total_pages ??
    data?.pagination?.totalPages ??
    data?.totalPages ??
    data?.total_pages ??
    data?.pages ??
    data?.data?.meta?.totalPages ??
    data?.data?.pagination?.total_pages ??
    data?.data?.totalPages ??
    1
  );
}

function extractItems(data: any): UserItem[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  // common shapes
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;

  return [];
}

const normalize = (x: any) => {
  if (typeof x === "string") {
    try { return JSON.parse(x); } catch { return x; }
  }
  return x;
};

export const fetchUsersThunk = createAsyncThunk('users/fetch', async (_, { rejectWithValue }) => {
  try {
    // Fetch page 1 to discover the response shape and total count
    let firstPage = normalize(await apiClient<any>('/users?page=1&limit=100'));

    let items = extractItems(firstPage)
    const total = extractTotal(firstPage)
    const totalPages = extractTotalPages(firstPage)
    const pageSize =
      firstPage?.pagination?.per_page ??
      firstPage?.meta?.limit ??
      100

    console.log("Users pagination:", {
      page1Count: items.length,
      total,
      totalPages,
      limit: firstPage?.meta?.limit,
    })

    // If we already have all users, we're done
    if (total > 0 && items.length >= total) {
      console.log("Users fetched:", items.length, "expected:", total)
      return items as UserItem[]
    }

    // Fetch remaining pages using backend-provided totalPages and pageSize
    if (totalPages > 1) {

      const pagePromises: Promise<any>[] = []
      for (let p = 2; p <= totalPages; p++) {
        pagePromises.push(apiClient<any>(`/users?page=${p}&limit=${pageSize}`))
      }
      const results = await Promise.allSettled(pagePromises)
      for (const result of results) {
        if (result.status === 'fulfilled') {
          items = [...items, ...extractItems(normalize(result.value))]
        }
      }
    }

    console.log("Users fetched:", items.length, "expected:", total)
    return items as UserItem[]
  } catch (e: any) {
    return rejectWithValue(e instanceof Error ? e.message : e?.message || 'Failed to fetch users')
  }
})

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUserOptimistic(state, action: PayloadAction<UserItem>) {
      state.items = [action.payload, ...state.items]
    },
    removeUserOptimistic(state, action: PayloadAction<string>) {
      state.items = state.items.filter(u => u.id !== action.payload)
    },
    updateUserOptimistic(state, action: PayloadAction<Partial<UserItem> & { id: string }>) {
      state.items = state.items.map(u => (u.id === action.payload.id ? { ...u, ...action.payload } : u))
    },
    invalidateUsers(state) {
      state.loaded = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.items = action.payload
        state.loaded = true
        state.loading = false
        state.lastFetched = Date.now()
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || action.error.message
      })
  },
})

export const { addUserOptimistic, removeUserOptimistic, updateUserOptimistic, invalidateUsers } = usersSlice.actions
export default usersSlice.reducer
