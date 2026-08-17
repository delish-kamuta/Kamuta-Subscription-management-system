import { apiClient } from "~/lib/api";
import {
  mockListProducts,
  mockGetCurrentSession,
  mockOpenSession,
  mockAddReceipt,
  mockAddWaste,
  mockCloseSession,
  mockReopenSession,
} from "./__mocks__/shop.mock";

const USE_MOCKS = import.meta.env.VITE_USE_MOCK_STORE === "true";

// ---------- Types ----------

export type ProductSource = "produced" | "bought";

export interface Product {
  id: string;
  name: string;
  source: ProductSource;
  selling_price: number;
  active: boolean;
}

export interface SessionLine {
  product_id: string;
  product_name: string;
  source: ProductSource;
  selling_price: number;
  opening_qty: number;
  received_produced_qty: number;
  received_bought_qty: number;
  received_bought_cost: number;
  waste_qty: number;
  waste_reason?: string;
  closing_qty?: number;
  sold_qty?: number;
  revenue?: number;
  margin?: number;
}

export type ShopSessionStatus = "open" | "closed";

export interface ShopSession {
  id: string;
  date: string; // YYYY-MM-DD
  status: ShopSessionStatus;
  opened_by_id?: string;
  opened_by_name?: string;
  opened_at: string;
  closed_by_id?: string;
  closed_by_name?: string;
  closed_at?: string;
  lines: SessionLine[];
  cash_actual?: number;
  cash_expected?: number;
  cash_variance?: number;
}

export interface ReceivePayload {
  product_id: string;
  quantity: number;
  kind: "produced" | "bought";
  buying_cost?: number; // required when kind === "bought"
}

export interface WasteShopPayload {
  product_id: string;
  quantity: number;
  reason: string;
}

export interface ClosePayload {
  closings: { product_id: string; closing_qty: number }[];
  cash_actual: number;
}

// ---------- Service functions ----------

export async function listProducts(): Promise<Product[]> {
  if (USE_MOCKS) return mockListProducts();
  const res = await apiClient<any>("/products");
  return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
}

export async function getCurrentSession(): Promise<ShopSession | null> {
  if (USE_MOCKS) return mockGetCurrentSession();
  const res = await apiClient<any>("/shop/session/current");
  return res?.data || res || null;
}

export async function openSession(openedBy: { id?: string; name?: string }): Promise<ShopSession> {
  if (USE_MOCKS) return mockOpenSession(openedBy);
  const res = await apiClient<any>("/shop/session/open", {
    method: "POST",
    body: JSON.stringify({}),
  });
  return res?.data || res;
}

export async function addReceipt(sessionId: string, payload: ReceivePayload): Promise<ShopSession> {
  if (USE_MOCKS) return mockAddReceipt(sessionId, payload);
  const res = await apiClient<any>(`/shop/session/${sessionId}/receive`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function addWaste(sessionId: string, payload: WasteShopPayload): Promise<ShopSession> {
  if (USE_MOCKS) return mockAddWaste(sessionId, payload);
  const res = await apiClient<any>(`/shop/session/${sessionId}/waste`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function closeSession(
  sessionId: string,
  payload: ClosePayload,
  closedBy: { id?: string; name?: string },
): Promise<ShopSession> {
  if (USE_MOCKS) return mockCloseSession(sessionId, payload, closedBy);
  const res = await apiClient<any>(`/shop/session/${sessionId}/close`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function reopenSession(sessionId: string): Promise<ShopSession> {
  if (USE_MOCKS) return mockReopenSession(sessionId);
  const res = await apiClient<any>(`/shop/session/${sessionId}/reopen`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return res?.data || res;
}
