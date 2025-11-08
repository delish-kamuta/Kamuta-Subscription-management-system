import React from 'react'
import { Outlet } from 'react-router';
const AdminLayout = () => {
  return (
    <div className=''>
        Mobile side bar
        <aside className=' hidden lg:block max-w-[270px] '>
            side bar
        </aside>
      <Outlet />
    </div>
  )
}

export default AdminLayout