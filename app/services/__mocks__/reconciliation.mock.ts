// In-memory stub for /reconciliation/* — synthesises reasonable-looking numbers
// from the same seed data used by the other mocks.
// Real backend will compute these from persisted shop/store/buffet data.

import type {
  ShopReconciliation,
  StoreVariance,
  BuffetGapReport,
  DailyPnL,
  StoreIssuesReport,
} from "../reconciliation";
import { _internalDailyLaborCost } from "./payroll.mock";

const delay = <T,>(v: T, ms = 250): Promise<T> =>
  new Promise((res) => setTimeout(() => res(v), ms));

// Branch-name → seeded snapshot. The real backend computes these on demand;
// this table just gives admin an obviously different picture per branch so
// they can visually confirm the filter is doing something.
const BRANCH_LABEL: Record<string, string> = {
  "": "All branches",
  cavm: "CAVM",
  busogo: "BUSOGO",
  huye: "HUYE",
  musanze: "MUSANZE",
};

const labelFor = (id?: string) => {
  if (!id) return BRANCH_LABEL[""];
  return BRANCH_LABEL[id.toLowerCase()] ?? id;
};

// Multiplier keeps the numbers different per branch without needing real data.
const factorFor = (id?: string) => {
  if (!id) return 1;
  const s = id.toLowerCase();
  if (s.includes("busogo")) return 0.9;
  if (s.includes("huye")) return 1.1;
  if (s.includes("musanze")) return 0.75;
  return 1;
};

const scale = (n: number, f: number) => Math.round(n * f);

export async function mockGetShopReconciliation(date: string, branchId?: string): Promise<ShopReconciliation> {
  const f = factorFor(branchId);
  const lines = [
    {
      product_name: "Chapati",
      source: "produced" as const,
      opening_qty: scale(12, f), received_qty: scale(60, f), waste_qty: 2, closing_qty: scale(5, f), sold_qty: scale(65, f),
      selling_price: 300,
      revenue: scale(19500, f),
      buying_cost: 0,
      // Ingredient cost: e.g. 5kg flour @ 1200 + 2L oil @ 3500 = 6000 + 7000 = 13000 (roughly)
      ingredient_cost: scale(13000, f),
      margin: 0, // recomputed below
    },
    {
      product_name: "Mandazi",
      source: "produced" as const,
      opening_qty: scale(8, f), received_qty: scale(40, f), waste_qty: 1, closing_qty: scale(3, f), sold_qty: scale(44, f),
      selling_price: 200,
      revenue: scale(8800, f),
      buying_cost: 0,
      ingredient_cost: scale(5500, f),
      margin: 0,
    },
    {
      product_name: "Soda 300ml",
      source: "bought" as const,
      opening_qty: 8, received_qty: 24, waste_qty: 0, closing_qty: 12, sold_qty: 20,
      selling_price: 700,
      revenue: 14000,
      buying_cost: 12000,
      ingredient_cost: 0,
      margin: 0,
    },
    {
      product_name: "Water 500ml",
      source: "bought" as const,
      opening_qty: 4, received_qty: 12, waste_qty: 0, closing_qty: 6, sold_qty: 10,
      selling_price: 500,
      revenue: 5000,
      buying_cost: 4200,
      ingredient_cost: 0,
      margin: 0,
    },
  ].map((l) => ({ ...l, margin: l.revenue - l.buying_cost - l.ingredient_cost }));

  const revenue_expected = lines.reduce((s, l) => s + l.revenue, 0);
  const bought_cost = lines.reduce((s, l) => s + l.buying_cost, 0);
  const ingredient_cost = lines.reduce((s, l) => s + l.ingredient_cost, 0);
  const margin = revenue_expected - bought_cost - ingredient_cost;

  return delay({
    date,
    branch_id: branchId,
    branch_name: labelFor(branchId),
    lines,
    totals: {
      revenue_expected,
      cash_actual: scale(45500, f),
      cash_variance: scale(45500, f) - revenue_expected,
      bought_cost,
      ingredient_cost,
      margin,
    },
  });
}

export async function mockGetStoreVariance(from: string, to: string, branchId?: string): Promise<StoreVariance> {
  const f = factorFor(branchId);
  return delay({
    from,
    to,
    branch_id: branchId,
    branch_name: labelFor(branchId),
    items: [
      { item_name: "Rice",        counts: 4, avg_variance: -1.5 * f, worst_variance: -3, unit: "kg" },
      { item_name: "Cooking Oil", counts: 4, avg_variance: -0.5 * f, worst_variance: -1, unit: "L" },
      { item_name: "Beans",       counts: 4, avg_variance:  0.2 * f, worst_variance:  1, unit: "kg" },
    ],
  });
}

export async function mockGetBuffetGap(date: string, branchId?: string): Promise<BuffetGapReport> {
  const f = factorFor(branchId);

  // Realistic mix: one shift pools Regular + VIP on the same line (VIP just gets tea).
  // VVIP is its own line with its own price. Base plate price = min covered tier.
  const shifts = [
    {
      shift_id: "sh_pool", scanner_name: "Aline",
      meal_types: ["Regular", "VIP"] as string[],
      plates_out: scale(120, f), remaining: scale(8, f), scans: scale(105, f),
      exceptions: 3, gap_plates: scale(4, f), gap_rwf: scale(4000, f), // 4 * 1000 (base=Regular)
    },
    {
      shift_id: "sh_vvip", scanner_name: "Marie",
      meal_types: ["VVIP"] as string[],
      plates_out: scale(20, f), remaining: scale(2, f), scans: scale(17, f),
      exceptions: 0, gap_plates: scale(1, f), gap_rwf: scale(2000, f), // 1 * 2000
    },
  ];

  // Scan/exception aggregates per tier (backend supplies these from meal_logs).
  const perTierMock: Record<string, { scans: number; exceptions: number }> = {
    Regular: { scans: scale(70, f), exceptions: 2 },
    VIP: { scans: scale(35, f), exceptions: 1 },
    VVIP: { scans: scale(17, f), exceptions: 0 },
  };
  const by_tier = (["Regular", "VIP", "VVIP"] as const).map((mt) => ({
    meal_type: mt,
    shifts_covering: shifts.filter((s) => s.meal_types.includes(mt)).length,
    scans: perTierMock[mt].scans,
    exceptions: perTierMock[mt].exceptions,
  }));

  const totalsFrom = shifts;
  return delay({
    date,
    branch_id: branchId,
    branch_name: labelFor(branchId),
    shifts,
    by_tier,
    totals: {
      plates_out: totalsFrom.reduce((s, x) => s + x.plates_out, 0),
      remaining: totalsFrom.reduce((s, x) => s + x.remaining, 0),
      scans: totalsFrom.reduce((s, x) => s + x.scans, 0),
      exceptions: totalsFrom.reduce((s, x) => s + x.exceptions, 0),
      gap_plates: totalsFrom.reduce((s, x) => s + x.gap_plates, 0),
      gap_rwf: totalsFrom.reduce((s, x) => s + x.gap_rwf, 0),
    },
  });
}

export async function mockGetDailyPnL(date: string, branchId?: string): Promise<DailyPnL> {
  const f = factorFor(branchId);
  const income = { shop_revenue: scale(47300, f), buffet_revenue: scale(180000, f) };
  // Labor comes from the payroll mock so admin adding a worker immediately shifts P&L.
  const period = date.slice(0, 7); // YYYY-MM
  const laborSalary = _internalDailyLaborCost(period, branchId);
  const cost = {
    ingredients_issued_shop: scale(18500, f),    // flour, oil for chapati/mandazi
    ingredients_issued_buffet: scale(16000, f),  // rice, beans, oil for buffet lunch
    direct_use_shop: scale(3000, f),             // e.g. fresh yeast bought for today's chapati
    direct_use_buffet: scale(4000, f),           // e.g. tomatoes bought for today's stew
    bought_goods: 16200,                          // sodas / water / biscuits for resale
    waste_cost: 2100,
    labor_salary: laborSalary,                    // daily portion of monthly salaries
  };
  const total_income = income.shop_revenue + income.buffet_revenue;
  const total_cost =
    cost.ingredients_issued_shop
    + cost.ingredients_issued_buffet
    + cost.direct_use_shop
    + cost.direct_use_buffet
    + cost.bought_goods
    + cost.waste_cost
    + cost.labor_salary;
  return delay({
    date,
    branch_id: branchId,
    branch_name: labelFor(branchId),
    income,
    cost,
    total_income,
    total_cost,
    margin: total_income - total_cost,
  });
}

// Store issues log — admin's "what did the storekeeper hand out today?" view.
export async function mockGetStoreIssues(from: string, to: string, branchId?: string): Promise<StoreIssuesReport> {
  const now = new Date().toISOString();
  return delay({
    from,
    to,
    branch_id: branchId,
    branch_name: labelFor(branchId),
    issues: [
      {
        id: "iss_1",
        created_at: now,
        issued_by: "John Stockkeeper",
        lines: [
          { item_name: "Rice", quantity: 8, unit: "kg", purpose: "buffet", unit_cost: 1200, total_cost: 9600, intended_product: "Buffet lunch" },
          { item_name: "Cooking Oil", quantity: 2, unit: "L", purpose: "buffet", unit_cost: 3500, total_cost: 7000 },
        ],
      },
      {
        id: "iss_2",
        created_at: now,
        issued_by: "John Stockkeeper",
        lines: [
          { item_name: "Beans", quantity: 5, unit: "kg", purpose: "snacks", unit_cost: 1500, total_cost: 7500, intended_product: "Bean stew" },
        ],
      },
    ],
  });
}
