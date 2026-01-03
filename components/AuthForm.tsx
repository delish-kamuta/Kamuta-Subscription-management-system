import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { UserRole, CustomerType } from "~/types/auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Eye, EyeOff } from "lucide-react"


interface AuthFormProps {
  onSubmit?: (data: { phone: string; password: string }) => void | Promise<void>
  mode?: "login" | "signup"
}

export function AuthForm({ onSubmit, mode = "login" }: AuthFormProps) {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!phone || !password) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      await onSubmit?.({ phone, password })
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
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+250788123456"
                className="border-black/10"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="border-black/10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
