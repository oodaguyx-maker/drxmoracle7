"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isFirebaseConfigured } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user && isFirebaseConfigured) {
      router.push("/auth/login")
    }
  }, [user, loading, isFirebaseConfigured, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <div className="max-w-2xl w-full space-y-6">
          <Alert variant="destructive" className="border-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">Firebase Not Configured</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p>Firebase authentication needs to be set up to use this application.</p>
              <div className="space-y-2">
                <p className="font-medium">Quick Setup Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
                  <li>Create a Firebase project at console.firebase.google.com</li>
                  <li>Enable Email/Password authentication</li>
                  <li>Add your Firebase config to environment variables</li>
                  <li>Restart the development server</li>
                </ol>
              </div>
              <div className="flex gap-3 mt-4">
                <Button asChild variant="outline">
                  <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">
                    Open Firebase Console
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/FIREBASE_SETUP.md" target="_blank">
                    View Setup Guide
                  </Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
