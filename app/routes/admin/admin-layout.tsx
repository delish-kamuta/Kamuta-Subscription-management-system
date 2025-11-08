import React from 'react'
import { Outlet } from 'react-router';
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar';
import { AppSidebar } from '../../../components/app-sidebar';
const AdminLayout = () => {
  return (
    <div className='admin-layout'>
     <aside className='max-w-[280px]'>
       <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
      </main>
    </SidebarProvider>
     </aside>
      <aside className='children'>
        <Outlet />
      </aside>
    </div>
  )
}

export default AdminLayout