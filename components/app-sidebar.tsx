import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import NavItems from "./NavItems"
import { Link } from "react-router"
export function AppSidebar() {
  const { open, toggleSidebar} = useSidebar();
  return (
    // enable icon-style collapsing so icons stay visible when collapsed
    <Sidebar collapsible="icon" className="h-screen flex flex-col ">
      <SidebarHeader className="w-full">
        <div className="flex items-center justify-between gap-2 p-2 w-full">
          <Link to="/">
            <div className="flex items-center gap-2">
              <img
                src="assets/icons/cutlery.png"
                className="w-12 group-data-[collapsible=icon]:w-8"
                alt=""
              />
              <p className="font-bold group-data-[collapsible=icon]:hidden">Restaurant</p>
            </div>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1  w-full">
        <SidebarGroup className="w-full">
          <SidebarGroupContent className="w-full" >
            <SidebarMenu className="w-full">
              <NavItems />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex px-6 gap-2 items-center  w-full group-data-[collapsible=icon]:px-0">
            <img
              src="/assets/images/david.webp"
              className="size-10 rounded-full group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
              alt="logo"
            />
          <div className="ml-2 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium">David Warner</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
          <button onClick={() => console.log('Logout clicked')} className="cursor-pointer group-data-[collapsible=icon]:hidden">
            <img src="/assets/icons/logout.svg" alt="" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}