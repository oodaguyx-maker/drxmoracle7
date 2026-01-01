"use client"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Settings, ChevronDown } from "lucide-react"
import Link from "next/link"

export function UserProfileDropdown() {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 gloss-flat gloss-interactive h-auto py-2 px-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full gloss-flat flex items-center justify-center">
              <User className="size-4 text-primary" />
            </div>
            <div className="hidden text-left lg:block">
              <p className="text-sm font-semibold text-foreground leading-none mb-1">{user.displayName || "User"}</p>
              <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
            </div>
            <ChevronDown className="size-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 gloss-card border-primary/20">
        <div className="px-3 py-2">
          <p className="text-sm font-semibold text-foreground">{user.displayName || "User"}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer gloss-interactive">
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="size-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive gloss-interactive">
          <LogOut className="size-4 mr-2" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
