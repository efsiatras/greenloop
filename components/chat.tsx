"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { geocodeLocation } from "@/lib/utils"

interface ChatProps {
  onLocationUpdate: (lat: number, lng: number) => void
}

interface Message {
  text: string
  type: 'user' | 'system'
}

export default function Chat({ onLocationUpdate }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const parseCoordinates = (text: string): { lat: number, lng: number } | null => {
    // Match decimal coordinates with optional spaces, commas: 38.5356, 22.6217 or 38.5356 22.6217
    const decimalRegex = /(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/
    
    // Match coordinates with degrees and cardinal directions: 38.5356° N, 22.6217° E
    const degreesRegex = /(\d+\.?\d*)\s*°?\s*([NSns])[,\s]+(\d+\.?\d*)\s*°?\s*([EWew])/
    
    // Try decimal format first
    const decimalMatch = text.match(decimalRegex)
    if (decimalMatch) {
      const lat = parseFloat(decimalMatch[1])
      const lng = parseFloat(decimalMatch[2])
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng }
      }
    }
    
    // Try degrees format
    const degreesMatch = text.match(degreesRegex)
    if (degreesMatch) {
      let lat = parseFloat(degreesMatch[1])
      let lng = parseFloat(degreesMatch[3])
      
      // Apply cardinal directions
      if (degreesMatch[2].toUpperCase() === 'S') lat = -lat
      if (degreesMatch[4].toUpperCase() === 'W') lng = -lng
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng }
      }
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setMessages(prev => [...prev, { text: input, type: 'user' }])

    try {
      // Check for coordinates anywhere in the text
      const coords = parseCoordinates(input)
      
      if (coords) {
        onLocationUpdate(coords.lat, coords.lng)
        setMessages(prev => [...prev, { 
          text: `Location found at coordinates ${coords.lat}, ${coords.lng}`, 
          type: 'system' 
        }])
      } else {
        // Use geocoding service for text location
        const result = await geocodeLocation(input)
        
        if (result.success) {
          onLocationUpdate(result.lat, result.lng)
          setMessages(prev => [...prev, { 
            text: `Location found: ${result.formattedAddress}`, 
            type: 'system' 
          }])
        } else {
          setMessages(prev => [...prev, { 
            text: `Could not find location. ${result.error}`, 
            type: 'system' 
          }])
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: 'Sorry, there was an error processing your request.', 
        type: 'system' 
      }])
    } finally {
      setIsLoading(false)
      setInput("")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {messages.map((message, i) => (
          <div 
            key={i} 
            className={`message ${message.type === 'user' ? 'message-user' : 'message-system'}`}
          >
            {message.text}
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a location or coordinates..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

