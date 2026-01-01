export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    console.log("[v0] Fetching tag suggestions for:", query)

    // Use Rule34's autocomplete API
    const response = await fetch(`https://api.rule34.xxx/autocomplete.php?q=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      console.log("[v0] Rule34 tags API error:", response.status)
      return Response.json({ tags: [] })
    }

    const text = await response.text()

    if (!text || text.trim() === "") {
      console.log("[v0] Empty response from tags API")
      return Response.json({ tags: [] })
    }

    const data = JSON.parse(text)

    // Rule34 autocomplete returns array of objects with 'label' and 'value'
    const tags = Array.isArray(data)
      ? data.map((item: any) => ({
          label: item.label || item.value || item,
          value: item.value || item.label || item,
          type: item.type || "tag",
        }))
      : []

    console.log("[v0] Found", tags.length, "tag suggestions")

    return Response.json({ tags })
  } catch (error) {
    console.error("[v0] Error fetching tags:", error)
    return Response.json({ tags: [] })
  }
}
