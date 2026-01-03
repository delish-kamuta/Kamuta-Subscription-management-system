import { Header } from "../../../components/Header"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { useSearchParams } from "react-router-dom"
import { useAppSelector, useAppDispatch } from "~/store/hooks"
import { UserRole } from "~/types/auth"
import { Download } from "lucide-react"
import { useWorkerWallet } from "~/hooks/useWorkerWallet"
import { exportWalletTransactionsToPDF } from "~/lib/export-utils"
import { AddWalletPaymentSheet } from "~/components/wallet/AddWalletPaymentSheet"
import { WalletStats } from "~/components/wallet/WalletStats"
import { WalletTransactionsTable } from "~/components/wallet/WalletTransactionsTable"
import { fetchUsersThunk } from "~/store/usersSlice"
import { useEffect } from "react"

export default function WalletPage() {
  const { user } = useAppSelector((s) => s.auth)
  const dispatch = useAppDispatch()
  const { items: users, loaded: usersLoaded } = useAppSelector((s) => (s as any).users || { items: [] })
  const [searchParams] = useSearchParams()
  const selectedUserId = searchParams.get('userId') || undefined
  
  const { data, loading, error, refreshWallet } = useWorkerWallet(user, selectedUserId)

  useEffect(() => {
    if (!usersLoaded && (user?.role === UserRole.ADMIN || (UserRole as any)?.CASHIER === user?.role)) {
      dispatch(fetchUsersThunk())
    }
  }, [usersLoaded, dispatch, user?.role])

  const handleExport = () => {
    if (data?.transactions) {
      const targetId = selectedUserId || user?.id;
      const targetUser = users.find((u: any) => String(u.id) === String(targetId));
      const userName = targetUser?.full_name || targetUser?.name || user?.name || 'Unknown User';
      const userPhone = targetUser?.phone || targetUser?.tel || '';
      
      exportWalletTransactionsToPDF(data.transactions, targetId, userName, userPhone)
    }
  }

  return (
    <main className="dashboard wrapper">
      <Header
        title="Wallet"
        description="View wallet details and recent transactions"
        action={<SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />}
      />

      <section className="bg-white p-6 rounded-lg shadow mt-6">
        {(user?.role === UserRole.ADMIN || (UserRole as any)?.CASHIER === user?.role) && (
          <div className="mb-6 flex gap-2">
            <AddWalletPaymentSheet 
              userId={selectedUserId || String(user?.id || '')} 
              onPaymentSuccess={refreshWallet} 
            />
            <button onClick={handleExport} className="px-3 py-2 rounded bg-green-600 text-white flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Transactions
            </button>
          </div>
        )}
        {loading ? (
          <p className="text-sm text-gray-500">Loading wallet…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : data ? (
          <>
            <WalletStats data={data} />
            <WalletTransactionsTable transactions={data.transactions} />
          </>
        ) : (
          <p className="text-sm text-gray-500">No wallet data</p>
        )}
      </section>
    </main>
  )
}
