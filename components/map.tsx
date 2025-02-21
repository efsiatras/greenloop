"use client"

import { useEffect, useState } from "react"
import { Zap } from "lucide-react"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"

// Dynamically import Leaflet component to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const ZoomControl = dynamic(() => import("react-leaflet").then((mod) => mod.ZoomControl), { ssr: false })

export default function Map() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fix for Leaflet marker icons in Next.js
    const fixLeafletIcons = async () => {
      const L = await import("leaflet")
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/marker-icon-2x.png",
        iconUrl: "/marker-icon.png",
        shadowUrl: "/marker-shadow.png",
      })
    }

    fixLeafletIcons()
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 z-[1000] bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg border">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <h1 className="font-bold text-lg">Energy Advisor</h1>
            <p className="text-xs text-muted-foreground">Renewable Energy Optimization</p>
          </div>
        </div>
      </div>
      <MapContainer
        center={[34.0522, -118.2437]} // Los Angeles
        zoom={9}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="topright" />
      </MapContainer>
    </div>
  )
}

