"use client"

import { useRef, useState, useEffect } from "react"
import Map, { MapRef } from "@/components/map"
import Chat from "@/components/chat"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function EnergyAdvisorDashboard() {
  const mapRef = useRef<MapRef>(null)
  const [chatWidth, setChatWidth] = useState("33.333%")
  const isResizing = useRef(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAutoExpanding, setIsAutoExpanding] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500) // 1.5 seconds loading time

    return () => clearTimeout(timer)
  }, [])

  const handleLocationUpdate = (lat: number, lng: number) => {
    mapRef.current?.setLocation(lat, lng)
  }

  const handleChatExpand = () => {
    setIsAutoExpanding(true)
    setTimeout(() => {
      setChatWidth("60%") // Set to maximum allowed width (60%)
    }, 1000) // 1 second delay
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isResizing.current = true
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return
    setIsAutoExpanding(false)

    const windowWidth = window.innerWidth
    const newWidth = windowWidth - e.clientX
    const widthPercentage = Math.min(Math.max((newWidth / windowWidth) * 100, 20), 60)
    setChatWidth(`${widthPercentage}%`)
  }

  const handleMouseUp = () => {
    isResizing.current = false
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <main className="relative h-screen select-none">
        {/* Map as the full background */}
        <Map ref={mapRef} />

        {/* Chat overlay on top of the map */}
        <div 
          className={`absolute right-0 top-0 h-full ${isAutoExpanding ? 'transition-all duration-2000 ease-in-out' : ''}`}
          style={{ width: chatWidth }}
        >
          {/* Draggable slider on the left edge of the chat overlay */}
          <div
            className="absolute left-0 top-0 h-full w-2 cursor-ew-resize group z-10"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-0 bg-transparent group-hover:bg-primary/40 transition-colors duration-200" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-1 h-8 bg-primary rounded-full" />
            </div>
          </div>
          {/* Chat content with transparency and backdrop blur */}
          <div className="h-full bg-background/80 backdrop-blur-sm">
            <Chat onLocationUpdate={handleLocationUpdate} onFormSubmit={handleChatExpand} />
          </div>
        </div>
      </main>
    </>
  )
}
