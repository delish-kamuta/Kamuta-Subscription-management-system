import { authFetch, ensureValidTokenOrMessage } from "~/lib/api"

export interface MealLogItem {
  id: string
  client_type: "student" | "worker" | "irregular_client" | string
  meal_type: "Regular" | "VIP" | "VVIP" | string
  deduction_source: "subscription" | "prepaid" | "credit" | "paid_ticket" | string
  branch_id?: string
  client_user_id?: string
  scanned_by?: string
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
  const url = `https://restaurant-bn-api.onrender.com/api/meal-logs${params.toString() ? `?${params.toString()}` : ''}`
  const res = await authFetch(url)
  let data: any = null
  try { data = await res.json() } catch {}
  if (!res.ok) {
    const msg = data?.message || data?.error || `Failed to fetch meal logs: ${res.status}`
    return { success: false, message: msg }
  }
  return data as MealLogsResponse
}
