import { apiClient, ensureValidTokenOrMessage } from "~/lib/api"

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
  
  try {
    const data = await apiClient<any>("/qr-otp/generate", {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    })
    return data as GenerateQrOtpResponse
  } catch (e: any) {
    return { success: false, message: e?.message || "QR generation failed" }
  }
}

export async function generateSelfQrOtp(): Promise<GenerateQrOtpResponse> {
  const tokenError = ensureValidTokenOrMessage()
  if (tokenError) return { success: false, message: tokenError }
  
  try {
    const data = await apiClient<any>("/qr-otp/generate-self", {
      method: "POST",
    })
    return data as GenerateQrOtpResponse
  } catch (e: any) {
    return { success: false, message: e?.message || "QR self generation failed" }
  }
}

export interface ScanQrOtpResponse {
  success: boolean
  data?: {
    user_name: string
    payment_result: {
      remaining_meals: number
    }
  }
  message?: string
}

export async function scanQrOtp(qrCode: string): Promise<ScanQrOtpResponse> {
  const tokenError = ensureValidTokenOrMessage()
  if (tokenError) return { success: false, message: tokenError }
  
  try {
    const data = await apiClient<any>("/qr-otp/scan", {
      method: "POST",
      body: JSON.stringify({ qr_code: qrCode }),
    })
    return data as ScanQrOtpResponse
  } catch (e: any) {
    return { success: false, message: e?.message || "QR scan failed" }
  }
}
