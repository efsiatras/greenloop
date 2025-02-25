"use client"
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react"
import { Leaf } from "lucide-react"  // Changed from Zap to Leaf
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export interface MapRef {
  setLocation: (lat: number, lng: number) => void
}

const Map = forwardRef<MapRef>((props, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [loading, setLoading] = useState(true)
  const [center] = useState<[number, number]>([20, 30])

  useImperativeHandle(ref, () => ({
    setLocation: (lat: number, lng: number) => {
      map.current?.flyTo({
        center: [lng, lat],
        zoom: 11,
        duration: 4000, // Duration in milliseconds
        essential: true
      })
    }
  }))

  useEffect(() => {
    if (!mapContainer.current) return

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!mapboxToken) {
      console.error('Mapbox token not found in environment variables')
      return
    }

    mapboxgl.accessToken = mapboxToken
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: center,
      zoom: 2,
      attributionControl: false // Disable default attribution
    })

    // Add minimal custom attribution
    // const customAttrib = new mapboxgl.AttributionControl({
    //   compact: true,
    //   customAttribution: ['© Mapbox'],
    //   attributionControl: false
    // })
    // customAttrib._updateAttributions = () => {} // Override update method to prevent default attributions
    // map.current.addControl(customAttrib, 'bottom-left')

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.current.on('load', () => {
      setLoading(false)
    })

    return () => {
      map.current?.remove()
    }
  }, [center])

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 z-[1000] bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg border">
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" /> {/* Changed from Zap to Leaf */}
          <div className="flex flex-col">
            <h1 className="font-bold text-lg"> Greenloop</h1>
            <p className="text-xs">Strategic Renewable Energy Advisor</p>
          </div>
        </div>
      </div>
      <div ref={mapContainer} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="animate-pulse text-muted-foreground">Loading map...</div>
        </div>
      )}
    </div>
  )
})

Map.displayName = 'Map'
export default Map
