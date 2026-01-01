"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"

interface BackButtonProps {
  href?: string
  label?: string
  variant?: "default" | "outline" | "ghost"
  showHomeButton?: boolean
}

export function BackButton({ href, label = "Back", variant = "ghost", showHomeButton = false }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant={variant} size="sm" onClick={handleBack} className="gap-2">
        <ArrowLeft className="size-4" />
        {label}
      </Button>
      {showHomeButton && (
        <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
          <Home className="size-4" />
          Dashboard
        </Button>
      )}
    </div>
  )
}
