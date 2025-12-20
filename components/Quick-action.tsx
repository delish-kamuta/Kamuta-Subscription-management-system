import {Button} from '~/components/ui/button'
import { Search,Ticket,Wallet, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { fetchBranchesThunk } from '~/store/branchesSlice'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetFooter } from '~/components/ui/sheet'
import dayjs from 'dayjs'
import RegisterSubscriptionSheet from '~/components/subscriptions/RegisterSubscriptionSheet'
import { generateIrregularTicket } from '~/services/irregularTickets'
import { UserRole } from '~/types/auth'
import { fetchSubscriptions } from '~/store/subscriptionsSlice'

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

  // Printer settings
  const [printerConfig, setPrinterConfig] = useState<{
    type: string;
    ip: string;
    port: number;
    vid?: string;
    pid?: string;
  }>({
    type: 'network',
    ip: '192.168.1.100',
    port: 9100,
    vid: '',
    pid: ''
  });
  const [openPrinterSettings, setOpenPrinterSettings] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('printerConfig');
    if (saved) {
      try {
        setPrinterConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse printer config', e);
      }
    }
  }, []);

  const savePrinterConfig = () => {
    localStorage.setItem('printerConfig', JSON.stringify(printerConfig));
    setOpenPrinterSettings(false);
  };

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
  const currentRole = useAppSelector((s) => s.auth.user?.role)

  useEffect(() => {
    if (!branchesLoaded && !branchesLoading) {
      dispatch(fetchBranchesThunk());
    }
  }, [branchesLoaded, branchesLoading, dispatch]);

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

  // Print ticket content via thermal printer API
  const handlePrint = async () => {
    const dateStr = dayjs().format('D MMM YYYY, HH:mm');
    // Use generated ticket details if available, otherwise selected client
    const clientName = ticketGenerated ? payerName : (selectedClient?.clientName || 'Client');
    const clientId = ticketGenerated ? 'Walk-in' : (selectedClient?.id || '-');
    const tId = ticketId || '-';

    const ticketData = {
        id: tId,
        date: dateStr,
        clientName,
        regNumber: clientId
    };

    // Use configured settings
    const config = {
      ...printerConfig,
      vid: (printerConfig.vid && !isNaN(parseInt(printerConfig.vid, 16))) ? parseInt(printerConfig.vid, 16) : undefined,
      pid: (printerConfig.pid && !isNaN(parseInt(printerConfig.pid, 16))) ? parseInt(printerConfig.pid, 16) : undefined
    };

    try {
        const formData = new FormData();
        formData.append('ticket', JSON.stringify(ticketData));
        formData.append('config', JSON.stringify(config));

        const res = await fetch('/api/print-ticket', {
            method: 'POST',
            body: formData
        });
        
        const json = await res.json();
        if (json.success) {
            alert('Ticket sent to printer!');
        } else {
            alert('Failed to print: ' + (json.message || 'Unknown error'));
        }
    } catch (e) {
        console.error(e);
        alert('Failed to connect to print service');
    }
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
    <div className="flex justify-between items-center">
        <p className='text-dark font-medium'>Quick Actions</p>
        <Button variant="ghost" size="icon" onClick={() => setOpenPrinterSettings(true)} title="Printer Settings">
            <Settings className="h-4 w-4" />
        </Button>
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
          <SheetTitle>Generate Walk-in Ticket</SheetTitle>
          <SheetDescription>Fill details for irregular client (24-hour QR).</SheetDescription>
        </SheetHeader>
        <form className='mt-6 space-y-6' onSubmit={(e) => e.preventDefault()}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
              <input type='number' min={0} className='w-full border rounded-md px-3 py-2' placeholder='e.g., 1000' value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value) || 0)} />
            </div>
          </div>
          <div className='flex justify-end'>
            <Button
              className='bg-blue-600 text-white px-6 disabled:opacity-60'
              disabled={isGenerating || !payerName.trim() || (currentRole === UserRole.CASHIER && (!paymentMethod || amountPaid <= 0))}
              onClick={async () => {
                try {
                  setIsGenerating(true)
                  const payload = {
                    payer_name: payerName.trim(),
                    meal_type: mealType,
                    payment_method: paymentMethod,
                    amount_paid: amountPaid
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
                  <div><span className='font-semibold'>Payer:</span> {payerName}</div>
                  <div><span className='font-semibold'>Meal:</span> {mealType}</div>
                  <div><span className='font-semibold'>Payment:</span> {paymentMethod}</div>
                  <div><span className='font-semibold'>Paid:</span> {amountPaid}</div>
                </div>
                {/* Debug: show exact JSON payload encoded in QR for verification */}
                {ticketQr && (
                  <div className='mt-2 text-[10px] text-gray-600 break-all'>
                    <span className='font-semibold'>QR data:</span> generated from backend `qr_code`
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

    {/* Printer Settings Sheet */}
    <Sheet open={openPrinterSettings} onOpenChange={setOpenPrinterSettings}>
      <SheetContent className='bg-white p-6'>
        <SheetHeader>
          <SheetTitle>Printer Settings</SheetTitle>
          <SheetDescription>Configure thermal printer connection.</SheetDescription>
        </SheetHeader>
        <div className="gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="type" className="text-right text-sm font-medium">Type</label>
            <select 
              id="type" 
              value={printerConfig.type} 
              onChange={(e) => setPrinterConfig({...printerConfig, type: e.target.value})}
              className="col-span-3 border rounded p-2 text-sm"
            >
              <option value="network">Network (Ethernet/WiFi)</option>
              <option value="usb">USB</option>
            </select>
          </div>
          {printerConfig.type === 'network' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="ip" className="text-right text-sm font-medium">IP Address</label>
                <input 
                  id="ip" 
                  value={printerConfig.ip} 
                  onChange={(e) => setPrinterConfig({...printerConfig, ip: e.target.value})}
                  className="col-span-3 border rounded p-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="port" className="text-right text-sm font-medium">Port</label>
                <input 
                  id="port" 
                  type="number"
                  value={printerConfig.port} 
                  onChange={(e) => setPrinterConfig({...printerConfig, port: parseInt(e.target.value) || 9100})}
                  className="col-span-3 border rounded p-2 text-sm"
                />
              </div>
            </>
          )}
          {printerConfig.type === 'usb' && (
             <>
               <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="vid" className="text-right text-sm font-medium">Vendor ID (Hex)</label>
                <input 
                  id="vid" 
                  placeholder="e.g. 0x0483"
                  value={printerConfig.vid || ''} 
                  onChange={(e) => setPrinterConfig({...printerConfig, vid: e.target.value})}
                  className="col-span-3 border rounded p-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="pid" className="text-right text-sm font-medium">Product ID (Hex)</label>
                <input 
                  id="pid" 
                  placeholder="e.g. 0x5743"
                  value={printerConfig.pid || ''} 
                  onChange={(e) => setPrinterConfig({...printerConfig, pid: e.target.value})}
                  className="col-span-3 border rounded p-2 text-sm"
                />
              </div>
              <div className="col-span-4 text-sm text-gray-500 text-center">
                Leave blank to auto-detect first USB printer.
                <br/>
                Note: On Windows, you may need to install WinUSB driver using Zadig.
             </div>
             </>
          )}
        </div>
        <SheetFooter>
          <Button onClick={savePrinterConfig}>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
</div>
  )
}

export default QuickAction;