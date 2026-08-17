import { apiClient, ensureValidTokenOrMessage } from "~/lib/api"

export interface MealLogItem {
  id: string
  client_type: "student" | "worker" | "irregular_client" | string
  meal_type: "Regular" | "VIP" | "VVIP" | string
  deduction_source: "subscription" | "prepaid" | "credit" | "paid_ticket" | string
  branch_id?: string
  client_user_id?: string
  scanned_by?: string
  scanner?: { id: string; full_name: string }
  scannedBy?: { id: string; full_name: string }
  clientUser?: { id: string; full_name: string; role: string }
  branch?: { id: string; name: string; campus?: string }
  created_at: string
}

export interface MealLogsPagination {
  current_page: number
  per_page: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface MealLogsResponse {
  success: boolean
  message?: string
  data?: MealLogItem[]
  pagination?: MealLogsPagination
}

export type MealLogsQuery = Partial<{
  client_type: string
  meal_type: string
  deduction_source: string
  branch_id: string
  client_user_id: string
  scanned_by: string
  page: number
  per_page: number   // legacy — backend ignores this, but meals-logs.tsx still sends it
  limit: number
  // Sent for forward compatibility; backend support pending
  search: string
  date_from: string
  date_to: string
  meal_time: string
}>

export async function listMealLogs(query: MealLogsQuery = {}): Promise<MealLogsResponse> {
  const tokenError = ensureValidTokenOrMessage()
  if (tokenError) return { success: false, message: tokenError }
  const params = new URLSearchParams()
  Object.entries(query).forEach(([k, v]) => { if (v) params.set(k, String(v)) })
  const queryString = params.toString() ? `?${params.toString()}` : ''
  
  try {
    const raw = await apiClient<any>(`/meal-logs${queryString}`)

    // The API wraps items in a double-nested shape: { data: { data: [...], pagination: {...} } }
    const items: MealLogItem[] =
      Array.isArray(raw?.data?.data) ? raw.data.data
      : Array.isArray(raw?.data)     ? raw.data
      : []

    const pagination: MealLogsPagination | undefined =
      raw?.data?.pagination ?? raw?.pagination ?? undefined

    return { success: raw?.success ?? true, message: raw?.message, data: items, pagination }
  } catch (e: any) {
    return { success: false, message: e?.message || "Network error" }
  }
}

export interface MealLogsStatsResponse {
  success: boolean;
  data?: {
    totalMeals: number;
    dailyLogsData: { date: string; day: string; count: number }[]; // Updated to match new backend response
    lunchVsSupperData: { Lunch: number; Supper: number }; // Changed array -> object
    branchStats: Record<string, { Regular: number; VIP: number; VVIP: number }>;
    topScanners: { scanned_by: string; full_name: string; count: number }[]; // Expanded
    // Adding optional fields in case they are restored later or computed on frontend
    thisMonthMeals?: number;
    lastMonthMeals?: number;
  };
  message?: string;
}

export async function getMealLogsStats(
  timeFilter: string = "Week",
  selectedPeriodDate?: string
): Promise<MealLogsStatsResponse> {
  const tokenError = ensureValidTokenOrMessage()
  if (tokenError) return { success: false, message: tokenError }
  
  try {
    const params = new URLSearchParams();
    params.set("timeFilter", timeFilter);
    if (selectedPeriodDate) {
      params.set("selectedPeriodDate", selectedPeriodDate);
    }
    
    const data = await apiClient<any>(`/meal-logs/stats?${params.toString()}`)
    return data as MealLogsStatsResponse
  } catch (e: any) {
    return { success: false, message: e?.message || "Failed to fetch stats" }
  }
}
