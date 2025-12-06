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
} from "~/components/ui/sidebar";
import NavItems from "./NavItems";
import { sidebarItems } from "~/constants"
import { Link, useNavigate } from "react-router"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "~/store/hooks"
import { logout as logoutAction } from "~/store/authSlice"

export function AppSidebar() {
  const { open, toggleSidebar } = useSidebar();
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      
      // Dispatch logout action to clear Redux state
      dispatch(logoutAction())
      
      console.log('User logged out')
      
      // Navigate to login page
      navigate("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
      alert("An error occurred during logout.")
    } finally {
      setIsLoggingOut(false)
    }
  }
  return (
    // enable icon-style collapsing so icons stay visible when collapsed
    <Sidebar collapsible="icon" className="h-screen flex flex-col border-black/5 w-[21%] lg:w-[18%]">
      <SidebarHeader className="w-full">
        <div className="flex items-center justify-between gap-2 p-2 w-full border-b border-black/5 py-3">
          <Link to="/">
            <div className="flex items-center gap-2">
              <img
                src="assets/icons/cutlery.png"
                className="w-12 group-data-[collapsible=icon]:w-8"
                alt=""
              />
              <p className="font-bold group-data-[collapsible=icon]:hidden">
                Restaurant
              </p>
            </div>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1  w-full">
        <SidebarGroup className="w-full">
          <SidebarGroupContent className="w-full">
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
            <p className="text-sm font-medium">{user?.name || "Guest"}</p>
            <p className="text-xs text-muted-foreground">{user?.role || "No role"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="cursor-pointer"
            title="Logout"
          >
            <img src="/assets/icons/logout.svg" alt="Logout" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
