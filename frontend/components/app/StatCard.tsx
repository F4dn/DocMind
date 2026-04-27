"use client"
import { motion } from "framer-motion"
import { type IconType } from "react-icons"

interface Props {
  label: string
  value: string | number
  unit?: string
  icon: IconType
  delay?: number
}

export function StatCard({ label, value, unit, icon: Icon, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass rounded-2xl p-6 hover:border-white/15 transition-colors group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-muted">
          {label}
        </div>
        <div className="w-9 h-9 rounded-lg bg-brand-gradient-soft border border-white/10 flex items-center justify-center group-hover:shadow-glow-soft transition-shadow">
          <Icon className="w-4 h-4 text-brand-cyan" />
        </div>
      </div>
      <div className="font-headline text-4xl text-gradient-subtle">
        {value}
        {unit && (
          <span className="text-sm font-mono text-ink-secondary ml-1.5">
            {unit}
          </span>
        )}
      </div>
    </motion.div>
  )
}