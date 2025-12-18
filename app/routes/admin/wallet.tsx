import { Header } from "../../../components/Header"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "~/components/ui/sheet"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useAppSelector } from "~/store/hooks"
import { getWorkerWallet, addWorkerWalletPayment } from "~/services/wallet"
import { UserRole } from "~/types/auth"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"

export default function WalletPage() {
  const { user } = useAppSelector((s) => s.auth)
  const [searchParams] = useSearchParams()
  const selectedUserId = searchParams.get('userId') || undefined
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<{ prepaid_amount: number; remaining_amount: number; credit_limit: number; credit_used: number; transactions: any[] } | null>(null)
  const [amount, setAmount] = useState<string>('')
  const [method, setMethod] = useState<string>('cash')
  const [note, setNote] = useState<string>('')
  const [saving, setSaving] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)

  useEffect(() => {
    const role = user?.role
    const targetId = selectedUserId || String(user?.id || '')
    if (!targetId) return
    // Allow admins/cashiers to open any user's wallet via userId; workers can open their own
    if (!selectedUserId && role !== UserRole.WORKER && role !== UserRole.ADMIN) { return }
    let mounted = true
    const run = async () => {
      try {
        setLoading(true); setError('')
        const resp = await getWorkerWallet(targetId)
        if (!mounted) return
        if (!resp.success) { setError(resp.message || 'Failed to fetch wallet'); return }
        setData(resp.data || null)
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : 'Wallet error')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [user?.id, user?.role, selectedUserId])

  return (
    <main className="dashboard wrapper">
      <Header
        title="Wallet"
        description="View wallet details and recent transactions"
        action={<SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />}
      />

      <section className="bg-white p-6 rounded-lg shadow mt-6">
        {(user?.role === UserRole.ADMIN || (UserRole as any)?.CASHIER === user?.role) && (
          <div className="mb-6">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="px-3 py-2 rounded bg-blue-600 text-white">Add Wallet Payment</button>
              </SheetTrigger>
              <SheetContent className="bg-white p-6">
                <SheetHeader>
                  <SheetTitle>Add Wallet Payment</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs text-gray-500">Amount</label>
                    <input type="number" className="mt-1 w-full border rounded p-2" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 5000" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Method</label>
                    <select className="mt-1 w-full border rounded p-2" value={method} onChange={(e) => setMethod(e.target.value)}>
                      <option value="cash">Cash</option>
                      <option value="momo">Mobile Money</option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Note</label>
                    <input className="mt-1 w-full border rounded p-2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
                  </div>
                </div>
                <SheetFooter className="mt-6 flex gap-2 px-0">
                  <SheetClose asChild>
                    <button className="px-3 py-2 rounded border">Cancel</button>
                  </SheetClose>
                  <button
                    className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
                    disabled={saving || !amount || Number(amount) <= 0}
                    onClick={async () => {
                      const targetId = selectedUserId || String(user?.id || '')
                      if (!targetId) return
                      try {
                        setSaving(true)
                        const resp = await addWorkerWalletPayment(targetId, { amount: Number(amount), payment_method: method, note })
                        if (!resp.success) { setError(resp.message || 'Failed to add payment'); return }
                        // refresh wallet
                        const w = await getWorkerWallet(targetId)
                        if (w.success) setData(w.data || null)
                        setAmount(''); setNote(''); setOpen(false)
                      } catch (e) {
                        setError(e instanceof Error ? e.message : 'Payment error')
                      } finally {
                        setSaving(false)
                      }
                    }}
                  >{saving ? 'Saving…' : 'Save Payment'}</button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        )}
        {loading ? (
          <p className="text-sm text-gray-500">Loading wallet…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-xs text-gray-500">Prepaid Amount</p>
                <p className="text-lg font-semibold">{data.prepaid_amount}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-xs text-gray-500">Credit Limit</p>
                <p className="text-lg font-semibold">{data.credit_limit}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-xs text-gray-500">Credit Used</p>
                <p className="text-lg font-semibold">{data.credit_used}</p>
              </div>
            </div>

            {data.transactions && data.transactions.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Recent Transactions</h3>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.transactions.slice(0, 20).map((t: any, idx: number) => {
                      const combinedStr = (
                        (t.type || '') + ' ' + 
                        (t.payment_method || '') + ' ' + 
                        (t.method || '') + ' ' + 
                        (t.category || '') + ' ' +
                        (t.description || '') + ' ' +
                        (t.note || '')
                      ).toLowerCase();

                      const isTopUp = combinedStr.includes('payment') || 
                                      combinedStr.includes('credit') || 
                                      combinedStr.includes('deposit') || 
                                      combinedStr.includes('top') ||
                                      combinedStr.includes('cash') ||
                                      combinedStr.includes('momo') ||
                                      combinedStr.includes('card') ||
                                      combinedStr.includes('mobile') ||
                                      combinedStr.includes('transfer') ||
                                      combinedStr.includes('fund') ||
                                      combinedStr.includes('admin');
                      
                      const dateStr = t.date || t.created_at;
                      const formattedDate = dateStr ? new Date(dateStr).toLocaleString() : '-';

                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs">{formattedDate}</TableCell>
                          <TableCell>{t.type || '-'}</TableCell>
                          <TableCell>
                            {isTopUp ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Top Up
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Charge
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{t.amount ?? t.value ?? '-'}</TableCell>
                          <TableCell className="hidden md:table-cell">{t.reference || t.id || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-4">No transactions found.</p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">No wallet data</p>
        )}
      </section>
    </main>
  )
}
