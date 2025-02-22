'use client'

interface EnergyChartsProps {
  data: {
    solar?: {
      radiation: number
      cloudCover: number
      temperature: number
    }
    wind?: {
      speed: number
      turbulence: number
      airDensity: number
    }
    hydro?: {
      elevation: number
      rainfall: number
    }
  }
}

export default function EnergyCharts({ data }: EnergyChartsProps) {
  return null
}
