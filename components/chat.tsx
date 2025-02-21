"use client"

import { useEffect, useRef } from "react"
import { useChat } from "ai/react"
import { Bot, Send, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 py-2 border-b">
        <h2 className="text-lg font-semibold">Energy Advisor</h2>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <Card
              key={index}
              className={cn(
                "flex items-start gap-3 p-4",
                message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground",
              )}
            >
              {message.role === "assistant" ? <Bot className="h-6 w-6 mt-1" /> : <User className="h-6 w-6 mt-1" />}
              <div className="flex-1">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about renewable energy optimization..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

