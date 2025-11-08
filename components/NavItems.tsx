import React from 'react'
import { Link } from 'react-router';
import { NavLink } from 'react-router';
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider
} from '~/components/ui/sidebar'
import { sidebarItems } from '~/constants'
import cn from '~/lib/utils';

const NavItems = () => {
  return (
    <>
    {sidebarItems.map((item) => (
      <SidebarMenuItem key={item.label} className="rounded-2xl">
        <SidebarMenuButton asChild className='w-full h-full inset-0 hover:bg-transparent hover:text-inherit'>
          <NavLink to={item.href} key={item.id} className='w-full'>
            {({ isActive }: { isActive: boolean }) => (
              <div className={cn('nav-item flex items-center w-full gap-2 inset-0', {
                'bg-primary-100 text-white!': isActive
              })}>
                <item.icon />
                <span>{item.label}</span>
              </div>
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))}
    </>
  )
}

export default NavItems
