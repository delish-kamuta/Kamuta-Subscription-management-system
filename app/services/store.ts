import { apiClient } from "~/lib/api";
import {
  mockListStoreItems,
  mockRecordPurchase,
  mockIssueToKitchen,
  mockRecordCount,
  mockListWaste,
  mockRecordWaste,
} from "./__mocks__/store.mock";

// Flip to false (or unset the env var) once the real backend ships.
// No component code changes when this happens — only this file's call-sites.
const USE_MOCKS = import.meta.env.VITE_USE_MOCK_STORE === "true";

// ---------- Types ----------

export type ValuationMode = "stocked" | "direct_use";

export interface StoreItem {
  id: string;
  name: string;
  unit: string;
  quantity_on_hand: number;
  avg_unit_cost: number;
  total_value: number;
  min_quantity: number;
  valuation_mode: ValuationMode;
  is_low_stock: boolean;
}

export type PurchaseDestination = "store" | "buffet" | "snacks";

export interface Purchase {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  total_cost: number;
  unit_cost: number;
  supplier?: string;
  destination: PurchaseDestination;
  direct_use_for?: "buffet" | "snacks";
  created_at: string;
}

export interface PurchasePayload {
  item_id?: string;
  new_item?: {
    name: string;
    unit: string;
    min_quantity?: number;
    valuation_mode?: ValuationMode;
  };
  quantity: number;
  total_cost: number;
  supplier?: string;
  destination: PurchaseDestination;
  direct_use_for?: "buffet" | "snacks";
}

export type IssuePurpose = "buffet" | "snacks";

export interface IssueLineInput {
  item_id: string;
  quantity: number;
  purpose: IssuePurpose;
  intended_product?: string;
}

export interface IssueLine extends IssueLineInput {
  item_name: string;
  unit: string;
  unit_cost: number;
  total_cost: number;
}

export interface Issue {
  id: string;
  lines: IssueLine[];
  created_at: string;
}

export interface IssuePayload {
  lines: IssueLineInput[];
}

export interface CountEntryInput {
  item_id: string;
  actual_qty: number;
  reason?: string;
}

export interface CountEntry {
  item_id: string;
  item_name: string;
  unit: string;
  system_qty: number;
  actual_qty: number;
  variance: number;
  reason?: string;
}

export interface PhysicalCount {
  id: string;
  entries: CountEntry[];
  created_at: string;
}

export interface CountPayload {
  entries: CountEntryInput[];
}

export interface WasteEntry {
  id: string;
  item_id: string;
  item_name: string;
  unit: string;
  quantity: number;
  reason: string;
  total_cost: number;
  created_at: string;
}

export interface WastePayload {
  item_id: string;
  quantity: number;
  reason: string;
}

// ---------- Service functions ----------

export async function listStoreItems(): Promise<StoreItem[]> {
  if (USE_MOCKS) return mockListStoreItems();
  const res = await apiClient<any>("/store/items");
  return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
}

export async function recordPurchase(payload: PurchasePayload): Promise<Purchase> {
  if (USE_MOCKS) return mockRecordPurchase(payload);
  const res = await apiClient<any>("/store/purchase", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function issueToKitchen(payload: IssuePayload): Promise<Issue> {
  if (USE_MOCKS) return mockIssueToKitchen(payload);
  const res = await apiClient<any>("/store/issue", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function recordCount(payload: CountPayload): Promise<PhysicalCount> {
  if (USE_MOCKS) return mockRecordCount(payload);
  const res = await apiClient<any>("/store/count", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function listWaste(): Promise<WasteEntry[]> {
  if (USE_MOCKS) return mockListWaste();
  const res = await apiClient<any>("/store/waste");
  return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
}

export async function recordWaste(payload: WastePayload): Promise<WasteEntry> {
  if (USE_MOCKS) return mockRecordWaste(payload);
  const res = await apiClient<any>("/store/waste", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}
