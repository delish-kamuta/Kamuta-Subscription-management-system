import { apiClient } from "~/lib/api";
import {
  mockGetShopReconciliation,
  mockGetStoreVariance,
  mockGetBuffetGap,
  mockGetDailyPnL,
  mockGetStoreIssues,
} from "./__mocks__/reconciliation.mock";

const USE_MOCKS = import.meta.env.VITE_USE_MOCK_STORE === "true";

// Every report accepts an optional branch_id so admin can filter to a single
// canteen (BUSOGO, HUYE, MUSANZE, CAVM…) or view all branches at once.

// ---------- Types ----------

export interface ShopReconciliationLine {
  product_name: string;
  // Produced items (chapati, mandazi…) have source="produced" — their real cost
  // is the ingredients used to make them, not a buying_cost per unit.
  // Bought items (sodas, water…) have source="bought" — buying_cost per unit applies.
  source: "produced" | "bought" | string;
  opening_qty: number;
  received_qty: number;
  waste_qty: number;
  closing_qty: number;
  sold_qty: number;
  selling_price: number;
  revenue: number;
  buying_cost: number;    // 0 for produced items
  ingredient_cost: number; // 0 for bought items; aggregate cost of issues + direct-use purchases attributed to this product
  margin: number;         // revenue - buying_cost - ingredient_cost
}

export interface ShopReconciliation {
  date: string;
  branch_id?: string;
  branch_name?: string;
  lines: ShopReconciliationLine[];
  totals: {
    revenue_expected: number;
    cash_actual: number;
    cash_variance: number;
    bought_cost: number;       // sum of buying_cost across bought items
    ingredient_cost: number;   // sum of ingredient_cost across produced items
    margin: number;            // revenue - bought_cost - ingredient_cost
  };
}

export interface StoreVarianceItem {
  item_name: string;
  unit: string;
  counts: number;
  avg_variance: number;
  worst_variance: number;
}

export interface StoreVariance {
  from: string;
  to: string;
  branch_id?: string;
  branch_name?: string;
  items: StoreVarianceItem[];
}

export interface BuffetGapShift {
  shift_id: string;
  scanner_name: string;
  // A shift can cover multiple tiers when plates are pooled on a single line
  // (e.g. Regular + VIP share plates; VIP just also gets tea).
  meal_types: Array<"Regular" | "VIP" | "VVIP" | string>;
  plates_out: number;
  remaining: number;
  scans: number;              // sum across all tiers this shift covers
  exceptions: number;
  gap_plates: number;
  gap_rwf: number;
}

export interface BuffetTierTotals {
  meal_type: "Regular" | "VIP" | "VVIP" | string;
  // Coverage — how many shifts included this tier and how big they were.
  // When a tier is pooled with another, plates_out / remaining are shared.
  shifts_covering: number;
  scans: number;
  exceptions: number;
}

export interface BuffetGapReport {
  date: string;
  branch_id?: string;
  branch_name?: string;
  shifts: BuffetGapShift[];
  by_tier: BuffetTierTotals[];   // per-tier scan/exception totals
  totals: {
    plates_out: number;
    remaining: number;
    scans: number;
    exceptions: number;
    gap_plates: number;
    gap_rwf: number;
  };
}

export interface DailyPnL {
  date: string;
  branch_id?: string;
  branch_name?: string;
  income: { shop_revenue: number; buffet_revenue: number };
  // Cost is split by DESTINATION so a produced item's real cost is visible.
  // - ingredients_issued_shop = value of store issues with purpose="snacks" (used to make chapati etc.)
  // - direct_use_shop = value of purchases where destination="snacks" (bought and used straight away for shop production)
  // - bought_goods = buying_cost of RESOLD items (sodas, water, biscuits)
  // - labor_salary = daily portion of monthly salaries for active workers in the branch
  //   (equal to sum(monthly_salary) / days_in_month; advances/deductions do NOT change it)
  cost: {
    ingredients_issued_shop: number;
    ingredients_issued_buffet: number;
    direct_use_shop: number;
    direct_use_buffet: number;
    bought_goods: number;
    waste_cost: number;
    labor_salary: number;
  };
  total_income: number;
  total_cost: number;
  margin: number;
}

export interface StoreIssueLog {
  id: string;
  created_at: string;
  issued_by: string;
  lines: Array<{
    item_name: string;
    quantity: number;
    unit: string;
    purpose: "buffet" | "snacks" | string;
    intended_product?: string;
    unit_cost: number;
    total_cost: number;
  }>;
}

export interface StoreIssuesReport {
  from: string;
  to: string;
  branch_id?: string;
  branch_name?: string;
  issues: StoreIssueLog[];
}

// ---------- Service functions ----------

const withBranch = (base: string, branchId?: string) =>
  branchId ? `${base}${base.includes("?") ? "&" : "?"}branch_id=${encodeURIComponent(branchId)}` : base;

export async function getShopReconciliation(date: string, branchId?: string): Promise<ShopReconciliation> {
  if (USE_MOCKS) return mockGetShopReconciliation(date, branchId);
  const res = await apiClient<any>(withBranch(`/reconciliation/shop?date=${encodeURIComponent(date)}`, branchId));
  return res?.data || res;
}

export async function getStoreVariance(from: string, to: string, branchId?: string): Promise<StoreVariance> {
  if (USE_MOCKS) return mockGetStoreVariance(from, to, branchId);
  const res = await apiClient<any>(
    withBranch(`/reconciliation/store?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, branchId),
  );
  return res?.data || res;
}

export async function getBuffetGap(date: string, branchId?: string): Promise<BuffetGapReport> {
  if (USE_MOCKS) return mockGetBuffetGap(date, branchId);
  const res = await apiClient<any>(withBranch(`/reconciliation/buffet?date=${encodeURIComponent(date)}`, branchId));
  return res?.data || res;
}

export async function getDailyPnL(date: string, branchId?: string): Promise<DailyPnL> {
  if (USE_MOCKS) return mockGetDailyPnL(date, branchId);
  const res = await apiClient<any>(withBranch(`/reconciliation/pnl?date=${encodeURIComponent(date)}`, branchId));
  return res?.data || res;
}

export async function getStoreIssues(from: string, to: string, branchId?: string): Promise<StoreIssuesReport> {
  if (USE_MOCKS) return mockGetStoreIssues(from, to, branchId);
  const res = await apiClient<any>(
    withBranch(`/reconciliation/store-issues?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, branchId),
  );
  return res?.data || res;
}
