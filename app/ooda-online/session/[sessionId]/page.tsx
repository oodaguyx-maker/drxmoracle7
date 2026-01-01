"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"

type ChatMessage = {
  id: string
  sender_name: string
  sender_type: string
  content: string
  created_at: string
}

type ChatSession = {
  id: string
  host_name: string
  invite_code: string
  is_active: boolean
}

export default function OodaOnlineSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [message, setMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadSession()
    loadMessages()

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const loadSession = async () => {
    const { data } = await supabase.from("chat_sessions").select("*").eq("id", sessionId).single()

    if (data) {
      setSession(data)
    }
  }

  const loadMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })

    if (data) {
      setMessages(data)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !session) return

    const { error } = await supabase.from("chat_messages").insert({
      session_id: sessionId,
      sender_name: session.host_name,
      sender_type: "host",
      content: message.trim(),
    })

    if (error) {
      console.error("Error sending message:", error)
      return
    }

    setMessage("")
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push("/ooda-online")} className="mb-2">
            <ArrowLeft className="mr-2 size-4" />
            Back to Sessions
          </Button>
          <h1 className="text-2xl font-bold">{session.host_name}</h1>
          <p className="text-sm text-muted-foreground">Share the invite code with your partner</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Invite Code</p>
          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{session.invite_code}</code>
        </div>
      </div>

      <Card className="flex-1 flex flex-col h-[calc(100vh-16rem)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 space-y-4">
          <ScrollArea ref={scrollRef} className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === "host" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.sender_type === "host" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-xs font-medium mb-1">{msg.sender_name}</p>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!message.trim()}>
              <Send className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
