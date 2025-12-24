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
  created_at: string
}

export interface MealLogsResponse {
  success: boolean
  message?: string
  data?: MealLogItem[]
}

export type MealLogsQuery = Partial<{
  client_type: string
  meal_type: string
  deduction_source: string
  branch_id: string
  client_user_id: string
  scanned_by: string
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
