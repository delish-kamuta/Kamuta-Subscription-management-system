// In-memory stub for /orders/*.
// Event orders (student groups paying cash upfront, campus paying later).
//
// Cost model:
//   direct_ingredients_cost = sum of issue lines with purpose="order" for this order
//   shared_cost_share       = order_portions ÷ (buffet_plates + all_order_portions_that_day) × shared_buffet_cost
//   computed_cost           = direct + shared
//   margin                  = agreed_price − computed_cost
//
// The frontend never computes shared_cost_share itself. Backend does. Mock
// synthesises a plausible value so screens render meaningfully.

import type {
  Order,
  OrderCustomerType,
  OrderPayload,
  OrderSummary,
  OrdersQuery,
} from "../orders";

const BRANCH_LABEL: Record<string, string> = {
  cavm: "CAVM",
  busogo: "BUSOGO",
  huye: "HUYE",
  musanze: "MUSANZE",
};
const branchName = (id: string) => BRANCH_LABEL[id.toLowerCase()] ?? id;

let _nextId = 1;
const uid = () => `ord_${(_nextId++).toString().padStart(4, "0")}`;
const now = () => new Date().toISOString();
const todayISO = () => new Date().toISOString().slice(0, 10);

// Mock's assumption of the day's shared buffet cost + plates served.
// Real backend derives from actual ingredient issues + buffet counts.
const ASSUMED_BUFFET_PLATES_PER_DAY = 200;
const ASSUMED_SHARED_COST_PER_DAY = 12000;

const computeSharedShare = (portions: number): number => {
  // Order-share formula from the spec.
  const denom = ASSUMED_BUFFET_PLATES_PER_DAY + portions;
  if (denom === 0) return 0;
  return Math.round((portions / denom) * ASSUMED_SHARED_COST_PER_DAY);
};

const recompute = (o: Order): Order => {
  const shared = computeSharedShare(o.portions);
  const cost = o.direct_ingredients_cost + shared;
  return {
    ...o,
    shared_cost_share: shared,
    computed_cost: cost,
    margin: o.agreed_price - cost,
  };
};

// ---- Seed data ----
const _orders: Order[] = [];

const seed = (
  daysAgo: number,
  customer_name: string,
  customer_type: OrderCustomerType,
  branch_id: string,
  portions: number,
  agreed_price: number,
  paid: boolean,
  paidDaysAgo?: number,
  directCost = 0,
): void => {
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() - daysAgo);
  const paidDate =
    paid && paidDaysAgo !== undefined
      ? (() => {
          const d = new Date();
          d.setDate(d.getDate() - paidDaysAgo);
          return d.toISOString().slice(0, 10);
        })()
      : undefined;
  const base: Order = {
    id: uid(),
    customer_name,
    customer_type,
    event_date: eventDate.toISOString().slice(0, 10),
    branch_id,
    branch_name: branchName(branch_id),
    portions,
    agreed_price,
    payment_status: paid ? "paid" : "outstanding",
    paid_date: paidDate,
    notes: undefined,
    direct_ingredients_cost: directCost,
    shared_cost_share: 0,
    computed_cost: 0,
    margin: 0,
    created_at: eventDate.toISOString(),
  };
  _orders.push(recompute(base));
};

// Twelve mixed orders over the last 30 days.
seed( 0, "Engineering Student Assoc.",     "student", "cavm",    30, 60000,  true,  0, 18000);
seed( 1, "Business Faculty Party",         "student", "cavm",    45, 90000,  true,  1, 28000);
seed( 2, "Campus Admin — Board Meeting",   "campus",  "cavm",    25, 75000,  false);
seed( 3, "Medical Students Group",         "student", "busogo",  40, 80000,  true,  3, 22000);
seed( 5, "Graduation Committee Lunch",     "campus",  "cavm",   150,450000,  false);
seed( 6, "Physics Study Group",            "student", "huye",    20, 40000,  true,  6, 12000);
seed( 8, "Campus Rector Reception",        "campus",  "cavm",    60,180000,  true,  2, 55000);
seed(12, "Sports Federation Dinner",       "student", "musanze", 50,100000,  true, 12, 30000);
seed(15, "Guest Lecturer Reception",       "campus",  "huye",    35, 95000,  false);
seed(18, "Alumni Weekend Brunch",          "student", "cavm",    80,180000,  true, 18, 52000);
seed(22, "Faculty Meeting (weekly)",       "campus",  "busogo",  20, 55000,  true, 20, 15000);
seed(28, "Cultural Week Feast",            "student", "musanze",120,240000,  true, 28, 78000);

// ---- Small delay to exercise loading UI ----
const delay = <T,>(v: T, ms = 200): Promise<T> =>
  new Promise((res) => setTimeout(() => res(v), ms));

// ---- Filter helpers ----
const inRange = (dateISO: string, from?: string, to?: string): boolean => {
  if (from && dateISO < from) return false;
  if (to && dateISO > to) return false;
  return true;
};

const matchesQuery = (o: Order, q: OrdersQuery): boolean => {
  if (!inRange(o.event_date, q.from, q.to)) return false;
  if (q.branch_id && o.branch_id !== q.branch_id) return false;
  if (q.customer_type && q.customer_type !== "all" && o.customer_type !== q.customer_type) return false;
  if (q.status && q.status !== "all" && o.payment_status !== q.status) return false;
  return true;
};

// ---- Public mock API ----

export async function mockListOrders(query: OrdersQuery = {}): Promise<Order[]> {
  return delay(_orders.filter((o) => matchesQuery(o, query)).map((o) => ({ ...o })));
}

export async function mockGetOrdersSummary(query: OrdersQuery = {}): Promise<OrderSummary> {
  const inScope = _orders.filter((o) => matchesQuery(o, { ...query, status: "all" }));
  const earned = inScope.reduce((s, o) => s + o.agreed_price, 0);
  const collected = _orders
    .filter((o) => o.payment_status === "paid" && o.paid_date && inRange(o.paid_date, query.from, query.to))
    .filter((o) => !query.branch_id || o.branch_id === query.branch_id)
    .reduce((s, o) => s + o.agreed_price, 0);
  // Outstanding total ignores date range — the owner always wants the full "money owed" number.
  const outstanding = _orders
    .filter((o) => o.payment_status === "outstanding")
    .filter((o) => !query.branch_id || o.branch_id === query.branch_id)
    .reduce((s, o) => s + o.agreed_price, 0);
  return delay({
    earned_in_period: earned,
    collected_in_period: collected,
    outstanding_total: outstanding,
    count: inScope.length,
    from: query.from,
    to: query.to,
    branch_id: query.branch_id,
  });
}

export async function mockCreateOrder(payload: OrderPayload): Promise<Order> {
  const default_status: Order["payment_status"] =
    payload.payment_status ?? (payload.customer_type === "student" ? "paid" : "outstanding");
  const default_paid_date = default_status === "paid" ? (payload.paid_date ?? todayISO()) : undefined;

  const o: Order = {
    id: uid(),
    customer_name: payload.customer_name,
    customer_type: payload.customer_type,
    event_date: payload.event_date,
    branch_id: payload.branch_id,
    branch_name: branchName(payload.branch_id),
    portions: payload.portions,
    agreed_price: payload.agreed_price,
    payment_status: default_status,
    paid_date: default_paid_date,
    notes: payload.notes,
    direct_ingredients_cost: 0,
    shared_cost_share: 0,
    computed_cost: 0,
    margin: 0,
    created_at: now(),
  };
  _orders.push(recompute(o));
  return delay({ ...recompute(o) });
}

export async function mockUpdateOrder(id: string, payload: Partial<OrderPayload>): Promise<Order> {
  const idx = _orders.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error("Order not found");
  const merged: Order = {
    ..._orders[idx],
    ...payload,
    branch_id: payload.branch_id ?? _orders[idx].branch_id,
    branch_name: payload.branch_id ? branchName(payload.branch_id) : _orders[idx].branch_name,
  };
  // If flipping to paid without a paid_date, stamp today.
  if (merged.payment_status === "paid" && !merged.paid_date) merged.paid_date = todayISO();
  // If flipping to outstanding, clear paid_date.
  if (merged.payment_status === "outstanding") merged.paid_date = undefined;
  _orders[idx] = recompute(merged);
  return delay({ ..._orders[idx] });
}

export async function mockMarkOrderPaid(id: string, paidDate?: string): Promise<Order> {
  const o = _orders.find((x) => x.id === id);
  if (!o) throw new Error("Order not found");
  o.payment_status = "paid";
  o.paid_date = paidDate || todayISO();
  return delay({ ...recompute(o) });
}

export async function mockDeleteOrder(id: string): Promise<{ id: string }> {
  const idx = _orders.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error("Order not found");
  _orders.splice(idx, 1);
  return delay({ id });
}

// ---- Internal hook the store mock calls when a "purpose=order" issue lands ----
// Keeps direct_ingredients_cost in sync without exposing a public "mutate cost"
// endpoint that the real backend wouldn't have.
export function _internalAttachOrderDirectCost(orderId: string, addAmount: number): void {
  const o = _orders.find((x) => x.id === orderId);
  if (!o) return; // silently ignore — the store mock will already have surfaced a validation error
  o.direct_ingredients_cost = Number((o.direct_ingredients_cost + addAmount).toFixed(2));
  const updated = recompute(o);
  o.shared_cost_share = updated.shared_cost_share;
  o.computed_cost = updated.computed_cost;
  o.margin = updated.margin;
}

// Exposed so the IssueSheet's order picker can filter to a single day (event_date === date).
export function _internalListOpenOrdersForDate(date: string): Order[] {
  return _orders.filter((o) => o.event_date === date).map((o) => ({ ...o }));
}

// Ledger feed — used by financial.mock.ts to emit order_earned entries.
export function _internalAllOrdersForLedger(): Order[] {
  return _orders.map((o) => ({ ...o }));
}
