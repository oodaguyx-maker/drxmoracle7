"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { getLorebooks, saveLorebook, deleteLorebook, generateId, type Lorebook } from "@/lib/storage"
import { BookOpen, Plus, Library, Sparkles, Edit, Trash2, Search, ChevronRight, LayoutDashboard } from "lucide-react"
import { toast } from "sonner"

export default function LoreWorldPage() {
  const router = useRouter()
  const [lorebooks, setLorebooks] = useState<Lorebook[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingLorebook, setEditingLorebook] = useState<Lorebook | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    loadLorebooks()
  }, [])

  const loadLorebooks = () => {
    const loaded = getLorebooks() || []
    setLorebooks(loaded)
  }

  const handleCreateLorebook = () => {
    setEditingLorebook(null)
    setFormData({ name: "", description: "" })
    setShowCreateDialog(true)
  }

  const handleEditLorebook = (lorebook: Lorebook) => {
    setEditingLorebook(lorebook)
    setFormData({
      name: lorebook.name,
      description: lorebook.description,
    })
    setShowCreateDialog(true)
  }

  const handleSaveLorebook = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a lorebook name")
      return
    }

    const lorebook: Lorebook = {
      id: editingLorebook?.id || generateId(),
      name: formData.name,
      description: formData.description,
      entries: editingLorebook?.entries || [],
      createdAt: editingLorebook?.createdAt || Date.now(),
      updatedAt: Date.now(),
    }

    saveLorebook(lorebook)
    toast.success(editingLorebook ? "Lorebook updated" : "Lorebook created")
    loadLorebooks()
    setShowCreateDialog(false)
  }

  const handleDeleteLorebook = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This will not delete the entries.`)) {
      deleteLorebook(id)
      toast.success("Lorebook deleted")
      loadLorebooks()
    }
  }

  const getEntryCount = (lorebookId: string) => {
    const lorebook = lorebooks.find((lb) => lb.id === lorebookId)
    return lorebook?.entries?.length || 0
  }

  const filteredLorebooks = lorebooks.filter(
    (lb) =>
      lb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lb.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-500/5 to-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-border/40 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)]" />
        <div className="container relative mx-auto px-4 py-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="mb-6 text-muted-foreground hover:text-foreground gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <Library className="h-12 w-12 text-purple-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-300 bg-clip-text text-transparent">
              LoreWorld
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Build immersive worlds with organized lorebooks. Create entries, curate lore, and bring your stories to life
            with LoreyAI.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" onClick={handleCreateLorebook} className="gap-2">
              <Plus className="h-5 w-5" />
              Create Lorebook
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/loreworld/lorey-ai")} className="gap-2">
              <Sparkles className="h-5 w-5" />
              Chat with LoreyAI
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-8">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search lorebooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lorebook Grid */}
      <div className="container mx-auto px-4 pb-16">
        {filteredLorebooks.length === 0 ? (
          <Card className="gloss-card p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-2">{searchQuery ? "No lorebooks found" : "No lorebooks yet"}</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try a different search term" : "Create your first lorebook to start building your world"}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateLorebook} className="gap-2">
                <Plus className="h-5 w-5" />
                Create Lorebook
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLorebooks.map((lorebook) => (
              <Card
                key={lorebook.id}
                className="gloss-card gloss-interactive group cursor-pointer overflow-hidden"
                onClick={() => router.push(`/loreworld/${lorebook.id}`)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between gap-2">
                    <BookOpen className="h-8 w-8 text-purple-500 shrink-0" />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditLorebook(lorebook)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteLorebook(lorebook.id, lorebook.name)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-2xl mt-2">{lorebook.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{lorebook.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="gap-1">
                      {getEntryCount(lorebook.id)} entries
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLorebook ? "Edit Lorebook" : "Create New Lorebook"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Elderealm Chronicles"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A brief description of your world..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveLorebook}>{editingLorebook ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
