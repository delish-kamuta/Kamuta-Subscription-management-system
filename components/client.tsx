import { Header } from "components/Header";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import FeedbackSheet from "components/FeedbackSheet";
import ResetPasswordButton from "./ResetPasswordButton";
import StatsCard from "components/StatsCard"
import { useMemo, useEffect, useState } from 'react'
// import { mealsLogsData } from 'app/constants'
import dayjs from 'dayjs'
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '~/components/ui/table'
import { useAppSelector, useAppDispatch } from '~/store/hooks'
import { fetchUsersThunk } from '~/store/usersSlice'
import { fetchBranchesThunk } from '~/store/branchesSlice'
import { listMealLogs, type MealLogItem } from '~/services/mealLogs'
import { listStudentSubscriptions } from '~/services/subscriptions'
import { getWorkerWallet, getWorkerWalletTransactions } from '~/services/wallet'

interface props {
    userName: string
}
const Client = ({userName}:props) => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((s) => s.auth)
  const token = useAppSelector((s) => s.auth.token)
  const [openFeedback, setOpenFeedback] = useState(false)
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [walletLoading, setWalletLoading] = useState(false)
  const [walletError, setWalletError] = useState('')
  const [wallet, setWallet] = useState<{ prepaid_amount: number; remaining_amount: number; credit_limit: number; credit_used: number; transactions: any[] } | null>(null)

  const [myLogs, setMyLogs] = useState<MealLogItem[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsError, setLogsError] = useState<string>('')

  // Student subscription state
  const [subsLoading, setSubsLoading] = useState(false)
  const [subsError, setSubsError] = useState('')
  const [mySubscription, setMySubscription] = useState<{
    subscriptionType: string
    totalMeals: number
    mealsLeft: number
    payment: string
    dateStarted?: string
  } | null>(null)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      if (!user?.id) return
      try {
        setLogsLoading(true); setLogsError('')
        const res = await listMealLogs({ client_user_id: String(user.id) })
        if (!mounted) return
        if (!res.success) { setLogsError(res.message || 'Failed to fetch meal logs'); setMyLogs([]); return }
        
        let list: MealLogItem[] = [];
        const rawData = res.data;
        if (Array.isArray(rawData)) {
          list = rawData;
        } else if (rawData && typeof rawData === 'object') {
           if (Array.isArray((rawData as any).data)) {
             list = (rawData as any).data;
           } else if (Array.isArray((rawData as any).logs)) {
             list = (rawData as any).logs;
           } else if (Array.isArray((rawData as any).results)) {
             list = (rawData as any).results;
           }
        }
        setMyLogs(list)
      } catch (e: any) {
        if (!mounted) return
        setLogsError(e?.message || 'Failed to fetch meal logs')
      } finally {
        if (mounted) setLogsLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [user?.id])

  // Fetch student subscription for student users
  useEffect(() => {
    const role = user?.role?.toLowerCase?.()
    if (role !== 'student') { setMySubscription(null); return }
    let mounted = true
    const run = async () => {
      try {
        setSubsLoading(true); setSubsError('')
        const items = await listStudentSubscriptions(token ?? null)
        if (!mounted) return
        const mine = items.find(i => String(i.userId || '').trim() === String(user?.id || '').trim())
        if (!mine) { setMySubscription(null); return }
        setMySubscription({
          subscriptionType: mine.subscriptionType,
          totalMeals: mine.totalMeals,
          mealsLeft: mine.mealsLeft,
          payment: mine.payment,
          dateStarted: mine.dateStarted,
        })
      } catch (e: any) {
        if (!mounted) return
        setSubsError(e?.message || 'Failed to fetch subscription')
        setMySubscription(null)
      } finally {
        if (mounted) setSubsLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [user?.id, user?.role])

  const logs = useMemo(() => {
    const base = Array.isArray(myLogs) ? [...myLogs] : []
    if (!startDate && !endDate) return base.sort((a,b) => +new Date(b.created_at) - +new Date(a.created_at))
    const start = startDate ? dayjs(startDate).startOf('day') : null
    const end = endDate ? dayjs(endDate).endOf('day') : null
    return base.filter((m) => {
      const dt = dayjs(m.created_at)
      if (start && dt.isBefore(start)) return false
      if (end && dt.isAfter(end)) return false
      return true
    }).sort((a,b) => +new Date(b.created_at) - +new Date(a.created_at))
  }, [myLogs, startDate, endDate])

  // Resolvers for names from Redux caches
  const users = useAppSelector((s) => s.users?.items || []) as Array<any>
  const branches = useAppSelector((s) => s.branches?.items || []) as Array<any>
  const resolveUserName = (id?: string) => {
    if (!id) return ''
    const found = users.find((u: any) => String(u.id) === String(id) || String(u.user_id) === String(id))
    return found?.full_name || found?.name || ''
  }
  const resolveBranchName = (id?: string) => {
    if (!id) return ''
    const found = branches.find((b: any) => String(b.id) === String(id))
    return found?.name || found?.branch_name || ''
  }

  // Prefetch users and branches caches if empty to resolve names
  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsersThunk())
    }
    if (branches.length === 0) {
      dispatch(fetchBranchesThunk())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch wallet for workers
  useEffect(() => {
    const role = user?.role?.toLowerCase?.()
    if (role !== 'worker' || !user?.id) return
    let mounted = true
    const run = async () => {
      try {
        setWalletLoading(true); setWalletError('')
        const [walletResp, txResp] = await Promise.all([
          getWorkerWallet(String(user.id)),
          getWorkerWalletTransactions(String(user.id))
        ])
        if (!mounted) return
        if (!walletResp.success) { setWalletError(walletResp.message || 'Failed to fetch wallet'); return }
        
        const walletData = walletResp.data || { prepaid_amount: 0, remaining_amount: 0, credit_limit: 0, credit_used: 0, transactions: [] }
        const transactions = txResp.success ? txResp.data : (walletData.transactions || [])
        
        setWallet({ ...walletData, transactions })
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

        {/* Student subscription info (students only) */}
        {user?.role?.toLowerCase?.() === 'student' && (
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">My Subscription</h2>
            {subsLoading ? (
              <p className="text-sm text-gray-500">Loading subscription…</p>
            ) : subsError ? (
              <p className="text-sm text-red-600">{subsError}</p>
            ) : mySubscription ? (
              <div className="space-y-2">
                <p><span className="font-medium">Type:</span> {mySubscription.subscriptionType || '-'}</p>
                <p><span className="font-medium">Total Meals:</span> {mySubscription.totalMeals}</p>
                <p><span className="font-medium">Remaining:</span> {mySubscription.mealsLeft}</p>
                <p><span className="font-medium">Payment Method:</span> {mySubscription.payment || '-'}</p>
                {mySubscription.dateStarted && (
                  <p><span className="font-medium">Started:</span> {dayjs(mySubscription.dateStarted).format('D MMM YYYY')}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No active subscription found.</p>
            )}
          </section>
        )}

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
                <div className="p-4 border border-gray-200 rounded">
                  <p className="text-xs text-gray-500">Remaining Amount</p>
                  <p className="text-lg font-semibold">{wallet.prepaid_amount}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded">
                  <p className="text-xs text-gray-500">Credit Limit</p>
                  <p className="text-lg font-semibold">{wallet.credit_limit}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded">
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
                        <TableCell>{t.transaction_type === "credit" ? "Top Up" : (t.transaction_type ? "Charge" : "-")}</TableCell>
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
            <div className="flex flex-col md:items-center gap-2 md:flex-row ">
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

          {logsLoading ? (
            <p className="text-sm text-gray-500">Loading meal logs…</p>
          ) : logsError ? (
            <p className="text-sm text-red-600">{logsError}</p>
          ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Date</TableHead>
                <TableHead>Client Type</TableHead>
                <TableHead>Meal Type</TableHead>
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
                logs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{dayjs(r.created_at).format('D MMM YYYY, h:mm A')}</TableCell>
                    <TableCell className="font-semibold">{r.client_type}</TableCell>
                    <TableCell className="font-semibold">{r.meal_type}</TableCell>
                    <TableCell className="hidden md:table-cell">{resolveUserName(r.scanned_by) || r.scanned_by || ''}</TableCell>
                    <TableCell className="hidden lg:table-cell">{resolveBranchName(String(r.branch_id)) || String(r.branch_id || '')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          )}
        </section>

        {/* Fixed Feedback Launcher */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button className="bg-blue-600 text-white rounded-full shadow-lg" onClick={() => setOpenFeedback(true)}>
            Give Feedback
          </Button>
        </div>

        {/* Feedback Sheet */}
        <FeedbackSheet open={openFeedback} onOpenChange={setOpenFeedback} />
      </main>
    );
}

export default Client
