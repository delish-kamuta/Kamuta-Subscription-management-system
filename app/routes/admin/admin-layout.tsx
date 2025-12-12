import React from 'react'
import { Outlet } from 'react-router';
import { SidebarProvider } from '~/components/ui/sidebar';
import { AppSidebar } from '../../../components/app-sidebar';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { UserRole } from '~/types/auth';

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.CASHIER, UserRole.WAITSTAFF, UserRole.STUDENT, UserRole.WORKER]}>
        <div className="admin-layout">
          <aside className=''>
            <AppSidebar />
          </aside>

          <main className="children">
            <Outlet />
          </main>
        </div>
      </ProtectedRoute>
    </SidebarProvider>
  )
}

export default AdminLayout