"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading || showSplash) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="relative flex justify-center">
            <div className="relative animate-float">
              <img
                src="https://files.catbox.moe/4z7bjg.jpg"
                alt="Dreamweaver Oracle Engine"
                className="size-64 object-cover rounded-3xl drop-shadow-[0_0_35px_rgba(139,0,0,0.8)]"
              />
              <div className="absolute inset-0 animate-pulse-glow rounded-3xl bg-primary/30 blur-3xl" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer">
              Dreamweaver
            </h1>
            <p className="text-2xl font-semibold text-gold">Oracle Engine</p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <Loader2 className="size-5 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Initializing mystical realms...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4">
      <Card className="w-full max-w-lg animate-fade-in border-primary/30 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative animate-float">
              <img
                src="https://files.catbox.moe/4z7bjg.jpg"
                alt="Dreamweaver Oracle Engine"
                className="size-48 object-cover rounded-2xl drop-shadow-[0_0_25px_rgba(139,0,0,0.6)]"
              />
              <div className="absolute inset-0 animate-pulse-glow rounded-2xl bg-primary/20 blur-2xl" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Dreamweaver
          </CardTitle>
          <p className="text-xl font-semibold text-gold mt-1">Oracle Engine</p>
          <CardDescription className="text-base font-medium mt-3">
            Advanced AI-Powered Roleplay & Character Experience Platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Link href="/auth/login" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register" className="block">
              <Button
                variant="outline"
                className="w-full bg-transparent border-accent text-accent hover:bg-accent/10"
                size="lg"
              >
                Create Account
              </Button>
            </Link>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
            <p className="mb-2 font-semibold text-primary">Core Features:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>- AI Character Roleplay with Memory System</li>
              <li>- Multi-Character Group Adventures (PartyOracle)</li>
              <li>- Open-World Storytelling (HeartFire Mode)</li>
              <li>- Dynamic Lore & World Building</li>
              <li>- Advanced Character Attribute Tracking</li>
            </ul>
          </div>

          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 text-sm">
            <p className="mb-2 font-semibold text-accent">Bonus Tools:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>- OodaGrabber - Video Embedding & Downloads</li>
              <li>- CakeViews - Private Character Gallery</li>
              <li>- OodaEye34 - Image Search & Generation</li>
              <li>- OodaOnline - Collaborative Roleplay</li>
            </ul>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground">
            <p className="font-medium mb-1">Powered By:</p>
            <p>OpenRouter API - Grok - DeepSeek - Claude - GPT-4 - Gemini - Mistral</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
