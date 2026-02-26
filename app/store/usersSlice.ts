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

/** Extract an array of users from any common API response shape */
function extractItems(data: any): UserItem[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (data?.data?.data && Array.isArray(data.data.data)) return data.data.data
  if (Array.isArray(data?.users)) return data.users
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.items)) return data.items
  return []
}

/** Extract total count from a paginated response */
function extractTotal(data: any): number {
  if (!data || Array.isArray(data)) return 0
  return data.total || data.count || data.totalItems ||
    data.data?.total || data.data?.count || 0
}

/** Extract total pages from a paginated response */
function extractTotalPages(data: any): number {
  if (!data || Array.isArray(data)) return 1
  return data.totalPages || data.total_pages || data.pages ||
    data.data?.totalPages || data.data?.total_pages || data.data?.pages || 1
}

export const fetchUsersThunk = createAsyncThunk('users/fetch', async (_, { rejectWithValue }) => {
  try {
    // First, try to fetch all users in a single request with a large limit
    let data = await apiClient<any>('/users?limit=10000')

    if (typeof data === 'string') {
      try { data = JSON.parse(data) } catch {}
    }

    let items = extractItems(data)

    // If we got a paginated response with fewer items than the total,
    // fetch the remaining pages
    const total = extractTotal(data)
    const totalPages = extractTotalPages(data)

    if (total > 0 && items.length < total && totalPages > 1) {
      // We only got page 1, fetch the rest
      const pagePromises: Promise<any>[] = []
      for (let p = 2; p <= totalPages && p <= 100; p++) {
        pagePromises.push(apiClient<any>(`/users?page=${p}`))
      }
      const results = await Promise.allSettled(pagePromises)
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const pageItems = extractItems(result.value)
          items = [...items, ...pageItems]
        }
      }
    }

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
