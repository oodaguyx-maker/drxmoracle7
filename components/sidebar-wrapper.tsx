"use client"

import { useEffect, useState } from "react"
import { SidebarNav } from "@/components/sidebar-nav"

export function SidebarWrapper() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <aside className="w-72 border-r-0 bg-background">
        <div className="animate-pulse" />
      </aside>
    )
  }

  return <SidebarNav />
}
