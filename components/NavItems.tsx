import React from 'react'
import { Link } from 'react-router';
import { NavLink } from 'react-router';
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider
} from '~/components/ui/sidebar'
import { sidebarItems } from '~/constants'
import {cn} from '~/lib/utils';

const NavItems = () => {
  return (
    <>
    {sidebarItems.map((item) => (
      <SidebarMenuItem key={item.label} className="rounded-2xl w-full group-data-[collapsible=icon]:py-[18px]   flex items-center justify-center ">
        {/* Provide tooltip so label is visible on hover when collapsed */}
        <SidebarMenuButton
          asChild
          className="w-full flex justify-center h-full inset-0 hover:bg-transparent hover:text-inherit "
          tooltip={item.label}
        >
          <NavLink to={item.href} key={item.id} className="w-full">
            {({ isActive }: { isActive: boolean }) => (
              <div
                className={cn(
                  "nav-item flex items-center w-full gap-2 inset-0 transition-all justify-start",
                    "group-data-[collapsible=icon]:justify-center  group-data-[collapsible=icon]:w-16 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:rounded-md",
                  {
                    "bg-primary-100 text-white!": isActive,
                  }
                )}
              >
                <item.icon />
                {/* hide text when sidebar is collapsed (icons-only) */}
                <span className="ml-2 group-data-[collapsible=icon]:hidden">{item.label}</span>
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
