import { Header } from "../../../components/Header"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useAppSelector } from "~/store/hooks"
import { getWorkerWallet } from "~/services/wallet"
import { UserRole } from "~/types/auth"
// Using a basic table to avoid dependency on missing UI table component

export default function WalletPage() {
  const { user } = useAppSelector((s) => s.auth)
  const [searchParams] = useSearchParams()
  const selectedUserId = searchParams.get('userId') || undefined
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<{ prepaid_amount: number; remaining_amount: number; credit_limit: number; credit_used: number; transactions: any[] } | null>(null)

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
                <p className="text-xs text-gray-500">Remaining Amount</p>
                <p className="text-lg font-semibold">{data.remaining_amount}</p>
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
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2 hidden md:table-cell">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.slice(0, 20).map((t: any, idx: number) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2 font-mono text-xs">{t.date || t.created_at || '-'}</td>
                        <td className="p-2">{t.type || '-'}</td>
                        <td className="p-2">{t.amount ?? t.value ?? '-'}</td>
                        <td className="p-2 hidden md:table-cell">{t.reference || t.id || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
