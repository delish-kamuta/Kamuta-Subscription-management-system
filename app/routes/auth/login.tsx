import { AuthForm } from "../../../components/AuthForm"
import { UserRole } from "~/types/auth"
import { mapApiRoleToUserRole, mapApiCustomerType } from "~/types/auth"
import { useNavigate } from "react-router"
import { useAppDispatch } from "~/store/hooks"
import { login as loginAction } from "~/store/authSlice"
import { API_BASE_URL } from "~/lib/api"

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleLogin = async (data: { phone: string; password: string }) => {
    try {
      // Call the login API
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
        let errorMessage = "Login failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If response is not JSON (like HTML 404 page), use status text
          errorMessage = `Login failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Store token & user in localStorage if provided
      const token = result.data?.accessToken || result.token || result.accessToken;
      if (token) {
        localStorage.setItem('authToken', token);
        console.log('Token saved:', token.substring(0, 20) + '...');
      } else {
        console.error('No token found in response:', result);
      }
      
      // Get user data from the correct path
      const userData = result.data?.user || result.user;
      if (userData) {
        try { localStorage.setItem('authUser', JSON.stringify(userData)); } catch {}
      }
      
      // Normalize role/customer type from API
      const normalizedRole = mapApiRoleToUserRole(userData?.role);
      const normalizedCustomerType = mapApiCustomerType(userData?.customerType as any);
      
      // Dispatch user data to Redux
      dispatch(loginAction({
        id: userData?.id,
        name: userData?.full_name,
        email: userData?.email || userData?.phone || data.phone,
        role: normalizedRole,
        customerType: normalizedCustomerType,
        token: token || null,
      }));
      
      console.log('User logged in successfully:', result);
      
      // Redirect based on role
      if (normalizedRole === UserRole.WORKER) {
        navigate("/chef-dashboard");
      } else if (normalizedRole === UserRole.WAITSTAFF) {
        navigate("/scan-qr");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw to be caught by AuthForm
    }
  }

  return <AuthForm mode="login" onSubmit={handleLogin} />
}
