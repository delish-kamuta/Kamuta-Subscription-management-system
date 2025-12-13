import { authFetch, ensureValidTokenOrMessage } from "~/lib/api"

export interface GenerateQrOtpResponse {
  success: boolean
  data?: {
    qr_code: string
    user_name: string
    expires_in_seconds: number
  }
  message?: string
}

export async function generateQrOtpForUser(userId: string): Promise<GenerateQrOtpResponse> {
  const tokenError = ensureValidTokenOrMessage()
  if (tokenError) return { success: false, message: tokenError }
  const res = await authFetch("https://restaurant-bn-api.onrender.com/api/qr-otp/generate", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  })
  let data: any = null
  try { data = await res.json() } catch {}
  if (!res.ok) {
    const msg = data?.message || data?.error || `QR generation failed: ${res.status}`
    return { success: false, message: msg }
  }
  return data as GenerateQrOtpResponse
}

export async function generateSelfQrOtp(): Promise<GenerateQrOtpResponse> {
  const tokenError = ensureValidTokenOrMessage()
  if (tokenError) return { success: false, message: tokenError }
  const res = await authFetch("https://restaurant-bn-api.onrender.com/api/qr-otp/generate-self", {
    method: "POST",
  })
  let data: any = null
  try { data = await res.json() } catch {}
  if (!res.ok) {
    const msg = data?.message || data?.error || `QR self generation failed: ${res.status}`
    return { success: false, message: msg }
  }
  return data as GenerateQrOtpResponse
}
