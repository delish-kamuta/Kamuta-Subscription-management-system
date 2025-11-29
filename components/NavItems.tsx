import { NavLink } from 'react-router';
import { SidebarMenuItem , SidebarMenuButton} from '~/components/ui/sidebar'
import { sidebarItems } from '~/constants'
import {cn} from '~/lib/utils';
import { useAppSelector } from '~/store/hooks';
import { UserRole, CustomerType } from '~/types/auth';

const NavItems = () => {
  // Filter sidebar items based on user role
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  // Default to CLIENT for guests (regular client without login)
  const userRole = user?.role || UserRole.CLIENT;
  
  // Map UserRole enum to sidebar role strings
  const roleMap: Record<UserRole, string> = {
    [UserRole.CASHIER]: "cashier",
    [UserRole.WAITSTAFF]: "scanner",
    [UserRole.ADMIN]: "admin",
    [UserRole.CLIENT]: "client"
  };
  
  const mappedRole = roleMap[userRole];
  
  const filteredItems = sidebarItems
    .filter((item) => item.roles?.includes(mappedRole))
    .filter((item) => {
      // Hide "My QR Code" for guests and regular clients
      if (item.label === "My QR Code") {
        if (!isAuthenticated) return false;
        return user?.customerType === CustomerType.STUDENT || user?.customerType === CustomerType.CAMPUS_WORKER;
      }
      return true;
    });

  return (
    <>
    {filteredItems.map((item) => (
      <SidebarMenuItem key={item.label} className="rounded-2xl w-full group-data-[collapsible=icon]:py-[18px] flex items-center justify-center ">
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
                <item.icon className='size-6 ' />
                {/* hide text when sidebar is collapsed (icons-only) */}
                <span className="ml-2 group-data-[collapsible=icon]:hidden text-[13px] lg:text-[18px] truncate">{item.label}</span>
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
