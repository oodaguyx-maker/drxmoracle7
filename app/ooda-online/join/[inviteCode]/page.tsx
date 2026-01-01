"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type ChatSession = {
  id: string
  host_name: string
  invite_code: string
  is_active: boolean
}

export default function JoinSessionPage() {
  const params = useParams()
  const router = useRouter()
  const inviteCode = params.inviteCode as string
  const [guestName, setGuestName] = useState("")
  const [session, setSession] = useState<ChatSession | null>(null)
  const [error, setError] = useState("")
  const supabase = createClient()

  useEffect(() => {
    loadSession()
  }, [inviteCode])

  const loadSession = async () => {
    const { data } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("invite_code", inviteCode)
      .eq("is_active", true)
      .single()

    if (data) {
      setSession(data)
    } else {
      setError("Invalid or expired invite code")
    }
  }

  const joinSession = () => {
    if (!guestName.trim() || !session) return

    router.push(`/ooda-online/guest/${session.id}?name=${encodeURIComponent(guestName)}`)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invite</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="size-8 text-primary" />
          </div>
          <CardTitle>Join OodaOnline Session</CardTitle>
          <CardDescription>You've been invited to join "{session.host_name}"</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Your Display Name</Label>
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter your name"
              onKeyDown={(e) => e.key === "Enter" && joinSession()}
            />
          </div>
          <Button onClick={joinSession} className="w-full" disabled={!guestName.trim()}>
            Join Session
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            This invite link will expire once you leave the session
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
