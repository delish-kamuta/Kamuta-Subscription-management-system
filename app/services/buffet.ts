import { apiClient } from "~/lib/api";
import {
  mockGetCurrentShift,
  mockStartShift,
  mockAddEntry,
  mockCloseShift,
} from "./__mocks__/buffet.mock";

const USE_MOCKS = import.meta.env.VITE_USE_MOCK_STORE === "true";

// ---------- Types ----------

export type BuffetShiftStatus = "open" | "closed";
export type BuffetEntryKind = "INITIAL" | "TOPUP" | "REMAINING" | "EXCEPTION";
export type ExceptionKind = "staff" | "guest" | "no_code";
export type BuffetMealType = "Regular" | "VIP" | "VVIP";

export interface BuffetEntry {
  id: string;
  shift_id: string;
  kind: BuffetEntryKind;
  quantity: number;
  exception_kind?: ExceptionKind;
  created_at: string;
}

export interface BuffetShift {
  id: string;
  status: BuffetShiftStatus;
  // Tiers this shift covers. Plates are POOLED across every tier in this list —
  // e.g. ["Regular","VIP"] means one buffet line serves both, VIP just also
  // get tea (tracked as ancillary cost elsewhere). Uniqueness for a scanner
  // is per-tier: no tier can appear in two open shifts at the same time.
  meal_types: BuffetMealType[];
  branch_id?: string;
  scanner_id?: string;
  scanner_name?: string;
  started_at: string;
  closed_at?: string;
  initial_qty: number;
  topup_qty: number;
  remaining_qty: number;
  exceptions_staff: number;
  exceptions_guest: number;
  exceptions_no_code: number;
  plates_out: number;         // initial + topup - remaining
  scans_count?: number;       // only set on close — sum across all tiers this shift covers
  gap_plates?: number;        // only set on close
  gap_rwf?: number;           // only set on close
  plate_price?: number;       // base food cost per plate — min tier price when pooled
  entries: BuffetEntry[];
}

export interface StartShiftPayload {
  initial_qty: number;
  meal_types: BuffetMealType[];
  branch_id?: string;
}

export interface EntryPayload {
  kind: BuffetEntryKind;
  quantity: number;
  exception_kind?: ExceptionKind;
}

export interface CloseShiftPayload {
  remaining_qty?: number;
  // Optional. When omitted, the backend derives the scan count from meal_logs
  // matching this shift's tiers + time window + scanner. The scanner doesn't
  // need to type it — the QR scans they already did are the source of truth.
  scans_count?: number;
}

// ---------- Service functions ----------

// A scanner can have MULTIPLE open shifts at once — one per meal tier
// (Regular / VIP / VVIP) if the branch runs multiple buffet lines.
export async function getCurrentBuffetShifts(scannerId?: string): Promise<BuffetShift[]> {
  if (USE_MOCKS) return mockGetCurrentShift(scannerId);
  const res = await apiClient<any>("/buffet/shifts/current");
  const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
  return list;
}

export async function startBuffetShift(
  scanner: { id?: string; name?: string },
  payload: StartShiftPayload,
): Promise<BuffetShift> {
  if (USE_MOCKS) return mockStartShift(scanner, payload);
  const res = await apiClient<any>("/buffet/shift/start", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function addBuffetEntry(
  shiftId: string,
  payload: EntryPayload,
): Promise<BuffetShift> {
  if (USE_MOCKS) return mockAddEntry(shiftId, payload);
  const res = await apiClient<any>(`/buffet/shift/${shiftId}/entry`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function closeBuffetShift(
  shiftId: string,
  payload: CloseShiftPayload,
): Promise<BuffetShift> {
  if (USE_MOCKS) return mockCloseShift(shiftId, payload);
  const res = await apiClient<any>(`/buffet/shift/${shiftId}/close`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}
