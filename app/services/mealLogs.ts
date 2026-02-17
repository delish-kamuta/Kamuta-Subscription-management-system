import { apiClient, ensureValidTokenOrMessage } from "~/lib/api"

export interface MealLogItem {
  id: string
  client_type: "student" | "worker" | "irregular_client" | string
  meal_type: "Regular" | "VIP" | "VVIP" | string
  deduction_source: "subscription" | "prepaid" | "credit" | "paid_ticket" | string
  branch_id?: string
  client_user_id?: string
  scanned_by?: string
  scanner?: {
    id: string
    full_name: string
  }
  scannedBy?: {
    id: string
    full_name: string
  }
  created_at: string
}

export interface MealLogsResponse {
  success: boolean
  message?: string
  data?: MealLogItem[]
  pagination?: {
    current_page: number
    per_page: number
    total_items: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export type MealLogsQuery = Partial<{
  client_type: string
  meal_type: string
  deduction_source: string
  branch_id: string
  client_user_id: string
  scanned_by: string
  per_page: number
  page: number
}>

export async function listMealLogs(query: MealLogsQuery = {}): Promise<MealLogsResponse> {
  const tokenError = ensureValidTokenOrMessage()
  if (tokenError) return { success: false, message: tokenError }
  const params = new URLSearchParams()
  Object.entries(query).forEach(([k, v]) => { if (v) params.set(k, String(v)) })
  const queryString = params.toString() ? `?${params.toString()}` : ''
  
  try {
    const data = await apiClient<any>(`/meal-logs${queryString}`)
    return data as MealLogsResponse
  } catch (e: any) {
    return { success: false, message: e?.message || "Network error" }
  }
}

export interface MealLogsStatsResponse {
  success: boolean;
  data?: {
    totalMeals: number;
    dailyLogsData: { label: string; count: number }[]; // Changed date -> label
    lunchVsSupperData: { Lunch: number; Supper: number }; // Changed array -> object
    branchStats: Record<string, { Regular: number; VIP: number; VVIP: number }>;
    topScanners: { scanned_by: string; full_name: string; count: number }[]; // Expanded
    // Adding optional fields in case they are restored later or computed on frontend
    thisMonthMeals?: number;
    lastMonthMeals?: number;
  };
  message?: string;
}

export async function getMealLogsStats(timeFilter: string = "Week"): Promise<MealLogsStatsResponse> {
  const tokenError = ensureValidTokenOrMessage()
  if (tokenError) return { success: false, message: tokenError }
  
  try {
    const data = await apiClient<any>(`/meal-logs/stats?timeFilter=${timeFilter}`)
    return data as MealLogsStatsResponse
  } catch (e: any) {
    return { success: false, message: e?.message || "Failed to fetch stats" }
  }
}
