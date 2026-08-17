// In-memory stub for the /store/* endpoints.
// Real backend does not exist yet; flip VITE_USE_MOCK_STORE=false in .env
// to switch every call back to apiClient() without touching any component.

import type {
  StoreItem,
  Purchase,
  Issue,
  PhysicalCount,
  PurchasePayload,
  IssuePayload,
  CountPayload,
  WasteEntry,
  WastePayload,
} from "../store";

let _nextId = 1;
const uid = () => String(_nextId++);
const now = () => new Date().toISOString();

// Seed a handful of items so screens render something meaningful on first load.
const _items: StoreItem[] = [
  {
    id: uid(),
    name: "Rice",
    unit: "kg",
    quantity_on_hand: 40,
    avg_unit_cost: 1200,
    total_value: 48000,
    min_quantity: 20,
    valuation_mode: "stocked",
    is_low_stock: false,
  },
  {
    id: uid(),
    name: "Cooking Oil",
    unit: "L",
    quantity_on_hand: 8,
    avg_unit_cost: 3500,
    total_value: 28000,
    min_quantity: 10,
    valuation_mode: "stocked",
    is_low_stock: true,
  },
  {
    id: uid(),
    name: "Beans",
    unit: "kg",
    quantity_on_hand: 22,
    avg_unit_cost: 1500,
    total_value: 33000,
    min_quantity: 15,
    valuation_mode: "stocked",
    is_low_stock: false,
  },
  {
    id: uid(),
    name: "Tomatoes",
    unit: "kg",
    quantity_on_hand: 0,
    avg_unit_cost: 0,
    total_value: 0,
    min_quantity: 0,
    valuation_mode: "direct_use",
    is_low_stock: false,
  },
];

const _purchases: Purchase[] = [];
const _issues: Issue[] = [];
const _counts: PhysicalCount[] = [];
const _waste: WasteEntry[] = [];

const recomputeLowStock = (i: StoreItem) => {
  i.is_low_stock = i.valuation_mode === "stocked" && i.quantity_on_hand <= (i.min_quantity ?? 0);
  i.total_value = Number((i.quantity_on_hand * i.avg_unit_cost).toFixed(2));
};

// Small artificial delay so loading UI is exercised.
const delay = <T,>(v: T, ms = 250): Promise<T> =>
  new Promise((res) => setTimeout(() => res(v), ms));

export async function mockListStoreItems(): Promise<StoreItem[]> {
  return delay(_items.map((i) => ({ ...i })));
}

export async function mockRecordPurchase(payload: PurchasePayload): Promise<Purchase> {
  // Resolve or create the item.
  let item = payload.item_id
    ? _items.find((i) => i.id === payload.item_id)
    : undefined;
  if (!item && payload.new_item) {
    item = {
      id: uid(),
      name: payload.new_item.name,
      unit: payload.new_item.unit,
      quantity_on_hand: 0,
      avg_unit_cost: 0,
      total_value: 0,
      min_quantity: payload.new_item.min_quantity ?? 0,
      valuation_mode: payload.new_item.valuation_mode ?? "stocked",
      is_low_stock: false,
    };
    _items.push(item);
  }
  if (!item) throw new Error("Purchase must reference an existing item or provide new_item");

  const unitCost = payload.quantity > 0 ? payload.total_cost / payload.quantity : 0;

  if (payload.destination === "store") {
    // Weighted average cost update.
    const prevQty = item.quantity_on_hand;
    const prevValue = item.total_value;
    const newQty = prevQty + payload.quantity;
    const newValue = prevValue + payload.total_cost;
    item.quantity_on_hand = newQty;
    item.avg_unit_cost = newQty > 0 ? Number((newValue / newQty).toFixed(2)) : 0;
    recomputeLowStock(item);
  }
  // For direct-use destinations we log the purchase but do not shelve it.

  const purchase: Purchase = {
    id: uid(),
    item_id: item.id,
    item_name: item.name,
    quantity: payload.quantity,
    unit: item.unit,
    total_cost: payload.total_cost,
    unit_cost: Number(unitCost.toFixed(2)),
    supplier: payload.supplier,
    destination: payload.destination,
    direct_use_for: payload.direct_use_for,
    created_at: now(),
  };
  _purchases.unshift(purchase);
  return delay(purchase);
}

export async function mockIssueToKitchen(payload: IssuePayload): Promise<Issue> {
  // Validate all lines up-front against on-hand quantities for stocked items.
  for (const line of payload.lines) {
    const item = _items.find((i) => i.id === line.item_id);
    if (!item) throw new Error(`Unknown item: ${line.item_id}`);
    if (item.valuation_mode === "stocked" && line.quantity > item.quantity_on_hand) {
      throw new Error(`Cannot issue ${line.quantity} ${item.unit} of ${item.name} — only ${item.quantity_on_hand} on hand`);
    }
  }

  // Apply the issue: decrement on-hand, keep avg cost, snapshot cost per line.
  const enrichedLines = payload.lines.map((line) => {
    const item = _items.find((i) => i.id === line.item_id)!;
    if (item.valuation_mode === "stocked") {
      item.quantity_on_hand -= line.quantity;
      recomputeLowStock(item);
    }
    return {
      item_id: item.id,
      item_name: item.name,
      unit: item.unit,
      quantity: line.quantity,
      purpose: line.purpose,
      intended_product: line.intended_product,
      unit_cost: item.avg_unit_cost,
      total_cost: Number((line.quantity * item.avg_unit_cost).toFixed(2)),
    };
  });

  const issue: Issue = {
    id: uid(),
    lines: enrichedLines,
    created_at: now(),
  };
  _issues.unshift(issue);
  return delay(issue);
}

export async function mockRecordCount(payload: CountPayload): Promise<PhysicalCount> {
  const entries = payload.entries.map((e) => {
    const item = _items.find((i) => i.id === e.item_id);
    if (!item) throw new Error(`Unknown item: ${e.item_id}`);
    if (item.valuation_mode !== "stocked") throw new Error(`${item.name} is direct-use — not countable`);
    const systemQty = item.quantity_on_hand;
    const variance = e.actual_qty - systemQty;
    // Adjust on-hand to counted value.
    item.quantity_on_hand = e.actual_qty;
    recomputeLowStock(item);
    return {
      item_id: item.id,
      item_name: item.name,
      unit: item.unit,
      system_qty: systemQty,
      actual_qty: e.actual_qty,
      variance,
      reason: e.reason,
    };
  });

  const count: PhysicalCount = {
    id: uid(),
    entries,
    created_at: now(),
  };
  _counts.unshift(count);
  return delay(count);
}

export async function mockListWaste(): Promise<WasteEntry[]> {
  return delay(_waste.map((w) => ({ ...w })));
}

export async function mockRecordWaste(payload: WastePayload): Promise<WasteEntry> {
  const item = _items.find((i) => i.id === payload.item_id);
  if (!item) throw new Error(`Unknown item: ${payload.item_id}`);
  if (item.valuation_mode === "stocked") {
    if (payload.quantity > item.quantity_on_hand) {
      throw new Error(`Cannot record waste of ${payload.quantity} ${item.unit} — only ${item.quantity_on_hand} on hand`);
    }
    item.quantity_on_hand -= payload.quantity;
    recomputeLowStock(item);
  }
  const entry: WasteEntry = {
    id: uid(),
    item_id: item.id,
    item_name: item.name,
    unit: item.unit,
    quantity: payload.quantity,
    reason: payload.reason,
    total_cost: Number((payload.quantity * item.avg_unit_cost).toFixed(2)),
    created_at: now(),
  };
  _waste.unshift(entry);
  return delay(entry);
}
