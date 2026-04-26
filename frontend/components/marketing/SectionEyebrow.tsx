"use client"
import { motion } from "framer-motion"

interface Props {
  label: string
  className?: string
}

export function SectionEyebrow({ label, className = "" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`flex items-center gap-3 ${className}`}
    >
      <div className="h-px w-10 bg-brand-cyan" />
      <span className="text-xs font-mono uppercase tracking-[0.3em] text-brand-cyan">
        {label}
      </span>
    </motion.div>
  )
}