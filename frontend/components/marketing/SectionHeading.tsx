"use client"
import { motion } from "framer-motion"

interface Props {
  eyebrow: string
  title: string
  highlight?: string
  description?: string
  align?: "left" | "center"
}

export function SectionHeading({ eyebrow, title, highlight, description, align = "left" }: Props) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left"

  return (
    <div className={`max-w-3xl ${alignment}`}>
      <motion.div
        initial={{ opacity: 0, x: align === "center" ? 0 : -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`flex items-center gap-3 mb-6 ${align === "center" ? "justify-center" : ""}`}
      >
        <div className="h-px w-10 bg-brand-cyan" />
        <span className="text-xs font-mono uppercase tracking-[0.3em] text-brand-cyan">
          {eyebrow}
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-headline text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight text-gradient-subtle"
      >
        {title}{" "}
        {highlight && <span className="text-gradient">{highlight}</span>}
      </motion.h2>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-base md:text-lg text-ink-secondary max-w-2xl leading-relaxed"
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}