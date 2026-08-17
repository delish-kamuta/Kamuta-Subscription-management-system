// In-memory stub for /buffet/* endpoints.
// Plates are counted MANUALLY (INITIAL, TOPUP, REMAINING) — kept independent
// from scan-derived meal logs on purpose so the two numbers can be compared.
//
// A branch may run more than one buffet in parallel (Regular / VIP / VVIP).
// Each combination of (scanner, meal_type) is its own open shift. Prices per
// plate differ per tier, so the gap in RWF uses the tier's price.

import type {
  BuffetShift,
  BuffetEntry,
  StartShiftPayload,
  EntryPayload,
  CloseShiftPayload,
  BuffetMealType,
} from "../buffet";

let _nextId = 1;
const uid = () => String(_nextId++);
const now = () => new Date().toISOString();

const _shifts: BuffetShift[] = [];
const _entries: BuffetEntry[] = [];

// Fallback per-plate price when the backend/branch price isn't known.
// Real endpoint will derive this from Branch.student_regular_price etc.
const PLATE_PRICE: Record<BuffetMealType, number> = {
  Regular: 1000,
  VIP: 1500,
  VVIP: 2000,
};

const delay = <T,>(v: T, ms = 200): Promise<T> =>
  new Promise((res) => setTimeout(() => res(v), ms));

const shiftEntries = (shiftId: string) =>
  _entries.filter((e) => e.shift_id === shiftId);

const tallyPlates = (shiftId: string) => {
  const es = shiftEntries(shiftId);
  const initial = es.filter((e) => e.kind === "INITIAL").reduce((s, e) => s + e.quantity, 0);
  const topup = es.filter((e) => e.kind === "TOPUP").reduce((s, e) => s + e.quantity, 0);
  const remaining = es.filter((e) => e.kind === "REMAINING").reduce((s, e) => s + e.quantity, 0);
  const exceptions_staff = es.filter((e) => e.kind === "EXCEPTION" && e.exception_kind === "staff").reduce((s, e) => s + e.quantity, 0);
  const exceptions_guest = es.filter((e) => e.kind === "EXCEPTION" && e.exception_kind === "guest").reduce((s, e) => s + e.quantity, 0);
  const exceptions_no_code = es.filter((e) => e.kind === "EXCEPTION" && e.exception_kind === "no_code").reduce((s, e) => s + e.quantity, 0);
  const plates_out = initial + topup - remaining;
  return { initial, topup, remaining, exceptions_staff, exceptions_guest, exceptions_no_code, plates_out };
};

const applyTallies = (s: BuffetShift): BuffetShift => {
  const t = tallyPlates(s.id);
  return {
    ...s,
    initial_qty: t.initial,
    topup_qty: t.topup,
    remaining_qty: t.remaining,
    exceptions_staff: t.exceptions_staff,
    exceptions_guest: t.exceptions_guest,
    exceptions_no_code: t.exceptions_no_code,
    plates_out: t.plates_out,
    entries: shiftEntries(s.id).map((e) => ({ ...e })),
  };
};

const openShiftsFor = (scannerId?: string): BuffetShift[] =>
  _shifts.filter((s) => s.status === "open" && (!scannerId || s.scanner_id === scannerId));

// Base plate price when tiers are pooled: use the min tier price. The food is
// the same; extras like tea for VIP diners are tracked as ancillary cost, not here.
const basePlatePrice = (tiers: BuffetMealType[]): number =>
  Math.min(...tiers.map((t) => PLATE_PRICE[t]));

// Returns EVERY open shift for the scanner PLUS the most recent closed shift
// so the UI can still show yesterday's summary.
export async function mockGetCurrentShift(scannerId?: string): Promise<BuffetShift[]> {
  const open = openShiftsFor(scannerId);
  const closed = _shifts
    .filter((s) => s.status === "closed" && (!scannerId || s.scanner_id === scannerId))
    .reverse()
    .slice(0, 3); // keep the last few closed for context
  const all = [...open, ...closed].map(applyTallies);
  return delay(all);
}

export async function mockStartShift(
  scanner: { id?: string; name?: string },
  payload: StartShiftPayload,
): Promise<BuffetShift> {
  if (!payload.meal_types || payload.meal_types.length === 0) {
    throw new Error("Pick at least one tier for this shift");
  }
  // No tier can appear in two open shifts for the same scanner at the same time.
  const openShifts = openShiftsFor(scanner.id);
  const overlap = payload.meal_types.filter((mt) =>
    openShifts.some((s) => s.meal_types.includes(mt)),
  );
  if (overlap.length > 0) {
    throw new Error(`Already an open shift covering: ${overlap.join(", ")}`);
  }
  const s: BuffetShift = {
    id: uid(),
    status: "open",
    meal_types: [...payload.meal_types],
    branch_id: payload.branch_id,
    scanner_id: scanner.id,
    scanner_name: scanner.name,
    started_at: now(),
    initial_qty: 0,
    topup_qty: 0,
    remaining_qty: 0,
    exceptions_staff: 0,
    exceptions_guest: 0,
    exceptions_no_code: 0,
    plates_out: 0,
    plate_price: basePlatePrice(payload.meal_types),
    entries: [],
  };
  _shifts.push(s);
  _entries.push({
    id: uid(),
    shift_id: s.id,
    kind: "INITIAL",
    quantity: payload.initial_qty,
    created_at: now(),
  });
  return delay(applyTallies(s));
}

export async function mockAddEntry(
  shiftId: string,
  payload: EntryPayload,
): Promise<BuffetShift> {
  const s = _shifts.find((x) => x.id === shiftId && x.status === "open");
  if (!s) throw new Error("No open shift");
  if (payload.kind === "EXCEPTION" && !payload.exception_kind) {
    throw new Error("Exception entry requires exception_kind");
  }
  _entries.push({
    id: uid(),
    shift_id: shiftId,
    kind: payload.kind,
    quantity: payload.quantity,
    exception_kind: payload.exception_kind,
    created_at: now(),
  });
  return delay(applyTallies(s));
}

export async function mockCloseShift(
  shiftId: string,
  payload: CloseShiftPayload,
): Promise<BuffetShift> {
  const s = _shifts.find((x) => x.id === shiftId && x.status === "open");
  if (!s) throw new Error("No open shift");
  const t = tallyPlates(shiftId);
  if (t.remaining === 0 && !payload.remaining_qty && payload.remaining_qty !== 0) {
    throw new Error("Enter a REMAINING plate count before closing the shift");
  }
  if (payload.remaining_qty !== undefined && t.remaining !== payload.remaining_qty) {
    _entries.push({
      id: uid(),
      shift_id: shiftId,
      kind: "REMAINING",
      quantity: payload.remaining_qty - t.remaining,
      created_at: now(),
    });
  }
  const tally = tallyPlates(shiftId);

  // Real backend would query meal_logs to get the exact scan count for this
  // shift (matching tiers + scanner + time window). Mock: derive a plausible
  // value from plates_out with a small deterministic gap.
  const exceptionsTotal = tally.exceptions_staff + tally.exceptions_guest + tally.exceptions_no_code;
  const derivedScans = Math.max(0, tally.plates_out - exceptionsTotal - Math.min(3, Math.floor(tally.plates_out * 0.03)));
  const scansCount = payload.scans_count ?? derivedScans;

  s.status = "closed";
  s.closed_at = now();
  s.scans_count = scansCount;
  s.gap_plates = tally.plates_out - scansCount - exceptionsTotal;
  const price = s.plate_price ?? basePlatePrice(s.meal_types);
  s.gap_rwf = Number((s.gap_plates * price).toFixed(2));
  return delay(applyTallies(s));
}
