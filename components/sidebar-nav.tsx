"use client"

import React from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface NavItem {
  name: string
  href: string
  icon: ReactNode
  highlight?: boolean
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    name: "Characters",
    href: "/characters",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    name: "LoreWorld",
    href: "/loreworld",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    name: "Scenarios",
    href: "/scenarios",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
    ),
  },
  {
    name: "Embark Modes",
    href: "/embark-modes",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: "Personas",
    href: "/personas",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    name: "Extensions",
    href: "/extensions",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
        />
      </svg>
    ),
    children: [
      {
        name: "OodaGrabber",
        href: "/video-tools",
        highlight: true,
        icon: (
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
        ),
      },
      {
        name: "OodaEyeXR",
        href: "/ooda-eyexr",
        highlight: true,
        icon: (
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
        ),
      },
      {
        name: "GrokImgOven",
        href: "/extensions/grok-imgoven",
        highlight: true,
        icon: (
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
            />
          </svg>
        ),
      },
    ],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    name: "OodaBoard",
    href: "/oodaboard",
    icon: (
      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"
        />
      </svg>
    ),
  },
]

export function SidebarNav() {
  const pathname = usePathname()
  const [openExtensions, setOpenExtensions] = React.useState(true)

  return (
    <aside className="flex w-80 flex-col border-r-0 gloss-convex relative z-10 min-h-screen">
      <div className="relative flex h-28 items-center gap-4 px-8 overflow-hidden crimson-glow">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent" />
        <div className="relative flex size-20 items-center justify-center rounded-2xl gloss-flat overflow-hidden animate-float border-2 border-accent/30">
          <img
            src="https://files.catbox.moe/4z7bjg.jpg"
            alt="Dreamweaver Oracle Engine"
            className="size-full object-cover"
          />
        </div>
        <div className="relative flex-1">
          <h1 className="text-xl font-bold text-gold">Dreamweaver</h1>
          <p className="text-sm text-foreground/70 font-semibold tracking-wide">Oracle Engine</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-6 pb-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

          if (item.children) {
            const hasActiveChild = item.children.some(
              (child) => pathname === child.href || pathname?.startsWith(`${child.href}/`),
            )

            return (
              <Collapsible key={item.href} open={openExtensions} onOpenChange={setOpenExtensions}>
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "group flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-base font-semibold transition-all",
                      isActive || hasActiveChild
                        ? "gloss-pressed bg-primary/20 text-primary shadow-inner"
                        : "gloss-flat gloss-interactive text-foreground/80 hover:text-foreground",
                    )}
                  >
                    <div className={cn("transition-all", (isActive || hasActiveChild) && "text-crimson-glow")}>
                      {item.icon}
                    </div>
                    <span className="flex-1 text-left">{item.name}</span>
                    {openExtensions ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pl-10 pt-3">
                  {item.children.map((child) => {
                    const isChildActive = pathname === child.href || pathname?.startsWith(`${child.href}/`)
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                          isChildActive
                            ? "gloss-pressed bg-accent/20 text-accent"
                            : "gloss-flat gloss-interactive text-foreground/70 hover:text-foreground",
                        )}
                      >
                        <div className={cn("transition-all", isChildActive && "text-gold-glow")}>{child.icon}</div>
                        {child.name}
                      </Link>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 rounded-2xl px-5 py-4 text-base font-semibold transition-all",
                isActive
                  ? "gloss-pressed bg-primary/20 text-primary shadow-inner"
                  : "gloss-flat gloss-interactive text-foreground/80 hover:text-foreground",
              )}
            >
              <div className={cn("transition-all", isActive && "text-crimson-glow")}>{item.icon}</div>
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t-0 p-6 space-y-4">
        <div className="rounded-2xl gloss-card p-5">
          <p className="text-sm font-semibold text-foreground mb-3">AI Status</p>
          <div className="flex items-center gap-2">
            <div className="size-3 animate-pulse rounded-full bg-accent shadow-lg shadow-accent/50" />
            <p className="text-sm text-muted-foreground font-medium">xAI Connected</p>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs font-mono text-gold">Grok Protocol Active</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
