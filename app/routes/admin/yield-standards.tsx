import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Header } from "../../../components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { UserRole } from "~/types/auth";
import { useAppSelector } from "~/store/hooks";
import { listYieldStandards, deleteYieldStandard, type YieldStandard } from "~/services/yieldStandards";
import { YieldStandardSheet } from "~/components/yield-standards/YieldStandardSheet";

export default function YieldStandardsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.role === UserRole.ADMIN;

  const [standards, setStandards] = useState<YieldStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<YieldStandard | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await listYieldStandards();
      setStandards(data);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch standards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDelete = async (s: YieldStandard) => {
    if (!confirm(`Delete the yield standard for ${s.product_name}? This can't be undone.`)) return;
    try {
      await deleteYieldStandard(s.id);
      await fetchAll();
    } catch (e: any) {
      alert(e?.message || "Failed to delete");
    }
  };

  if (!isAdmin) {
    return (
      <main className="wrapper flex items-center justify-center h-screen">
        <p className="text-xl text-gray-500">Access Denied: Admin Only</p>
      </main>
    );
  }

  return (
    <main className="dashboard wrapper flex flex-col gap-6 p-4 md:p-6">
      <Header
        title="Yield Standards"
        description="How much of an input should produce how many units. Consumed by yield-variance reports."
        action={<SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">Error:</strong> <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => {
            setSelected(null);
            setSheetOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus className="h-4 w-4" /> Add standard
        </Button>
      </div>

      <section className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 text-sm text-gray-500">
          {loading ? "Loading…" : `${standards.length} standards`}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Input item</TableHead>
                <TableHead className="text-right">Input qty</TableHead>
                <TableHead className="text-right">Output qty</TableHead>
                <TableHead className="text-right">Tolerance</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && standards.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-gray-500 py-6">
                    No yield standards defined yet.
                  </TableCell>
                </TableRow>
              )}
              {standards.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.product_name}</TableCell>
                  <TableCell>{s.input_item_name}</TableCell>
                  <TableCell className="text-right font-mono">{s.input_qty} {s.input_unit}</TableCell>
                  <TableCell className="text-right font-mono">{s.output_qty}</TableCell>
                  <TableCell className="text-right font-mono">±{s.tolerance_pct}%</TableCell>
                  <TableCell className="text-xs text-gray-500">{new Date(s.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(s); setSheetOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(s)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <YieldStandardSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialData={selected}
        onSuccess={fetchAll}
      />
    </main>
  );
}
