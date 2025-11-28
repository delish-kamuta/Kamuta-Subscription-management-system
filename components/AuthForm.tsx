import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { UserRole } from "~/types/auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"


interface AuthFormProps {
  onSubmit?: (data: { email: string; password: string; role: UserRole }) => void | Promise<void>
  mode?: "login" | "signup"
}

export function AuthForm({ onSubmit, mode = "login" }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>(UserRole.CASHIER)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    if (mode === "signup" && !role) {
      setError("Please select a role")
      return
    }

    setIsLoading(true)
    try {
      await onSubmit?.({ email, password, role })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex  items-center  justify-center min-h-screen bg-gray-50 p-4 ">
      <Card className="w-full max-w-md border-black/10">
        <CardHeader className="flex flex-col items-center">
          <div className=" size-20 md:size-25">
        <img src="../../assets/icons/user.png" alt="" />
      </div>
          <CardTitle className="text-2xl font-bold text-center text-slate-700">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-center text-slate-700">
            {mode === "login"
              ? "Enter your credentials to access your account"
              : "Fill in your details to get started"}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="border-black/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="border-black/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={isLoading}
                className="flex h-9 w-full rounded-md border-black/10 border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value={UserRole.CASHIER}>Cashier</option>
                <option value={UserRole.WAITSTAFF}>Waitstaff</option>
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.CLIENT}>Client</option>
              </select>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-primary-100 hover:bg-primary-100/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : mode === "login" ? "Sign In" : "Sign Up"}
            </Button>

            <p className="text-sm text-center text-gray-600">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <a href="signup" className="text-primary-100 hover:underline font-medium">
                    Sign up
                  </a>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <a href="login" className="text-primary-100 hover:underline font-medium">
                    Sign in
                  </a>
                </>
              )}
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
