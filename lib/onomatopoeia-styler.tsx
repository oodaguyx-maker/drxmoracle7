export const onomatopoeiaWords = {
  impact: ["thwack", "smack", "slap", "crack", "pop", "snap", "thud", "boom", "bang", "crash", "whack", "slam", "bam"],
  wet: [
    "squelch",
    "squish",
    "splash",
    "splatter",
    "drip",
    "plop",
    "glorp",
    "schlick",
    "schluck",
    "splurt",
    "sploosh",
    "slosh",
    "squelching",
    "squishing",
  ],
  movement: [
    "clop",
    "clop clop",
    "clopping",
    "clap",
    "clapping",
    "thump",
    "thumping",
    "rustle",
    "shuffle",
    "swoosh",
    "whoosh",
    "swish",
  ],
  soft: ["jiggle", "jiggling", "bounce", "bouncing", "squish", "squishing", "wobble", "wobbling", "plump", "plush"],
  rhythmic: ["pump", "pumping", "thrust", "thrusting", "pound", "pounding", "grind", "grinding"],
  other: ["moan", "gasp", "pant", "huff", "mmm", "ahh", "ohh", "ugh", "hng", "mmph", "slurp", "gulp"],
}

export function styleOnomatopoeia(text: string): string {
  let styledText = text

  // Special handling for emphasized sounds (CLOP CLOP, THWACK, etc.)
  const emphasizedPatterns = [
    { pattern: /\b(CLOP\s+CLOP|clop\s+clop)\b/gi, className: "onomatopoeia-clop" },
    { pattern: /\b(THWACK|thwack)\b/gi, className: "onomatopoeia-thwack" },
    { pattern: /\b(CLAP|clap|CLAPPING|clapping)\b/gi, className: "onomatopoeia-clap" },
    { pattern: /\b(jiggling|JIGGLING|jiggles)\b/gi, className: "onomatopoeia-jiggle" },
    { pattern: /\b(squelching|SQUELCHING|squelch)\b/gi, className: "onomatopoeia-squelch" },
  ]

  emphasizedPatterns.forEach(({ pattern, className }) => {
    styledText = styledText.replace(pattern, `<span class="${className}">$1</span>`)
  })

  // Style impact sounds (red/orange with readable contrast)
  onomatopoeiaWords.impact.forEach((word) => {
    const regex = new RegExp(`\\b(${word}(?:s|ed|ing)?)\\b`, "gi")
    styledText = styledText.replace(regex, '<span class="onomatopoeia-impact">$1</span>')
  })

  // Style wet sounds (cyan/blue)
  onomatopoeiaWords.wet.forEach((word) => {
    const regex = new RegExp(`\\b(${word}(?:s|ed|ing)?)\\b`, "gi")
    styledText = styledText.replace(regex, '<span class="onomatopoeia-wet">$1</span>')
  })

  // Style movement sounds (purple)
  onomatopoeiaWords.movement.forEach((word) => {
    const regex = new RegExp(`\\b(${word}(?:s|ed|ing)?)\\b`, "gi")
    styledText = styledText.replace(regex, '<span class="onomatopoeia-movement">$1</span>')
  })

  // Style soft sounds (pink)
  onomatopoeiaWords.soft.forEach((word) => {
    const regex = new RegExp(`\\b(${word}(?:s|ed|ing)?)\\b`, "gi")
    styledText = styledText.replace(regex, '<span class="onomatopoeia-soft">$1</span>')
  })

  // Style rhythmic sounds (orange/yellow)
  onomatopoeiaWords.rhythmic.forEach((word) => {
    const regex = new RegExp(`\\b(${word}(?:s|ed|ing)?)\\b`, "gi")
    styledText = styledText.replace(regex, '<span class="onomatopoeia-rhythmic">$1</span>')
  })

  // Style other expressive sounds (green)
  onomatopoeiaWords.other.forEach((word) => {
    const regex = new RegExp(`\\b(${word}(?:s|ed|ing)?)\\b`, "gi")
    styledText = styledText.replace(regex, '<span class="onomatopoeia-other">$1</span>')
  })

  return styledText
}

// React component version for safe rendering
export function StyledText({ text }: { text: string }) {
  return (
    <span
      className="whitespace-pre-wrap leading-relaxed"
      dangerouslySetInnerHTML={{ __html: styleOnomatopoeia(text) }}
    />
  )
}
