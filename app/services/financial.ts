import { apiClient } from "~/lib/api";
import {
  mockGetLedger,
  mockGetProductProfitability,
  mockGetBranchProfitability,
} from "./__mocks__/financial.mock";

const USE_MOCKS = import.meta.env.VITE_USE_MOCK_STORE === "true";

// ---------- Types ----------

export type LedgerDirection = "in" | "out";

export type LedgerCategory =
  | "subscription"
  | "shop_sale"
  | "buffet_meal"
  | "irregular_ticket"
  | "order_earned"     // event order income, recognised on cook day
  | "purchase"
  | "direct_use"
  | "waste"
  | "labor"
  | "advance"
  | "deduction";

export interface LedgerEntry {
  id: string;
  date: string;              // YYYY-MM-DD
  direction: LedgerDirection;
  category: LedgerCategory;
  subcategory?: string;      // "Chapati", "Alice Cook", "Rice", etc.
  description: string;
  amount: number;            // always positive; direction gives sign
  branch_id?: string;
  branch_name?: string;
  ref_id?: string;           // link back to underlying record if the caller wants a drill-in
  running_balance?: number;  // computed server-side over the filtered set
}

export interface LedgerTotals {
  total_income: number;
  total_expense: number;
  net: number;
  transactions: number;
}

export interface LedgerResponse {
  entries: LedgerEntry[];
  totals: LedgerTotals;
  page: number;
  total_pages: number;
  from: string;
  to: string;
  branch_id?: string;
}

export interface FinancialQuery {
  from: string;
  to: string;
  branch_id?: string;
  direction?: LedgerDirection | "both";
  categories?: LedgerCategory[];
  page?: number;
  limit?: number;
}

export interface ProductProfitability {
  product_id: string;
  product_name: string;
  source: "produced" | "bought";
  units_sold: number;
  revenue: number;
  cost: number;
  margin: number;
  margin_pct: number;
  daily: Array<{ date: string; revenue: number; cost: number }>; // powers sparkline
}

export interface BranchProfitability {
  branch_id: string;
  branch_name: string;
  revenue: number;
  cost: number;
  margin: number;
  margin_pct: number;
  vs_previous?: {
    revenue_delta_pct: number;
    margin_delta_pct: number;
  };
}

export interface ProfitabilityQuery {
  from: string;
  to: string;
  branch_id?: string;
}

// ---------- Service functions ----------

const buildLedgerUrl = (q: FinancialQuery) => {
  const params = new URLSearchParams();
  params.set("from", q.from);
  params.set("to", q.to);
  if (q.branch_id) params.set("branch_id", q.branch_id);
  if (q.direction && q.direction !== "both") params.set("direction", q.direction);
  if (q.categories && q.categories.length > 0) params.set("categories", q.categories.join(","));
  if (q.page) params.set("page", String(q.page));
  if (q.limit) params.set("limit", String(q.limit));
  return `/financial/ledger?${params.toString()}`;
};

const buildProfitabilityUrl = (base: string, q: ProfitabilityQuery) => {
  const params = new URLSearchParams();
  params.set("from", q.from);
  params.set("to", q.to);
  if (q.branch_id) params.set("branch_id", q.branch_id);
  return `${base}?${params.toString()}`;
};

export async function getLedger(query: FinancialQuery): Promise<LedgerResponse> {
  if (USE_MOCKS) return mockGetLedger(query);
  const res = await apiClient<any>(buildLedgerUrl(query));
  return res?.data || res;
}

export async function getProductProfitability(
  query: ProfitabilityQuery,
): Promise<ProductProfitability[]> {
  if (USE_MOCKS) return mockGetProductProfitability(query);
  const res = await apiClient<any>(buildProfitabilityUrl("/financial/products", query));
  return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
}

export async function getBranchProfitability(
  query: ProfitabilityQuery,
): Promise<BranchProfitability[]> {
  if (USE_MOCKS) return mockGetBranchProfitability({ from: query.from, to: query.to });
  const res = await apiClient<any>(buildProfitabilityUrl("/financial/branches", query));
  return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
}
