import { AuthForm } from "../../../components/AuthForm"
import { useNavigate } from "react-router"
import { UserRole } from "~/types/auth"
import { mapApiRoleToUserRole, mapApiCustomerType } from "~/types/auth"
import { useAppDispatch } from "~/store/hooks"
import { signup as signupAction } from "~/store/authSlice"
import { API_BASE_URL } from "~/lib/api"

export default function SignupPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleSignup = async (data: { phone: string; password: string }) => {
    try {
      // Call the signup API
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: data.phone,
          password: data.password,
        }),
      });

      if (!response.ok) {
        // Try to parse error message
        let errorMessage = "Signup failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If response is not JSON (like HTML 404 page), use status text
          errorMessage = `Signup failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Store token in localStorage if provided
      const token = result.data?.accessToken || result.token || result.accessToken;
      if (token) {
        localStorage.setItem('authToken', token);
      }
      
      // Get user data from the correct path
      const userData = result.data?.user || result.user;
      
      // Normalize role/customer type from API
      const normalizedRole = mapApiRoleToUserRole(userData?.role);
      const normalizedCustomerType = mapApiCustomerType(userData?.customerType as any);
      
      // Dispatch user data to Redux
      dispatch(signupAction({
        id: userData?.id,
        name: userData?.full_name,
        email: userData?.email || userData?.phone || data.phone,
        role: normalizedRole,
        customerType: normalizedCustomerType,
      }));
      
      console.log('User signed up successfully:', result);
      
      // Redirect based on role
      if (normalizedRole === UserRole.WAITSTAFF) {
        navigate("/scan-qr");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error; // Re-throw to be caught by AuthForm
    }
  }

  return <AuthForm mode="signup" onSubmit={handleSignup} />
}
