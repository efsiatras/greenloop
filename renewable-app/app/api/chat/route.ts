import { StreamingTextResponse } from "ai"
import { CohereClient } from "cohere-ai"

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!,
})

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Convert chat history to a format Cohere can understand
  const chatHistory = messages.slice(0, -1).map((message: any) => ({
    role: message.role,
    message: message.content,
  }))

  const currentMessage = messages[messages.length - 1].content

  const response = await cohere.chatStream({
    message: currentMessage,
    chatHistory,
    preamble: `You are an Energy Advisor AI assistant that helps users optimize renewable energy installations.
    You provide insights about:
    - Optimal locations for new installations
    - Performance analysis of existing installations
    - Weather impact on energy generation
    - Maintenance recommendations
    - Energy efficiency improvements
    
    Be concise but informative in your responses.`,
    connectorId: "",
  })

  // Convert the Cohere stream to a format compatible with the AI SDK
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        if (chunk.eventType === "text-generation") {
          controller.enqueue(chunk.text)
        }
      }
      controller.close()
    },
  })

  return new StreamingTextResponse(stream)
}

