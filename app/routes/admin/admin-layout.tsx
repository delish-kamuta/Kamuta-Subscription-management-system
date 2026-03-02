import React from 'react'
import { Outlet } from 'react-router';
import { SidebarProvider } from '~/components/ui/sidebar';
import { AppSidebar } from '../../../components/app-sidebar';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { UserRole } from '~/types/auth';
import { DashboardViewProvider } from '~/hooks/useDashboardView';

const AdminLayout = () => {
  return (
    <DashboardViewProvider>
    <SidebarProvider>
      <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITSTAFF, UserRole.STUDENT, UserRole.WORKER]}>
        <div className="admin-layout flex w-full relative">
          <aside className=''>
            <AppSidebar />
          </aside>

          <main className="children flex-1 flex flex-col w-full h-screen overflow-hidden">
            <div className="flex-1 overflow-auto p-4">
               <Outlet />
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </SidebarProvider>
    </DashboardViewProvider>
  )
}


export default AdminLayout