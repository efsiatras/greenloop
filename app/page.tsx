import type { Metadata } from "next"
import EnergyAdvisorDashboard from "@/components/energy-advisor-dashboard"

export const metadata: Metadata = {
  title: "Evergreen",
  description: "Strategic Energy Advisor for Renewable Energy Optimization",
}

export default function Home() {
  return <EnergyAdvisorDashboard />
}

