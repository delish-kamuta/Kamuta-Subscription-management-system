import { Button } from '~/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '~/components/ui/sheet'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import { fetchSubscriptions } from '~/store/subscriptionsSlice'
import { handleGenerateQr, printQrTicket } from '~/lib/qr-utils'

interface FindClientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FindClientSheet({ open, onOpenChange }: FindClientSheetProps) {
  const [findQuery, setFindQuery] = useState('');
  const [findResults, setFindResults] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  
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
    if (open && !subscriptionsHydrated && token) {
      dispatch(fetchSubscriptions({ token }));
    }
  }, [open, subscriptionsHydrated, token, dispatch]);

  // Reset state when closed
  useEffect(() => {
    if (!open) {
        setSelectedClient(null);
        setFindQuery('');
        setFindResults([]);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
                <Button variant='outline' onClick={() => onOpenChange(false)}>Close</Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
