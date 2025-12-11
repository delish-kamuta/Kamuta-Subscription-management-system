import { type ReactNode } from "react"
import { Navigate } from "react-router"
import { UserRole } from "~/types/auth"
import { useAppSelector } from "~/store/hooks"


interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, hydrated, token } = useAppSelector((state) => state.auth as any)

  // Wait for hydration before deciding
  if (!hydrated) {
    return <></>
  }

  // If not authenticated after hydration, redirect
  if (!isAuthenticated || !token) {
    return <Navigate to="/auth/login" replace />
  }

  if (user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
