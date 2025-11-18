import { AuthForm } from "../../../components/AuthForm"
import { useNavigate } from "react-router"

export default function SignupPage() {
  const navigate = useNavigate()

  const handleSignup = async (data: { email: string; password: string; role: string }) => {
    // Note: Worker accounts should be created by admins through the admin panel
    // This signup is just a placeholder - redirect to login
    throw new Error("Please contact an administrator to create your account")
  }

  return <AuthForm mode="signup" onSubmit={handleSignup} />
}
