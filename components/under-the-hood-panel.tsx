"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"
import type { Character, CharacterAttributes } from "@/lib/storage"
import { updateCharacterAttributes } from "@/lib/storage"
import { formatAttributeValue } from "@/lib/attribute-tracker"

interface UnderTheHoodPanelProps {
  character: Character
  characterId: string
  onClose: () => void
  onUpdate: (char: Character) => void
}

export function UnderTheHoodPanel({ character, characterId, onClose, onUpdate }: UnderTheHoodPanelProps) {
  const attributes = character.attributes || {}
  const [isEditing, setIsEditing] = useState(false)
  const [editedAttributes, setEditedAttributes] = useState<Partial<CharacterAttributes>>(attributes)

  const handleSave = () => {
    updateCharacterAttributes(character.id, editedAttributes)
    setIsEditing(false)
    // Refresh character data
    const updatedChar = { ...character, attributes: { ...character.attributes, ...editedAttributes } }
    onUpdate(updatedChar)
  }

  const addChild = () => {
    const children = [...(editedAttributes.children || [])]
    children.push({ name: "New Child", age: 0 })
    setEditedAttributes({ ...editedAttributes, children })
  }

  const removeChild = (index: number) => {
    const children = [...(editedAttributes.children || [])]
    children.splice(index, 1)
    setEditedAttributes({ ...editedAttributes, children })
  }

  const updateChild = (index: number, field: "name" | "age" | "father", value: string | number) => {
    const children = [...(editedAttributes.children || [])]
    children[index] = { ...children[index], [field]: value }
    setEditedAttributes({ ...editedAttributes, children })
  }

  const addTattoo = () => {
    const tattoos = [...(editedAttributes.tattoos || [])]
    tattoos.push({ description: "New tattoo", location: "Unknown", dateAdded: Date.now() })
    setEditedAttributes({ ...editedAttributes, tattoos })
  }

  const removeTattoo = (index: number) => {
    const tattoos = [...(editedAttributes.tattoos || [])]
    tattoos.splice(index, 1)
    setEditedAttributes({ ...editedAttributes, tattoos })
  }

  const updateTattoo = (index: number, field: "description" | "location", value: string) => {
    const tattoos = [...(editedAttributes.tattoos || [])]
    tattoos[index] = { ...tattoos[index], [field]: value }
    setEditedAttributes({ ...editedAttributes, tattoos })
  }

  return (
    <div className="w-96 border-l border-border bg-card/30 backdrop-blur-sm overflow-y-auto animate-in slide-in-from-right duration-500">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="size-5 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="font-semibold">Under The Hood</h3>
          </div>
          <div className="flex items-center gap-1">
            {!isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="size-8 p-0 hover:text-primary transition-colors"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="size-8 p-0 text-green-500 hover:text-green-400 transition-colors"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="size-8 p-0 hover:text-destructive transition-colors"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-3 text-xs neon-border animate-in fade-in duration-700">
          <p className="font-semibold text-primary flex items-center gap-1">
            <Sparkles className="size-3" />
            Dynamic Character Tracking
          </p>
          <p className="mt-1 text-muted-foreground">
            These attributes evolve based on roleplay conversations and can be manually edited.
          </p>
        </div>

        {/* Pregnancy Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span>Pregnancy</span>
              {attributes.pregnant && <Badge variant="default">Active</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isEditing ? (
              <>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editedAttributes.pregnant || false}
                    onChange={(e) => setEditedAttributes({ ...editedAttributes, pregnant: e.target.checked })}
                    className="size-4"
                  />
                  <Label className="text-xs">Is Pregnant</Label>
                </div>
                {editedAttributes.pregnant && (
                  <div>
                    <Label className="text-xs">Weeks</Label>
                    <Input
                      type="number"
                      value={editedAttributes.pregnancyWeeks || 0}
                      onChange={(e) =>
                        setEditedAttributes({ ...editedAttributes, pregnancyWeeks: Number.parseInt(e.target.value) })
                      }
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs">
                <p className="text-muted-foreground">
                  Status: <span className="text-foreground">{attributes.pregnant ? "Pregnant" : "Not pregnant"}</span>
                </p>
                {attributes.pregnant && attributes.pregnancyWeeks && (
                  <p className="mt-1 text-muted-foreground">
                    Weeks: <span className="text-foreground">{attributes.pregnancyWeeks}</span>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Children */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span>Children</span>
              <Badge variant="outline">{attributes.children?.length || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isEditing ? (
              <>
                {(editedAttributes.children || []).map((child, index) => (
                  <div key={index} className="rounded-lg border border-border p-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Child {index + 1}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChild(index)}
                        className="size-6 p-0 text-destructive"
                      >
                        <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={child.name}
                        onChange={(e) => updateChild(index, "name", e.target.value)}
                        className="mt-1 h-7 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Age</Label>
                      <Input
                        type="number"
                        value={child.age}
                        onChange={(e) => updateChild(index, "age", Number.parseInt(e.target.value))}
                        className="mt-1 h-7 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Father</Label>
                      <Input
                        value={child.father || ""}
                        onChange={(e) => updateChild(index, "father", e.target.value)}
                        placeholder="e.g., user"
                        className="mt-1 h-7 text-xs"
                      />
                    </div>
                  </div>
                ))}
                <Button onClick={addChild} variant="outline" size="sm" className="w-full text-xs bg-transparent">
                  <svg className="mr-2 size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Child
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                {attributes.children && attributes.children.length > 0 ? (
                  attributes.children.map((child, index) => (
                    <div key={index} className="rounded-lg border border-border p-2">
                      <p className="text-xs font-semibold">{child.name}</p>
                      <p className="text-xs text-muted-foreground">Age: {child.age}</p>
                      {child.father && <p className="text-xs text-muted-foreground">Father: {child.father}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No children</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Marriage Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span>Marriage</span>
              {attributes.marriedTo && <Badge variant="default">Married</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isEditing ? (
              <>
                <div>
                  <Label className="text-xs">Married To</Label>
                  <Input
                    value={editedAttributes.marriedTo || ""}
                    onChange={(e) => setEditedAttributes({ ...editedAttributes, marriedTo: e.target.value })}
                    placeholder="e.g., user, NPC name, or character ID"
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </>
            ) : (
              <div className="text-xs">
                <p className="text-muted-foreground">
                  Status:{" "}
                  <span className="text-foreground">
                    {attributes.marriedTo ? formatAttributeValue("marriedTo", attributes.marriedTo) : "Single"}
                  </span>
                </p>
                {attributes.marriageDate && (
                  <p className="mt-1 text-muted-foreground">
                    Since:{" "}
                    <span className="text-foreground">
                      {formatAttributeValue("marriageDate", attributes.marriageDate)}
                    </span>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tattoos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span>Tattoos</span>
              <Badge variant="outline">{attributes.tattoos?.length || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isEditing ? (
              <>
                {(editedAttributes.tattoos || []).map((tattoo, index) => (
                  <div key={index} className="rounded-lg border border-border p-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Tattoo {index + 1}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTattoo(index)}
                        className="size-6 p-0 text-destructive"
                      >
                        <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={tattoo.description}
                        onChange={(e) => updateTattoo(index, "description", e.target.value)}
                        className="mt-1 h-7 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Location</Label>
                      <Input
                        value={tattoo.location}
                        onChange={(e) => updateTattoo(index, "location", e.target.value)}
                        className="mt-1 h-7 text-xs"
                      />
                    </div>
                  </div>
                ))}
                <Button onClick={addTattoo} variant="outline" size="sm" className="w-full text-xs bg-transparent">
                  <svg className="mr-2 size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Tattoo
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                {attributes.tattoos && attributes.tattoos.length > 0 ? (
                  attributes.tattoos.map((tattoo, index) => (
                    <div key={index} className="rounded-lg border border-border p-2">
                      <p className="text-xs font-semibold">{tattoo.description}</p>
                      <p className="text-xs text-muted-foreground">Location: {tattoo.location}</p>
                      <p className="text-xs text-muted-foreground">
                        Added: {new Date(tattoo.dateAdded).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No tattoos</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Physical Attributes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Physical Attributes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isEditing ? (
              <>
                <div>
                  <Label className="text-xs">Hair Color</Label>
                  <Input
                    value={editedAttributes.hairColor || ""}
                    onChange={(e) => setEditedAttributes({ ...editedAttributes, hairColor: e.target.value })}
                    placeholder="e.g., Blonde, Black"
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Hair Length</Label>
                  <Input
                    value={editedAttributes.hairLength || ""}
                    onChange={(e) => setEditedAttributes({ ...editedAttributes, hairLength: e.target.value })}
                    placeholder="e.g., Long, Short"
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </>
            ) : (
              <div className="text-xs space-y-1">
                {attributes.hairColor && (
                  <p className="text-muted-foreground">
                    Hair Color: <span className="text-foreground">{attributes.hairColor}</span>
                  </p>
                )}
                {attributes.hairLength && (
                  <p className="text-muted-foreground">
                    Hair Length: <span className="text-foreground">{attributes.hairLength}</span>
                  </p>
                )}
                {!attributes.hairColor && !attributes.hairLength && (
                  <p className="text-muted-foreground">No physical attributes tracked</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Additional Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isEditing ? (
              <>
                <div>
                  <Label className="text-xs">Relationship Status</Label>
                  <Input
                    value={editedAttributes.relationshipStatus || ""}
                    onChange={(e) => setEditedAttributes({ ...editedAttributes, relationshipStatus: e.target.value })}
                    placeholder="e.g., Dating, Engaged"
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Occupation</Label>
                  <Input
                    value={editedAttributes.occupation || ""}
                    onChange={(e) => setEditedAttributes({ ...editedAttributes, occupation: e.target.value })}
                    placeholder="e.g., Teacher, Artist"
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Location</Label>
                  <Input
                    value={editedAttributes.location || ""}
                    onChange={(e) => setEditedAttributes({ ...editedAttributes, location: e.target.value })}
                    placeholder="e.g., New York, Paris"
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </>
            ) : (
              <div className="text-xs space-y-1">
                {attributes.relationshipStatus && (
                  <p className="text-muted-foreground">
                    Relationship: <span className="text-foreground">{attributes.relationshipStatus}</span>
                  </p>
                )}
                {attributes.occupation && (
                  <p className="text-muted-foreground">
                    Occupation: <span className="text-foreground">{attributes.occupation}</span>
                  </p>
                )}
                {attributes.location && (
                  <p className="text-muted-foreground">
                    Location: <span className="text-foreground">{attributes.location}</span>
                  </p>
                )}
                {!attributes.relationshipStatus && !attributes.occupation && !attributes.location && (
                  <p className="text-muted-foreground">No additional info tracked</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
