export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    console.log("[v0] Fetching Realbooru tag suggestions for:", query)

    // Realbooru uses the same autocomplete format as Rule34
    const response = await fetch(`https://realbooru.com/autocomplete.php?q=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      console.log("[v0] Realbooru tags API error:", response.status)
      return Response.json({ tags: [] })
    }

    const text = await response.text()

    if (!text || text.trim() === "") {
      console.log("[v0] Empty response from Realbooru tags API")
      return Response.json({ tags: [] })
    }

    const data = JSON.parse(text)

    const tags = Array.isArray(data)
      ? data.map((item: any) => ({
          label: item.label || item.value || item,
          value: item.value || item.label || item,
          type: item.type || "tag",
        }))
      : []

    console.log("[v0] Found", tags.length, "Realbooru tag suggestions")

    return Response.json({ tags })
  } catch (error) {
    console.error("[v0] Error fetching Realbooru tags:", error)
    return Response.json({ tags: [] })
  }
}
