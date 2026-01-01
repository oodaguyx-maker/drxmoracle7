"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, X, Sparkles } from "lucide-react"
import { usePWAInstall, usePostLoginPWAPrompt } from "@/hooks/use-pwa-install"
import { motion, AnimatePresence } from "framer-motion"

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall()
  const { showPostLoginPrompt, setShowPostLoginPrompt } = usePostLoginPWAPrompt()
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (isInstallable && !isInstalled && !dismissed) {
      // If user just logged in, show prompt immediately
      if (showPostLoginPrompt) {
        console.log("[v0] Showing PWA prompt after login")
        setShowPrompt(true)
        setShowPostLoginPrompt(false)
      }
    }
  }, [isInstallable, isInstalled, dismissed, showPostLoginPrompt, setShowPostLoginPrompt])

  const handleInstall = async () => {
    const result = await promptInstall()
    if (result) {
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    // Remember dismissal for 7 days
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString())
  }

  useEffect(() => {
    // Check if user dismissed prompt recently
    const dismissedTime = localStorage.getItem("pwa-prompt-dismissed")
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - Number.parseInt(dismissedTime)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        setDismissed(true)
      }
    }
  }, [])

  if (!showPrompt || isInstalled) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-6 right-6 z-50 max-w-md"
      >
        <Card className="neu-convex p-6 border-0 shadow-2xl backdrop-blur-xl bg-background/95">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="size-12 rounded-full neu-flat flex items-center justify-center">
                <Sparkles className="size-6 text-primary animate-pulse-glow" />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-bold text-lg mb-1">Install Oracle Engine</h3>
                <p className="text-sm text-muted-foreground">
                  Get the full experience with offline access, faster loading, and fullscreen mode!
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleInstall} className="gap-2 flex-1" size="sm">
                  <Download className="size-4" />
                  Install Now
                </Button>
                <Button onClick={handleDismiss} variant="ghost" size="sm" className="neu-flat">
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
