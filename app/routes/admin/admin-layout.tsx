import React from 'react'
import { Outlet } from 'react-router';
import { SidebarProvider } from '~/components/ui/sidebar';
import { AppSidebar } from '../../../components/app-sidebar';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { UserRole } from '~/types/auth';

const AdminLayout = () => {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITSTAFF]}>
      <SidebarProvider>
        <div className="admin-layout">
          <aside className=''>
            <AppSidebar />
          </aside>

          <main className="children">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

export default AdminLayout