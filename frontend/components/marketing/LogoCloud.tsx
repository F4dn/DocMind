"use client"
import { motion } from "framer-motion"

const techStack = [
  { name: "FastAPI", letters: "FA" },
  { name: "Next.js", letters: "NX" },
  { name: "ChromaDB", letters: "CH" },
  { name: "LangChain", letters: "LC" },
  { name: "Gemini", letters: "GM" },
  { name: "Celery", letters: "CL" },
  { name: "Redis", letters: "RD" },
  { name: "Docker", letters: "DK" },
]

export function LogoCloud() {
  return (
    <section className="relative py-24 border-y border-white/5">
      <div className="mx-auto max-w-7xl px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs font-mono uppercase tracking-[0.3em] text-ink-muted mb-12"
        >
          Built on production-grade infrastructure
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-px bg-white/5 rounded-2xl overflow-hidden">
          {techStack.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-base p-6 flex flex-col items-center justify-center gap-2 hover:bg-white/[0.02] transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg glass flex items-center justify-center font-mono text-xs text-ink-secondary group-hover:text-brand-cyan transition-colors">
                {tech.letters}
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
                {tech.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}