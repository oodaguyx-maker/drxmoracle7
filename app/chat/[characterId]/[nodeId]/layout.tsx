"use client"

import type React from "react"

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full">
      <main className="flex-1">{children}</main>
    </div>
  )
}
