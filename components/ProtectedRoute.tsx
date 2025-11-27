import { useEffect, useState } from "react"
import { Navigate } from "react-router"
import { UserRole } from "~/types/auth"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<UserRole | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // TODO: Implement authentication check
        // For now, assume user is authenticated as ADMIN
        setIsAuthenticated(true)
        setUserRole(UserRole.ADMIN)
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
        setUserRole(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  // Redirect to unauthorized if user doesn't have required role
  if (userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Render children if authenticated and authorized
  return <>{children}</>
}
