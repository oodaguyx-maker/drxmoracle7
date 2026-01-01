// Script to fetch and display OpenRouter model IDs
// This helps us find the correct model IDs to use

async function fetchModels() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models")
    const data = await response.json()

    // Filter for the models we're interested in
    const relevantModels = data.data.filter((model: any) => {
      const id = model.id.toLowerCase()
      return id.includes("grok") || id.includes("deepseek") || id.includes("mistral") || id.includes("gpt-4o-mini")
    })

    console.log("=== Relevant OpenRouter Models ===\n")
    relevantModels.forEach((model: any) => {
      console.log(`Name: ${model.name}`)
      console.log(`ID: ${model.id}`)
      console.log(`Context: ${model.context_length}`)
      console.log(`Price (prompt): $${model.pricing.prompt} per token`)
      console.log("---")
    })
  } catch (error) {
    console.error("Error fetching models:", error)
  }
}

fetchModels()
