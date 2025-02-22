import { CohereClientV2 } from 'cohere-ai';

const cohere = new CohereClientV2({
  token: 'XGhdAwWDdwJSeDF0G09I35IBpxGA2q0Klwm6itGR',
});

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const cohereMessages = messages.map((msg: ChatMessage) => ({
    role: msg.role === 'user' ? 'User' : 'Assistant',
    content: msg.content,
  }));

  const response = await cohere.chat({
    model: "command-r-plus-08-2024",
    messages: cohereMessages,
  });

  // Return the assistant's message with null check
  const content = response.message?.content?.[0]?.text ?? "I'm sorry, I couldn't generate a response.";
  
  return new Response(JSON.stringify({ 
    role: 'assistant',
    content: content
  }));
}

