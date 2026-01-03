import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "~/components/ui/sheet"
import { addWorkerWalletPayment } from "~/services/wallet"

interface AddWalletPaymentSheetProps {
  userId: string;
  onPaymentSuccess: () => void;
}

export function AddWalletPaymentSheet({ userId, onPaymentSuccess }: AddWalletPaymentSheetProps) {
  const [amount, setAmount] = useState<string>('')
  const [method, setMethod] = useState<string>('cash')
  const [note, setNote] = useState<string>('')
  const [saving, setSaving] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!userId) return
    try {
      setSaving(true)
      setError('')
      const resp = await addWorkerWalletPayment(userId, { amount: Number(amount), payment_method: method, note })
      if (!resp.success) { 
        setError(resp.message || 'Failed to add payment'); 
        return 
      }
      
      setAmount(''); setNote(''); setOpen(false)
      onPaymentSuccess()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="px-3 py-2 rounded bg-blue-600 text-white">Add Wallet Payment</button>
      </SheetTrigger>
      <SheetContent className="bg-white p-6">
        <SheetHeader>
          <SheetTitle>Add Wallet Payment</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <label className="text-xs text-gray-500">Amount</label>
            <input type="number" className="mt-1 w-full border rounded p-2" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 5000" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Method</label>
            <select className="mt-1 w-full border rounded p-2" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="momo">Mobile Money</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Note</label>
            <input className="mt-1 w-full border rounded p-2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
          </div>
        </div>
        <SheetFooter className="mt-6 flex gap-2 px-0">
          <SheetClose asChild>
            <button className="px-3 py-2 rounded border">Cancel</button>
          </SheetClose>
          <button
            className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            disabled={saving || !amount || Number(amount) <= 0}
            onClick={handleSave}
          >{saving ? 'Saving…' : 'Save Payment'}</button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}