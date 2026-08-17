// In-memory stub for /yield-standards.
// Rows describe how much of an input ingredient produces how many units of a
// product (e.g. "5 kg flour → 120 chapati ±10%"). Consumed by reconciliation.

import type { YieldStandard, YieldStandardPayload } from "../yieldStandards";

let _nextId = 1;
const uid = () => String(_nextId++);
const now = () => new Date().toISOString();

const _standards: YieldStandard[] = [
  {
    id: uid(),
    product_id: "1",
    product_name: "Chapati",
    input_item_id: "seed_flour",
    input_item_name: "Wheat Flour",
    input_qty: 5,
    input_unit: "kg",
    output_qty: 120,
    tolerance_pct: 10,
    updated_at: now(),
  },
  {
    id: uid(),
    product_id: "2",
    product_name: "Mandazi",
    input_item_id: "seed_flour",
    input_item_name: "Wheat Flour",
    input_qty: 5,
    input_unit: "kg",
    output_qty: 150,
    tolerance_pct: 10,
    updated_at: now(),
  },
];

const delay = <T,>(v: T, ms = 200): Promise<T> =>
  new Promise((res) => setTimeout(() => res(v), ms));

export async function mockListYieldStandards(): Promise<YieldStandard[]> {
  return delay(_standards.map((s) => ({ ...s })));
}

export async function mockCreateYieldStandard(payload: YieldStandardPayload): Promise<YieldStandard> {
  const s: YieldStandard = { id: uid(), updated_at: now(), ...payload };
  _standards.push(s);
  return delay({ ...s });
}

export async function mockUpdateYieldStandard(id: string, payload: Partial<YieldStandardPayload>): Promise<YieldStandard> {
  const s = _standards.find((x) => x.id === id);
  if (!s) throw new Error("Standard not found");
  Object.assign(s, payload, { updated_at: now() });
  return delay({ ...s });
}

export async function mockDeleteYieldStandard(id: string): Promise<{ id: string }> {
  const idx = _standards.findIndex((x) => x.id === id);
  if (idx === -1) throw new Error("Standard not found");
  _standards.splice(idx, 1);
  return delay({ id });
}
