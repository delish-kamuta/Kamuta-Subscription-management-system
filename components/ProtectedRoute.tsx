import { type ReactNode } from "react"
import { UserRole } from "~/types/auth"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  // TODO: Implement authentication check
  // For now, just render children without protection
  return <>{children}</>
}
