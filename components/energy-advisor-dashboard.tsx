"use client"

import { useRef } from "react"
import Map, { MapRef } from "@/components/map"
import Chat from "@/components/chat"

export default function EnergyAdvisorDashboard() {
  const mapRef = useRef<MapRef>(null)

  const handleLocationUpdate = (lat: number, lng: number) => {
    mapRef.current?.setLocation(lat, lng)
  }

  return (
    <main className="flex h-screen">
      <div className="w-4/6 h-full border-r">
        <Map ref={mapRef} />
      </div>

      <div className="w-2/6 h-full bg-background">
        <Chat onLocationUpdate={handleLocationUpdate} />
      </div>
    </main>
  )
}

