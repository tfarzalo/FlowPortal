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
import { isSupabaseConfigured, resolvedSupabaseUrl, hasSupabaseAnonKey } from "@/lib/supabase"

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
      const loggedInUser = await login(data.email, data.password);

      toast({
        title: "Success",
        description: "Logged in successfully",
      })

      const locationState = location.state as { from?: { pathname?: string } } | null
      const params = new URLSearchParams(location.search)
      const redirectParam = params.get("redirect")
      const redirectFromState = locationState?.from?.pathname
      const redirectTo = redirectFromState || redirectParam

      // Redirect admin users (any role except 'user') to admin dashboard
      if (loggedInUser?.role && loggedInUser.role !== 'user') {
        navigate(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/admin")
      } else {
        navigate(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during login"
      console.error("Login error:", errorMessage)
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
                Supabase credentials are missing. Add `VITE_SUPABASE_URL` and
                `VITE_SUPABASE_ANON_KEY` to your deployment environment and redeploy.
              </div>
            ) : null}
            <div className="rounded-md border border-muted bg-muted/50 p-3 text-xs text-muted-foreground">
              Diagnostics: Supabase URL = {resolvedSupabaseUrl || "missing"} | anon key loaded = {hasSupabaseAnonKey ? "yes" : "no"}
            </div>
            {loginError ? (
              <div className="rounded-md border border-muted bg-muted/50 p-3 text-sm text-muted-foreground">
                {loginError.includes("Timed out")
                  ? "Login timed out. This usually means the site cannot reach Supabase. Verify your Supabase URL/anon key and that the project is reachable."
                  : `Login failed: ${loginError}`}
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
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
