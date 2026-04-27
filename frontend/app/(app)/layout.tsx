"use client"
import { useState } from "react"
import { useAuthGuard } from "@/lib/useAuth"
import { Sidebar } from "@/components/app/Sidebar"
import { Topbar } from "@/components/app/Topbar"
import { NoiseTexture } from "@/components/shared/NoiseTexture"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authChecked = useAuthGuard()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex">
      <NoiseTexture />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  )
}