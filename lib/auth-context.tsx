"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import { auth } from "./firebase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  isFirebaseConfigured: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  isFirebaseConfigured: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const isFirebaseConfigured = auth !== null

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    const initAuth = async () => {
      try {
        await setPersistence(auth!, browserLocalPersistence)
      } catch (error) {
        console.error("[v0] Failed to set persistence:", error)
      }
    }

    initAuth()

    const unsubscribe = onAuthStateChanged(
      auth!,
      (user) => {
        console.log("[v0] Auth state changed:", user ? `Logged in as ${user.email}` : "Logged out")
        setUser(user)
        setLoading(false)
      },
      (error) => {
        console.error("[v0] Auth state change error:", error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [isFirebaseConfigured])

  const signOut = async () => {
    if (!isFirebaseConfigured || !auth) {
      console.error("[v0] Firebase not configured")
      return
    }

    try {
      await firebaseSignOut(auth)
      console.log("[v0] User signed out successfully")
      router.push("/auth/login")
    } catch (error) {
      console.error("[v0] Sign out error:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, isFirebaseConfigured }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
