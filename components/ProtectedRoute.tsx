import { useEffect, useState } from "react"
import { Navigate } from "react-router"
import { getCurrentUser, UserRole } from "~/appwrite/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<UserRole | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, role } = await getCurrentUser()
        
        if (user && role) {
          setIsAuthenticated(true)
          setUserRole(role)
        } else {
          setIsAuthenticated(false)
          setUserRole(null)
        }
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
