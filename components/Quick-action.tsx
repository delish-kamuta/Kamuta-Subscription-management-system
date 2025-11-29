import {Button} from '~/components/ui/button'
import { Search,Ticket,Wallet } from 'lucide-react'

const QuickAction = () => {
  return (
<div className='flex flex-col gap-5 w-full'>
    <div>
        <p className='text-dark font-medium'>Quick Actions</p>
    </div>
    <div className='flex flex-col justify-between lg:gap-5 md:flex-row md:gap-0 gap-5'>
      <Button size='icon-lg' className=' md:w-auto lg:w-[30%] px-2 bg-blue-600 text-white h-[50px] w-full '><Wallet/>Register New Subscription</Button>
      <Button size='icon-lg'className='md:w-[30%] lg:w-[30%] bg-blue-600 text-white h-[50px] w-full'> <Search/>Find Client</Button>
      <Button size='icon-lg' className='md:w-[30%] lg:w-[30%] bg-blue-600 text-white h-[50px] w-full'> <Ticket/>Sell walk-in Ticket</Button>
    </div>
</div>
  )
}

export default QuickAction;