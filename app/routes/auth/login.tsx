import { AuthForm } from "../../../components/AuthForm"
import { login, UserRole } from "~/appwrite/auth"
import { useNavigate } from "react-router"

export default function LoginPage() {
  const navigate = useNavigate()

  const handleLogin = async (data: { email: string; password: string; role: string }) => {
    // Map form role values to UserRole enum
    const roleMap: Record<string, UserRole> = {
      "customer": UserRole.CASHIER,
      "staff": UserRole.WAITSTAFF,
      "admin": UserRole.ADMIN
    }

    const response = await login({
      email: data.email,
      password: data.password,
      role: roleMap[data.role]
    })

    if (!response.success) {
      // Check for rate limit error
      if (response.error?.includes("Rate limit") || response.error?.includes("429")) {
        throw new Error("Too many login attempts. Please wait a few minutes and try again.")
      }
      throw new Error(response.error || "Login failed")
    }

    // Redirect based on role
    if (response.workerProfile?.role === UserRole.ADMIN) {
      navigate("/dashboard")
    } else {
      navigate("/dashboard")
    }
  }

  return <AuthForm mode="login" onSubmit={handleLogin} />
}
