import { Header } from "components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import ResetPasswordButton from "./ResetPasswordButton";
import StatsCard from "components/StatsCard"
import { useMemo, useEffect, useState } from 'react'
import { mealsLogsData } from 'app/constants'
import dayjs from 'dayjs'
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '~/components/ui/table'
import { useAppSelector } from '~/store/hooks'
import { getWorkerWallet } from '~/services/wallet'

interface props {
    userName: string
}
const Client = ({userName}:props) => {
  const { user } = useAppSelector((s) => s.auth)
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [walletLoading, setWalletLoading] = useState(false)
  const [walletError, setWalletError] = useState('')
  const [wallet, setWallet] = useState<{ prepaid_amount: number; remaining_amount: number; credit_limit: number; credit_used: number; transactions: any[] } | null>(null)

  const logs = useMemo(() => {
    const base = mealsLogsData.filter((m) => m.clientName === userName);
    if (!startDate && !endDate) return base.sort((a,b) => +new Date(b.dateTime) - +new Date(a.dateTime));
    const start = startDate ? dayjs(startDate).startOf('day') : null;
    const end = endDate ? dayjs(endDate).endOf('day') : null;
    return base.filter((m) => {
      const dt = dayjs(m.dateTime, ['MMM D, YYYY h:mm A','YYYY-MM-DDTHH:mm:ssZ','YYYY-MM-DD']);
      if (start && dt.isBefore(start)) return false;
      if (end && dt.isAfter(end)) return false;
      return true;
    }).sort((a,b) => +new Date(b.dateTime) - +new Date(a.dateTime));
  }, [userName, startDate, endDate]);

  // Fetch wallet for workers
  useEffect(() => {
    const role = user?.role?.toLowerCase?.()
    if (role !== 'worker' || !user?.id) return
    let mounted = true
    const run = async () => {
      try {
        setWalletLoading(true); setWalletError('')
        const resp = await getWorkerWallet(String(user.id))
        if (!mounted) return
        if (!resp.success) { setWalletError(resp.message || 'Failed to fetch wallet'); return }
        setWallet(resp.data || null)
      } catch (e) {
        if (!mounted) return
        setWalletError(e instanceof Error ? e.message : 'Wallet error')
      } finally {
        if (mounted) setWalletLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [user?.id, user?.role])
  return (
      <main className='dashboard wrapper'>
        <Header
          title={`Welcome ${userName} 👋`}
          description="View your meal subscription and remaining meals"
          action={
            <SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />
          }
        />

        {/* Student/Worker subscription info */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">My Subscription</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Type:</span> VIP</p>
            <p><span className="font-medium">Total Meals:</span> 30</p>
            <p><span className="font-medium">Remaining:</span> 15</p>
            <p><span className="font-medium">Payment Status:</span> Paid</p>
          </div>
        </section>

        {/* Worker Wallet Section */}
        {user?.role?.toLowerCase?.() === 'worker' && (
          <section className="bg-white p-6 rounded-lg shadow mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Wallet</h2>
            </div>
            {walletLoading ? (
              <p className="text-sm text-gray-500 mt-2">Loading wallet…</p>
            ) : walletError ? (
              <p className="text-sm text-red-600 mt-2">{walletError}</p>
            ) : wallet ? (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded">
                  <p className="text-xs text-gray-500">Prepaid Amount</p>
                  <p className="text-lg font-semibold">{wallet.prepaid_amount}</p>
                </div>
                <div className="p-4 border rounded">
                  <p className="text-xs text-gray-500">Remaining Amount</p>
                  <p className="text-lg font-semibold">{wallet.remaining_amount}</p>
                </div>
                <div className="p-4 border rounded">
                  <p className="text-xs text-gray-500">Credit Limit</p>
                  <p className="text-lg font-semibold">{wallet.credit_limit}</p>
                </div>
                <div className="p-4 border rounded">
                  <p className="text-xs text-gray-500">Credit Used</p>
                  <p className="text-lg font-semibold">{wallet.credit_used}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">No wallet data</p>
            )}

            {/* Transactions */}
            {wallet?.transactions && wallet.transactions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Recent Transactions</h3>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wallet.transactions.slice(0, 10).map((t: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs">{t.date || t.created_at || '-'}</TableCell>
                        <TableCell>{t.type || '-'}</TableCell>
                        <TableCell>{t.amount ?? t.value ?? '-'}</TableCell>
                        <TableCell className="hidden md:table-cell">{t.reference || t.id || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        )}
        {/* Meals Log */}
        <section className="bg-white p-6 rounded-lg shadow mt-6">
          <div className="flex gap-1 md:items-center flex-col md:flex-row justify-between mb-4">
            <h2 className="text-xl font-semibold">Meals Log</h2>
            <div className="flex items-center gap-2 md:flex-row ">
              <div className="flex flex-col md:flex-row md:items-center">
                <label className="text-sm">From</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border md:px-2 py-1 rounded" />
              </div>
              <div className="flex flex-col md:flex-row md:items-center">
                <label className="text-sm">To</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border md:px-2 py-1 rounded" />
              </div>
              <button className="ml-2 text-sm text-blue-600 hidden md:block" onClick={() => { setStartDate(''); setEndDate(''); }}>Clear</button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Date</TableHead>
                <TableHead>Meal Used</TableHead>
                <TableHead>Meals Left</TableHead>
                <TableHead className="hidden md:table-cell">Scanned By</TableHead>
                <TableHead className="hidden lg:table-cell">Branch</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-4 text-sm text-gray-500">No meals logged for this period.</TableCell>
                </TableRow>
              ) : (
                logs.map((r, idx) => (
                  <TableRow key={`${r.clientId}-${idx}`}>
                    <TableCell className="font-mono text-xs">{dayjs(r.dateTime, ['MMM D, YYYY h:mm A','YYYY-MM-DDTHH:mm:ssZ']).format('D MMM YYYY, h:mm A')}</TableCell>
                    <TableCell className="font-semibold">{r.mealUsed}</TableCell>
                    <TableCell className="font-semibold">{r.mealsLeft}</TableCell>
                    <TableCell className="hidden md:table-cell">{r.scannedBy}</TableCell>
                    <TableCell className="hidden lg:table-cell">{r.branch}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </section>
      </main>
    );
}

export default Client
