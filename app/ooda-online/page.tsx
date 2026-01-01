"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getOodaProfiles, type OodaProfile } from "@/lib/storage"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, ExternalLink, Copy, Check, Users, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"

type ChatSession = {
  id: string
  host_name: string
  invite_code: string
  is_active: boolean
  created_at: string
  message_count?: number
}

export default function OodaOnlinePage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [profiles, setProfiles] = useState<OodaProfile[]>([])
  const [newSessionName, setNewSessionName] = useState("")
  const [flistUrl, setFlistUrl] = useState("")
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [isImportingProfile, setIsImportingProfile] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)

  useEffect(() => {
    const client = createClient()
    setSupabase(client)
  }, [])

  useEffect(() => {
    if (supabase) {
      loadData()
    }
  }, [supabase])

  const loadData = async () => {
    if (!supabase) return

    const { data: sessionsData } = await supabase
      .from("chat_sessions")
      .select("*, chat_messages(count)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (sessionsData) {
      const formattedSessions = sessionsData.map((s: any) => ({
        id: s.id,
        host_name: s.host_name,
        invite_code: s.invite_code,
        is_active: s.is_active,
        created_at: s.created_at,
        message_count: s.chat_messages?.[0]?.count || 0,
      }))
      setSessions(formattedSessions)
    }

    setProfiles(getOodaProfiles())
  }

  const createSession = async () => {
    if (!supabase || !newSessionName.trim()) return

    const inviteCode = generateInviteCode()

    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({
        host_name: newSessionName,
        invite_code: inviteCode,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating session:", error)
      alert("Failed to create session. Please try again.")
      return
    }

    setNewSessionName("")
    setIsCreatingSession(false)
    loadData()
  }

  const generateInviteCode = (): string => {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  const copyInviteLink = (session: ChatSession) => {
    const link = `${window.location.origin}/ooda-online/join/${session.invite_code}`
    navigator.clipboard.writeText(link)
    setCopiedCode(session.invite_code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const deleteSession = async (id: string) => {
    if (!supabase) return

    const { error } = await supabase.from("chat_sessions").delete().eq("id", id)

    if (error) {
      console.error("Error deleting session:", error)
      return
    }

    loadData()
  }

  const importFlistProfile = async () => {
    if (!flistUrl.trim()) return

    setIsImportingProfile(true)
    try {
      const match = flistUrl.match(/f-list\.net\/c\/([\w-]+)/)
      if (!match) {
        alert("Invalid F-List URL format")
        return
      }

      const characterName = match[1]
      const response = await fetch(`/api/import-flist?character=${characterName}`)
      const data = await response.json()

      if (data.error) {
        alert(`Error: ${data.error}`)
        return
      }

      sessionStorage.setItem("flist-import-preview", JSON.stringify(data.profile))
      router.push("/ooda-online/preview-profile")
    } catch (error) {
      console.error("Error importing F-List profile:", error)
      alert("Failed to import profile. Please try again.")
    } finally {
      setIsImportingProfile(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">OodaOnline</h1>
          <p className="text-muted-foreground">P2P roleplay with shareable invite links</p>
        </div>
      </div>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">
            <MessageSquare className="mr-2 size-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="profiles">
            <Users className="mr-2 size-4" />
            Profiles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Session</CardTitle>
              <CardDescription>Start a P2P roleplay session with a shareable invite link</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isCreatingSession} onOpenChange={setIsCreatingSession}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <MessageSquare className="mr-2 size-4" />
                    Create New Session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Session</DialogTitle>
                    <DialogDescription>Give your session a name to get started</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Session Name</Label>
                      <Input
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                        placeholder="e.g., Fantasy Adventure"
                      />
                    </div>
                    <Button onClick={createSession} className="w-full" disabled={!newSessionName.trim()}>
                      Create Session
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {sessions.map((session) => (
              <Card key={session.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{session.host_name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSession(session.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>Active Session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-3">
                    <p className="text-xs font-medium text-primary mb-2">Shareable Invite Link</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-background px-3 py-2 text-xs font-mono break-all">
                        {typeof window !== "undefined" &&
                          `${window.location.origin}/ooda-online/join/${session.invite_code}`}
                      </code>
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => copyInviteLink(session)}
                        className="shrink-0"
                      >
                        {copiedCode === session.invite_code ? (
                          <Check className="size-4" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Copy this link and share it with anyone you want to chat with
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => router.push(`/ooda-online/session/${session.id}`)} className="flex-1">
                      <ExternalLink className="mr-2 size-4" />
                      Enter Session
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Messages: {session.message_count} • Created {new Date(session.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}

            {sessions.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No sessions yet. Create one to get started!
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import F-List Profile</CardTitle>
              <CardDescription>Import a character profile from F-List and convert it to an OodaProfile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>F-List Character URL</Label>
                <Input
                  value={flistUrl}
                  onChange={(e) => setFlistUrl(e.target.value)}
                  placeholder="https://www.f-list.net/c/character-name"
                />
              </div>
              <Button onClick={importFlistProfile} className="w-full" disabled={!flistUrl.trim() || isImportingProfile}>
                {isImportingProfile ? "Importing..." : "Import Profile"}
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {profiles.map((profile) => (
              <Card key={profile.id}>
                <CardHeader>
                  <CardTitle>{profile.name}</CardTitle>
                  {profile.flistUrl && (
                    <CardDescription className="flex items-center gap-1">
                      <ExternalLink className="size-3" />
                      Imported from F-List
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.avatar && (
                    <img
                      src={profile.avatar || "/placeholder.svg"}
                      alt={profile.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  {profile.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{profile.description}</p>
                  )}
                  {profile.kinks && profile.kinks.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Kinks ({profile.kinks.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.kinks.slice(0, 5).map((kink, idx) => (
                          <span key={idx} className="text-xs bg-muted px-2 py-0.5 rounded">
                            {kink}
                          </span>
                        ))}
                        {profile.kinks.length > 5 && (
                          <span className="text-xs text-muted-foreground">+{profile.kinks.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={() => router.push(`/ooda-online/profile/${profile.id}`)}
                    variant="outline"
                    className="w-full"
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}

            {profiles.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No profiles yet. Import from F-List to get started!
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
