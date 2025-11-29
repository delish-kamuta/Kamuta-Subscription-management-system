import {Button} from '~/components/ui/button'
import { Search,Ticket,Wallet } from 'lucide-react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '~/components/ui/sheet'

const QuickAction = () => {
  const [openRegister, setOpenRegister] = useState(false);
  const [openFind, setOpenFind] = useState(false);
  const [openTicket, setOpenTicket] = useState(false);
  return (
<div className='flex flex-col gap-5 w-full'>
    <div>
        <p className='text-dark font-medium'>Quick Actions</p>
    </div>
    <div className='flex flex-col justify-between lg:gap-5 md:flex-row md:gap-0 gap-5'>
      <Button size='icon-lg' onClick={() => setOpenRegister(true)} className=' md:w-auto lg:w-[30%] px-2 bg-blue-600 text-white h-[50px] w-full '><Wallet/>Register New Subscription</Button>
      <Button size='icon-lg' onClick={() => setOpenFind(true)} className='md:w-[30%] lg:w-[30%] bg-blue-600 text-white h-[50px] w-full'> <Search/>Find Client</Button>
      <Button size='icon-lg' onClick={() => setOpenTicket(true)} className='md:w-[30%] lg:w-[30%] bg-blue-600 text-white h-[50px] w-full'> <Ticket/>Sell walk-in Ticket</Button>
    </div>
    {/* Register Subscription Sheet */}
    <Sheet open={openRegister} onOpenChange={setOpenRegister}>
      <SheetContent side='right' className='w-full sm:max-w-lg bg-white p-6 border-none'>
        <SheetHeader>
          <SheetTitle>Record New Subscription</SheetTitle>
          <SheetDescription>Provide customer and subscription details, then submit.</SheetDescription>
        </SheetHeader>
        <form className='mt-6 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Name</label>
              <input className='w-full border rounded-md px-3 py-2' placeholder='Enter full name' />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Reg number</label>
              <input className='w-full border rounded-md px-3 py-2' placeholder='e.g., RG-12345' />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Days</label>
              <input type='number' min={1} className='w-full border rounded-md px-3 py-2' placeholder='e.g., 30' />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Subscription</label>
              <select className='w-full border rounded-md px-3 py-2'>
                <option value='VVIP'>VVIP</option>
                <option value='Vip'>VIP</option>
                <option value='Ordinary'>Ordinary</option>
              </select>
            </div>
            <div className='space-y-2 md:col-span-2'>
              <label className='text-sm font-medium text-gray-700'>Payment mode</label>
              <select className='w-full border rounded-md px-3 py-2'>
                <option value=''>select payment method</option>
                <option value='Cash'>Cash</option>
                <option value='Card'>Card</option>
                <option value='Mobile Money'>Mobile Money</option>
              </select>
            </div>
          </div>
          <div className='flex justify-end'>
            <Button className='bg-blue-600 text-white px-6'>SUBMIT</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
    {/* Find Client Sheet */}
    <Sheet open={openFind} onOpenChange={setOpenFind}>
      <SheetContent side='right' className='w-full sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>Find Client</SheetTitle>
          <SheetDescription>Search by name or ID to view details.</SheetDescription>
        </SheetHeader>
        <div className='mt-4 space-y-3'>
          <input className='w-full border rounded-md px-3 py-2' placeholder='Search by name or ID' />
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setOpenFind(false)}>Close</Button>
            <Button>Search</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
    {/* Sell Ticket Sheet */}
    <Sheet open={openTicket} onOpenChange={setOpenTicket}>
      <SheetContent side='right' className='w-full sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>Sell Walk-in Ticket</SheetTitle>
          <SheetDescription>Record a walk-in ticket sale.</SheetDescription>
        </SheetHeader>
        <div className='mt-4 space-y-3'>
          <input className='w-full border rounded-md px-3 py-2' placeholder='Customer Name (optional)' />
          <select className='w-full border rounded-md px-3 py-2'>
            <option>Meal Type</option>
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
          </select>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setOpenTicket(false)}>Cancel</Button>
            <Button>Record Sale</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
</div>
  )
}

export default QuickAction;