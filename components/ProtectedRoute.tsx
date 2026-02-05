import { type ReactNode, useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router"
import { jwtDecode } from "jwt-decode"
import { UserRole } from "~/types/auth"
import { useAppSelector } from "~/store/hooks"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation()
  const { user, hydrated } = useAppSelector((state) => state.auth as any)
  const [isTokenVerified, setIsTokenVerified] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)

  useEffect(() => {
    // This effect runs only on the client
    const token = localStorage.getItem('authToken')

    if (!token) {
      setIsValidToken(false)
      setIsTokenVerified(true)
      return
    }

    try {
      const decoded: any = jwtDecode(token)
      const currentTime = Date.now() / 1000

      if (decoded.exp && decoded.exp < currentTime) {
        // Token expired
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        setIsValidToken(false)
      } else {
        setIsValidToken(true)
      }
    } catch (error) {
      // Invalid token
      localStorage.removeItem('authToken')
      setIsValidToken(false)
    }
    
    setIsTokenVerified(true)
  }, [])

  // 1. SSR & Initial Client Render: Return null to avoid hydration mismatch
  // and prevent accessing localStorage on server.
  if (!isTokenVerified) {
    return null
  }

  // 2. Redirect if token was invalid
  if (!isValidToken) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // 3. Wait for Redux hydration before checking roles
  if (!hydrated) {
    return null
  }

  if (user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
