import React from 'react'
import { Outlet } from 'react-router';
import { NavItems } from 'components/index';
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar';
import { AppSidebar } from 'components/app-sidebar';
const AdminLayout = () => {
  return (
    <div className=''>
            <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {/** Main content goes here **/}
      </main>
    </SidebarProvider>
      <Outlet />
    </div>
  )
}

export default AdminLayout