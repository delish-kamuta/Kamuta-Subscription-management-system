import { apiClient, ensureValidTokenOrMessage } from "~/lib/api";

export interface GenerateIrregularTicketPayload {
  payer_name: string;
  meal_type: string; // e.g., "Regular" | "VIP" | "VVIP"
  payment_method?: string; // required for CASHIER
  amount_paid?: number; // required for CASHIER
}

export interface IrregularTicketResponseData {
  qr_code: string;
  ticket_id: string;
  payer_name: string;
  meal_type: string;
  amount_paid?: number;
  payment_method?: string;
  expires_at: string;
  expires_in_hours?: number; // typically 24
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
