import { AuthForm } from "../../../components/AuthForm"
import { useNavigate } from "react-router"
import { UserRole } from "~/types/auth"
import { useAppDispatch } from "~/store/hooks"
import { login as loginAction } from "~/store/authSlice"

export default function SignupPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()


  const handleSignup = async (data: { email: string; password: string; role: string }) => {
      // Map form role values to UserRole enum
      const roleMap: Record<string, UserRole> = {
        "customer": UserRole.CLIENT,
        "staff": UserRole.WAITSTAFF,
        "admin": UserRole.ADMIN,
        "cashier": UserRole.CASHIER
      }
  
      const role = roleMap[data.role]
  
      // TODO: Replace with actual authentication API call
      // For now, dispatching mock user data to Redux
      dispatch(loginAction({
        id: "user-123",
        name: data.email.split('@')[0], // Use email prefix as name
        email: data.email,
        role: role
      }))
      
      console.log('User logged in with role:', role)
      
      // Redirect to dashboard
      navigate("/dashboard")
    }

  return <AuthForm mode="signup" onSubmit={handleSignup} />
}
