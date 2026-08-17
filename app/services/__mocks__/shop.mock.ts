// In-memory stub for the /shop/* endpoints.
// Products are seeded here for Phase 1 so shop flows work end-to-end; Phase 2
// introduces a dedicated products service and CRUD screen.

import type {
  Product,
  ShopSession,
  SessionLine,
  ReceivePayload,
  WasteShopPayload,
  ClosePayload,
} from "../shop";

let _nextId = 1;
const uid = () => String(_nextId++);
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);

// Seeded products — replaced by Phase 2 admin CRUD.
const _products: Product[] = [
  { id: uid(), name: "Chapati", source: "produced", selling_price: 300, active: true },
  { id: uid(), name: "Mandazi", source: "produced", selling_price: 200, active: true },
  { id: uid(), name: "Soda 300ml", source: "bought", selling_price: 700, active: true },
  { id: uid(), name: "Water 500ml", source: "bought", selling_price: 500, active: true },
  { id: uid(), name: "Biscuits", source: "bought", selling_price: 400, active: true },
];

// Sessions across days — keyed by insertion order. `_lastClosedByProduct`
// holds yesterday's closing quantity per product so the next open pre-fills.
const _sessions: ShopSession[] = [];
const _lastClosedByProduct = new Map<string, number>();
// Price history per product — a new row is appended whenever selling_price is edited.
const _priceHistory: Array<{ id: string; product_id: string; selling_price: number; changed_at: string }> = [];

// Seed initial price-history rows so the "history" view has data on first render.
for (const p of _products) {
  _priceHistory.push({
    id: uid(),
    product_id: p.id,
    selling_price: p.selling_price,
    changed_at: now(),
  });
}

const delay = <T,>(v: T, ms = 250): Promise<T> =>
  new Promise((res) => setTimeout(() => res(v), ms));

const emptyLine = (p: Product): SessionLine => ({
  product_id: p.id,
  product_name: p.name,
  source: p.source,
  selling_price: p.selling_price,
  opening_qty: _lastClosedByProduct.get(p.id) ?? 0,
  received_produced_qty: 0,
  received_bought_qty: 0,
  received_bought_cost: 0,
  waste_qty: 0,
});

// Recompute derived fields on a line (sold, revenue, margin) when closing.
const finaliseLine = (line: SessionLine) => {
  const received = line.received_produced_qty + line.received_bought_qty;
  const available = line.opening_qty + received;
  const closing = line.closing_qty ?? 0;
  const sold = available - closing - line.waste_qty;
  const revenue = sold * line.selling_price;
  const bought_cost = line.received_bought_cost;
  const margin = line.source === "bought" ? revenue - bought_cost : revenue;
  return { ...line, sold_qty: sold, revenue, margin };
};

const findOpenSession = (): ShopSession | undefined =>
  _sessions.find((s) => s.status === "open");

export async function mockListProducts(): Promise<Product[]> {
  return delay(_products.map((p) => ({ ...p })));
}

export async function mockGetCurrentSession(): Promise<ShopSession | null> {
  const open = findOpenSession();
  if (open) return delay({ ...open, lines: open.lines.map((l) => ({ ...l })) });
  // Otherwise return the most recently closed session (if any) for the read-only view.
  const closed = [..._sessions].reverse().find((s) => s.status === "closed");
  return delay(closed ? { ...closed, lines: closed.lines.map((l) => ({ ...l })) } : null);
}

export async function mockOpenSession(openedBy: {
  id?: string;
  name?: string;
}): Promise<ShopSession> {
  if (findOpenSession()) throw new Error("A session is already open");
  const session: ShopSession = {
    id: uid(),
    date: today(),
    status: "open",
    opened_by_id: openedBy.id,
    opened_by_name: openedBy.name,
    opened_at: now(),
    lines: _products.filter((p) => p.active).map(emptyLine),
  };
  _sessions.push(session);
  return delay({ ...session, lines: session.lines.map((l) => ({ ...l })) });
}

export async function mockAddReceipt(
  sessionId: string,
  payload: ReceivePayload,
): Promise<ShopSession> {
  const s = _sessions.find((x) => x.id === sessionId && x.status === "open");
  if (!s) throw new Error("No open session");
  const line = s.lines.find((l) => l.product_id === payload.product_id);
  if (!line) throw new Error("Product not in session");
  if (payload.kind === "produced") {
    line.received_produced_qty += payload.quantity;
  } else {
    line.received_bought_qty += payload.quantity;
    line.received_bought_cost += payload.buying_cost ?? 0;
  }
  return delay({ ...s, lines: s.lines.map((l) => ({ ...l })) });
}

export async function mockAddWaste(
  sessionId: string,
  payload: WasteShopPayload,
): Promise<ShopSession> {
  const s = _sessions.find((x) => x.id === sessionId && x.status === "open");
  if (!s) throw new Error("No open session");
  const line = s.lines.find((l) => l.product_id === payload.product_id);
  if (!line) throw new Error("Product not in session");
  line.waste_qty += payload.quantity;
  line.waste_reason = payload.reason;
  return delay({ ...s, lines: s.lines.map((l) => ({ ...l })) });
}

export async function mockCloseSession(
  sessionId: string,
  payload: ClosePayload,
  closedBy: { id?: string; name?: string },
): Promise<ShopSession> {
  const s = _sessions.find((x) => x.id === sessionId && x.status === "open");
  if (!s) throw new Error("No open session");

  // Apply closing quantities per line + validate.
  for (const c of payload.closings) {
    const line = s.lines.find((l) => l.product_id === c.product_id);
    if (!line) continue;
    const available = line.opening_qty + line.received_produced_qty + line.received_bought_qty;
    if (c.closing_qty > available) {
      throw new Error(
        `You counted more ${line.product_name} than was available (${c.closing_qty} > opening+received ${available}) — did a delivery go unlogged?`,
      );
    }
    line.closing_qty = c.closing_qty;
  }

  // Finalise all lines (compute sold/revenue/margin).
  s.lines = s.lines.map(finaliseLine);
  const expectedRevenue = s.lines.reduce((sum, l) => sum + (l.revenue ?? 0), 0);
  s.status = "closed";
  s.closed_by_id = closedBy.id;
  s.closed_by_name = closedBy.name;
  s.closed_at = now();
  s.cash_expected = Number(expectedRevenue.toFixed(2));
  s.cash_actual = payload.cash_actual;
  s.cash_variance = Number((payload.cash_actual - expectedRevenue).toFixed(2));

  // Carry closing forward as tomorrow's opening.
  for (const l of s.lines) {
    _lastClosedByProduct.set(l.product_id, l.closing_qty ?? 0);
  }
  return delay({ ...s, lines: s.lines.map((l) => ({ ...l })) });
}

// ---------- Product CRUD (used by /products admin page) ----------

export async function mockCreateProduct(input: {
  name: string;
  source: Product["source"];
  selling_price: number;
  active?: boolean;
}): Promise<Product> {
  const p: Product = {
    id: uid(),
    name: input.name,
    source: input.source,
    selling_price: input.selling_price,
    active: input.active ?? true,
  };
  _products.push(p);
  _priceHistory.push({ id: uid(), product_id: p.id, selling_price: p.selling_price, changed_at: now() });
  return delay(p);
}

export async function mockUpdateProduct(
  id: string,
  patch: Partial<Pick<Product, "name" | "source" | "selling_price" | "active">>,
): Promise<Product> {
  const p = _products.find((x) => x.id === id);
  if (!p) throw new Error("Product not found");
  const priceChanged = patch.selling_price !== undefined && patch.selling_price !== p.selling_price;
  Object.assign(p, patch);
  if (priceChanged) {
    _priceHistory.push({ id: uid(), product_id: p.id, selling_price: p.selling_price, changed_at: now() });
  }
  return delay({ ...p });
}

export async function mockGetProductPriceHistory(productId: string): Promise<
  Array<{ id: string; product_id: string; selling_price: number; changed_at: string }>
> {
  return delay(_priceHistory.filter((h) => h.product_id === productId).map((h) => ({ ...h })));
}

// Exposed for reconciliation reports that need to snapshot the shop state.
export function _internalSessions(): ShopSession[] {
  return _sessions.map((s) => ({ ...s, lines: s.lines.map((l) => ({ ...l })) }));
}

export async function mockReopenSession(sessionId: string): Promise<ShopSession> {
  const s = _sessions.find((x) => x.id === sessionId && x.status === "closed");
  if (!s) throw new Error("Session not found or not closed");
  s.status = "open";
  s.closed_at = undefined;
  s.closed_by_id = undefined;
  s.closed_by_name = undefined;
  s.cash_actual = undefined;
  s.cash_expected = undefined;
  s.cash_variance = undefined;
  for (const l of s.lines) {
    l.closing_qty = undefined;
    l.sold_qty = undefined;
    l.revenue = undefined;
    l.margin = undefined;
  }
  return delay({ ...s, lines: s.lines.map((l) => ({ ...l })) });
}
