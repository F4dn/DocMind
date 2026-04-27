"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { HiOutlineUser, HiOutlineKey, HiOutlineColorSwatch } from "react-icons/hi"
import { GradientBlob } from "@/components/shared/GradientBlob"

const tabs = [
  { id: "profile", label: "Profile", icon: HiOutlineUser },
  { id: "api", label: "API keys", icon: HiOutlineKey },
  { id: "appearance", label: "Appearance", icon: HiOutlineColorSwatch },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="relative min-h-full">
      <GradientBlob className="-top-40 -left-40" color="purple" size="md" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 py-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-brand-cyan" />
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-brand-cyan">
              Settings
            </span>
          </div>
          <h1 className="font-headline text-5xl md:text-6xl tracking-tight leading-[0.9]">
            <span className="text-gradient-subtle">YOUR</span>{" "}
            <span className="text-gradient">ACCOUNT.</span>
          </h1>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl glass w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 h-10 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? "bg-white/10 text-ink-primary"
                    : "text-ink-muted hover:text-ink-secondary"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass rounded-2xl p-8 space-y-6"
        >
          <div className="space-y-2">
            <h2 className="font-headline text-2xl tracking-tight text-gradient-subtle">
              {tabs.find((t) => t.id === activeTab)?.label.toUpperCase()}
            </h2>
            <p className="text-sm text-ink-secondary">
              Configuration coming soon. This area will let you manage your{" "}
              {activeTab === "profile" && "profile information and email preferences"}
              {activeTab === "api" && "API keys for Gemini, OpenAI, and other providers"}
              {activeTab === "appearance" && "theme, layout density, and accent colors"}
              .
            </p>
          </div>

          <div className="pt-6 border-t border-white/5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">
              Status: under construction
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}