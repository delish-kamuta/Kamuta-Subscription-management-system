import { apiClient, ensureValidTokenOrMessage } from "~/lib/api";

export interface GenerateIrregularTicketPayload {
  payer_name: string;
  meal_type: string; // e.g., "Regular" | "VIP" | "VVIP"
  irregular_payer_type: string; // e.g., "irregular_student"
  payment_method?: string; // required for CASHIER
  amount_paid?: number; // optional, validation might be on backend or removed
  branch_id?: string; // Optional, for Admin to specify branch
}

export interface IrregularTicketResponseData {
  id: string;        // The main ticket UUID
  qr_id: string;     // The content encoded in the QR
  branch_id?: string;
  payer_name: string;
  meal_paid: string;
  is_used?: boolean;
  issued_at?: string;
  expires_at: string;
  // Optional/Legacy fields depending on what else is kept
  irregular_payer_type?: string; 
  amount_paid?: number; 
  payment_method?: string;
  branch_name?: string;
}

export interface GenerateIrregularTicketResponse {
  success: boolean;
  message?: string;
  data?: IrregularTicketResponseData;
}

export async function generateIrregularTicket(
  payload: GenerateIrregularTicketPayload
): Promise<GenerateIrregularTicketResponse> {
  const tokenError = ensureValidTokenOrMessage();
  if (tokenError) return { success: false, message: tokenError };
  try {
    const data = await apiClient<any>("/irregular-tickets/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data as GenerateIrregularTicketResponse;
  } catch (e: any) {
    return { success: false, message: e?.message || "Network error" };
  }
}

export async function scanIrregularTicket(qrCode: string): Promise<GenerateIrregularTicketResponse> {
  const tokenError = ensureValidTokenOrMessage();
  if (tokenError) return { success: false, message: tokenError };
  try {
    const data = await apiClient<any>("/irregular-tickets/scan", {
      method: "POST",
      body: JSON.stringify({ qr_code: qrCode }),
    });
    return data as GenerateIrregularTicketResponse;
  } catch (e: any) {
    return { success: false, message: e?.message || "Network error" };
  }
}
