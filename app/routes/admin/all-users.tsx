import React from 'react'
import { Header } from '../../../components/Header'
import { SidebarTrigger } from '~/components/ui/sidebar'

const AllUsers = () => {
  return (
    <main className='dashboard wrapper'>
          <Header title="Manage Clients"
            description="Manage all clients and their activity"
            action={<SidebarTrigger className="rounded-md p-1 border border-transparent  md:border-slate-200" />} />
          dashboard details
        </main>
  )
}

export default AllUsers
