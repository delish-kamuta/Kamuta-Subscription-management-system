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
import { LogOut } from "lucide-react"
import { useAppDispatch, useAppSelector } from "~/store/hooks"
import { logout as logoutAction } from "~/store/authSlice"

export function AppSidebar() {
  const { open, toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      
      // Dispatch logout action to clear Redux state
      dispatch(logoutAction())
      try {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
      } catch {}
      
      console.log('User logged out')
      
      // Navigate to login page
      navigate("/auth/login")
      if (isMobile) setOpenMobile(false)
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
          <Link to="/" onClick={() => isMobile && setOpenMobile(false)}>
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
        {/* Profile + Logout side-by-side */}
        <div className="flex items-center gap-2 w-full group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
          <button
            onClick={() => {
              navigate('/profile');
              if (isMobile) setOpenMobile(false);
            }}
            className="flex items-center gap-2 flex-1 text-left rounded-md py-1 px-2 cursor-pointer hover:bg-gray-50 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center"
            title="View profile"
          >
            <img
              src="/assets/images/david.webp"
              className="size-10 rounded-full group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
              alt="profile"
            />
            <div className="ml-2 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium">{user?.name || "Guest"}</p>
              <p className="text-xs text-muted-foreground">{user?.role || "No role"}</p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center justify-center w-9 h-9 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer shrink-0"
            title={isLoggingOut ? "Logging out…" : "Logout"}
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
