"use client"

import { Button } from "@/components/ui/button"
import { Download, CheckCircle2, Info } from "lucide-react"
import { usePWAInstall } from "@/hooks/use-pwa-install"
import { toast } from "sonner"

export function InstallPWAButton() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall()

  const handleInstall = async () => {
    const result = await promptInstall()
    if (result) {
      toast.success("App installed successfully!", {
        description: "You can now use Dreamweaver Oracle Engine offline",
      })
    }
  }

  if (isInstalled) {
    return (
      <Button variant="outline" disabled className="gap-2 bg-transparent">
        <CheckCircle2 className="size-4" />
        App Installed
      </Button>
    )
  }

  if (!isInstallable) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Info className="size-4" />
        <span>Install available in Chrome/Edge on desktop or Android</span>
      </div>
    )
  }

  return (
    <Button onClick={handleInstall} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
      <Download className="size-4" />
      Install App
    </Button>
  )
}
