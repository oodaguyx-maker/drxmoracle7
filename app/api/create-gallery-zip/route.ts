import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import JSZip from "jszip"

export async function POST(request: NextRequest) {
  try {
    const { galleryName, images } = await request.json()

    if (!galleryName || !images || !Array.isArray(images)) {
      return NextResponse.json({ error: "Missing gallery name or images" }, { status: 400 })
    }

    const zip = new JSZip()

    // Download each image and add to ZIP
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      try {
        const response = await fetch(image.url)
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer()
          const extension = image.url.split(".").pop()?.split("?")[0] || "jpg"
          zip.file(`${galleryName}_${i + 1}.${extension}`, arrayBuffer)
        }
      } catch (err) {
        console.error(`Failed to fetch image ${i + 1}:`, err)
      }
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

    const downloadDir = path.join(process.cwd(), "public", "EyeDownloads")
    await mkdir(downloadDir, { recursive: true })

    const filename = `${galleryName}_${Date.now()}.zip`
    const filePath = path.join(downloadDir, filename)
    await writeFile(filePath, zipBuffer)

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error creating gallery ZIP:", error)
    return NextResponse.json({ error: "Failed to create gallery ZIP" }, { status: 500 })
  }
}
