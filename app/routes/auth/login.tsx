import { AuthForm } from "../../../components/AuthForm"
import { UserRole } from "~/types/auth"
import { useNavigate } from "react-router"

export default function LoginPage() {
  const navigate = useNavigate()

  const handleLogin = async (data: { email: string; password: string; role: string }) => {
    // TODO: Implement authentication logic
    console.log("Login attempt:", data)
    
    // Temporary: Navigate to dashboard
    navigate("/dashboard")
  }

  return <AuthForm mode="login" onSubmit={handleLogin} />
}
