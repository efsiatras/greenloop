"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import { AlertCircle, Zap } from "lucide-react"
import "mapbox-gl/dist/mapbox-gl.css"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    if (!token) {
      setError("Mapbox token is missing. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables.")
      setLoading(false)
      return
    }

    try {
      if (map.current) return

      mapboxgl.accessToken = token

      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/dark-v11", // Changed to dark theme
        center: [-118.2437, 34.0522],
        zoom: 9,
        projection: "globe", // Added globe projection for better visual
      })

      // Add atmosphere and terrain effects
      map.current.on("load", () => {
        if (map.current) {
          map.current.setFog({
            color: "rgb(12, 17, 23)",
            "high-color": "rgb(36, 92, 223)",
            "horizon-blend": 0.4,
            "space-color": "rgb(11, 11, 25)",
            "star-intensity": 0.6,
          })

          setLoading(false)
        }
      })

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        "top-right",
      )
    } catch (err) {
      setError("Failed to initialize map. Please check your Mapbox configuration.")
      setLoading(false)
    }

    return () => {
      map.current?.remove()
    }
  }, [])

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg border">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <h1 className="font-bold text-lg">Energy Advisor</h1>
            <p className="text-xs text-muted-foreground">Renewable Energy Optimization</p>
          </div>
        </div>
      </div>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  )
}

