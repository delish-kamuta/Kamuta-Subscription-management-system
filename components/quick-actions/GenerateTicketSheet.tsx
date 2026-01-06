import { Button } from '~/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '~/components/ui/sheet'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { fetchBranchesThunk } from '~/store/branchesSlice'
import { generateIrregularTicket } from '~/services/irregularTickets'
import { UserRole } from '~/types/auth'
import dayjs from 'dayjs'
import { printQrTicket, downloadQrTicket } from '~/lib/qr-utils'

interface GenerateTicketSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateTicketSheet({ open, onOpenChange }: GenerateTicketSheetProps) {
  const [payerName, setPayerName] = useState('')
  const [mealType, setMealType] = useState('Regular')
  const [irregularPayerType, setIrregularPayerType] = useState('irregular_student')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountPaid, setAmountPaid] = useState<number>(0)
  
  const [ticketId, setTicketId] = useState<string>('');
  const [ticketQr, setTicketQr] = useState<string>('');
  const [ticketGenerated, setTicketGenerated] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  const { items: branches, loading: branchesLoading, loaded: branchesLoaded } = useAppSelector((s) => s.branches);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const currentRole = user?.role;

  useEffect(() => {
    if (open && !branchesLoaded && !branchesLoading) {
      dispatch(fetchBranchesThunk());
    }
  }, [open, branchesLoaded, branchesLoading, dispatch]);

  // Set default branch for non-admins
  useEffect(() => {
    if (currentRole !== UserRole.ADMIN && user?.branch_id) {
      setSelectedBranchId(user.branch_id);
    }
  }, [currentRole, user?.branch_id]);

  // Auto-calculate price based on branch and meal type
  useEffect(() => {
    if (!selectedBranchId || !mealType) return;
    
    const branch = branches.find(b => b.id === selectedBranchId);
    if (branch) {
      let price = 0;
      if (irregularPayerType === 'irregular_student') {
        switch (mealType) {
          case 'Regular': price = branch.irregular_student_regular_price || 0; break;
          case 'VIP': price = branch.irregular_student_vip_price || 0; break;
          case 'VVIP': price = branch.irregular_student_vvip_price || 0; break;
          default: price = branch.irregular_student_regular_price || 0;
        }
      } else {
        // irregular_worker
        switch (mealType) {
          case 'Regular': price = branch.irregular_worker_regular_price || 0; break;
          case 'VIP': price = branch.irregular_worker_vip_price || 0; break;
          case 'VVIP': price = branch.irregular_worker_vvip_price || 0; break;
          default: price = branch.irregular_worker_regular_price || 0;
        }
      }
      setAmountPaid(price);
    }
  }, [selectedBranchId, mealType, irregularPayerType, branches]);

  // Auto-refresh QR every 20s while ticket sheet is open and generated (cache-bust only)
  useEffect(() => {
    if (!open || !ticketGenerated) return;

    const refresh = () => {
      setTicketQr((prev) => {
        if (!prev) return prev;
        const base = prev.split('&cacheBust=')[0];
        return `${base}&cacheBust=${Date.now()}`;
      });
    };

    refresh();
    const interval = setInterval(refresh, 20000);
    return () => clearInterval(interval);
  }, [open, ticketGenerated]);

  // Reset state when closed
  useEffect(() => {
    if (!open) {
        setTicketGenerated(false);
        setTicketId('');
        setTicketQr('');
        setExpiresAt('');
        setPayerName('');
        setMealType('Regular');
        setIrregularPayerType('student');
        setPaymentMethod('cash');
        setAmountPaid(0);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:max-w-lg bg-white p-6 border-none h-screen max-h-screen overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Generate Walk-in Ticket</SheetTitle>
          <SheetDescription>Fill details for irregular client (24-hour QR).</SheetDescription>
        </SheetHeader>
        <form className='mt-6 space-y-6' onSubmit={(e) => e.preventDefault()}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Branch Selection for Admin */}
            {currentRole === UserRole.ADMIN && (
              <div className='space-y-2 md:col-span-2'>
                <label className='text-sm font-medium text-gray-700'>Branch</label>
                <select 
                  className='w-full border rounded-md px-3 py-2' 
                  value={selectedBranchId} 
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className='space-y-2 md:col-span-2'>
              <label className='text-sm font-medium text-gray-700'>Payer name</label>
              <input className='w-full border rounded-md px-3 py-2' placeholder='e.g., John Walk-in' value={payerName} onChange={(e) => setPayerName(e.target.value)} />
            </div>
            
            <div className='space-y-2 md:col-span-2'>
              <label className='text-sm font-medium text-gray-700'>Payer Type</label>
              <select 
                className='w-full border rounded-md px-3 py-2' 
                value={irregularPayerType} 
                onChange={(e) => setIrregularPayerType(e.target.value)}
              >
                  <option value="irregular_student">Student</option>
                  <option value="irregular_worker">Irregular Worker</option>
              </select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Meal type</label>
              <select className='w-full border rounded-md px-3 py-2' value={mealType} onChange={(e) => setMealType(e.target.value)}>
                <option value='Regular'>Regular</option>
                <option value='VIP'>VIP</option>
                <option value='VVIP'>VVIP</option>
              </select>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Payment Method</label>
              <select className='w-full border rounded-md px-3 py-2' value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value='cash'>Cash</option>
                <option value='momo'>Mobile Money</option>
              </select>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Amount Paid (RWF)</label>
              <input 
                type='number' 
                min={0} 
                className='w-full border rounded-md px-3 py-2 bg-gray-50' 
                placeholder='Auto-calculated' 
                value={amountPaid} 
                readOnly
              />
            </div>
          </div>
          <div className='flex justify-end'>
            <Button
              className='bg-blue-600 text-white px-6 disabled:opacity-60'
              disabled={isGenerating || !payerName.trim() || !selectedBranchId || (currentRole === UserRole.CASHIER && (!paymentMethod || amountPaid <= 0))}
              onClick={async () => {
                try {
                  setIsGenerating(true)
                  const payload = {
                    payer_name: payerName.trim(),
                    meal_type: mealType,
                    irregular_payer_type: irregularPayerType,
                    payment_method: paymentMethod,
                    amount_paid: amountPaid,
                    branch_id: selectedBranchId || undefined
                  }
                  const res = await generateIrregularTicket(payload)
                  if (!res.success) throw new Error(res.message || 'Failed to generate ticket')
                  const data = res.data as any // Cast to any to safely access potential legacy fields
                  
                  // Use qr_id as the code for the QR image, fallback to id or legacy qr_code
                  const qrCodeContent = data.qr_id || data.id || data.qr_code || ''
                  
                  if (!qrCodeContent) {
                    throw new Error('Server returned empty QR data')
                  }

                  const exp = data.expires_at || ''
                  const ticket = data.id || data.ticket_id || '' // Handle ticket_id fallback just in case
                  setTicketId(ticket)
                  setExpiresAt(exp)
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrCodeContent)}`
                  setTicketQr(qrUrl)
                  setTicketGenerated(true)
                } catch (e) {
                  alert(e instanceof Error ? e.message : 'Failed to generate irregular ticket')
                } finally {
                  setIsGenerating(false)
                }
              }}
            >
              {isGenerating ? 'Generating…' : 'Generate QR'}
            </Button>
          </div>
          {ticketGenerated && (
            <div className='mt-6 border rounded-md p-4 bg-gray-50'>
              <div id='ticket-content' className='ticket'>
                <div className='text-center font-semibold tracking-wide'>MEAL TICKET</div>
                <div className='grid grid-cols-2 gap-1 mt-2 text-xs'>
                  <div><span className='font-semibold'>Ticket ID:</span> {ticketId || '—'}</div>
                  <div><span className='font-semibold'>Date:</span> {dayjs().format('D MMM YYYY, HH:mm')}</div>
                  {expiresAt && (<div><span className='font-semibold'>Expires:</span> {dayjs(expiresAt).format('D MMM YYYY, HH:mm')}</div>)}
                  <div><span className='font-semibold'>Meal:</span> {mealType}</div>
                  <div><span className='font-semibold'>Payment:</span> {paymentMethod}</div>
                  <div><span className='font-semibold'>Paid:</span> {amountPaid}</div>
                </div>
                {/* Debug: show exact JSON payload encoded in QR for verification */}
                <div className='my-3 border-t border-dashed border-gray-200' />
                <div className='qr flex items-center justify-center'>
                  {ticketQr ? (
                    <img src={ticketQr} alt='QR Code' className='w-44 h-44' />
                  ) : (
                    <span className='text-sm text-gray-500'>Generating QR...</span>
                  )}
                </div>
                <div className='my-3 border-t border-dashed border-gray-200' />
                <div className='text-center text-xs text-gray-500'>Scan at point of service • Thank you</div>
              </div>
              <div className='mt-4 flex justify-end gap-2'>
                <Button variant='outline' onClick={() => downloadQrTicket('ticket-content', ticketId)}>Download</Button>
                <Button className='bg-blue-600 text-white' onClick={() => printQrTicket('ticket-content')}>Print</Button>
              </div>
            </div>
          )}
        </form>
      </SheetContent>
    </Sheet>
  )
}
