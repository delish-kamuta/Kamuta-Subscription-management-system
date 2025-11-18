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
import { NavLink, useNavigate } from "react-router"
import { Link } from "react-router"
import { logout } from "~/appwrite/auth"
import { useState } from "react"

export function AppSidebar() {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const result = await logout()
      
      if (result.success) {
        navigate("/auth/login")
      } else {
        console.error("Logout failed:", result.error)
        alert("Failed to logout. Please try again.")
      }
    } catch (error) {
      console.error("Logout error:", error)
      alert("An error occurred during logout.")
    } finally {
      setIsLoggingOut(false)
    }
  }
  return (
    <Sidebar className="h-screen flex flex-col ">
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
          <button 
            onClick={handleLogout} 
            disabled={isLoggingOut}
            className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Logout"
          >
            <img src="/assets/icons/logout.svg" alt="Logout" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}