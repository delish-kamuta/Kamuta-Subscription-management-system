import { apiClient, ensureValidTokenOrMessage } from "~/lib/api"

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
  
  return apiClient("/auth/generate-meal-token", {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface ValidateMealTokenResponse {
  success: boolean
  message?: string
  status?: number
  errorText?: string
  data?: {
    token: string
    valid: boolean
    consumed?: boolean
    meal?: {
      type?: string
      quantity?: number
      extras?: string
      extras_quantity?: number
      total_price?: number
    }
    validated_at?: string
  }
}

export async function validateMealToken(tokenValue: string): Promise<ValidateMealTokenResponse> {
  const tokenError = ensureValidTokenOrMessage()
  if (tokenError) throw new Error(tokenError)
  
  try {
    const data = await apiClient<any>("/auth/validate-meal-token", {
      method: 'POST',
      body: JSON.stringify({ token: tokenValue }),
    })
    return data as ValidateMealTokenResponse
  } catch (e: any) {
    return { success: false, message: e?.message || "Validation failed", status: e?.status }
  }
}
