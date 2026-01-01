import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const character = searchParams.get("character")

    if (!character) {
      return NextResponse.json({ error: "Character name is required" }, { status: 400 })
    }

    // Fetch the F-List character page
    const response = await fetch(`https://www.f-list.net/c/${character}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OodaOnline/1.0)",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch F-List profile" }, { status: 404 })
    }

    const html = await response.text()

    // Parse the HTML to extract character information
    // Note: F-List uses a lot of client-side rendering, so we'll extract what we can from the HTML

    const profile = {
      name: extractFromHtml(html, /<title>([^<]+) - F-List<\/title>/, character),
      avatar: extractFromHtml(html, /<meta property="og:image" content="([^"]+)"/, ""),
      description: extractFromHtml(html, /<meta name="description" content="([^"]+)"/, ""),
      flistUrl: `https://www.f-list.net/c/${character}`,
      kinks: extractKinks(html),
      images: extractImages(html),
      personality: extractFromHtml(html, /<div class="character-personality">([^<]+)<\/div>/, ""),
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error importing F-List profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function extractFromHtml(html: string, regex: RegExp, defaultValue: string): string {
  const match = html.match(regex)
  return match ? match[1].trim() : defaultValue
}

function extractKinks(html: string): string[] {
  const kinks: string[] = []
  const kinksSection = html.match(/<div class="kinks">(.+?)<\/div>/s)

  if (kinksSection) {
    const kinkMatches = kinksSection[1].matchAll(/<span[^>]*>([^<]+)<\/span>/g)
    for (const match of kinkMatches) {
      kinks.push(match[1].trim())
    }
  }

  return kinks
}

function extractImages(html: string): string[] {
  const images: string[] = []
  const imageMatches = html.matchAll(/<img[^>]+src="(https:\/\/static\.f-list\.net\/images\/[^"]+)"/g)

  for (const match of imageMatches) {
    images.push(match[1])
  }

  return images.slice(0, 10) // Limit to 10 images
}
