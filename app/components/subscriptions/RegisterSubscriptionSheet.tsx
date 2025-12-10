import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { fetchBranchesThunk } from '~/store/branchesSlice'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'

interface RegisterSubscriptionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function RegisterSubscriptionSheet({ open, onOpenChange }: RegisterSubscriptionSheetProps) {
  const dispatch = useAppDispatch()
  const { items: branches, loading: branchesLoading, error: branchesError, loaded: branchesLoaded } = useAppSelector((s) => s.branches)
  const authToken = useAppSelector((s) => (s.auth as any)?.token || (s.auth as any)?.user?.token)
  const currentUser = useAppSelector((s) => s.auth.user)
  const userBranchId = currentUser?.branch_id
  
  // Register form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    reg_number: '',
    role: 'student',
    days: '',
    meal_type: 'Regular',
    branch_id: '',
    payment_method: '',
    amount_paid: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!branchesLoaded && !branchesLoading) {
      dispatch(fetchBranchesThunk())
    }
  }, [branchesLoaded, branchesLoading, dispatch])

  useEffect(() => {
    if (!formData.branch_id && branches.length > 0) {
      // Use logged user's branch if available, otherwise first branch
      const defaultBranch = userBranchId || branches[0].id
      setFormData((fd) => ({ ...fd, branch_id: defaultBranch }))
    }
  }, [branches, formData.branch_id, userBranchId])

  // Auto-calculate amount based on branch prices
  useEffect(() => {
    if (formData.branch_id && formData.days && formData.meal_type) {
      const selectedBranch = branches.find((b) => b.id === formData.branch_id)
      if (selectedBranch) {
        const days = Number(formData.days) || 0
        const number_of_meal = days*2;
        let pricePerMeal = 0
        
        if (formData.meal_type === 'Regular') {
          pricePerMeal = selectedBranch.regular_price || 0
        } else if (formData.meal_type === 'VIP') {
          pricePerMeal = selectedBranch.vip_price || 0
        } else if (formData.meal_type === 'VVIP') {
          pricePerMeal = selectedBranch.vvip_price || 0
        }
        
        const totalAmount = number_of_meal * pricePerMeal
        setFormData((fd) => ({ ...fd, amount_paid: String(totalAmount) }))
      }
    }
  }, [formData.branch_id, formData.days, formData.meal_type, branches])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const token = authToken
      if (!token) {
        setError('Not authenticated. Please log in again.')
        setSubmitting(false)
        return
      }

      const payload: any = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        branch_id: formData.branch_id,
        subscription: {
          meal_type: formData.meal_type,
          total_meals: Number(formData.days)*2 || 30,
          amount_paid: Number(formData.amount_paid) || 0,
          payment_method: formData.payment_method.toLowerCase()
        }
      }

      // Only include reg_number for students
      if (formData.role === 'student' && formData.reg_number.trim()) {
        payload.reg_number = formData.reg_number.trim()
      }

      console.log('Sending payload:', JSON.stringify(payload, null, 2))

      const resp = await fetch('https://restaurant-bn-api.onrender.com/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(payload),
      })

      if (!resp.ok) {
        let msg = `Failed to register subscription (${resp.status})`
        try {
          const j = await resp.json()
          console.error('Server error response:', j)
          msg = j.message || j.error || JSON.stringify(j) || msg
        } catch {}
        throw new Error(msg)
      }

      await resp.json()
      setSuccess('Subscription registered successfully!')
      // Reset form
      setFormData({
        full_name: '',
        phone: '',
        reg_number: '',
        role: 'student',
        days: '',
        meal_type: 'Regular',
        branch_id: branches[0]?.id || '',
        payment_method: '',
        amount_paid: ''
      })
      setTimeout(() => {
        setSuccess('')
        onOpenChange(false)
      }, 2000)
    } catch (err: any) {
      setError(err?.message || 'Request failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:max-w-lg bg-white p-6 border-none h-screen max-h-screen overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Record New Subscription</SheetTitle>
          <SheetDescription>Provide customer and subscription details, then submit.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className='mt-6 space-y-6'>
          {error && (
            <div className='bg-red-50 text-red-600 p-3 rounded-md text-sm'>
              {error}
            </div>
          )}
          {success && (
            <div className='bg-green-50 text-green-600 p-3 rounded-md text-sm'>
              {success}
            </div>
          )}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Name *</label>
              <input 
                className='w-full border rounded-md px-3 py-2' 
                placeholder='Enter full name'
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Phone *</label>
              <input 
                className='w-full border rounded-md px-3 py-2' 
                placeholder='0788123456'
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Role *</label>
              <select 
                className='w-full border rounded-md px-3 py-2'
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <option value='student'>Student</option>
                <option value='worker'>Worker</option>
              </select>
            </div>
            {formData.role === 'student' && (
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Reg number *</label>
                <input 
                  className='w-full border rounded-md px-3 py-2' 
                  placeholder='e.g., STU2024001'
                  value={formData.reg_number}
                  onChange={(e) => setFormData({ ...formData, reg_number: e.target.value })}
                  required
                />
              </div>
            )}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Number of Days *</label>
              <input 
                type='number' 
                min={1} 
                className='w-full border rounded-md px-3 py-2' 
                placeholder='e.g., 30'
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                required
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Meal Type *</label>
              <select 
                className='w-full border rounded-md px-3 py-2'
                value={formData.meal_type}
                onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
              >
                <option value='VVIP'>VVIP</option>
                <option value='VIP'>VIP</option>
                <option value='Regular'>Regular</option>
              </select>
            </div>
            {currentUser?.role === 'ADMIN' && (
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Branch *</label>
                <select
                  className='w-full border rounded-md px-3 py-2'
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  required
                >
                  <option value='' disabled>
                    {branchesLoading ? 'Loading branches...' : 'Select a branch'}
                  </option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name || b.id}</option>
                  ))}
                </select>
                {branchesError && (
                  <p className='text-xs text-red-600'>Failed to load branches: {branchesError}</p>
                )}
              </div>
            )}
            <div className='space-y-2 md:col-span-1'>
              <label className='text-sm font-medium text-gray-700'>Payment Method *</label>
              <select 
                className='w-full border rounded-md px-3 py-2'
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                required
              >
                <option value=''>Select payment method</option>
                <option value='cash'>Cash</option>
                <option value='mobile_money'>Mobile Money</option>
              </select>
            </div>
            <div className='space-y-2 md:col-span-2'>
              <label className='text-sm font-medium text-gray-700'>Amount to Pay (Auto-calculated) *</label>
              <input 
                type='number' 
                min={1} 
                className='w-full border rounded-md px-3 py-2 bg-gray-50' 
                placeholder='Auto-calculated based on meal type and days'
                value={formData.amount_paid}
                readOnly
                required
              />
            </div>
          </div>
          <div className='flex justify-end gap-2'>
            <Button 
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type='submit' 
              className='bg-blue-600 text-white px-6' 
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'SUBMIT'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
