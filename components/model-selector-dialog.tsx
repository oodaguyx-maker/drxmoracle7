"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"

interface Model {
  id: string
  name: string
  description: string
  pricing: {
    prompt: string
    completion: string
  }
  context_length: number
  isFree: boolean
}

interface ModelSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentModel: string
  onSelectModel: (modelId: string) => void
}

export function ModelSelectorDialog({ open, onOpenChange, currentModel, onSelectModel }: ModelSelectorDialogProps) {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadModels()
    }
  }, [open])

  const loadModels = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/openrouter-models")
      if (response.ok) {
        const data = await response.json()
        setModels(data.models || [])
      } else {
        // Fallback to default models if API fails
        setModels(getDefaultModels())
      }
    } catch (error) {
      console.error("[v0] Failed to load models:", error)
      setModels(getDefaultModels())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultModels = (): Model[] => [
    {
      id: "openai/gpt-4o-mini:free",
      name: "GPT-4o Mini (Free)",
      description: "Fast and efficient, perfect for most conversations",
      pricing: { prompt: "$0", completion: "$0" },
      context_length: 128000,
      isFree: true,
    },
    {
      id: "meta-llama/llama-3.2-3b-instruct:free",
      name: "Llama 3.2 3B (Free)",
      description: "Lightweight and fast open-source model",
      pricing: { prompt: "$0", completion: "$0" },
      context_length: 131072,
      isFree: true,
    },
    {
      id: "google/gemini-2.0-flash-exp:free",
      name: "Gemini 2.0 Flash (Free)",
      description: "Google's latest fast model with large context",
      pricing: { prompt: "$0", completion: "$0" },
      context_length: 1000000,
      isFree: true,
    },
    {
      id: "mistralai/mistral-7b-instruct:free",
      name: "Mistral 7B (Free)",
      description: "Efficient open-source model with good quality",
      pricing: { prompt: "$0", completion: "$0" },
      context_length: 32768,
      isFree: true,
    },
    {
      id: "openai/gpt-4o",
      name: "GPT-4o",
      description: "OpenAI's flagship model with excellent quality",
      pricing: { prompt: "$2.50/1M", completion: "$10.00/1M" },
      context_length: 128000,
      isFree: false,
    },
    {
      id: "anthropic/claude-3.5-sonnet",
      name: "Claude 3.5 Sonnet",
      description: "Anthropic's most capable model with nuanced responses",
      pricing: { prompt: "$3.00/1M", completion: "$15.00/1M" },
      context_length: 200000,
      isFree: false,
    },
    {
      id: "meta-llama/llama-3.1-70b-instruct",
      name: "Llama 3.1 70B",
      description: "Large open-source model with strong performance",
      pricing: { prompt: "$0.35/1M", completion: "$0.40/1M" },
      context_length: 131072,
      isFree: false,
    },
    {
      id: "google/gemini-pro-1.5",
      name: "Gemini Pro 1.5",
      description: "Google's pro model with massive context window",
      pricing: { prompt: "$1.25/1M", completion: "$5.00/1M" },
      context_length: 2000000,
      isFree: false,
    },
  ]

  const freeModels = models.filter((m) => m.isFree)
  const paidModels = models.filter((m) => !m.isFree)

  const handleSelect = (modelId: string) => {
    onSelectModel(modelId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select AI Model</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading models...</div>
            ) : (
              <>
                {freeModels.length > 0 && (
                  <div>
                    <Label className="text-lg font-semibold mb-3 flex items-center gap-2">
                      Free Models
                      <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                        No Cost
                      </Badge>
                    </Label>
                    <div className="space-y-2">
                      {freeModels.map((model) => (
                        <Card
                          key={model.id}
                          className={`p-4 cursor-pointer transition-all hover:border-primary ${
                            currentModel === model.id ? "border-primary bg-primary/5" : ""
                          }`}
                          onClick={() => handleSelect(model.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{model.name}</h4>
                                {currentModel === model.id && <Check className="h-4 w-4 text-primary" />}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{model.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Context: {(model.context_length / 1000).toFixed(0)}k tokens</span>
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Free
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {paidModels.length > 0 && (
                  <div>
                    <Label className="text-lg font-semibold mb-3 flex items-center gap-2">
                      Premium Models
                      <Badge variant="secondary">Paid</Badge>
                    </Label>
                    <div className="space-y-2">
                      {paidModels.map((model) => (
                        <Card
                          key={model.id}
                          className={`p-4 cursor-pointer transition-all hover:border-primary ${
                            currentModel === model.id ? "border-primary bg-primary/5" : ""
                          }`}
                          onClick={() => handleSelect(model.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{model.name}</h4>
                                {currentModel === model.id && <Check className="h-4 w-4 text-primary" />}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{model.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Context: {(model.context_length / 1000).toFixed(0)}k tokens</span>
                                <span>
                                  Input: {model.pricing.prompt} | Output: {model.pricing.completion}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
