"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OracleViewer } from "@/components/oracle-viewer"
import { LoreDexViewer } from "@/components/loredex-viewer"
import { CharacterExportDialog } from "@/components/character-export-dialog"
import {
  getCharacter,
  getNodes,
  deleteNode,
  generateId,
  saveNode,
  getScenarioTemplates,
  setActiveSoul,
  getActiveSoul,
  addSoulToCharacter,
  deleteSoul,
  type Character,
  type ChatNode,
  type ScenarioTemplate,
} from "@/lib/storage"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Sparkles, Trash2, Download } from "lucide-react"
import { toast } from "sonner"

export default function CharacterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const characterId = params.id as string

  const [character, setCharacter] = useState<Character | null>(null)
  const [nodes, setNodes] = useState<ChatNode[]>([])
  const [editingNode, setEditingNode] = useState<ChatNode | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [showGallery, setShowGallery] = useState(false)
  const [viewerMedia, setViewerMedia] = useState<{ url: string; type: "image" | "video" | "embed" } | null>(null)
  const [showLoreDex, setShowLoreDex] = useState(false)
  const [showScenarioDialog, setShowScenarioDialog] = useState(false)
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("default")
  const [availableScenarios, setAvailableScenarios] = useState<ScenarioTemplate[]>([])
  const [showExportDialog, setShowExportDialog] = useState(false)

  const [activeSoul, setActiveSoulState] = useState<any | null>(null)
  const [showSoulDialog, setShowSoulDialog] = useState(false)
  const [showSoulUploadDialog, setShowSoulUploadDialog] = useState(false)
  const [newSoulData, setNewSoulData] = useState({
    name: "",
    description: "",
    genre: "",
    personality: "",
    scenario: "",
    first_mes: "",
  })
  const [uploadedSoulFile, setUploadedSoulFile] = useState<File | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (isInitialized) return

    const char = getCharacter(characterId)

    if (!char) {
      console.log("[v0] Character not found, redirecting to characters list")
      router.push("/characters")
      return
    }

    setCharacter(char)

    setIsInitialized(true)
  }, [characterId, router, isInitialized])

  useEffect(() => {
    if (!character) return

    const characterNodes = getNodes(characterId)
    setNodes(characterNodes)

    const soul = getActiveSoul(character)
    setActiveSoulState(soul)

    const scenarios = getScenarioTemplates()
    setAvailableScenarios(scenarios)

    loadGalleryItems()
  }, [character, characterId])

  const loadAvailableScenarios = (char: Character) => {
    const allScenarios = getScenarioTemplates()
    const filtered = allScenarios.filter(
      (s) => !s.characterIds || s.characterIds.length === 0 || s.characterIds.includes(char.id),
    )
    setAvailableScenarios(filtered)
  }

  const handleCreateNode = () => {
    if (!character) return
    setSelectedScenarioId("default")
    setShowScenarioDialog(true)
  }

  const createNodeWithScenario = () => {
    if (!character) return

    const firstMessage = activeSoul?.first_mes || character.first_mes || "Hello!"

    const newNode: ChatNode = {
      id: generateId(),
      characterId: character.id,
      soulId: activeSoul?.id,
      name: `Chat ${nodes.length + 1}`,
      title: `Conversation ${nodes.length + 1}`,
      scenarioId: selectedScenarioId === "default" ? undefined : selectedScenarioId,
      messages: [
        {
          id: generateId(),
          role: "assistant",
          content: firstMessage,
          timestamp: Date.now(),
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    saveNode(newNode)
    setShowScenarioDialog(false)

    setTimeout(() => {
      router.push(`/chat/${character.id}/${newNode.id}`)
    }, 100)
  }

  const handleContinue = (nodeId: string) => {
    router.push(`/chat/${characterId}/${nodeId}`)
  }

  const handleDeleteNode = (nodeId: string) => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteNode(nodeId)
      setNodes(getNodes(characterId))
    }
  }

  const handleEditNodeTitle = (node: ChatNode) => {
    setEditingNode(node)
    setEditTitle(node.title || node.name)
  }

  const handleSaveNodeTitle = () => {
    if (editingNode) {
      const updated = { ...editingNode, title: editTitle, updatedAt: Date.now() }
      saveNode(updated)
      setNodes(getNodes(characterId))
      setEditingNode(null)
    }
  }

  const openMediaViewer = (url: string, type: "image" | "video" | "embed") => {
    setViewerMedia({ url, type })
    setShowGallery(false)
  }

  const handleSoulSelect = (soulId: string) => {
    if (!character) return

    if (soulId === "default") {
      setActiveSoul(character.id, undefined)
      setActiveSoulState(null)
    } else {
      setActiveSoul(character.id, soulId)
      const soul = character.souls?.find((s) => s.id === soulId)
      setActiveSoulState(soul || null)
    }

    const updatedChar = getCharacter(characterId)
    setCharacter(updatedChar)
    toast.success(`Switched to ${soulId === "default" ? "default edition" : "soul"}`)
  }

  const handleCreateSoul = () => {
    if (!character) return

    if (!newSoulData.name || !newSoulData.genre) {
      toast.error("Please provide at least a name and genre")
      return
    }

    addSoulToCharacter(character.id, newSoulData)

    const updatedChar = getCharacter(characterId)
    setCharacter(updatedChar)

    setShowSoulDialog(false)
    setNewSoulData({
      name: "",
      description: "",
      genre: "",
      personality: "",
      scenario: "",
      first_mes: "",
    })

    toast.success(`Created new soul: ${newSoulData.name}`)
  }

  const handleUploadSoulJSON = async () => {
    if (!character || !uploadedSoulFile) return

    try {
      const text = await uploadedSoulFile.text()
      const parsed = JSON.parse(text)

      const soulData = {
        name: parsed.name || parsed.data?.name || "Imported Soul",
        description: parsed.description || parsed.data?.description || "",
        genre: parsed.genre || "Custom",
        personality: parsed.personality || parsed.data?.personality || "",
        scenario: parsed.scenario || parsed.data?.scenario || "",
        first_mes: parsed.first_mes || parsed.data?.first_mes || "",
        mes_example: parsed.mes_example || parsed.data?.mes_example || "",
        tags: parsed.data?.tags || parsed.tags || [],
        configData: parsed,
      }

      addSoulToCharacter(character.id, soulData)

      const updatedChar = getCharacter(characterId)
      setCharacter(updatedChar)

      setShowSoulUploadDialog(false)
      setUploadedSoulFile(null)

      toast.success(`Imported soul: ${soulData.name}`)
    } catch (error) {
      toast.error("Invalid JSON file. Please check your file format")
      console.error("[v0] Soul import error:", error)
    }
  }

  const handleDeleteSoul = (soulId: string) => {
    if (!character) return

    if (confirm("Are you sure you want to delete this soul? All associated nodes will be deleted.")) {
      deleteSoul(character.id, soulId)
      const updatedChar = getCharacter(characterId)
      setCharacter(updatedChar)
      setActiveSoulState(null)
      toast.success("Soul deleted")
    }
  }

  const displayName = activeSoul?.name || character?.name || ""
  const displayDescription = activeSoul?.description || character?.description || ""
  const displayAvatar = activeSoul?.avatar || character?.avatar
  const displayGallery = activeSoul?.gallery || character?.gallery || []
  const displayPersonality = activeSoul?.personality || character?.personality
  const displayScenario = activeSoul?.scenario || character?.scenario

  const galleryItems = displayGallery
    .filter((url: any) => typeof url === "string" && url.trim())
    .map((url: string) => ({
      url,
      type: url.includes(".mp4") || url.includes(".webm") ? ("video" as const) : ("image" as const),
    }))

  const loadGalleryItems = () => {
    const items = displayGallery
      .filter((url: any) => typeof url === "string" && url.trim())
      .map((url: string) => ({
        url,
        type: url.includes(".mp4") || url.includes(".webm") ? "video" : "image",
      }))
    setViewerMedia(items.length > 0 ? items[0] : null)
  }

  if (!character) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => router.push("/characters")} variant="ghost" size="sm">
          <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Characters
        </Button>

        <Button onClick={() => setShowExportDialog(true)} variant="outline" size="sm" className="gap-2">
          <Download className="size-4" />
          Export
        </Button>
      </div>

      {character.souls && character.souls.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-5 text-accent" />
                  OracleSouls - Character Editions
                </CardTitle>
                <CardDescription>Select which version of {character.name} to interact with</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowSoulUploadDialog(true)} variant="outline" size="sm" className="gap-2">
                  <Upload className="size-4" />
                  Import JSON
                </Button>
                <Button onClick={() => setShowSoulDialog(true)} size="sm" className="gap-2">
                  <Sparkles className="size-4" />
                  Create Soul
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeSoul?.id || "default"} onValueChange={handleSoulSelect} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="default" className="gap-2">
                  <Badge variant="outline">Default</Badge>
                  Original
                </TabsTrigger>
                {character.souls.map((soul) => (
                  <TabsTrigger key={soul.id} value={soul.id} className="gap-2">
                    <Badge variant="secondary">{soul.genre}</Badge>
                    {soul.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {activeSoul && (
              <div className="mt-4 flex items-start gap-4 rounded-lg border p-4">
                <Avatar className="size-16">
                  <AvatarImage src={displayAvatar || "/placeholder.svg"} />
                  <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{displayName}</h3>
                      <Badge variant="default" className="mt-1">
                        {activeSoul.genre}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => handleDeleteSoul(activeSoul.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{displayDescription}</p>
                  {displayGallery.length > 0 && (
                    <div className="flex gap-2">
                      <Badge variant="outline">{displayGallery.length} images</Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(!character.souls || character.souls.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="mb-4 size-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Create Your First OracleSoul</h3>
            <p className="mb-4 text-sm text-muted-foreground max-w-md">
              Add multiple editions of {character.name} with different settings, genres, and personalities. Each soul
              has its own gallery, nodes, and configs.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setShowSoulDialog(true)} className="gap-2">
                <Sparkles className="size-4" />
                Create Soul
              </Button>
              <Button onClick={() => setShowSoulUploadDialog(true)} variant="outline" className="gap-2">
                <Upload className="size-4" />
                Import JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="size-20">
              <AvatarImage src={displayAvatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <CardTitle className="text-2xl">{displayName}</CardTitle>
              <CardDescription className="text-base">{displayDescription}</CardDescription>
            </div>
            <div className="flex gap-2">
              {character.attachedLorebooks && character.attachedLorebooks.length > 0 && (
                <Button onClick={() => setShowLoreDex(true)} variant="outline" size="sm" className="gap-2">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 16.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  LoreDex ({character.attachedLorebooks.length})
                </Button>
              )}
              {displayGallery.length > 0 && (
                <Button onClick={() => setShowGallery(true)} variant="outline" size="sm">
                  <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Gallery ({displayGallery.length})
                </Button>
              )}
              <Button onClick={() => router.push(`/characters/${character.id}/edit`)} variant="outline">
                Edit Character
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayPersonality && (
            <div>
              <h3 className="mb-1 text-sm font-medium">Personality</h3>
              <p className="text-sm text-muted-foreground">{displayPersonality}</p>
            </div>
          )}
          {displayScenario && (
            <div>
              <h3 className="mb-1 text-sm font-medium">Scenario</h3>
              <p className="text-sm text-muted-foreground">{displayScenario}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Conversation Nodes{" "}
            {activeSoul && <span className="text-muted-foreground text-lg">({activeSoul.name})</span>}
          </h2>
          <Button onClick={handleCreateNode}>
            <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Node
          </Button>
        </div>

        {nodes.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[200px] flex-col items-center justify-center text-center">
              <svg className="mb-4 size-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h3 className="mb-2 text-lg font-semibold">No conversations yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Create a new conversation node to start chatting with {displayName}
              </p>
              <Button onClick={handleCreateNode}>Create First Node</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {nodes.map((node) => (
              <Card key={node.id} className="group transition-colors hover:bg-muted/50">
                <CardHeader
                  className="cursor-pointer pb-3"
                  onClick={() => router.push(`/chat/${character.id}/${node.id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base flex-1">{node.title || node.name}</CardTitle>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditNodeTitle(node)
                        }}
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0"
                      >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNode(node.id)
                        }}
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {node.messages.length} messages - {new Date(node.updatedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="cursor-pointer" onClick={() => router.push(`/chat/${character.id}/${node.id}`)}>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {node.messages[node.messages.length - 1]?.content || "No messages yet"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Scenario Selection Dialog */}
      <Dialog open={showScenarioDialog} onOpenChange={setShowScenarioDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Scenario</DialogTitle>
            <DialogDescription>Choose a scenario template for this conversation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedScenarioId} onValueChange={setSelectedScenarioId}>
              <SelectTrigger>
                <SelectValue placeholder="Select scenario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (No scenario)</SelectItem>
                {availableScenarios.map((scenario) => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={createNodeWithScenario} className="w-full">
              Create Conversation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Node Title Dialog */}
      <Dialog open={!!editingNode} onOpenChange={() => setEditingNode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Node Title</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Enter title" />
            <Button onClick={handleSaveNodeTitle} className="w-full">
              Save Title
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Soul Dialog */}
      <Dialog open={showSoulDialog} onOpenChange={setShowSoulDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create OracleSoul</DialogTitle>
            <DialogDescription>
              Create a new edition of {character.name} with different setting, personality, and gallery
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={newSoulData.name}
                  onChange={(e) => setNewSoulData({ ...newSoulData, name: e.target.value })}
                  placeholder="e.g., Medieval Queen"
                />
              </div>
              <div>
                <Label>Genre</Label>
                <Input
                  value={newSoulData.genre}
                  onChange={(e) => setNewSoulData({ ...newSoulData, genre: e.target.value })}
                  placeholder="e.g., Fantasy, Sci-Fi"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newSoulData.description}
                onChange={(e) => setNewSoulData({ ...newSoulData, description: e.target.value })}
                placeholder="Describe this edition..."
              />
            </div>
            <div>
              <Label>Personality (Optional)</Label>
              <Textarea
                value={newSoulData.personality}
                onChange={(e) => setNewSoulData({ ...newSoulData, personality: e.target.value })}
                placeholder="Leave blank to use character's default personality..."
              />
            </div>
            <div>
              <Label>Scenario (Optional)</Label>
              <Textarea
                value={newSoulData.scenario}
                onChange={(e) => setNewSoulData({ ...newSoulData, scenario: e.target.value })}
                placeholder="Leave blank to use character's default scenario..."
              />
            </div>
            <div>
              <Label>First Message (Optional)</Label>
              <Textarea
                value={newSoulData.first_mes}
                onChange={(e) => setNewSoulData({ ...newSoulData, first_mes: e.target.value })}
                placeholder="Leave blank to use character's default greeting..."
              />
            </div>
            <Button onClick={handleCreateSoul} className="w-full">
              Create Soul
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Soul Dialog */}
      <Dialog open={showSoulUploadDialog} onOpenChange={setShowSoulUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import OracleSoul</DialogTitle>
            <DialogDescription>Upload a character JSON file to create a new OracleSoul edition</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Character JSON File</Label>
              <Input type="file" accept=".json" onChange={(e) => setUploadedSoulFile(e.target.files?.[0] || null)} />
            </div>
            <Button onClick={handleUploadSoulJSON} disabled={!uploadedSoulFile} className="w-full">
              Import Soul
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gallery Viewer */}
      {showGallery && (
        <OracleViewer
          media={displayGallery
            .filter((url: any) => typeof url === "string" && url.trim())
            .map((url: string) => ({
              url,
              type: url.includes(".mp4") || url.includes(".webm") ? "video" : "image",
            }))}
          onClose={() => setShowGallery(false)}
          title={`${displayName}'s Gallery`}
        />
      )}

      {/* Media Viewer */}
      {viewerMedia && <OracleViewer media={[viewerMedia]} onClose={() => setViewerMedia(null)} title="Media Viewer" />}

      {/* LoreDex Viewer */}
      {showLoreDex && character.attachedLorebooks && (
        <LoreDexViewer lorebookIds={character.attachedLorebooks} onClose={() => setShowLoreDex(false)} />
      )}

      <CharacterExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        character={character}
        nodes={nodes}
        galleryItems={galleryItems}
      />
    </div>
  )
}
