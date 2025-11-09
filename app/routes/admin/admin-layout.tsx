import React from 'react'
import { Outlet } from 'react-router';
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar';
import { AppSidebar } from '../../../components/app-sidebar';
import { Ghost } from 'lucide-react';
const AdminLayout = () => {
  return (
    <div className='admin-layout'>
     <aside>
       <SidebarProvider >
      <AppSidebar />
      <main>
        <SidebarTrigger  />
      </main>
    </SidebarProvider>
     </aside>
      <aside className='children '>
        <Outlet />
      </aside>
    </div>
  )
}

export default AdminLayout