import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Header } from '../../../components/Header'
import { SidebarTrigger } from '~/components/ui/sidebar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { listFeedbacks, type FeedbackItem, getFeedbackStats, type FeedbackStats, getFeedbackById, updateFeedbackStatus } from '~/services/feedback'
import { Button } from '~/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '~/components/ui/sheet'
import { EyeIcon, EditIcon } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { fetchBranchesThunk } from '~/store/branchesSlice'
import { fetchUsersThunk } from '~/store/usersSlice'

const typeOptions = [
  { v: '', l: 'All types' },
  { v: 'meal_quality', l: 'Meal quality' },
  { v: 'service_quality', l: 'Service quality' },
  { v: 'cleanliness', l: 'Cleanliness' },
  { v: 'pricing', l: 'Pricing' },
  { v: 'staff_behavior', l: 'Staff behavior' },
  { v: 'system_issue', l: 'System issue' },
  { v: 'suggestion', l: 'Suggestion' },
  { v: 'complaint', l: 'Complaint' },
]

const statusOptions = [
  { v: '', l: 'All status' },
  { v: 'pending', l: 'Pending' },
  { v: 'reviewed', l: 'Reviewed' },
  { v: 'resolved', l: 'Resolved' },
  { v: 'dismissed', l: 'Dismissed' },
]

const ratingOptions = [
  { v: '', l: 'All ratings' },
  { v: 'EXCELLENT', l: 'Excellent' },
  { v: 'GOOD', l: 'Good' },
  { v: 'AVERAGE', l: 'Average' },
  { v: 'POOR', l: 'Poor' },
  { v: 'TERRIBLE', l: 'Terrible' },
]

export default function FeedbackPage() {
  const dispatch = useAppDispatch()
  const branches = useAppSelector(s => s.branches.items)
  const branchesLoaded = useAppSelector(s => s.branches.loaded)
  const branchesLoading = useAppSelector(s => s.branches.loading)
  const users = useAppSelector(s => s.users.items)
  const usersLoaded = useAppSelector(s => s.users.loaded)
  const usersLoading = useAppSelector(s => s.users.loading)
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [rating, setRating] = useState('')
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [statsError, setStatsError] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | number | null>(null)
  const [detail, setDetail] = useState<FeedbackItem | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [saveError, setSaveError] = useState('')

  const fetchAll = async () => {
    try {
      setLoading(true); setError('')
      const res = await listFeedbacks({ type, status, rating })
      if (!res.success) { setError(res.message || 'Failed to load feedback'); setItems([]); return }
      const data = Array.isArray(res.data?.data) ? res.data.data : []
      data.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      setItems(data)
    } catch (e: any) {
      setError(e?.message || 'Failed to load feedback')
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch on mount and whenever filters change
  useEffect(() => { fetchAll() }, [type, status, rating])
  useEffect(() => {
    (async () => {
      try {
        setStatsError('')
        const res = await getFeedbackStats()
        if (!res.success) { setStats(null); setStatsError(res.message || 'Failed to load stats'); return }
        setStats(res.data || null)
      } catch (e: any) {
        setStatsError(e?.message || 'Failed to load stats')
      }
    })()
  }, [])

  // Ensure branches are available for resolving branch name in details
  useEffect(() => {
    if (!branchesLoaded && !branchesLoading) {
      dispatch(fetchBranchesThunk())
    }
  }, [branchesLoaded, branchesLoading, dispatch])

  useEffect(() => {
    if (!usersLoaded && !usersLoading) {
      dispatch(fetchUsersThunk())
    }
  }, [usersLoaded, usersLoading, dispatch])

  useEffect(() => {
    const loadDetail = async () => {
      if (!detailOpen || detailId == null) return
      try {
        setDetailLoading(true); setDetailError(''); setDetail(null)
        const res = await getFeedbackById(detailId)
        if (!res.success) { setDetailError(res.message || 'Failed to load feedback'); return }
        setDetail(res.data || null)
        const current = (res.data?.status as string) || 'pending'
        setNewStatus(current)
      } catch (e: any) {
        setDetailError(e?.message || 'Failed to load feedback')
      } finally {
        setDetailLoading(false)
      }
    }
    loadDetail()
  }, [detailOpen, detailId])

  const onUpdateStatus = async () => {
    if (!detailId) return
    try {
      setSavingStatus(true); setSaveError('')
      const res = await updateFeedbackStatus(detailId, newStatus)
      if (!res.success) { setSaveError(res.message || 'Failed to update status'); return }
      // Refresh detail, list, and stats
      await Promise.all([getFeedbackById(detailId).then(r => { if (r.success) setDetail(r.data || null) }), fetchAll(), (async () => { const s = await getFeedbackStats(); if (s.success) setStats(s.data || null) })()])
    } catch (e: any) {
      setSaveError(e?.message || 'Failed to update status')
    } finally {
      setSavingStatus(false)
    }
  }

  const filtered = useMemo(() => items, [items])
  const detailBranchName = useMemo(() => {
    if (!detail) return '-'
    if (detail.branch_name) return detail.branch_name
    const id = (detail as any)?.branch_id || (detail as any)?.branchId || (detail as any)?.branch?.id
    if (!id) return '-'
    const found = branches.find(b => String(b.id) === String(id))
    return found?.name || '-'
  }, [detail, branches])

  const detailUserPhone = useMemo(() => {
    if (!detail) return '-'
    if (detail.is_anonymous) return '-'
    if (detail.user_phone) return detail.user_phone
    
    const uid = detail.user_id || detail.userId
    if (!uid) return '-'
    
    const found = users.find(u => String(u.id) === String(uid))
    return found?.phone || '-'
  }, [detail, users])

  return (
    <main className="dashboard wrapper">
      <Header
        title="Feedback"
        description="Client feedback collected from the app"
        action={<SidebarTrigger className="rounded-md p-1 border border-transparent md:border-slate-200" />}
      />

      <section className="bg-white p-6 rounded-lg shadow mt-6">
        {/* Stats summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="border rounded-lg p-4 border-black/20">
            <p className="text-xs text-gray-500">Total feedback</p>
            <p className="text-2xl font-semibold">{stats?.total ?? '-'}</p>
          </div>
          <div className="border rounded-lg p-4 border-black/20">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-2xl font-semibold">{stats?.by_status?.pending ?? 0}</p>
          </div>
          <div className="border rounded-lg p-4 border-black/20">
            <p className="text-xs text-gray-500">Resolved</p>
            <p className="text-2xl font-semibold">{stats?.by_status?.resolved ?? 0}</p>
          </div>
          <div className="border rounded-lg p-4 border-black/20">
            <p className="text-xs text-gray-500">Average rating</p>
            <p className="text-2xl font-semibold">{stats?.average_rating ?? '-'}</p>
          </div>
        </div>
        {statsError && (
          <p className="text-xs text-red-600 mb-4">{statsError}</p>
        )}

        <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="space-y-1 space-x-2">
              <label className="text-xs text-gray-500">Type</label>
              <select className="border border-black/20 rounded px-2 py-2" value={type} onChange={(e) => setType(e.target.value)}>
                {typeOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
            <div className="space-y-1 space-x-2">
              <label className="text-xs text-gray-500">Status</label>
              <select className="border border-black/20 rounded px-2 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
            <div className="space-y-1 space-x-2">
              <label className="text-xs text-gray-500">Rating</label>
              <select className="border border-black/20 rounded px-2 py-2" value={rating} onChange={(e) => setRating(e.target.value)}>
                {ratingOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 border border-black/20 rounded" onClick={() => { setType(''); setStatus(''); setRating(''); }}>Reset</button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading feedback…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="hidden lg:table-cell">Client</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-4 text-sm text-gray-500">No feedback found.</TableCell>
                </TableRow>
              ) : (
                filtered.map((f, idx) => (
                  <TableRow key={String(f.id || idx)}>
                    <TableCell className="font-mono text-xs">{f.created_at ? dayjs(f.created_at).format('D MMM YYYY, h:mm A') : '-'}</TableCell>
                    <TableCell>{f.type || '-'}</TableCell>
                    <TableCell>{f.rating || '-'}</TableCell>
                    <TableCell className="hidden lg:table-cell">{f.is_anonymous ? 'Anonymous' : (f.user_name || '-')}</TableCell>
                    <TableCell className="hidden lg:table-cell">{f.status || 'pending'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button  size="sm" onClick={() => { setDetailId(f.id as any); setDetailOpen(true); }}>
                          <EyeIcon className="size-4" />
                          View
                        </Button>
                        <Button size="sm" onClick={() => { setDetailId(f.id as any); setDetailOpen(true); }}>
                          <EditIcon className="size-4" />
                          status
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </section>

      {/* Details Sheet */}
      <Sheet open={detailOpen} onOpenChange={(o) => { setDetailOpen(o); if (!o) { setDetailId(null); setDetail(null); setDetailError(''); } }}>
        <SheetContent side="right" className='bg-white p-6'>
          <SheetHeader>
            <SheetTitle>Feedback Details</SheetTitle>
            <SheetDescription>Full feedback content and metadata</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4 space-y-3">
            {detailLoading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : detailError ? (
              <p className="text-sm text-red-600">{detailError}</p>
            ) : !detail ? (
              <p className="text-sm text-gray-500">No data.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-medium">{detail.created_at ? dayjs(detail.created_at).format('D MMM YYYY, h:mm A') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <div className="flex flex-col  gap-2">
                      <select className="border rounded px-2 py-1 text-sm" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                        {statusOptions.filter(o => o.v !== '').map(o => (
                          <option key={o.v} value={o.v}>{o.l}</option>
                        ))}
                      </select>
                      <Button size="sm" disabled={savingStatus} onClick={onUpdateStatus} variant={'outline'}>Change status</Button>
                    </div>
                    {saveError && <p className="text-xs text-red-600 mt-1">{saveError}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm font-medium">{detail.type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="text-sm font-medium">{detail.rating || '-'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Message</p>
                  <p className="text-sm whitespace-pre-wrap">{detail.message || '-'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Client</p>
                    <p className="text-sm font-medium">{detail.is_anonymous ? 'Anonymous' : (detail.user_name || '-')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{detailUserPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Branch</p>
                    <p className="text-sm font-medium">{detailBranchName}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}
