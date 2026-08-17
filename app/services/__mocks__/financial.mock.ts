// In-memory stub for /financial/* endpoints.
// Synthesises 30 days of plausible income/expense entries across all branches,
// then rolls them up per product and per branch for the profitability tabs.
// Real backend will derive these by unioning SubscriptionPayment, PaidTicket,
// shop-session sold lines, Purchase, WasteEntry, PayrollWorker/Advance/Deduction.

import type {
  LedgerEntry,
  LedgerCategory,
  LedgerDirection,
  LedgerResponse,
  ProductProfitability,
  BranchProfitability,
  FinancialQuery,
  ProfitabilityQuery,
} from "../financial";
import { _internalAllOrdersForLedger } from "./orders.mock";

const delay = <T,>(v: T, ms = 250): Promise<T> =>
  new Promise((res) => setTimeout(() => res(v), ms));

const BRANCHES: Array<{ id: string; name: string; factor: number }> = [
  { id: "cavm",    name: "CAVM",    factor: 1.0 },
  { id: "busogo",  name: "BUSOGO",  factor: 0.9 },
  { id: "huye",    name: "HUYE",    factor: 1.1 },
  { id: "musanze", name: "MUSANZE", factor: 0.75 },
];

// Product catalogue mirrors the shop mock so tab 2 makes sense.
type ProductMeta = {
  id: string;
  name: string;
  source: "produced" | "bought";
  selling_price: number;
  unit_cost: number;      // buying cost per unit for bought items; unit ingredient cost for produced
  daily_units_range: [number, number];
};
const PRODUCTS: ProductMeta[] = [
  { id: "p_chapati", name: "Chapati",     source: "produced", selling_price: 300, unit_cost: 200, daily_units_range: [50, 90] },
  { id: "p_mandazi", name: "Mandazi",     source: "produced", selling_price: 200, unit_cost: 125, daily_units_range: [30, 60] },
  { id: "p_samosa",  name: "Samosa",      source: "produced", selling_price: 250, unit_cost: 210, daily_units_range: [10, 30] },
  { id: "p_soda",    name: "Soda 300ml",  source: "bought",   selling_price: 700, unit_cost: 600, daily_units_range: [15, 35] },
  { id: "p_water",   name: "Water 500ml", source: "bought",   selling_price: 500, unit_cost: 420, daily_units_range: [8,  20] },
  { id: "p_biscuit", name: "Biscuit",     source: "bought",   selling_price: 400, unit_cost: 320, daily_units_range: [5,  18] },
];

const WORKERS = [
  { id: "w_alice",  name: "Alice Cook",         monthly: 150000, branch: "cavm"    },
  { id: "w_bosco",  name: "Bosco Assistant",    monthly:  90000, branch: "cavm"    },
  { id: "w_claire", name: "Claire Baker",       monthly: 120000, branch: "busogo"  },
  { id: "w_denis",  name: "Denis Cashier",      monthly: 110000, branch: "huye"    },
  { id: "w_esther", name: "Esther Buffet Head", monthly: 130000, branch: "musanze" },
];

// Deterministic pseudo-random so re-renders don't reshuffle numbers.
const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

const parseISO = (s: string): Date => new Date(s + "T00:00:00Z");
const iso = (d: Date): string => d.toISOString().slice(0, 10);
const daysBetween = (from: string, to: string): string[] => {
  const out: string[] = [];
  const start = parseISO(from);
  const end = parseISO(to);
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(iso(d));
  }
  return out;
};

// ---------- Ledger entry generation ----------

let _entryId = 0;
const nextId = () => `L${(_entryId++).toString().padStart(6, "0")}`;

const buildDayEntries = (
  date: string,
  branch: { id: string; name: string; factor: number },
  rand: () => number,
): LedgerEntry[] => {
  const out: LedgerEntry[] = [];

  // --- Income: shop sales, one row per product per day ---
  for (const p of PRODUCTS) {
    const [lo, hi] = p.daily_units_range;
    const units = Math.round((lo + rand() * (hi - lo)) * branch.factor);
    if (units <= 0) continue;
    out.push({
      id: nextId(),
      date,
      direction: "in",
      category: "shop_sale",
      subcategory: p.name,
      description: `${units} × ${p.name} sold`,
      amount: units * p.selling_price,
      branch_id: branch.id,
      branch_name: branch.name,
      ref_id: `shop_${date}_${p.id}`,
    });
  }

  // --- Income: buffet meals (Regular/VIP/VVIP) ---
  const buffetTiers: Array<{ tier: string; price: number; range: [number, number] }> = [
    { tier: "Regular", price: 1000, range: [60, 100] },
    { tier: "VIP",     price: 1500, range: [20,  40] },
    { tier: "VVIP",    price: 2000, range: [10,  20] },
  ];
  for (const t of buffetTiers) {
    const scans = Math.round((t.range[0] + rand() * (t.range[1] - t.range[0])) * branch.factor);
    out.push({
      id: nextId(),
      date,
      direction: "in",
      category: "buffet_meal",
      subcategory: t.tier,
      description: `${scans} × ${t.tier} buffet scans`,
      amount: scans * t.price,
      branch_id: branch.id,
      branch_name: branch.name,
      ref_id: `buffet_${date}_${t.tier.toLowerCase()}`,
    });
  }

  // --- Income: subscription payments (2-4 per day per branch) ---
  const subPayments = 2 + Math.floor(rand() * 3);
  for (let i = 0; i < subPayments; i++) {
    const isStudent = rand() > 0.25;
    const amt = isStudent
      ? [24000, 30000, 45000][Math.floor(rand() * 3)]
      : 60000;
    out.push({
      id: nextId(),
      date,
      direction: "in",
      category: "subscription",
      subcategory: isStudent ? "Student" : "Worker",
      description: isStudent ? "Student subscription payment" : "Worker subscription top-up",
      amount: amt,
      branch_id: branch.id,
      branch_name: branch.name,
      ref_id: `sub_${date}_${i}`,
    });
  }

  // --- Income: irregular tickets (walk-ins) ---
  const tickets = Math.floor(rand() * 4);
  for (let i = 0; i < tickets; i++) {
    const isStudent = rand() > 0.4;
    const amt = isStudent ? [800, 1200, 1600][Math.floor(rand() * 3)] : 1500;
    out.push({
      id: nextId(),
      date,
      direction: "in",
      category: "irregular_ticket",
      subcategory: isStudent ? "Walk-in student" : "Walk-in worker",
      description: `${isStudent ? "Student" : "Worker"} walk-in meal`,
      amount: amt,
      branch_id: branch.id,
      branch_name: branch.name,
      ref_id: `tkt_${date}_${i}`,
    });
  }

  // --- Expense: store purchases (0-2 per day) ---
  const purchases = Math.floor(rand() * 3);
  const supplies = ["Rice", "Cooking Oil", "Beans", "Wheat Flour", "Sugar", "Tomatoes"];
  for (let i = 0; i < purchases; i++) {
    const item = supplies[Math.floor(rand() * supplies.length)];
    const cost = Math.round((5000 + rand() * 20000) * branch.factor);
    out.push({
      id: nextId(),
      date,
      direction: "out",
      category: "purchase",
      subcategory: item,
      description: `${item} purchase`,
      amount: cost,
      branch_id: branch.id,
      branch_name: branch.name,
      ref_id: `pur_${date}_${i}`,
    });
  }

  // --- Expense: direct-use purchases (occasional) ---
  if (rand() > 0.6) {
    const item = ["Fresh Yeast", "Tomatoes", "Onions"][Math.floor(rand() * 3)];
    const forShop = rand() > 0.5;
    out.push({
      id: nextId(),
      date,
      direction: "out",
      category: "direct_use",
      subcategory: forShop ? "Shop production" : "Buffet",
      description: `${item} — used same day`,
      amount: Math.round((2000 + rand() * 4000) * branch.factor),
      branch_id: branch.id,
      branch_name: branch.name,
    });
  }

  // --- Expense: waste (rare, 20% of days) ---
  if (rand() > 0.8) {
    const item = ["Rice", "Chapati", "Soda 300ml"][Math.floor(rand() * 3)];
    out.push({
      id: nextId(),
      date,
      direction: "out",
      category: "waste",
      subcategory: item,
      description: `${item} spoiled / broken`,
      amount: Math.round((1000 + rand() * 3000) * branch.factor),
      branch_id: branch.id,
      branch_name: branch.name,
    });
  }

  // --- Expense: labor (prorated daily salary, one row per active worker at this branch) ---
  const daysInMonth = 30;
  for (const w of WORKERS.filter((x) => x.branch === branch.id)) {
    out.push({
      id: nextId(),
      date,
      direction: "out",
      category: "labor",
      subcategory: w.name,
      description: `Prorated daily salary — ${w.name}`,
      amount: Math.round(w.monthly / daysInMonth),
      branch_id: branch.id,
      branch_name: branch.name,
      ref_id: `payroll_${date}_${w.id}`,
    });
  }

  // --- Occasional advances & deductions ---
  if (rand() > 0.9) {
    const w = WORKERS.filter((x) => x.branch === branch.id)[0];
    if (w) {
      out.push({
        id: nextId(),
        date,
        direction: "out",
        category: "advance",
        subcategory: w.name,
        description: `Advance to ${w.name} — urgent`,
        amount: Math.round(20000 + rand() * 15000),
        branch_id: branch.id,
        branch_name: branch.name,
      });
    }
  }
  if (rand() > 0.95) {
    const w = WORKERS.filter((x) => x.branch === branch.id)[0];
    if (w) {
      out.push({
        id: nextId(),
        date,
        direction: "in",
        category: "deduction",
        subcategory: w.name,
        description: `Deduction from ${w.name} — broke serving dish`,
        amount: Math.round(2000 + rand() * 5000),
        branch_id: branch.id,
        branch_name: branch.name,
      });
    }
  }

  return out;
};

// Event orders — pulled from the orders mock. Emitted on cook day only so we
// never double-count when the campus finally pays. Collected / outstanding
// are shown separately on the /orders page from the orders summary endpoint.
const buildOrderEntries = (from: string, to: string): LedgerEntry[] => {
  const orders = _internalAllOrdersForLedger();
  return orders
    .filter((o) => o.event_date >= from && o.event_date <= to)
    .map((o) => ({
      id: nextId(),
      date: o.event_date,
      direction: "in" as LedgerDirection,
      category: "order_earned" as LedgerCategory,
      subcategory: o.customer_type === "student" ? "Student group" : "Campus",
      description: `${o.customer_name} — ${o.portions} portions`,
      amount: o.agreed_price,
      branch_id: o.branch_id,
      branch_name: o.branch_name,
      ref_id: o.id,
    }));
};

const buildAllEntries = (from: string, to: string): LedgerEntry[] => {
  _entryId = 0;
  const dates = daysBetween(from, to);
  const rand = seededRandom(dates.length * 7919); // deterministic per range
  const all: LedgerEntry[] = [];
  for (const date of dates) {
    for (const branch of BRANCHES) {
      all.push(...buildDayEntries(date, branch, rand));
    }
  }
  all.push(...buildOrderEntries(from, to));
  // Newest first — matches what a ledger reader expects
  return all.sort((a, b) => (a.date < b.date ? 1 : -1));
};

const matchesFilters = (
  e: LedgerEntry,
  q: FinancialQuery,
): boolean => {
  if (q.branch_id && e.branch_id !== q.branch_id) return false;
  if (q.direction && q.direction !== "both" && e.direction !== q.direction) return false;
  if (q.categories && q.categories.length > 0 && !q.categories.includes(e.category as LedgerCategory)) return false;
  return true;
};

// ---------- Public mock functions ----------

export async function mockGetLedger(query: FinancialQuery): Promise<LedgerResponse> {
  const all = buildAllEntries(query.from, query.to);
  const filtered = all.filter((e) => matchesFilters(e, query));

  // Running balance is computed on the filtered set, oldest → newest, then re-attached.
  const byOldest = [...filtered].reverse();
  let bal = 0;
  const withBalance = byOldest.map((e) => {
    bal += e.direction === "in" ? e.amount : -e.amount;
    return { ...e, running_balance: bal };
  });
  const withBalanceNewestFirst = withBalance.reverse();

  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? query.limit : 50;
  const totalCount = withBalanceNewestFirst.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const startIdx = (page - 1) * limit;
  const pageEntries = withBalanceNewestFirst.slice(startIdx, startIdx + limit);

  const totalIn = filtered.filter((e) => e.direction === "in").reduce((s, e) => s + e.amount, 0);
  const totalOut = filtered.filter((e) => e.direction === "out").reduce((s, e) => s + e.amount, 0);

  return delay({
    entries: pageEntries,
    totals: {
      total_income: totalIn,
      total_expense: totalOut,
      net: totalIn - totalOut,
      transactions: totalCount,
    },
    page,
    total_pages: totalPages,
    from: query.from,
    to: query.to,
    branch_id: query.branch_id,
  });
}

export async function mockGetProductProfitability(
  query: ProfitabilityQuery,
): Promise<ProductProfitability[]> {
  const dates = daysBetween(query.from, query.to);
  const branches = query.branch_id
    ? BRANCHES.filter((b) => b.id === query.branch_id)
    : BRANCHES;
  const rand = seededRandom(dates.length * 12211);

  return delay(
    PRODUCTS.map((p) => {
      // Aggregate units, revenue, cost across every branch × day.
      let units = 0;
      const daily: Array<{ date: string; revenue: number; cost: number }> = [];
      for (const date of dates) {
        let dailyRev = 0;
        let dailyCost = 0;
        for (const b of branches) {
          const [lo, hi] = p.daily_units_range;
          const u = Math.round((lo + rand() * (hi - lo)) * b.factor);
          units += u;
          dailyRev += u * p.selling_price;
          dailyCost += u * p.unit_cost;
        }
        daily.push({ date, revenue: dailyRev, cost: dailyCost });
      }
      const revenue = daily.reduce((s, d) => s + d.revenue, 0);
      const cost = daily.reduce((s, d) => s + d.cost, 0);
      const margin = revenue - cost;
      const margin_pct = revenue > 0 ? (margin / revenue) * 100 : 0;
      return {
        product_id: p.id,
        product_name: p.name,
        source: p.source,
        units_sold: units,
        revenue,
        cost,
        margin,
        margin_pct: Number(margin_pct.toFixed(2)),
        daily,
      };
    }),
  );
}

export async function mockGetBranchProfitability(
  query: { from: string; to: string },
): Promise<BranchProfitability[]> {
  const dates = daysBetween(query.from, query.to);
  const rand = seededRandom(dates.length * 6469);

  const perBranch = BRANCHES.map((b) => {
    // Sum ledger-equivalent numbers per day for this branch.
    let revenue = 0;
    let cost = 0;
    for (let d = 0; d < dates.length; d++) {
      // Rough per-day mock: sum of products revenue + buffet + subs vs purchases + labor
      const productRev = PRODUCTS.reduce((s, p) => {
        const [lo, hi] = p.daily_units_range;
        const u = Math.round((lo + rand() * (hi - lo)) * b.factor);
        return s + u * p.selling_price;
      }, 0);
      const productCost = PRODUCTS.reduce((s, p) => {
        const [lo, hi] = p.daily_units_range;
        const u = Math.round((lo + rand() * (hi - lo)) * b.factor);
        return s + u * p.unit_cost;
      }, 0);
      const buffetRev = Math.round((60000 + rand() * 40000) * b.factor);
      const subRev = Math.round((90000 + rand() * 30000) * b.factor);
      const purchases = Math.round((15000 + rand() * 25000) * b.factor);
      const labor = WORKERS.filter((w) => w.branch === b.id).reduce(
        (s, w) => s + Math.round(w.monthly / 30),
        0,
      );
      const waste = Math.round((rand() * 3000) * b.factor);

      revenue += productRev + buffetRev + subRev;
      cost += productCost + purchases + labor + waste;
    }
    const margin = revenue - cost;
    const margin_pct = revenue > 0 ? (margin / revenue) * 100 : 0;
    return {
      branch_id: b.id,
      branch_name: b.name,
      revenue,
      cost,
      margin,
      margin_pct: Number(margin_pct.toFixed(2)),
      vs_previous: {
        // Synthetic — a mix of directions so the UI shows both arrows.
        revenue_delta_pct: Number(((rand() - 0.4) * 20).toFixed(1)),
        margin_delta_pct: Number(((rand() - 0.5) * 15).toFixed(1)),
      },
    };
  });

  // Sort by margin % descending so rank badges are stable.
  perBranch.sort((a, b) => b.margin_pct - a.margin_pct);
  return delay(perBranch);
}
