import { useEffect, useMemo, useState } from "react";
import { PlayCircle, Package, ShoppingBag, Trash2, ClipboardCheck, RefreshCw, User as UserIcon } from "lucide-react";
import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import {
  fetchCurrentSessionThunk,
  fetchProductsThunk,
  openSessionThunk,
  reopenSessionThunk,
} from "~/store/shopSlice";
import { UserRole } from "~/types/auth";
import { formatCurrency } from "~/lib/utils";
import { ReceiveSheet } from "~/components/shop/ReceiveSheet";
import { RecordShopWasteSheet } from "~/components/shop/RecordShopWasteSheet";
import { CloseSessionSheet } from "~/components/shop/CloseSessionSheet";

export default function ShopPage() {
  const dispatch = useAppDispatch();
  const { currentSession, loading, error, productsLoaded } = useAppSelector((s) => s.shop);
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.role === UserRole.ADMIN;

  const [receiveKind, setReceiveKind] = useState<"produced" | "bought" | null>(null);
  const [wasteOpen, setWasteOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState("");

  useEffect(() => {
    dispatch(fetchCurrentSessionThunk());
    if (!productsLoaded) dispatch(fetchProductsThunk());
  }, [dispatch, productsLoaded]);

  const view: "no_session" | "open" | "closed" = useMemo(() => {
    if (!currentSession) return "no_session";
    return currentSession.status === "open" ? "open" : "closed";
  }, [currentSession]);

  const handleOpenDay = async () => {
    setOpenError("");
    setOpening(true);
    try {
      await dispatch(
        openSessionThunk({ openedBy: { id: user?.id, name: user?.name } }),
      ).unwrap();
    } catch (err: any) {
      setOpenError(err?.message || String(err) || "Failed to open day");
    } finally {
      setOpening(false);
    }
  };

  const handleReopen = async () => {
    if (!currentSession) return;
    if (!confirm(`Reopen the session from ${new Date(currentSession.date).toDateString()}? Only admins can do this.`)) return;
    try {
      await dispatch(reopenSessionThunk({ sessionId: currentSession.id })).unwrap();
    } catch (err: any) {
      alert(err?.message || String(err) || "Failed to reopen");
    }
  };

  return (
    <main className="dashboard wrapper flex flex-col gap-6 p-4 md:p-6">
      <Header
        title="Shop session"
        description="Open the day, record production and bought goods, waste, then close with a cash reconciliation."
        action={<SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">Session error:</strong> <span>{error}</span>
        </div>
      )}

      {loading && !currentSession && (
        <div className="text-sm text-gray-500">Loading session…</div>
      )}

      {view === "no_session" && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center gap-4 text-center">
          <PlayCircle className="w-12 h-12 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold">No session open today</h2>
            <p className="text-sm text-gray-500 mt-1">
              Opening quantities are pre-filled from yesterday's closing — you just confirm.
            </p>
          </div>
          {openError && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm w-full max-w-md">{openError}</div>}
          <Button onClick={handleOpenDay} disabled={opening} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <PlayCircle className="h-4 w-4" /> {opening ? "Opening…" : "Open day"}
          </Button>
        </div>
      )}

      {view === "open" && currentSession && (
        <>
          {/* Session header */}
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap items-center gap-4 justify-between">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Session date</div>
              <div className="text-lg font-semibold">{new Date(currentSession.date).toDateString()}</div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <UserIcon className="w-3 h-3" /> Opened by {currentSession.opened_by_name || "—"}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setReceiveKind("produced")} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                <Package className="w-4 h-4" /> Receive production
              </Button>
              <Button onClick={() => setReceiveKind("bought")} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <ShoppingBag className="w-4 h-4" /> Receive bought
              </Button>
              <Button onClick={() => setWasteOpen(true)} variant="outline" className="gap-2">
                <Trash2 className="w-4 h-4" /> Waste
              </Button>
              <Button onClick={() => setCloseOpen(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                <ClipboardCheck className="w-4 h-4" /> Close day
              </Button>
            </div>
          </div>

          {/* Live session table */}
          <section className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 text-sm text-gray-500">Live session</div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Opening</TableHead>
                    <TableHead className="text-right">Produced</TableHead>
                    <TableHead className="text-right">Bought</TableHead>
                    <TableHead className="text-right">Waste</TableHead>
                    <TableHead className="text-right">Bought cost</TableHead>
                    <TableHead className="text-right">Selling price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSession.lines.map((l) => (
                    <TableRow key={l.product_id}>
                      <TableCell className="font-medium">{l.product_name}</TableCell>
                      <TableCell className="text-xs text-gray-500">{l.source}</TableCell>
                      <TableCell className="text-right font-mono">{l.opening_qty}</TableCell>
                      <TableCell className="text-right font-mono">{l.received_produced_qty}</TableCell>
                      <TableCell className="text-right font-mono">{l.received_bought_qty}</TableCell>
                      <TableCell className="text-right font-mono">{l.waste_qty}</TableCell>
                      <TableCell className="text-right font-mono">
                        {l.source === "bought" ? formatCurrency(l.received_bought_cost) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(l.selling_price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </>
      )}

      {view === "closed" && currentSession && (
        <div className="space-y-4">
          {/* Reconciliation cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="text-gray-600 text-sm font-medium">Expected revenue</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(currentSession.cash_expected ?? 0)}</div>
              <div className="text-xs text-gray-500 mt-1">Sold × selling price</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="text-gray-600 text-sm font-medium">Actual cash</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(currentSession.cash_actual ?? 0)}</div>
              <div className="text-xs text-gray-500 mt-1">Counted at close</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="text-gray-600 text-sm font-medium">Variance</div>
              <div className={`text-3xl font-bold mt-1 ${(currentSession.cash_variance ?? 0) < 0 ? "text-red-600" : (currentSession.cash_variance ?? 0) > 0 ? "text-green-700" : "text-gray-900"}`}>
                {(currentSession.cash_variance ?? 0) > 0 ? "+" : ""}
                {formatCurrency(currentSession.cash_variance ?? 0)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Actual − expected</div>
            </div>
          </div>

          {/* Closed-session header */}
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap items-center gap-4 justify-between">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Closed session</div>
              <div className="text-lg font-semibold">{new Date(currentSession.date).toDateString()}</div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <UserIcon className="w-3 h-3" /> Closed by {currentSession.closed_by_name || "—"}
              </div>
            </div>
            {isAdmin && (
              <Button onClick={handleReopen} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" /> Reopen (admin)
              </Button>
            )}
          </div>

          {/* Per-product breakdown */}
          <section className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 text-sm text-gray-500">Per-product breakdown</div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Opening</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right">Waste</TableHead>
                    <TableHead className="text-right">Closing</TableHead>
                    <TableHead className="text-right">Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSession.lines.map((l) => {
                    const received = l.received_produced_qty + l.received_bought_qty;
                    return (
                      <TableRow key={l.product_id}>
                        <TableCell className="font-medium">{l.product_name}</TableCell>
                        <TableCell className="text-right font-mono">{l.opening_qty}</TableCell>
                        <TableCell className="text-right font-mono">{received}</TableCell>
                        <TableCell className="text-right font-mono">{l.waste_qty}</TableCell>
                        <TableCell className="text-right font-mono">{l.closing_qty ?? 0}</TableCell>
                        <TableCell className="text-right font-mono">{l.sold_qty ?? 0}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(l.revenue ?? 0)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(l.margin ?? 0)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      )}

      {/* Sheets */}
      {receiveKind && (
        <ReceiveSheet
          open={receiveKind !== null}
          onOpenChange={(v) => { if (!v) setReceiveKind(null); }}
          kind={receiveKind}
        />
      )}
      <RecordShopWasteSheet open={wasteOpen} onOpenChange={setWasteOpen} />
      <CloseSessionSheet open={closeOpen} onOpenChange={setCloseOpen} />
    </main>
  );
}
