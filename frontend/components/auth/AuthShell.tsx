"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { GradientBlob } from "@/components/shared/GradientBlob"
import { AnimatedGrid } from "@/components/shared/AnimatedGrid"
import { Logo } from "@/components/shared/Logo"
import { HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineShieldCheck } from "react-icons/hi"
import { HiArrowLeft } from "react-icons/hi2"

const panels = [
  {
    icon: HiOutlineSparkles,
    eyebrow: "Cited Answers",
    title: "Every claim,\ntraced to source.",
    description: "Multi-query expansion plus cross-encoder reranking deliver answers that always reference real chunks from your documents.",
    stat: { value: "0.91", label: "RAGAS faithfulness" },
  },
  {
    icon: HiOutlineLightningBolt,
    eyebrow: "Real-time Streaming",
    title: "Watch the model\nthink in real time.",
    description: "Server-Sent Events deliver tokens the moment Gemini generates them. No spinners, no waiting — just instant feedback.",
    stat: { value: "184ms", label: "Time to first token" },
  },
  {
    icon: HiOutlineShieldCheck,
    eyebrow: "Multi-tenant Isolation",
    title: "Your documents,\nyour namespace.",
    description: "Each user gets an isolated ChromaDB collection. Vectors never leak across tenants. Built for production from day one.",
    stat: { value: "100%", label: "Tenant isolation" },
  },
]

interface Props {
  children: React.ReactNode
}

export function AuthShell({ children }: Props) {
  const [activePanel, setActivePanel] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePanel((p) => (p + 1) % panels.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const panel = panels[activePanel]
  const Icon = panel.icon

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT — Brand panel (hidden on mobile) */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        <GradientBlob className="-top-40 -left-40" color="purple" size="xl" />
        <GradientBlob className="bottom-0 -right-40" color="cyan" size="lg" />
        <AnimatedGrid />

        {/* Top: Logo + back link */}
        <div className="relative z-10 flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-secondary hover:text-ink-primary transition-colors"
          >
            <HiArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </Link>
        </div>

        {/* Middle: Rotating content */}
        <div className="relative z-10 max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-10 bg-brand-cyan" />
                <span className="text-xs font-mono uppercase tracking-[0.3em] text-brand-cyan">
                  {panel.eyebrow}
                </span>
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-brand-gradient-soft border border-white/10 flex items-center justify-center mb-8 shadow-glow-soft">
                <Icon className="w-6 h-6 text-brand-cyan" />
              </div>

              {/* Headline */}
              <h2 className="font-headline text-5xl md:text-6xl tracking-tight leading-[0.9] text-gradient-subtle whitespace-pre-line mb-6">
                {panel.title}
              </h2>

              {/* Description */}
              <p className="text-sm text-ink-secondary leading-relaxed mb-10 max-w-sm">
                {panel.description}
              </p>

              {/* Stat */}
              <div className="glass rounded-xl p-5 inline-block">
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-2">
                  {panel.stat.label}
                </div>
                <div className="font-headline text-4xl text-gradient">
                  {panel.stat.value}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom: Pagination dots */}
        <div className="relative z-10 flex items-center gap-2">
          {panels.map((_, i) => (
            <button
              key={i}
              onClick={() => setActivePanel(i)}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: i === activePanel ? 32 : 12,
                background:
                  i === activePanel
                    ? "linear-gradient(to right, #A855F7, #06B6D4)"
                    : "rgba(255,255,255,0.15)",
              }}
              aria-label={`Show panel ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* RIGHT — Form panel */}
      <div className="relative flex items-center justify-center p-6 sm:p-12">
        {/* Mobile: show subtle blob and back link */}
        <div className="lg:hidden absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <Logo size="sm" />
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-secondary hover:text-ink-primary transition-colors"
          >
            <HiArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>

        <GradientBlob
          className="lg:hidden -top-40 -right-40"
          color="purple"
          size="lg"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md relative z-10"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}