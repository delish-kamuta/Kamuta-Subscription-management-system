import { getToken, ensureValidTokenOrMessage } from "~/lib/api"

export interface GenerateMealTokenPayload {
  reg_number?: string | number
  customer_type?: string // e.g., "student" | "worker"
  meal_type?: string
  quantity?: number
  extras?: string
  extras_quantity?: number
  total_price?: number
}

export interface GenerateMealTokenResponse {
  success: boolean
  message?: string
  data?: {
    token: string
    expires_at: string
    qr_value: string
  }
}

export async function generateMealToken(payload: GenerateMealTokenPayload): Promise<GenerateMealTokenResponse> {
  const tokenError = ensureValidTokenOrMessage()
  if (tokenError) throw new Error(tokenError)
  const token = getToken()
  const resp = await fetch('https://restaurant-bn-api.onrender.com/api/auth/generate-meal-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify(payload),
  })
  let msg = 'Failed to generate meal token'
  if (!resp.ok) {
    try { const j = await resp.json(); msg = j.message || msg } catch {}
    throw new Error(msg)
  }
  return resp.json()
}
