import React from 'react'
import { Header } from '../../../components/Header'
import { SidebarTrigger } from '~/components/ui/sidebar'

const MealsLogs = () => {
  return (
    <main className='dashboard wrapper'>
          <Header title="Manage Meals Logs"
            description="Manage all clients and their activity"
            action={<SidebarTrigger className="rounded-md p-1 border border-transparent  md:border-slate-200" />} />
          dashboard details
        </main>
  )
}

export default MealsLogs
