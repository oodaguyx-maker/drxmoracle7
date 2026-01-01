"use client"

import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
      console.log("[v0] PWA install prompt ready")
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("[v0] PWA was installed")
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.log("[v0] No install prompt available")
      return false
    }

    // Show the install prompt
    await deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice

    console.log("[v0] User choice:", choiceResult.outcome)

    if (choiceResult.outcome === "accepted") {
      console.log("[v0] User accepted the install prompt")
      setIsInstallable(false)
      setDeferredPrompt(null)
      return true
    }

    return false
  }

  return {
    isInstallable,
    isInstalled,
    promptInstall,
  }
}

export function usePostLoginPWAPrompt() {
  const [showPostLoginPrompt, setShowPostLoginPrompt] = useState(false)

  useEffect(() => {
    // Check if user just logged in
    const justLoggedIn = sessionStorage.getItem("pwa_show_after_login")

    if (justLoggedIn === "true") {
      console.log("[v0] Post-login detected, preparing PWA prompt")
      // Clear the flag
      sessionStorage.removeItem("pwa_show_after_login")
      // Show prompt after a brief delay to let dashboard load
      const timer = setTimeout(() => {
        setShowPostLoginPrompt(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  return { showPostLoginPrompt, setShowPostLoginPrompt }
}
