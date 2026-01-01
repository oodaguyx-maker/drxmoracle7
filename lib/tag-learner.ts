import type { ChatMessage } from "./storage"

export interface LearnedTag {
  tag: string
  confidence: "high" | "medium" | "low"
  reason: string
  detectedAt: number
}

/**
 * Analyzes chat messages to learn and suggest character tags
 * Detects gender, kinks, personality traits, species, and behavior patterns
 */
export function analyzeConversationForTags(messages: ChatMessage[], characterName: string): LearnedTag[] {
  const learnedTags: LearnedTag[] = []
  const conversationText = messages
    .filter((m) => m.role === "assistant")
    .map((m) => m.content)
    .join(" ")
    .toLowerCase()

  const charLower = characterName.toLowerCase()

  // Gender Detection
  const genderPatterns = {
    Female: [
      /\b(she|her|hers|herself)\b/gi,
      /\b(woman|girl|lady|female|gal)\b/gi,
      /\b(breasts?|boobs|tits|pussy|vagina|clit)\b/gi,
      /\b(daughter|sister|mother|wife|girlfriend)\b/gi,
    ],
    Male: [
      /\b(he|him|his|himself)\b/gi,
      /\b(man|boy|guy|male|dude|bro)\b/gi,
      /\b(cock|dick|penis|balls|shaft)\b/gi,
      /\b(son|brother|father|husband|boyfriend)\b/gi,
    ],
    "Non-binary": [/\b(they|them|theirs|themselves)\b/gi, /\b(non-binary|nonbinary|enby|genderqueer)\b/gi],
  }

  Object.entries(genderPatterns).forEach(([gender, patterns]) => {
    const matches = patterns.reduce((count, pattern) => {
      const found = conversationText.match(pattern)
      return count + (found ? found.length : 0)
    }, 0)

    if (matches > 5) {
      learnedTags.push({
        tag: gender,
        confidence: matches > 15 ? "high" : matches > 10 ? "medium" : "low",
        reason: `Detected ${matches} gender-specific references`,
        detectedAt: Date.now(),
      })
    }
  })

  // Kink & Sexual Content Detection
  const kinkPatterns = {
    BDSM: [
      /\b(bdsm|bondage|domination|submission|sadism|masochism)\b/gi,
      /\b(tied|bound|restrained|collar|leash|chain)\b/gi,
      /\b(whip|flog|spank|paddle|cane)\b/gi,
      /\b(master|mistress|slave|pet|sub|dom)\b/gi,
    ],
    Dominant: [
      /\b(dominant|dominate|dominating|dominatrix|dom)\b/gi,
      /\b(control|command|order|demand|force)\b/gi,
      /\b(pin|push|grab|hold|restrain)\b/gi,
    ],
    Submissive: [
      /\b(submissive|submit|obey|serve|please)\b/gi,
      /\b(beg|plead|whimper|moan softly)\b/gi,
      /\b(yielding|compliant|docile)\b/gi,
    ],
    Kinky: [
      /\b(kinky|kink|fetish|perverse|deviant)\b/gi,
      /\b(taboo|forbidden|naughty|dirty)\b/gi,
      /\b(roleplay|fantasy|scenario)\b/gi,
    ],
    Breeding: [/\b(breed|breeding|impregnate|knocked up|pregnant)\b/gi, /\b(fertile|ovulating|seed|cum inside)\b/gi],
    Exhibitionist: [
      /\b(exhibitionist|exhibition|public|exposed|display)\b/gi,
      /\b(watch|watching|voyeur|audience)\b/gi,
    ],
    Oral: [/\b(oral|blowjob|cunnilingus|lick|suck|tongue|mouth)\b/gi, /\b(taste|lips|kissing deeply)\b/gi],
    Anal: [/\b(anal|ass|asshole|backdoor|butt)\b/gi, /\b(spread|tight|push in)\b/gi],
    Rough: [
      /\b(rough|hard|aggressive|forceful|intense)\b/gi,
      /\b(slam|pound|thrust hard|grip tight)\b/gi,
      /\b(bruise|mark|scratch|bite hard)\b/gi,
    ],
    Gentle: [
      /\b(gentle|soft|tender|caring|loving)\b/gi,
      /\b(caress|stroke gently|kiss softly)\b/gi,
      /\b(sweet|affectionate|romantic)\b/gi,
    ],
    Vanilla: [/\b(vanilla|traditional|conventional|normal|standard)\b/gi, /\b(romantic|loving|intimate|tender)\b/gi],
  }

  Object.entries(kinkPatterns).forEach(([kink, patterns]) => {
    const matches = patterns.reduce((count, pattern) => {
      const found = conversationText.match(pattern)
      return count + (found ? found.length : 0)
    }, 0)

    if (matches > 3) {
      learnedTags.push({
        tag: kink,
        confidence: matches > 8 ? "high" : matches > 5 ? "medium" : "low",
        reason: `Detected ${matches} ${kink.toLowerCase()}-related interactions`,
        detectedAt: Date.now(),
      })
    }
  })

  // Personality Trait Detection
  const personalityPatterns = {
    Tsundere: [
      /\b(tsundere|it's not like|baka|idiot)\b/gi,
      /\b(flustered|embarrassed|defensive|pouty)\b/gi,
      /\b(don't get the wrong idea|not for you)\b/gi,
    ],
    Yandere: [
      /\b(yandere|obsessed|possessive|jealous|mine)\b/gi,
      /\b(kill|hurt|punish|eliminate)\b/gi,
      /\b(only mine|belong to me|no one else)\b/gi,
    ],
    Kuudere: [/\b(kuudere|cold|emotionless|stoic|indifferent)\b/gi, /\b(monotone|blank|expressionless)\b/gi],
    Caring: [
      /\b(caring|care|nurturing|protective|worried)\b/gi,
      /\b(comfort|soothe|help|support)\b/gi,
      /\b(are you okay|let me help|I'm here)\b/gi,
    ],
    Teasing: [
      /\b(tease|teasing|playful|mischievous)\b/gi,
      /\b(smirk|grin|wink|giggle)\b/gi,
      /\b(can't handle|too much for you)\b/gi,
    ],
    Shy: [
      /\b(shy|timid|bashful|nervous|anxious)\b/gi,
      /\b(blush|stammer|hesitate|look away)\b/gi,
      /\b(quietly|softly|barely audible)\b/gi,
    ],
    Confident: [
      /\b(confident|bold|assertive|self-assured)\b/gi,
      /\b(smirk|stride|command|declare)\b/gi,
      /\b(I know|of course|obviously)\b/gi,
    ],
    Flirty: [
      /\b(flirt|flirty|seductive|alluring)\b/gi,
      /\b(wink|purr|sultry|tease)\b/gi,
      /\b(want me|like what you see)\b/gi,
    ],
  }

  Object.entries(personalityPatterns).forEach(([trait, patterns]) => {
    const matches = patterns.reduce((count, pattern) => {
      const found = conversationText.match(pattern)
      return count + (found ? found.length : 0)
    }, 0)

    if (matches > 3) {
      learnedTags.push({
        tag: trait,
        confidence: matches > 7 ? "high" : matches > 4 ? "medium" : "low",
        reason: `Detected ${matches} ${trait.toLowerCase()} behavioral patterns`,
        detectedAt: Date.now(),
      })
    }
  })

  // Species/Race Detection
  const speciesPatterns = {
    Human: [/\b(human|person|mortal|mankind)\b/gi],
    Elf: [/\b(elf|elven|elvish|fae)\b/gi, /\b(pointed ears|graceful|ethereal)\b/gi],
    Demon: [
      /\b(demon|demonic|devil|infernal|hellish)\b/gi,
      /\b(horns|tail|wings|claws)\b/gi,
      /\b(corrupted|sinful|wicked)\b/gi,
    ],
    Angel: [/\b(angel|angelic|divine|celestial|holy)\b/gi, /\b(wings|halo|pure|sacred)\b/gi],
    Vampire: [
      /\b(vampire|vampiric|undead|immortal)\b/gi,
      /\b(fangs|bite|blood|pale|nocturnal)\b/gi,
      /\b(suck|drain|thirst)\b/gi,
    ],
    Werewolf: [/\b(werewolf|lycan|wolf|beast)\b/gi, /\b(howl|growl|fur|claws|pack)\b/gi],
    Furry: [
      /\b(furry|anthro|anthropomorphic)\b/gi,
      /\b(fur|tail|ears|paws|snout)\b/gi,
      /\b(canine|feline|vulpine)\b/gi,
    ],
    Catgirl: [/\b(catgirl|neko|cat girl)\b/gi, /\b(cat ears|tail swish|purr|meow)\b/gi, /\b(feline|kitty)\b/gi],
    Monster: [
      /\b(monster|creature|beast|inhuman)\b/gi,
      /\b(tentacle|appendage|non-human)\b/gi,
      /\b(monstrous|beastly)\b/gi,
    ],
  }

  Object.entries(speciesPatterns).forEach(([species, patterns]) => {
    const matches = patterns.reduce((count, pattern) => {
      const found = conversationText.match(pattern)
      return count + (found ? found.length : 0)
    }, 0)

    if (matches > 2) {
      learnedTags.push({
        tag: species,
        confidence: matches > 5 ? "high" : matches > 3 ? "medium" : "low",
        reason: `Detected ${matches} ${species.toLowerCase()}-specific references`,
        detectedAt: Date.now(),
      })
    }
  })

  // Age/Maturity Detection
  const agePatterns = {
    Teen: [/\b(teen|teenager|young|adolescent|high school)\b/gi, /\b(18|19|school uniform)\b/gi],
    MILF: [/\b(milf|mother|mom|mommy|mature woman)\b/gi, /\b(experienced|older woman)\b/gi],
    Mature: [/\b(mature|older|experienced|adult|grown)\b/gi, /\b(wisdom|age|years)\b/gi],
  }

  Object.entries(agePatterns).forEach(([age, patterns]) => {
    const matches = patterns.reduce((count, pattern) => {
      const found = conversationText.match(pattern)
      return count + (found ? found.length : 0)
    }, 0)

    if (matches > 2) {
      learnedTags.push({
        tag: age,
        confidence: matches > 5 ? "high" : matches > 3 ? "medium" : "low",
        reason: `Detected ${matches} age-related references`,
        detectedAt: Date.now(),
      })
    }
  })

  // Setting/Genre Detection
  const genrePatterns = {
    Fantasy: [/\b(fantasy|magic|spell|wizard|sorcerer|enchant)\b/gi, /\b(dragon|knight|castle|kingdom|realm)\b/gi],
    "Sci-fi": [
      /\b(sci-fi|science fiction|space|alien|robot|cyborg)\b/gi,
      /\b(starship|laser|plasma|hologram|android)\b/gi,
    ],
    Modern: [/\b(modern|contemporary|city|urban|technology)\b/gi, /\b(phone|computer|internet|car)\b/gi],
    Historical: [/\b(historical|ancient|medieval|victorian|period)\b/gi, /\b(past|history|era)\b/gi],
    "Post-apocalyptic": [/\b(post-apocalyptic|wasteland|survivor|ruins)\b/gi, /\b(apocalypse|destroyed|fallout)\b/gi],
  }

  Object.entries(genrePatterns).forEach(([genre, patterns]) => {
    const matches = patterns.reduce((count, pattern) => {
      const found = conversationText.match(pattern)
      return count + (found ? found.length : 0)
    }, 0)

    if (matches > 3) {
      learnedTags.push({
        tag: genre,
        confidence: matches > 7 ? "high" : matches > 5 ? "medium" : "low",
        reason: `Detected ${matches} ${genre.toLowerCase()} elements`,
        detectedAt: Date.now(),
      })
    }
  })

  // Remove duplicate tags (keep highest confidence)
  const uniqueTags = new Map<string, LearnedTag>()
  learnedTags.forEach((tag) => {
    const existing = uniqueTags.get(tag.tag)
    if (!existing || getConfidenceScore(tag.confidence) > getConfidenceScore(existing.confidence)) {
      uniqueTags.set(tag.tag, tag)
    }
  })

  return Array.from(uniqueTags.values()).sort(
    (a, b) => getConfidenceScore(b.confidence) - getConfidenceScore(a.confidence),
  )
}

function getConfidenceScore(confidence: "high" | "medium" | "low"): number {
  switch (confidence) {
    case "high":
      return 3
    case "medium":
      return 2
    case "low":
      return 1
  }
}

/**
 * Suggests tags that should be added to a character based on learned tags
 * Returns only high and medium confidence tags that aren't already added
 */
export function suggestTagsToAdd(learnedTags: LearnedTag[], currentTags: string[]): LearnedTag[] {
  return learnedTags.filter(
    (tag) => !currentTags.includes(tag.tag) && (tag.confidence === "high" || tag.confidence === "medium"),
  )
}
