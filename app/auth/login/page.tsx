"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Lock, Mail, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { BackButton } from "@/components/back-button"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { isFirebaseConfigured, user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/onboarding")
    }
  }, [user, authLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!auth) {
      setError("Firebase is not configured. Please check environment variables.")
      return
    }

    setLoading(true)
    setError("")

    try {
      await setPersistence(auth, browserLocalPersistence)
      await signInWithEmailAndPassword(auth, email, password)

      sessionStorage.setItem("pwa_show_after_login", "true")

      toast.success("Welcome back! You'll stay logged in.")
      router.push("/onboarding")
    } catch (err: any) {
      console.error("[v0] Login error:", err)
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password")
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.")
      } else {
        setError("Failed to sign in. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="mb-4">
            <BackButton href="/" label="Back to Home" variant="ghost" />
          </div>
          <Alert variant="destructive" className="border-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">Firebase Not Configured</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p>Please set up Firebase to enable authentication.</p>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">
                  Open Firebase Console
                </a>
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <BackButton href="/" label="Back to Home" variant="ghost" />
        </div>

        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div className="relative animate-float">
              <Image
                src="/images/2824-removebg-preview.png"
                alt="Dreamweaver Oracle Engine"
                width={160}
                height={160}
                className="object-contain drop-shadow-[0_0_20px_rgba(217,119,6,0.6)]"
              />
              <div className="absolute inset-0 animate-pulse-glow rounded-full bg-amber-500/20 blur-xl" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-pink-500 bg-clip-text text-transparent">
            Dreamweaver
          </h1>
          <p className="text-lg font-semibold text-foreground/80">Oracle Engine</p>
          <p className="text-sm text-muted-foreground mt-1">Sign in to access your roleplay realm</p>
        </div>

        <Card className="border-border/50 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Secure authentication with persistent sessions powered by Firebase
        </p>
      </div>
    </div>
  )
}
