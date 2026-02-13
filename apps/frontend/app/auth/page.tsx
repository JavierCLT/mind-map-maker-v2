"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase-client"

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const supabase = getSupabaseClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) throw authError
      router.push("/")
    } catch (err: any) {
      setError(err?.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const supabase = getSupabaseClient()
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      if (authError) throw authError
      router.push("/")
    } catch (err: any) {
      setError(err?.message || "Failed to sign up")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to Mind Map Maker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleSignIn} disabled={isLoading}>
              {isLoading ? "Please wait..." : "Sign In"}
            </Button>
            <Button onClick={handleSignUp} disabled={isLoading} variant="outline">
              {isLoading ? "Please wait..." : "Sign Up"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Free plan: 3 maps/month. Pro plan: unlimited maps.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
