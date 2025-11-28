import { AuthForm } from "../../../components/AuthForm"
import { UserRole } from "~/types/auth"
import { useNavigate } from "react-router"
import { useAppDispatch } from "~/store/hooks"
import { login as loginAction } from "~/store/authSlice"

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleLogin = async (data: { email: string; password: string; role: UserRole }) => {
    // TODO: Replace with actual authentication API call
    // For now, dispatching mock user data to Redux
    dispatch(loginAction({
      id: "user-123",
      name: data.email.split('@')[0], // Use email prefix as name
      email: data.email,
      role: data.role
    }))
    
    console.log('User logged in with role:', data.role)
    
    // Redirect based on role
    if (data.role === UserRole.WAITSTAFF) {
      navigate("/scan-qr")
    } else {
      navigate("/dashboard")
    }
  }

  return <AuthForm mode="login" onSubmit={handleLogin} />
}
