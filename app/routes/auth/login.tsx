import { AuthForm } from "../../../components/AuthForm"
import { UserRole } from "~/types/auth"
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

    // TODO: Implement login functionality
    console.log('Login attempt:', { email: data.email, role: roleMap[data.role] })
    
    // For now, just redirect to dashboard
    navigate("/dashboard")
  }

  return <AuthForm mode="login" onSubmit={handleLogin} />
}
