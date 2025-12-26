import {Button} from '~/components/ui/button'
import { Search, Ticket, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { fetchBranchesThunk } from '~/store/branchesSlice'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetFooter } from '~/components/ui/sheet'
import dayjs from 'dayjs'
import RegisterSubscriptionSheet from '~/components/subscriptions/RegisterSubscriptionSheet'
import { generateIrregularTicket } from '~/services/irregularTickets'
import { UserRole } from '~/types/auth'
import { fetchSubscriptions } from '~/store/subscriptionsSlice'
import { handleGenerateQr, printQrTicket, downloadQrTicket } from '~/lib/qr-utils'

// QR code generated via public API to avoid extra deps

const QuickAction = () => {
  const [openRegister, setOpenRegister] = useState(false);
  const [openFind, setOpenFind] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [findResults, setFindResults] = useState<any[]>([]);
  const [openTicket, setOpenTicket] = useState(false);
  const { items: subscriptions, hydrated: subscriptionsHydrated } = useAppSelector((state) => state.subscriptions);
  const { token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // QR State for Subscription Ticket
  const [qrState, setQrState] = useState<{
    loading: boolean;
    error: string;
    data: { qr_code: string; user_name: string; expires_in_seconds: number } | null;
    image: string;
  }>({ loading: false, error: '', data: null, image: '' });

  useEffect(() => {
    if (openFind && !subscriptionsHydrated && token) {
      dispatch(fetchSubscriptions({ token }));
    }
  }, [openFind, subscriptionsHydrated, token, dispatch]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  // Ticket form controls
  // Walk-in (irregular) ticket form controls
  const [payerName, setPayerName] = useState('')
  const [mealType, setMealType] = useState('Regular')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountPaid, setAmountPaid] = useState<number>(0)
  // Generated ticket preview
  const [ticketId, setTicketId] = useState<string>('');
  const [ticketQr, setTicketQr] = useState<string>('');
  const [ticketGenerated, setTicketGenerated] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [expiresAt, setExpiresAt] = useState<string>('');

  // Branches from Redux (needed for ticket generation)
  const { items: branches, loading: branchesLoading, error: branchesError, loaded: branchesLoaded } = useAppSelector((s) => s.branches);
  const { user } = useAppSelector((state) => state.auth);
  const currentRole = user?.role;
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  useEffect(() => {
    if (!branchesLoaded && !branchesLoading) {
      dispatch(fetchBranchesThunk());
    }
  }, [branchesLoaded, branchesLoading, dispatch]);

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
      switch (mealType) {
        case 'Regular': price = branch.irregular_regular_price || 0; break;
        case 'VIP': price = branch.irregular_vip_price || 0; break;
        case 'VVIP': price = branch.irregular_vvip_price || 0; break;
        default: price = branch.irregular_regular_price || 0;
      }
      setAmountPaid(price);
    }
  }, [selectedBranchId, mealType, branches]);

  // Auto-refresh QR every 20s while ticket sheet is open and generated (cache-bust only)
  useEffect(() => {
    if (!openTicket || !ticketGenerated) return;

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
  }, [openTicket, ticketGenerated]);




  return (
<div className='flex flex-col gap-5 w-full'>
    <div className="flex justify-between items-center">
        <p className='text-dark font-medium'>Quick Actions</p>
    </div>
    <div className='flex flex-col justify-between lg:gap-5 md:flex-row md:gap-0 gap-5'>
      <Button size='icon-lg' onClick={() => setOpenRegister(true)} className=' md:w-auto lg:w-[30%] px-2 bg-blue-600 text-white h-[50px] w-full '><Wallet/>Register New Subscription</Button>
      <Button size='icon-lg' onClick={() => setOpenFind(true)} className='md:w-[30%] lg:w-[30%] bg-blue-600 text-white h-[50px] w-full'> <Search/>Find Client</Button>
      <Button size='icon-lg' onClick={() => setOpenTicket(true)} className='md:w-[30%] lg:w-[30%] bg-blue-600 text-white h-[50px] w-full'> <Ticket/>Generate Ticket</Button>
    </div>

    {/* Register Subscription Sheet */}
    <RegisterSubscriptionSheet open={openRegister} onOpenChange={setOpenRegister} />
    {/* Find Client Sheet */}
    <Sheet open={openFind} onOpenChange={(o) => { setOpenFind(o); if (!o) setSelectedClient(null); }}>
      <SheetContent side='right' className='w-full sm:max-w-lg p-6 bg-white border-none h-screen max-h-screen overflow-y-auto'>
        {selectedClient ? (
          <>
            <SheetHeader className="border-b pb-4 mb-4">
              <SheetTitle>QR-OTP</SheetTitle>
              <SheetDescription>Temporary QR for {selectedClient.clientName}</SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 space-y-6">
              {/* Client Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Registration Number:</span>
                  <span className="text-sm font-mono font-medium">{selectedClient.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Client Name:</span>
                  <span className="text-sm font-medium">{selectedClient.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Meals Left:</span>
                  <span className="text-sm font-semibold text-green-600">{selectedClient.mealsLeft}</span>
                </div>
              </div>

              {/* QR Content */}
              {qrState.loading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              {qrState.error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {qrState.error}
                </div>
              )}
              {qrState.data && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div id={`ticket-content-${selectedClient.id}`} className="ticket">
                    <div className="text-center font-semibold tracking-wide">MEAL TICKET</div>
                    <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                      <div><span className="font-semibold">Name:</span> {qrState.data.user_name}</div>
                      <div><span className="font-semibold">Reg #:</span> {selectedClient.id}</div>
                      <div><span className="font-semibold">Type:</span> {selectedClient.subscriptionType}</div>
                      <div><span className="font-semibold">Meals:</span> {selectedClient.mealsLeft}</div>
                      <div><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</div>
                      <div><span className="font-semibold">Time:</span> {new Date().toLocaleTimeString()}</div>
                    </div>
                    
                    <div className="my-3 border-t border-dashed border-gray-400"></div>
                    
                    <div className="qr flex justify-center items-center">
                      {qrState.image ? (
                        <img src={qrState.image} alt="QR Code" className="w-48 h-48" />
                      ) : (
                        <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                          Generating QR...
                        </div>
                      )}
                    </div>
                    
                    <div className="my-3 border-t border-dashed border-gray-400"></div>
                    <div className="text-center text-xs text-gray-500">
                      Scan at point of service<br/>
                      Valid for {Math.floor(qrState.data.expires_in_seconds / 60)} minutes
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {qrState.data && (
                <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border border-blue-100">
                  <p className="font-medium text-blue-800 mb-1">Instructions:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>This QR code is temporary and expires in {Math.floor(qrState.data.expires_in_seconds / 60)} minutes.</li>
                    <li>Print this ticket or show it on screen to the scanner.</li>
                    <li>Once scanned, one meal will be deducted from the subscription.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t bg-gray-50 -mx-6 px-6 pb-6">
              <div className="flex gap-2 w-full">
                <Button 
                  onClick={() => {
                    const uid = selectedClient.userId || String(selectedClient.id);
                    handleGenerateQr(uid, (newState) => setQrState(prev => ({ ...prev, ...newState })));
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Regenerate
                </Button>
                <Button
                  disabled={!qrState.image}
                  onClick={() => printQrTicket(`ticket-content-${selectedClient.id}`)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Print QR
                </Button>
                <Button 
                  onClick={() => setSelectedClient(null)}
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>Find Client</SheetTitle>
              <SheetDescription>Search by name or ID to view details.</SheetDescription>
            </SheetHeader>
            <div className='mt-4 space-y-4'>
              <div className='flex gap-2'>
                <input
                  className='flex-1 border rounded-md px-3 py-2'
                  placeholder='Search by name or Reg number'
                  value={findQuery}
                  onChange={(e) => setFindQuery(e.target.value)}
                />
                <Button
                  onClick={() => {
                    const q = findQuery.trim().toLowerCase();
                    const results = subscriptions.filter((s) =>
                      s.clientName.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
                    );
                    setFindResults(results);
                  }}
                >
                  Search
                </Button>
              </div>
              {/* Results */}
              <div className='border rounded-md'>
                <div className='grid grid-cols-5 gap-2 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700'>
                  <span>Reg #</span>
                  <span>Client</span>
                  <span className='hidden md:block'>Type</span>
                  <span className='hidden md:block'>Meals Left</span>
                  <span className='text-right'>Action</span>
                </div>
                <div className='max-h-64 overflow-y-auto'>
                  {findResults.length === 0 ? (
                    <div className='px-3 py-4 text-sm text-gray-500'>No results</div>
                  ) : (
                    findResults.map((item) => (
                      <div key={item.id} className='grid grid-cols-5 gap-2 px-3 py-2 border-t text-sm'>
                        <span className='font-mono'>{item.id}</span>
                        <span className='font-medium'>{item.clientName}</span>
                        <span className='hidden md:block'>{item.subscriptionType}</span>
                        <span className='hidden md:block'>{item.mealsLeft}</span>
                        <span className='flex justify-end gap-2'>
                          <Button
                            size='sm'
                            className='bg-blue-600 text-white'
                            onClick={() => {
                              setSelectedClient(item);
                              const uid = item.userId || String(item.id);
                              handleGenerateQr(uid, (newState) => setQrState(prev => ({ ...prev, ...newState })));
                            }}
                          >
                            Ticket
                          </Button>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setOpenFind(false)}>Close</Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
    {/* Generate Ticket Sheet */}
    <Sheet open={openTicket} onOpenChange={(o) => { setOpenTicket(o); if (!o) { setTicketGenerated(false); setSelectedClient(null); } }}>
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
                <option value='card'>Card/POS</option>
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
                    payment_method: paymentMethod,
                    amount_paid: amountPaid,
                    branch_id: selectedBranchId // Include branch_id if API supports it, otherwise backend might infer from user
                  }
                  const res = await generateIrregularTicket(payload)
                  if (!res.success) throw new Error(res.message || 'Failed to generate ticket')
                  const data = res.data!
                  const qrCode = data.qr_code || ''
                  const exp = data.expires_at || ''
                  const ticket = data.ticket_id || ''
                  setTicketId(ticket)
                  setExpiresAt(exp)
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrCode)}`
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
</div>
  )
}

export default QuickAction;