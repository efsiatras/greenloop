import { StreamingTextResponse, OpenAIStream } from "ai"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { messages } = await req.json()

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    stream: true,
    messages: [
      {
        role: "system",
        content: `You are an Energy Advisor AI assistant that helps users optimize renewable energy installations.
        You provide insights about:
        - Optimal locations for new installations
        - Performance analysis of existing installations
        - Weather impact on energy generation
        - Maintenance recommendations
        - Energy efficiency improvements
        
        Be concise but informative in your responses.`,
      },
      ...messages,
    ],
  })

  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}

