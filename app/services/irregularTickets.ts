import { authFetch, ensureValidTokenOrMessage } from "~/lib/api";

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
    const res = await authFetch(
      "https://restaurant-bn-api.onrender.com/api/irregular-tickets/generate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    let json: any = null;
    try { json = await res.json(); } catch {}
    if (!res.ok) {
      const msg = json?.message || json?.error || `Failed to generate ticket (${res.status})`;
      return { success: false, message: msg };
    }
    return (json ?? { success: true }) as GenerateIrregularTicketResponse;
  } catch (e: any) {
    return { success: false, message: e?.message || "Network error" };
  }
}

export async function scanIrregularTicket(qrCode: string): Promise<GenerateIrregularTicketResponse> {
  const tokenError = ensureValidTokenOrMessage();
  if (tokenError) return { success: false, message: tokenError };
  try {
    const res = await authFetch(
      "https://restaurant-bn-api.onrender.com/api/irregular-tickets/scan",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_code: qrCode }),
      }
    );
    let json: any = null;
    try { json = await res.json(); } catch {}
    if (!res.ok) {
      const msg = json?.message || json?.error || `Failed to scan ticket (${res.status})`;
      return { success: false, message: msg };
    }
    return (json ?? { success: true }) as GenerateIrregularTicketResponse;
  } catch (e: any) {
    return { success: false, message: e?.message || "Network error" };
  }
}
