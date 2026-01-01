"use client"

import type React from "react"
import { SidebarWrapper } from "@/components/sidebar-wrapper"
import { TopNavbar } from "@/components/top-navbar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <TopNavbar />
      <div className="flex flex-1 overflow-hidden">
        <SidebarWrapper />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  )
}
