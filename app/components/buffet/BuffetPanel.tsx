import { useEffect, useMemo, useState } from "react";
import { UtensilsCrossed, Plus, PlayCircle, ClipboardCheck, User as UserIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import {
  fetchCurrentBuffetShiftsThunk,
  startBuffetShiftThunk,
  addBuffetEntryThunk,
  closeBuffetShiftThunk,
} from "~/store/buffetSlice";
import type { BuffetMealType, BuffetShift } from "~/services/buffet";
import { formatCurrency } from "~/lib/utils";
import { UserRole } from "~/types/auth";

const TIERS: BuffetMealType[] = ["Regular", "VIP", "VVIP"];

// Panel is now shift-list based, because a single buffet line can serve
// multiple tiers at once (e.g. Regular+VIP share plates; VIP just gets tea).
// Each shift declares which tiers it covers.
export function BuffetPanel() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const shifts = useAppSelector((s) => s.buffet.currentShifts);
  const loading = useAppSelector((s) => s.buffet.loading);
  const error = useAppSelector((s) => s.buffet.error);

  const [creatorOpen, setCreatorOpen] = useState(false);
  const [newTiers, setNewTiers] = useState<Set<BuffetMealType>>(new Set());
  const [newInitial, setNewInitial] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    dispatch(fetchCurrentBuffetShiftsThunk({ scannerId: user?.id }));
  }, [dispatch, user?.id]);

  const openShifts = useMemo(() => shifts.filter((s) => s.status === "open"), [shifts]);
  const closedShifts = useMemo(() => shifts.filter((s) => s.status === "closed").slice(0, 3), [shifts]);

  // Tiers already covered by an open shift — hidden from the new-shift chooser.
  const coveredTiers = useMemo(() => {
    const set = new Set<BuffetMealType>();
    for (const s of openShifts) s.meal_types.forEach((t) => set.add(t));
    return set;
  }, [openShifts]);

  const availableTiers = TIERS.filter((t) => !coveredTiers.has(t));

  const toggleTier = (t: BuffetMealType) => {
    setNewTiers((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const handleStartNew = async () => {
    setLocalError("");
    if (newTiers.size === 0) {
      setLocalError("Pick at least one tier for this shift");
      return;
    }
    const qty = Number(newInitial);
    if (!qty || qty <= 0) {
      setLocalError("Enter starting plate count");
      return;
    }
    setBusy(true);
    try {
      await dispatch(
        startBuffetShiftThunk({
          scanner: { id: user?.id, name: user?.name },
          payload: {
            initial_qty: qty,
            meal_types: Array.from(newTiers),
            branch_id: user?.branch_id || undefined,
          },
        }),
      ).unwrap();
      setNewTiers(new Set());
      setNewInitial("");
      setCreatorOpen(false);
    } catch (err: any) {
      setLocalError(err?.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full flex flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
        <UtensilsCrossed className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold flex-1">Buffet shifts</h3>
        <span className="text-xs text-gray-500">
          {openShifts.length} open · {coveredTiers.size}/{TIERS.length} tiers covered
        </span>
      </div>

      {(localError || error) && !creatorOpen && (
        <div className="bg-red-50 text-red-600 p-2 rounded text-xs">
          {localError || error}
        </div>
      )}

      {/* Open shifts */}
      {loading && openShifts.length === 0 && (
        <div className="text-xs text-gray-500">Loading shifts…</div>
      )}

      {openShifts.length === 0 && !loading && !creatorOpen && (
        <p className="text-xs text-gray-500">No open shifts yet. Start one below.</p>
      )}

      <div className="flex flex-col gap-2">
        {openShifts.map((shift) => (
          <ShiftCard key={shift.id} shift={shift} onError={setLocalError} setBusy={setBusy} busy={busy} />
        ))}
      </div>

      {/* Start-new-shift creator */}
      {availableTiers.length > 0 && (
        <div className="border border-dashed border-gray-200 rounded-md">
          <button
            type="button"
            onClick={() => setCreatorOpen((v) => !v)}
            className="w-full flex items-center justify-between text-sm px-3 py-2 hover:bg-gray-50 rounded-md"
          >
            <span className="flex items-center gap-2 text-blue-600 font-medium">
              <Plus className="w-4 h-4" /> Start new shift
            </span>
            {creatorOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {creatorOpen && (
            <div className="px-3 pb-3 space-y-2 text-sm">
              {localError && (
                <div className="bg-red-50 text-red-600 p-2 rounded text-xs">{localError}</div>
              )}
              <div>
                <label className="text-xs font-medium block mb-1">Tiers on this line *</label>
                <div className="flex flex-wrap gap-1">
                  {availableTiers.map((t) => {
                    const on = newTiers.has(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTier(t)}
                        className={`px-2 py-1 text-xs rounded border ${on ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-50"}`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Multi-select if the plates are shared (e.g. Regular + VIP on the same line).
                </p>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Initial plates *</label>
                <Input
                  type="number"
                  min={0}
                  value={newInitial}
                  onChange={(e) => setNewInitial(e.target.value)}
                  placeholder="e.g. 100"
                  className="h-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleStartNew}
                  disabled={busy || newTiers.size === 0 || !newInitial}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
                >
                  <PlayCircle className="w-4 h-4" /> Start shift
                </Button>
                <Button
                  onClick={() => { setCreatorOpen(false); setLocalError(""); }}
                  variant="ghost"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recently closed */}
      {closedShifts.length > 0 && (
        <div className="border-t border-gray-100 pt-2 space-y-2">
          <div className="text-xs text-gray-500 font-medium">Recently closed</div>
          {closedShifts.map((shift) => (
            <ClosedShiftCard key={shift.id} shift={shift} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Open-shift card ----------

function ShiftCard({
  shift,
  onError,
  setBusy,
  busy,
}: {
  shift: BuffetShift;
  onError: (msg: string) => void;
  setBusy: (b: boolean) => void;
  busy: boolean;
}) {
  const dispatch = useAppDispatch();
  const [topup, setTopup] = useState("");
  const [remaining, setRemaining] = useState("");

  const tierLabel = shift.meal_types.join(" · ");
  const hasRemaining = shift.remaining_qty > 0;
  const canClose = hasRemaining;

  const doTopup = async () => {
    onError("");
    const q = Number(topup);
    if (!q || q <= 0) return onError("Enter top-up plate count");
    setBusy(true);
    try {
      await dispatch(
        addBuffetEntryThunk({ shiftId: shift.id, payload: { kind: "TOPUP", quantity: q } }),
      ).unwrap();
      setTopup("");
    } catch (err: any) {
      onError(err?.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  const doRemaining = async () => {
    onError("");
    const q = Number(remaining);
    if (isNaN(q) || q < 0) return onError("Enter remaining plate count");
    setBusy(true);
    try {
      const delta = q - (shift.remaining_qty ?? 0);
      if (delta !== 0) {
        await dispatch(
          addBuffetEntryThunk({ shiftId: shift.id, payload: { kind: "REMAINING", quantity: delta } }),
        ).unwrap();
      }
      setRemaining("");
    } catch (err: any) {
      onError(err?.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  const doException = async (kind: "staff" | "guest" | "no_code") => {
    onError("");
    setBusy(true);
    try {
      await dispatch(
        addBuffetEntryThunk({
          shiftId: shift.id,
          payload: { kind: "EXCEPTION", quantity: 1, exception_kind: kind },
        }),
      ).unwrap();
    } catch (err: any) {
      onError(err?.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  const doClose = async () => {
    if (!canClose) return;
    if (!confirm(`Close the ${tierLabel} shift? You won't be able to add more entries.`)) return;
    onError("");
    setBusy(true);
    try {
      // scans_count is intentionally omitted — the backend counts the scans
      // for this shift's tiers / scanner / time window from the meal logs.
      await dispatch(
        closeBuffetShiftThunk({
          shiftId: shift.id,
          payload: {
            remaining_qty: Number(remaining || shift.remaining_qty || 0),
          },
        }),
      ).unwrap();
    } catch (err: any) {
      onError(err?.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-md p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {shift.meal_types.map((t) => (
            <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
              {t}
            </span>
          ))}
        </div>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <UserIcon className="w-3 h-3" /> {shift.scanner_name || "You"}
        </span>
      </div>

      <div className="text-xs text-gray-500">
        Plate price (base food): <span className="font-mono text-gray-700">{formatCurrency(shift.plate_price ?? 0)}</span>
        {shift.meal_types.length > 1 && (
          <span className="ml-1 text-gray-400">— extras for higher tiers tracked separately</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gray-50 rounded p-2">
          <div className="text-xs text-gray-500">Initial</div>
          <div className="font-mono font-semibold">{shift.initial_qty}</div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="text-xs text-gray-500">Top-ups</div>
          <div className="font-mono font-semibold">{shift.topup_qty}</div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="text-xs text-gray-500">Remaining</div>
          <div className="font-mono font-semibold">{shift.remaining_qty}</div>
        </div>
        <div className="bg-blue-50 rounded p-2">
          <div className="text-xs text-blue-700">Plates out</div>
          <div className="font-mono font-semibold text-blue-900">{shift.plates_out}</div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium">Add top-up</label>
        <div className="flex gap-2">
          <Input type="number" min={0} value={topup} onChange={(e) => setTopup(e.target.value)}
            placeholder="plates added" className="h-9" />
          <Button onClick={doTopup} disabled={busy} size="sm" variant="outline" className="h-9 gap-1">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium">Exceptions (+1 each)</label>
        <div className="flex flex-wrap gap-1 text-xs">
          <button type="button" onClick={() => doException("staff")} disabled={busy}
            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1">
            Staff <span className="font-mono text-gray-500">{shift.exceptions_staff}</span>
          </button>
          <button type="button" onClick={() => doException("guest")} disabled={busy}
            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1">
            Guest <span className="font-mono text-gray-500">{shift.exceptions_guest}</span>
          </button>
          <button type="button" onClick={() => doException("no_code")} disabled={busy}
            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1">
            No code <span className="font-mono text-gray-500">{shift.exceptions_no_code}</span>
          </button>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-2 space-y-2">
        <div className="space-y-1">
          <label className="text-xs font-medium">Remaining at end</label>
          <div className="flex gap-2">
            <Input type="number" min={0} value={remaining}
              onChange={(e) => setRemaining(e.target.value)} placeholder="plates left" className="h-9" />
            <Button onClick={doRemaining} disabled={busy} size="sm" variant="outline" className="h-9">
              Save
            </Button>
          </div>
        </div>
        <Button onClick={doClose} disabled={!canClose || busy}
          className="w-full bg-red-600 hover:bg-red-700 text-white gap-1" size="sm">
          <ClipboardCheck className="w-4 h-4" /> Close shift
        </Button>
        {!hasRemaining && (
          <p className="text-xs text-amber-700">Waiting for REMAINING count before close is allowed.</p>
        )}
        <p className="text-xs text-gray-500">
          Scan count is pulled from meal logs automatically at close — you don't type it.
        </p>
      </div>
    </div>
  );
}

// ---------- Closed-shift card (read-only summary) ----------

function ClosedShiftCard({ shift }: { shift: BuffetShift }) {
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.role === UserRole.ADMIN;

  const gap = shift.gap_plates ?? 0;
  const gapRwf = shift.gap_rwf ?? 0;
  return (
    <div className="border border-gray-100 rounded-md p-2 bg-gray-50/40 space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap gap-1">
          {shift.meal_types.map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px]">
              {t}
            </span>
          ))}
        </div>
        <span className="text-gray-400 flex items-center gap-1">
          <UserIcon className="w-3 h-3" /> {shift.scanner_name || "—"}
        </span>
      </div>
      {/* Non-admins see only what they physically counted. Scans, gap, and
          gap-in-RWF are reconciliation data — admin-only on this panel. */}
      {isAdmin ? (
        <div className="grid grid-cols-4 gap-1 text-xs">
          <div>
            <div className="text-gray-500">Out</div>
            <div className="font-mono">{shift.plates_out}</div>
          </div>
          <div>
            <div className="text-gray-500">Scans</div>
            <div className="font-mono">{shift.scans_count ?? 0}</div>
          </div>
          <div>
            <div className="text-gray-500">Gap</div>
            <div className={`font-mono ${gap > 0 ? "text-red-600" : "text-green-700"}`}>{gap}</div>
          </div>
          <div>
            <div className="text-gray-500">Gap RWF</div>
            <div className={`font-mono ${gapRwf > 0 ? "text-red-600" : "text-green-700"}`}>{formatCurrency(gapRwf)}</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div>
            <div className="text-gray-500">Plates out</div>
            <div className="font-mono">{shift.plates_out}</div>
          </div>
          <div>
            <div className="text-gray-500">Status</div>
            <div className="font-medium text-green-700">Closed</div>
          </div>
        </div>
      )}
    </div>
  );
}
