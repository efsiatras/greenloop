"use client"

import Map from "@/components/map"
import Chat from "@/components/chat"

export default function EnergyAdvisorDashboard() {
  return (
    <main className="flex h-screen">
      {/* Map Section */}
      <div className="w-1/2 h-full border-r">
        <Map />
      </div>

      {/* Chat Section */}
      <div className="w-1/2 h-full bg-background">
        <Chat />
      </div>
    </main>
  )
}

