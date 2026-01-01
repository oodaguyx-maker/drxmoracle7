"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Sparkles, Zap, ImageIcon, Eye, Users, BookOpen } from "lucide-react"
import { getSettings, saveSettings, type AppSettings } from "@/lib/storage"
import { AI_MODELS } from "@/lib/ai-providers"
import { InstallPWAButton } from "@/components/install-pwa-button"

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<AppSettings>({
    apiKeys: {},
    defaultModel: "xai/grok-4.1", // Updated default model to Grok 4.1
    temperature: 0.8,
    maxTokens: 2000,
    globalSystemPrompt: "",
    favoriteTags: [],
  })
  const [showApiKeys, setShowApiKeys] = useState({
    xai: false,
    openrouter: false,
    groq: false,
    gemini: false,
  })
  const [isSaved, setIsSaved] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    const loadedSettings = getSettings()
    setSettings(loadedSettings)
  }, [])

  useEffect(() => {
    const currentSaved = getSettings()
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(currentSaved)
    setHasUnsavedChanges(hasChanges)
  }, [settings])

  const handleSave = () => {
    saveSettings(settings)
    setIsSaved(true)
    setHasUnsavedChanges(false)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const addTag = () => {
    if (newTag.trim() && !settings.favoriteTags?.includes(newTag.trim())) {
      setSettings({
        ...settings,
        favoriteTags: [...(settings.favoriteTags || []), newTag.trim()],
      })
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setSettings({
      ...settings,
      favoriteTags: settings.favoriteTags?.filter((t) => t !== tag) || [],
    })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div className="flex items-center gap-2">
        <Button onClick={() => router.push("/dashboard")} variant="ghost" size="sm" className="gap-1">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gloss">Settings</h1>
        <p className="text-muted-foreground">Configure your Dreamweaver Oracle Engine preferences</p>
      </div>

      {hasUnsavedChanges && (
        <Card className="border-yellow-500/50 bg-yellow-500/10 gloss-card">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-yellow-500">
              <Sparkles className="size-5" />
              <span className="font-medium">You have unsaved changes</span>
            </div>
            <Button onClick={handleSave} className="gap-2 gloss-interactive">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings">Configuration</TabsTrigger>
          <TabsTrigger value="overview">Feature Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="size-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Install as App
              </CardTitle>
              <CardDescription>
                Install Dreamweaver Oracle Engine for offline access and faster performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Install the app on your device to use it offline, get faster loading times, and enjoy a native app
                    experience. Works on desktop and mobile devices.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>Access your characters and stories offline</li>
                    <li>Faster loading with cached resources</li>
                    <li>Native app experience with no browser UI</li>
                    <li>Receive notifications for updates</li>
                  </ul>
                </div>
                <InstallPWAButton />
              </div>
            </CardContent>
          </Card>

          <Card className="gloss-card border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-platinum">
                <Zap className="size-5 text-primary" />
                API Configuration
              </CardTitle>
              <CardDescription>Manage your AI provider API keys (Priority: xAI → OpenRouter → Groq)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* xAI (Primary) */}
              <div className="space-y-2">
                <Label htmlFor="xai" className="flex items-center gap-2">
                  <span className="text-primary">★</span> xAI API Key (Primary)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="xai"
                    type={showApiKeys.xai ? "text" : "password"}
                    value={settings.apiKeys.xai || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        apiKeys: { ...settings.apiKeys, xai: e.target.value || undefined },
                      })
                    }
                    placeholder="xai-..."
                    className="font-mono text-sm gloss-flat"
                  />
                  <Button
                    onClick={() => setShowApiKeys({ ...showApiKeys, xai: !showApiKeys.xai })}
                    variant="outline"
                    size="icon"
                    className="gloss-interactive"
                  >
                    <Eye className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://x.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    x.ai
                  </a>
                  . Grok models with wit and reasoning.
                </p>
              </div>

              {/* OpenRouter (Secondary) */}
              <div className="space-y-2">
                <Label htmlFor="openrouter">OpenRouter API Key (Secondary)</Label>
                <div className="flex gap-2">
                  <Input
                    id="openrouter"
                    type={showApiKeys.openrouter ? "text" : "password"}
                    value={settings.apiKeys.openRouter || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        apiKeys: { ...settings.apiKeys, openRouter: e.target.value || undefined },
                      })
                    }
                    placeholder="sk-or-v1-..."
                    className="font-mono text-sm gloss-flat"
                  />
                  <Button
                    onClick={() => setShowApiKeys({ ...showApiKeys, openrouter: !showApiKeys.openrouter })}
                    variant="outline"
                    size="icon"
                    className="gloss-interactive"
                  >
                    <Eye className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    openrouter.ai/keys
                  </a>
                  . Access to 100+ models.
                </p>
              </div>

              {/* Groq (Tertiary) */}
              <div className="space-y-2">
                <Label htmlFor="groq">Groq API Key (Tertiary)</Label>
                <div className="flex gap-2">
                  <Input
                    id="groq"
                    type={showApiKeys.groq ? "text" : "password"}
                    value={settings.apiKeys.groq || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        apiKeys: { ...settings.apiKeys, groq: e.target.value || undefined },
                      })
                    }
                    placeholder="gsk_..."
                    className="font-mono text-sm gloss-flat"
                  />
                  <Button
                    onClick={() => setShowApiKeys({ ...showApiKeys, groq: !showApiKeys.groq })}
                    variant="outline"
                    size="icon"
                    className="gloss-interactive"
                  >
                    <Eye className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://console.groq.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    console.groq.com
                  </a>
                  . Ultra-fast inference.
                </p>
              </div>

              {/* Gemini (Loreworld Only) */}
              <div className="space-y-2">
                <Label htmlFor="gemini" className="flex items-center gap-2">
                  Gemini API Key{" "}
                  <Badge variant="secondary" className="text-xs">
                    Loreworld Only
                  </Badge>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="gemini"
                    type={showApiKeys.gemini ? "text" : "password"}
                    value={settings.apiKeys.gemini || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        apiKeys: { ...settings.apiKeys, gemini: e.target.value || undefined },
                      })
                    }
                    placeholder="AIza..."
                    className="font-mono text-sm gloss-flat"
                  />
                  <Button
                    onClick={() => setShowApiKeys({ ...showApiKeys, gemini: !showApiKeys.gemini })}
                    variant="outline"
                    size="icon"
                    className="gloss-interactive"
                  >
                    <Eye className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google AI Studio
                  </a>
                  . Used exclusively in Loreworld.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 gloss-card">
            <CardHeader>
              <CardTitle className="text-platinum">System Prompts</CardTitle>
              <CardDescription>Configure global prompts for roleplay</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="globalSystemPrompt">Global System Prompt</Label>
                <Textarea
                  id="globalSystemPrompt"
                  value={settings.globalSystemPrompt || ""}
                  onChange={(e) => setSettings({ ...settings, globalSystemPrompt: e.target.value })}
                  placeholder="Define the personality, behavior, or knowledge base for AI responses across all characters"
                  className="min-h-[100px] font-mono text-sm gloss-flat"
                />
                <p className="text-xs text-muted-foreground">Applied to all AI conversations as a base instruction</p>
              </div>
            </CardContent>
          </Card>

          <Card className="gloss-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-platinum">Model Preferences</CardTitle>
              <CardDescription>Choose your default AI model and generation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultModel">Default Model</Label>
                <Select
                  value={settings.defaultModel}
                  onValueChange={(value) => setSettings({ ...settings, defaultModel: value })}
                >
                  <SelectTrigger id="defaultModel" className="gloss-flat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="gloss-card">
                    {AI_MODELS.map((model) => (
                      <SelectItem
                        key={model.id}
                        value={model.id}
                        disabled={model.requiresApiKey && !settings.apiKeys[model.provider]}
                      >
                        {model.name} {model.provider === "xai" && <span className="text-primary">★</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature: {settings.temperature}</Label>
                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: Number.parseFloat(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Controls randomness. Lower is more focused, higher is more creative (recommended: 0.8)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="100"
                  max="4000"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings({ ...settings, maxTokens: Number.parseInt(e.target.value) })}
                  className="gloss-flat"
                />
                <p className="text-xs text-muted-foreground">Maximum length of AI responses (100-4000)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 gloss-card">
            <CardHeader>
              <CardTitle className="text-platinum">Favorite Tags</CardTitle>
              <CardDescription>Tags used for generating NPC avatars in HeartFire mode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newTag">Add Tag</Label>
                <div className="flex gap-2">
                  <Input
                    id="newTag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                    placeholder="e.g., anime, fantasy, cyberpunk"
                    className="gloss-flat"
                  />
                  <Button onClick={addTag} variant="secondary" className="gloss-interactive">
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {settings.favoriteTags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 gloss-interactive">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive transition-colors"
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {(!settings.favoriteTags || settings.favoriteTags.length === 0) && (
                  <p className="text-sm text-muted-foreground">No favorite tags added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="gloss-card">
            <CardHeader>
              <CardTitle className="text-platinum">About</CardTitle>
              <CardDescription>Dreamweaver Oracle Engine information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Version:</strong> 1.0.0
              </p>
              <p>
                <strong>Content:</strong> Uncensored NSFW/Adult Roleplay
              </p>
              <p>
                <strong>Supported Formats:</strong> ChubAI, SillyTavern JSON
              </p>
              <p>
                <strong>Available Models:</strong> Grok 2, DeepSeek v3, Mistral Large, ChatGPT 4o Mini
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 gloss-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Sparkles className="size-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Welcome to Dreamweaver Oracle Engine</CardTitle>
                  <CardDescription className="text-base">
                    Your complete AI-powered roleplay and creative storytelling platform
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Core Roleplay Features */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Core Roleplay Features
                </h3>
                <div className="grid gap-3">
                  <Card className="border-primary/10 gloss-card">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded bg-primary/10 shrink-0">
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold">Characters</h4>
                          <p className="text-sm text-muted-foreground">
                            Create, import, and manage AI characters with detailed profiles, attributes, and memories.
                            Supports ChubAI and SillyTavern JSON formats. Add custom galleries with images and embedded
                            videos.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/10 gloss-card">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded bg-primary/10 shrink-0">
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13M3 6.253C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                          </svg>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold">Conversations</h4>
                          <p className="text-sm text-muted-foreground">
                            Engage in dynamic roleplay with AI characters, maintaining context and personality across
                            long-form interactions. Supports custom prompts and fine-tuning for specific narrative
                            styles.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/10 gloss-card">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded bg-primary/10 shrink-0">
                          <Zap className="size-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold">Image Generation</h4>
                          <p className="text-sm text-muted-foreground">
                            Generate stunning visuals based on text prompts, with support for various art styles and
                            parameters. Integrates with leading AI image models.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/10 gloss-card">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded bg-primary/10 shrink-0">
                          <ImageIcon className="size-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold">Avatar Creation</h4>
                          <p className="text-sm text-muted-foreground">
                            Design unique character avatars using a combination of AI generation and custom tag
                            selection, perfect for game development or personal projects.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Advanced Features */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-accent flex items-center gap-2">
                  <Eye className="size-5 text-accent" />
                  Advanced Features
                </h3>
                <div className="grid gap-3">
                  <Card className="border-accent/10 gloss-card">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded bg-accent/10 shrink-0">
                          <Eye className="size-4 text-accent" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold">Real-time Interaction</h4>
                          <p className="text-sm text-muted-foreground">
                            Experience fluid and responsive AI interactions with low latency and dynamic dialogue
                            generation.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-accent/10 gloss-card">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded bg-accent/10 shrink-0">
                          <Users className="size-4 text-accent" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold">Multi-character Simulation</h4>
                          <p className="text-sm text-muted-foreground">
                            Simulate complex scenarios with multiple AI characters interacting with each other and the
                            user.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-accent/10 gloss-card">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded bg-accent/10 shrink-0">
                          <BookOpen className="size-4 text-accent" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold">Lore & Worldbuilding Tools</h4>
                          <p className="text-sm text-muted-foreground">
                            Develop rich narratives and detailed worlds with integrated tools for managing lore,
                            timelines, and character backstories.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 z-10 mt-8 flex items-center justify-between rounded-lg border bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60 gloss-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {hasUnsavedChanges ? (
            <>
              <span className="size-2 rounded-full bg-yellow-500 animate-pulse" />
              Unsaved changes
            </>
          ) : (
            <>
              <span className="size-2 rounded-full bg-green-500" />
              All changes saved
            </>
          )}
        </div>
        <Button onClick={handleSave} size="lg" disabled={!hasUnsavedChanges} className="gloss-interactive">
          {isSaved ? (
            <>
              <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  )
}
