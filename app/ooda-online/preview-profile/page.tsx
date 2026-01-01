"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveOodaProfile, generateId, type OodaProfile } from "@/lib/storage"
import { ArrowLeft, Save, ImageIcon } from "lucide-react"

export default function PreviewProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Partial<OodaProfile>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const data = sessionStorage.getItem("flist-import-preview")
    if (data) {
      setProfile(JSON.parse(data))
      sessionStorage.removeItem("flist-import-preview")
    }
    setIsLoading(false)
  }, [])

  const saveProfile = () => {
    const newProfile: OodaProfile = {
      id: generateId(),
      name: profile.name || "Unnamed Profile",
      avatar: profile.avatar,
      description: profile.description,
      personality: profile.personality,
      kinks: profile.kinks,
      images: profile.images,
      flistUrl: profile.flistUrl,
      importedFrom: "flist",
      createdAt: Date.now(),
    }

    saveOodaProfile(newProfile)
    router.push("/ooda-online")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push("/ooda-online")} className="mb-2">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Preview F-List Profile</h1>
          <p className="text-muted-foreground">Review and edit the imported profile before saving</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Edit the imported information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div>
              <Label>Avatar URL</Label>
              <Input
                value={profile.avatar || ""}
                onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={profile.description || ""}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label>Personality</Label>
              <Textarea
                value={profile.personality || ""}
                onChange={(e) => setProfile({ ...profile, personality: e.target.value })}
                rows={3}
              />
            </div>
            <Button onClick={saveProfile} className="w-full">
              <Save className="mr-2 size-4" />
              Save Profile
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Avatar Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.avatar ? (
                <img
                  src={profile.avatar || "/placeholder.svg"}
                  alt={profile.name}
                  className="w-full rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                  <ImageIcon className="size-12 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {profile.kinks && profile.kinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Kinks ({profile.kinks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.kinks.map((kink, idx) => (
                    <span key={idx} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {kink}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {profile.images && profile.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gallery ({profile.images.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {profile.images.slice(0, 4).map((img, idx) => (
                    <img
                      key={idx}
                      src={img || "/placeholder.svg"}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
