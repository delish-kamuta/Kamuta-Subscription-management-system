import { authFetch, ensureValidTokenOrMessage } from "~/lib/api"

export interface WorkerWalletResponse {
  success: boolean
  data?: {
    prepaid_amount: number
    remaining_amount: number
    credit_limit: number
    credit_used: number
    transactions: any[]
  }
  message?: string
}

export async function getWorkerWallet(workerId: string): Promise<WorkerWalletResponse> {
  const tokenError = ensureValidTokenOrMessage()
  if (tokenError) return { success: false, message: tokenError }
  const resp = await authFetch(`https://restaurant-bn-api.onrender.com/api/workers/${workerId}/wallet`)
  if (!resp.ok) {
    let msg = 'Failed to fetch wallet'
    try { const j = await resp.json(); msg = j.message || msg } catch {}
    return { success: false, message: msg }
  }
  try {
    const data = await resp.json()
    return data as WorkerWalletResponse
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : 'Parse error' }
  }
}

export async function addWorkerWalletPayment(workerId: string, payload: { amount: number; payment_method?: string; note?: string }): Promise<{ success: boolean; message?: string; data?: any }> {
  const tokenError = ensureValidTokenOrMessage()
  if (tokenError) return { success: false, message: tokenError }
  const res = await authFetch(`https://restaurant-bn-api.onrender.com/api/workers/${workerId}/wallet/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: tokenError || '' },
    body: JSON.stringify(payload),
  })
  let data: any = null
  try { data = await res.json() } catch {}
  if (!res.ok) {
    const msg = data?.message || data?.error || `Add payment failed: ${res.status}`
    return { success: false, message: msg }
  }
  return { success: true, data: data?.data || data }
}
