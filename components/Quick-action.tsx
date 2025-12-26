import {Button} from '~/components/ui/button'
import { Search, Ticket, Wallet } from 'lucide-react'
import { useState } from 'react'
import RegisterSubscriptionSheet from '~/components/subscriptions/RegisterSubscriptionSheet'
import { FindClientSheet } from './quick-actions/FindClientSheet'
import { GenerateTicketSheet } from './quick-actions/GenerateTicketSheet'

const QuickAction = () => {
  const [openRegister, setOpenRegister] = useState(false);
  const [openFind, setOpenFind] = useState(false);
  const [openTicket, setOpenTicket] = useState(false);

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
    <FindClientSheet open={openFind} onOpenChange={setOpenFind} />

    {/* Generate Ticket Sheet */}
    <GenerateTicketSheet open={openTicket} onOpenChange={setOpenTicket} />
</div>
  )
}

export default QuickAction;