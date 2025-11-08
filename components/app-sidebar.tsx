import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import cn from "~/lib/utils"
import NavItems from "./NavItems"
import { sidebarItems } from "~/constants"
import { NavLink } from "react-router"
import { Link } from "react-router"
export function AppSidebar() {
  return (
    <Sidebar className="h-screen flex flex-col">
      <SidebarHeader>
    <Link to="/">
    <div className='flex items-center gap-2 p-2'>
        <img src="assets/icons/cutlery.png" className='w-[50px]' alt="" />
        <p className='font-bold'>Restaurant</p>
    </div>
    </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItems />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex px-6 gap-2 items-center">
          <img src="/assets/images/david.webp" className="size-10 rounded-full" alt="logo" />
          <div>
            <p className="text-sm font-medium">David Warner</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
          <button onClick={() => console.log('Logout clicked')} className="cursor-pointer">
            <img src="/assets/icons/logout.svg" alt="" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}