import type { Metadata } from "next"
import EnergyAdvisorDashboard from "@/components/energy-advisor-dashboard"

export const metadata: Metadata = {
  title: "Energy Advisor",
  description: "Renewable Energy Optimization Platform",
}

export default function Home() {
  return <EnergyAdvisorDashboard />
}

