import { generateId, type Character, type MultiCharSession } from "./storage"

export function createTestPartyOracleSession(): { characters: Character[]; session: MultiCharSession } {
  // Create 3 test characters
  const characters: Character[] = [
    {
      id: generateId(),
      name: "Elena Shadowblade",
      description:
        "A mysterious elven ranger with silver hair and piercing green eyes. She's skilled in archery and wilderness survival, always calm under pressure.",
      personality:
        "Stoic, protective, observant. Speaks little but her words carry weight. Has a dry sense of humor that catches people off guard.",
      scenario: "Elena has been tracking a dangerous creature through the forest when she encounters the party.",
      first_mes:
        "Elena steps out from behind a tree, bow at the ready. 'You're making too much noise. The beast will hear you from a mile away.'",
      mes_example: "",
      avatarUrl: "/elf-ranger-silver-hair.jpg",
      avatar: "/elf-ranger-silver-hair.jpg",
      tags: ["Fantasy", "Medieval", "Ranger", "Elf"],
      attributes: { age: "127", height: "5'8\"", build: "Athletic" },
      data: {},
      gallery: [
        { url: "/elf-ranger-forest.jpg", type: "image" as const },
        { url: "/elf-archer-moonlight.jpg", type: "image" as const },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: generateId(),
      name: "Marcus Ironheart",
      description:
        "A burly human warrior with battle scars and a heart of gold. Former knight turned mercenary, he fights to protect the innocent.",
      personality:
        "Bold, jovial, fiercely loyal. Laughs in the face of danger and always has a story to tell. Values honor and friendship above all.",
      scenario: "Marcus has been hired to escort travelers through dangerous territory.",
      first_mes:
        "Marcus claps his gauntleted hands together with a resounding clang. 'Well met, friends! Marcus Ironheart at your service. Ready for an adventure?'",
      mes_example: "",
      avatarUrl: "/warrior-knight-armor.jpg",
      avatar: "/warrior-knight-armor.jpg",
      tags: ["Fantasy", "Medieval", "Warrior", "Human"],
      attributes: { age: "34", height: "6'2\"", build: "Muscular" },
      data: {},
      gallery: [
        { url: "/knight-warrior-battle.jpg", type: "image" as const },
        { url: "/warrior-camp-fire.jpg", type: "image" as const },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: generateId(),
      name: "Lyra Stardust",
      description:
        "A cheerful halfling mage with wild purple hair and a mischievous smile. She specializes in illusion magic and loves playing pranks.",
      personality:
        "Playful, curious, energetic. Always looking for fun and excitement. Hides a brilliant tactical mind behind her carefree attitude.",
      scenario: "Lyra has been traveling the realm in search of rare magical artifacts and new spells to learn.",
      first_mes:
        "Lyra appears in a puff of sparkles, giggling. 'Did someone say adventure? Count me in! I've got just the spell for this...'",
      mes_example: "",
      avatarUrl: "/halfling-mage-purple-hair.jpg",
      avatar: "/halfling-mage-purple-hair.jpg",
      tags: ["Fantasy", "Medieval", "Mage", "Halfling"],
      attributes: { age: "28", height: "3'6\"", build: "Petite" },
      data: {},
      gallery: [
        { url: "/mage-casting-magic.jpg", type: "image" as const },
        { url: "/halfling-wizard-library.jpg", type: "image" as const },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ]

  // Create test session
  const session: MultiCharSession = {
    id: generateId(),
    name: "Test Adventure Party",
    title: "Test Adventure Party (Demo)",
    characterIds: characters.map((c) => c.id),
    includesUser: true,
    messages: [],
    relationships: [],
    relationshipMap: {
      [`${characters[0].id}_${characters[1].id}`]: "Respectful allies, occasional tension",
      [`${characters[0].id}_${characters[2].id}`]: "Protective older sister figure",
      [`${characters[1].id}_${characters[2].id}`]: "Comic duo, he's her bodyguard",
    },
    nodes: [
      {
        id: generateId(),
        title: "The Forest Clearing",
        sessionId: "",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    currentNodeId: "",
    situation:
      "The party meets in a moonlit forest clearing. Strange sounds echo through the trees, and an ancient evil stirs nearby. A dangerous quest awaits.",
    modelId: "openai/gpt-4o-mini:free",
    narratorEnabled: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  session.currentNodeId = session.nodes[0].id
  session.nodes[0].sessionId = session.id

  return { characters, session }
}
