import {Button} from '~/components/ui/button'
import { Search,Ticket,Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { fetchBranchesThunk } from '~/store/branchesSlice'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '~/components/ui/sheet'
import { subscriptionData } from 'app/constants'
import dayjs from 'dayjs'
import RegisterSubscriptionSheet from '~/components/subscriptions/RegisterSubscriptionSheet'
import { generateMealToken } from '~/services/mealToken'

// QR code generated via public API to avoid extra deps

const QuickAction = () => {
  const [openRegister, setOpenRegister] = useState(false);
  const [openFind, setOpenFind] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [findResults, setFindResults] = useState<any[]>([]);
  const [openTicket, setOpenTicket] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  // Ticket form controls
  const [mealType, setMealType] = useState('Standard');
  const [quantity, setQuantity] = useState<number>(1);
  const [extras, setExtras] = useState('None');
  const [extrasQty, setExtrasQty] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  // Generated ticket preview
  const [ticketId, setTicketId] = useState<string>('');
  const [ticketQr, setTicketQr] = useState<string>('');
  const [ticketGenerated, setTicketGenerated] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [expiresAt, setExpiresAt] = useState<string>('');

  // Branches from Redux (needed for ticket generation)
  const dispatch = useAppDispatch();
  const { items: branches, loading: branchesLoading, error: branchesError, loaded: branchesLoaded } = useAppSelector((s) => s.branches);

  useEffect(() => {
    if (!branchesLoaded && !branchesLoading) {
      dispatch(fetchBranchesThunk());
    }
  }, [branchesLoaded, branchesLoading, dispatch]);

  // Auto-refresh QR every 30s while ticket sheet is open and generated
  useEffect(() => {
    if (!openTicket || !ticketGenerated) return;

    const refresh = () => {
      const dateStr = dayjs().format('D MMM YYYY');
      const qrPayload = {
        token: ticketId,
        expires_at: expiresAt || undefined,
        meal: {
          type: mealType,
          quantity,
          extras,
          extras_quantity: extrasQty,
          total_price: totalPrice,
        },
        date: dateStr,
        ts: Date.now(),
      };
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(JSON.stringify(qrPayload))}&cacheBust=${Date.now()}`;
      setTicketQr(qrUrl);
    };

    // Initial refresh immediately to ensure up-to-date timestamp
    refresh();
    const interval = setInterval(refresh, 20000);
    return () => clearInterval(interval);
  }, [openTicket, ticketGenerated, ticketId, mealType, extras, extrasQty, totalPrice, expiresAt]);

  // Print ticket content in a clean window
  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) return;
    const dateStr = dayjs().format('D MMM YYYY, HH:mm');
    const clientName = selectedClient?.clientName || 'Client';
    const clientId = selectedClient?.id || '-';
    const type = selectedClient?.customerType || 'Student';
    const total = Number(totalPrice || 0);
    const extrasLine = extras !== 'None' && extrasQty > 0 ? `${extras} x${extrasQty}` : 'None';
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Meal Ticket ${ticketId ? `- ${ticketId}` : ''}</title>
    <style>
      :root { --border:#e5e7eb; --text:#111827; }
      * { box-sizing: border-box; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: var(--text); padding: 24px; }
      .ticket { width: 370px; margin: 0 auto; border: 1px solid var(--border); padding: 18px; }
      .title { text-align: center; font-weight: 700; letter-spacing: 1px; }
      .meta { margin-top: 8px; font-size: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 8px; }
      .row { display:flex; justify-content:space-between; font-size: 14px; margin-top: 8px; }
      .divider { margin: 12px 0; border-top: 1px dashed var(--border); }
      .qr { display:flex; align-items:center; justify-content:center; padding: 8px 0; }
      .qr img { width: 180px; height: 180px; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12px; color:#374151; }
      .totals { margin-top: 8px; }
      .footer { text-align:center; font-size: 11px; color:#6b7280; margin-top: 12px; }
      @media print { @page { margin: 10mm; } }
    </style>
  </head>
  <body>
    <div class="ticket">
      <div class="title">MEAL TICKET</div>
      <div class="meta">
        <div><strong>Ticket:</strong> ${ticketId}</div>
        <div><strong>Date:</strong> ${dateStr}</div>
        <div><strong>Client:</strong> ${clientName}</div>
        <div><strong>Reg #:</strong> ${clientId}</div>
      </div>
      <div class="qr">
        ${ticketQr ? `<img src="${ticketQr}" alt="QR Code"/>` : '<div class="mono">QR unavailable</div>'}
      </div>
      <div class="divider"></div>
      <div class="footer mono">Scan at point of service • Thank you</div>
    </div>
    <script>
      window.onload = function(){ window.print(); setTimeout(function(){ window.close(); }, 300); }
    <\/script>
  </body>
</html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  // Download ticket content as a standalone HTML file
  const handleDownload = () => {
    const content = document.getElementById('ticket-content');
    if (!content) return;
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Meal Ticket ${ticketId ? `- ${ticketId}` : ''}</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; }
      .ticket { max-width: 420px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 16px; }
      pre { white-space: pre-wrap; margin: 0; }
      .qr { display: flex; align-items: center; justify-content: center; padding: 16px 0; }
    </style>
  </head>
  <body>
    ${content.outerHTML}
  </body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticketId || 'meal'}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  return (
<div className='flex flex-col gap-5 w-full'>
    <div>
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
    <Sheet open={openFind} onOpenChange={setOpenFind}>
      <SheetContent side='right' className='w-full sm:max-w-lg p-6 bg-white border-none h-screen max-h-screen overflow-y-auto'>
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
                const results = subscriptionData.filter((s) =>
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
                      <Button size='sm' variant='outline' onClick={() => setOpenFind(false)}>View</Button>
                      <Button
                        size='sm'
                        className='bg-blue-600 text-white'
                        onClick={() => {
                          setSelectedClient(item);
                          setOpenFind(false);
                          setOpenTicket(true);
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
      </SheetContent>
    </Sheet>
    {/* Generate Ticket Sheet */}
    <Sheet open={openTicket} onOpenChange={(o) => { setOpenTicket(o); if (!o) setTicketGenerated(false); }}>
      <SheetContent side='right' className='w-full sm:max-w-lg bg-white p-6 border-none h-screen max-h-screen overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Generate Ticket</SheetTitle>
          <SheetDescription>Select items and quantities, then generate.</SheetDescription>
        </SheetHeader>
        <form className='mt-6 space-y-6' onSubmit={(e) => e.preventDefault()}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Meal type</label>
              <select className='w-full border rounded-md px-3 py-2' value={mealType} onChange={(e) => setMealType(e.target.value)}>
                <option value='None'>None</option>
                <option value='Standard'>Standard</option>
                <option value='Breakfast'>Breakfast</option>
                <option value='Lunch'>Lunch</option>
                <option value='Dinner'>Dinner</option>
              </select>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Quantity</label>
              <input type='number' min={1} className='w-full border rounded-md px-3 py-2' placeholder='e.g., 1' value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Extras</label>
              <select className='w-full border rounded-md px-3 py-2' value={extras} onChange={(e) => setExtras(e.target.value)}>
                <option value='None'>None</option>
                <option value='FANTA'>FANTA</option>
                <option value='Coke'>Coke</option>
                <option value='Juice'>Juice</option>
              </select>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Quantity of Extras</label>
              <input type='number' min={0} className='w-full border rounded-md px-3 py-2' placeholder='e.g., 0' value={extrasQty} onChange={(e) => setExtrasQty(Number(e.target.value) || 0)} />
            </div>
            <div className='space-y-2 md:col-span-2'>
              <label className='text-sm font-medium text-gray-700'>Total Price: RWF</label>
              <input type='number' min={0} className='w-full border rounded-md px-3 py-2' placeholder='e.g., 2000' value={totalPrice} onChange={(e) => setTotalPrice(Number(e.target.value) || 0)} />
            </div>
          </div>
          <div className='flex justify-end'>
            <Button
              className='bg-blue-600 text-white px-6 disabled:opacity-60'
              disabled={isGenerating}
              onClick={async () => {
                try {
                  setIsGenerating(true)
                  // Prepare payload for backend
                  // Walk-in: no client required; send only form data to API
                  const payload = {
                    meal_type: mealType,
                    quantity,
                    extras,
                    extras_quantity: extrasQty,
                    total_price: totalPrice,
                  }
                  const res = await generateMealToken(payload)
                  const token = res?.data?.token || ''
                  const exp = res?.data?.expires_at || ''
                  // Always display the real API token; avoid random fallback
                  setTicketId(token)
                  setExpiresAt(exp)
                  const dateStr = dayjs().format('D MMM YYYY')
                  // Embed API token + form data in QR payload
                  const qrPayload = {
                    token,
                    expires_at: exp,
                    meal: {
                      type: mealType,
                      quantity,
                      extras,
                      extras_quantity: extrasQty,
                      total_price: totalPrice,
                    },
                    date: dateStr,
                    ts: Date.now(),
                  }
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(JSON.stringify(qrPayload))}`
                  setTicketQr(qrUrl)
                  setTicketGenerated(true)
                } catch (e) {
                  alert(e instanceof Error ? e.message : 'Failed to generate meal token')
                } finally {
                  setIsGenerating(false)
                }
              }}
            >
              {isGenerating ? 'Generating…' : 'Generate Ticket'}
            </Button>
          </div>
          {ticketGenerated && (
            <div className='mt-6 border rounded-md p-4 bg-gray-50'>
              <div id='ticket-content' className='ticket'>
                <div className='text-center font-semibold tracking-wide'>MEAL TICKET</div>
                <div className='grid grid-cols-2 gap-1 mt-2 text-xs'>
                  <div><span className='font-semibold'>API Token:</span> {ticketId || '—'}</div>
                  <div><span className='font-semibold'>Date:</span> {dayjs().format('D MMM YYYY, HH:mm')}</div>
                  {expiresAt && (<div><span className='font-semibold'>Expires:</span> {dayjs(expiresAt).format('D MMM YYYY, HH:mm')}</div>)}
                  <div><span className='font-semibold'>Meal:</span> {mealType}</div>
                  <div><span className='font-semibold'>Qty:</span> {quantity}</div>
                  <div><span className='font-semibold'>Extras:</span> {extras} {extras !== 'None' && extrasQty > 0 ? `x${extrasQty}` : ''}</div>
                  <div><span className='font-semibold'>Total:</span> {totalPrice}</div>
                </div>
                {/* Debug: show exact JSON payload encoded in QR for verification */}
                {ticketQr && (
                  <div className='mt-2 text-[10px] text-gray-600 break-all'>
                    <span className='font-semibold'>QR payload token:</span> {ticketId || '—'}
                  </div>
                )}
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
                <Button variant='outline' onClick={handleDownload}>Download</Button>
                <Button className='bg-blue-600 text-white' onClick={handlePrint}>Print</Button>
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