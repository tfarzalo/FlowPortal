import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/useToast"
import {
  LogIn
} from "lucide-react"
import { useAuth } from "@/contexts/SupabaseAuthContext"
import { isSupabaseConfigured } from "@/lib/supabase"

type LoginForm = {
  email: string
  password: string
}

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const { toast } = useToast()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { register, handleSubmit } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true)
      setLoginError(null)
      console.log('[Login] Starting login process...');
      const loggedInUser = await login(data.email, data.password);

      console.log('[Login] User logged in - FULL DATA:', JSON.stringify(loggedInUser, null, 2));
      console.log('[Login] Role check:', {
        role: loggedInUser?.role,
        isAdmin: loggedInUser?.role === 'admin',
        roleType: typeof loggedInUser?.role
      });

      toast({
        title: "Success",
        description: "Logged in successfully",
      })

      // Check if user has admin role
      if (loggedInUser?.role === 'admin') {
        console.log('[Login] ✅ Admin role detected - Redirecting to /admin');
        navigate("/admin", { replace: true })
      } else {
        console.log('[Login] ❌ Not admin role - Redirecting to home. Role was:', loggedInUser?.role);
        const locationState = location.state as { from?: { pathname?: string } } | null
        const params = new URLSearchParams(location.search)
        const redirectParam = params.get("redirect")
        const redirectFromState = locationState?.from?.pathname
        const redirectTo = redirectFromState || redirectParam
        navigate(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during login"
      console.error("[Login] Login error:", errorMessage, error)
      setLoginError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!isSupabaseConfigured ? (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                Supabase credentials are missing. Please contact the administrator.
              </div>
            ) : null}
            {loginError ? (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {loginError.includes("Timed out")
                  ? "Login timed out. Please try again or contact support if the issue persists."
                  : `Login failed: ${loginError}`}
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                {...register("email", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register("password", { required: true })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                "Loading..."
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
