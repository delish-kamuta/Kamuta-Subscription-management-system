import { apiClient } from "~/lib/api";
import {
  mockListYieldStandards,
  mockCreateYieldStandard,
  mockUpdateYieldStandard,
  mockDeleteYieldStandard,
} from "./__mocks__/yieldStandards.mock";

const USE_MOCKS = import.meta.env.VITE_USE_MOCK_STORE === "true";

export interface YieldStandard {
  id: string;
  product_id: string;
  product_name: string;
  input_item_id: string;
  input_item_name: string;
  input_qty: number;
  input_unit: string;
  output_qty: number;
  tolerance_pct: number; // ± percentage
  updated_at: string;
}

export type YieldStandardPayload = Omit<YieldStandard, "id" | "updated_at">;

export async function listYieldStandards(): Promise<YieldStandard[]> {
  if (USE_MOCKS) return mockListYieldStandards();
  const res = await apiClient<any>("/yield-standards");
  return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
}

export async function createYieldStandard(payload: YieldStandardPayload): Promise<YieldStandard> {
  if (USE_MOCKS) return mockCreateYieldStandard(payload);
  const res = await apiClient<any>("/yield-standards", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateYieldStandard(id: string, payload: Partial<YieldStandardPayload>): Promise<YieldStandard> {
  if (USE_MOCKS) return mockUpdateYieldStandard(id, payload);
  const res = await apiClient<any>(`/yield-standards/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function deleteYieldStandard(id: string): Promise<{ id: string }> {
  if (USE_MOCKS) return mockDeleteYieldStandard(id);
  const res = await apiClient<any>(`/yield-standards/${id}`, { method: "DELETE" });
  return res?.data || res || { id };
}
