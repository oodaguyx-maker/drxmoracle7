"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProposedLoreCard } from "@/lib/storage"

interface LoreCardProps {
  card: ProposedLoreCard
  onAccept: (cardId: string) => void
  onReject: (cardId: string) => void
}

const importanceColors = {
  low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  medium: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  high: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
}

export function LoreCard({ card, onAccept, onReject }: LoreCardProps) {
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-lg leading-tight">{card.name}</CardTitle>
            {card.category && <CardDescription className="text-xs">{card.category}</CardDescription>}
          </div>
          <Badge className={`shrink-0 ${importanceColors[card.importance]}`}>{card.importance}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-primary/20 bg-muted/30 p-3">
          <p className="text-sm leading-relaxed text-foreground">{card.content}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {card.keys.map((key, idx) => (
            <Badge key={idx} variant="outline" className="bg-accent/10 text-xs">
              {key}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={() => onAccept(card.id)} size="sm" className="flex-1 bg-primary/90 hover:bg-primary">
            <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Accept
          </Button>
          <Button
            onClick={() => onReject(card.id)}
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
