import { useState, useEffect, useCallback } from "react"
import { getWorkerWallet, getWorkerWalletTransactions } from "~/services/wallet"
import { UserRole } from "~/types/auth"

export function useWorkerWallet(user: any, selectedUserId?: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<{ prepaid_amount: number; remaining_amount: number; credit_limit: number; credit_used: number; transactions: any[] } | null>(null)

  const fetchWalletData = useCallback(async () => {
    const role = user?.role
    const targetId = selectedUserId || String(user?.id || '')
    if (!targetId) return

    // Allow admins/cashiers to open any user's wallet via userId; workers can open their own
    if (!selectedUserId && role !== UserRole.WORKER && role !== UserRole.ADMIN) { return }

    setLoading(true); setError('')
    try {
      const [walletResp, txResp] = await Promise.all([
        getWorkerWallet(targetId),
        getWorkerWalletTransactions(targetId)
      ])
      
      if (!walletResp.success) { 
        setError(walletResp.message || 'Failed to fetch wallet'); 
        return 
      }
      
      const walletData = walletResp.data || { prepaid_amount: 0, remaining_amount: 0, credit_limit: 0, credit_used: 0, transactions: [] }
      const transactions = txResp.success ? txResp.data : (walletData.transactions || [])
      
      setData({ ...walletData, transactions })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Wallet error')
    } finally {
      setLoading(false)
    }
  }, [user?.id, user?.role, selectedUserId])

  useEffect(() => {
    fetchWalletData()
  }, [fetchWalletData])

  return { data, loading, error, refreshWallet: fetchWalletData }
}