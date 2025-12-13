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
