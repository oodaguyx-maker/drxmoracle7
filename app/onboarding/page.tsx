"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Key, ExternalLink, Check } from "lucide-react"
import { getSettings, saveSettings } from "@/lib/storage"
import { toast } from "sonner"
import Image from "next/image"

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [apiKey, setApiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      const settings = getSettings()
      if (settings.apiKeys?.openRouter) {
        // User already has API key, redirect to dashboard
        router.push("/dashboard")
      }
    }
  }, [user, router])

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your API key")
      return
    }

    if (!apiKey.startsWith("sk-or-")) {
      toast.error("Invalid API key format. OpenRouter keys start with 'sk-or-'")
      return
    }

    setSaving(true)

    try {
      const settings = getSettings()
      saveSettings({
        ...settings,
        apiKeys: { ...settings.apiKeys, openRouter: apiKey.trim() },
      })

      toast.success("API key saved successfully!")
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      console.error("Error saving API key:", error)
      toast.error("Failed to save API key")
      setSaving(false)
    }
  }

  const handleSkip = () => {
    toast("You can add your API key later in Settings")
    router.push("/dashboard")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4">
      <Card className="w-full max-w-2xl animate-fade-in border-primary/30 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mb-4 flex justify-center">
            <div className="relative animate-float">
              <Image
                src="/images/download-95-removebg-preview.png"
                alt="Dreamweaver Oracle Engine"
                width={100}
                height={100}
                className="object-contain drop-shadow-[0_0_20px_rgba(147,51,234,0.6)]"
              />
              <div className="absolute inset-0 animate-pulse-glow rounded-full bg-primary/20 blur-2xl" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-pink-500 bg-clip-text text-transparent">
            Welcome to Dreamweaver Oracle Engine
          </CardTitle>
          <CardDescription className="text-base mt-2">Let's get you set up with AI-powered roleplay</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2">
            <div
              className={`flex items-center justify-center size-8 rounded-full text-sm font-medium ${
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {step > 1 ? <Check className="size-4" /> : "1"}
            </div>
            <div className={`h-1 w-16 rounded ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            <div
              className={`flex items-center justify-center size-8 rounded-full text-sm font-medium ${
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
          </div>

          {step === 1 ? (
            <>
              {/* Step 1: Introduction */}
              <div className="space-y-4">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <h3 className="font-semibold text-primary mb-3">What is Dreamweaver Oracle Engine?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>
                        An advanced AI roleplay platform powered by OpenRouter, giving you access to the best AI models
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>
                        Create characters with detailed personalities, chat with intelligent memory systems, and build
                        rich story worlds
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>
                        Experience multi-character group adventures and open-world storytelling with emergent narratives
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                  <h3 className="font-semibold text-accent mb-3">Why do I need an OpenRouter API key?</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    OpenRouter provides access to 100+ AI models from providers like xAI (Grok), DeepSeek, Anthropic
                    (Claude), OpenAI (GPT-4), Google (Gemini), and more.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your API key enables the AI features and gives you control over which models to use and how much to
                    spend.
                  </p>
                </div>

                <Button onClick={() => setStep(2)} className="w-full" size="lg">
                  Get Started - Add API Key
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: API Key Entry */}
              <div className="space-y-4">
                <Alert className="border-primary/30 bg-primary/5">
                  <Key className="size-4 text-primary" />
                  <AlertDescription className="text-sm">
                    Don't have an API key yet?{" "}
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Get one free from OpenRouter
                      <ExternalLink className="size-3" />
                    </a>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="api-key">OpenRouter API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="api-key"
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-or-v1-..."
                      className="font-mono text-sm"
                    />
                    <Button onClick={() => setShowKey(!showKey)} variant="outline" size="icon">
                      {showKey ? (
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      ) : (
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your API key is stored locally and never shared. OpenRouter keys start with "sk-or-"
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground space-y-2">
                  <p className="font-medium">Quick Setup Guide:</p>
                  <ol className="space-y-1 ml-4 list-decimal">
                    <li>Visit openrouter.ai/keys and sign up (free)</li>
                    <li>Create a new API key (they offer $1 free credit)</li>
                    <li>Copy your key and paste it above</li>
                    <li>Start chatting with AI characters!</li>
                  </ol>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSkip} variant="outline" className="flex-1 bg-transparent">
                    Skip for Now
                  </Button>
                  <Button onClick={handleSaveApiKey} disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save & Continue"
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
