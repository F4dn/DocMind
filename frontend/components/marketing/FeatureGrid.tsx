"use client"
import { motion } from "framer-motion"
// import { Zap, Shield, FileSearch, Layers, Code2 } from "lucide-react"
import { FiZap, FiShield, FiLayers, FiCode } from "react-icons/fi"
import { FaSearch } from "react-icons/fa"
import { SectionHeading } from "./SectionHeading"

export function FeatureGrid() {
  return (
    <section id="features" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Capabilities"
          title="Built for"
          highlight="grounded answers."
          description="Every feature engineered with one goal: zero hallucinations. Cite the source or refuse to answer."
        />

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[280px]">
          {/* LARGE — Streaming */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 lg:col-span-2 glass rounded-2xl p-8 hover:border-white/20 transition-colors group relative overflow-hidden"
          >
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-brand-cyan/10 blur-3xl group-hover:bg-brand-cyan/20 transition-colors" />
            <div className="relative h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center">
                    <FiZap className="w-5 h-5 text-brand-cyan" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-cyan">
                    Real-time
                  </span>
                </div>
                <h3 className="font-headline text-4xl md:text-5xl tracking-tight text-gradient-subtle mb-4">
                  Token-by-token streaming.
                </h3>
                <p className="text-sm text-ink-secondary max-w-md leading-relaxed">
                  Server-Sent Events deliver each token the moment Gemini generates it. No waiting for full responses — feel the model think.
                </p>
              </div>
              {/* Mini SSE preview */}
              <div className="font-mono text-[11px] text-ink-muted">
                <div className="text-success">▸ data: {"{"}"type":"token"{"}"}</div>
                <div className="text-success">▸ data: {"{"}"type":"sources"{"}"}</div>
                <div className="text-brand-cyan">▸ data: {"{"}"type":"done"{"}"}</div>
              </div>
            </div>
          </motion.div>

          {/* Faithfulness */}
          <FeatureCard
            icon={FiShield}
            iconColor="text-brand-purple"
            iconBg="bg-brand-purple/10"
            iconBorder="border-brand-purple/20"
            label="Grounded"
            title="Citation-first."
            description="Every claim traces back to a chunk. If the document doesn't answer it, neither does the model."
            delay={0.1}
          />

          {/* Multi-format */}
          <FeatureCard
            icon={FaSearch}
            iconColor="text-brand-blue"
            iconBg="bg-brand-blue/10"
            iconBorder="border-brand-blue/20"
            label="Universal"
            title="Any document."
            description="PDFs with tables, DOCX with formatting, raw text. We handle the parsing chaos so you don't have to."
            delay={0.2}
          />

          {/* Multi-tenant */}
          <FeatureCard
            icon={FiLayers}
            iconColor="text-success"
            iconBg="bg-success/10"
            iconBorder="border-success/20"
            label="Isolated"
            title="Multi-tenant ready."
            description="Per-user ChromaDB namespaces. Your documents never touch another tenant's vector space."
            delay={0.3}
          />

          {/* Self-hostable — wide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-2 glass rounded-2xl p-8 hover:border-white/20 transition-colors group relative overflow-hidden"
          >
            <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-brand-purple/10 blur-3xl group-hover:bg-brand-purple/20 transition-colors" />
            <div className="relative h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center">
                    <FiCode className="w-5 h-5 text-brand-purple" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-purple">
                    Open source
                  </span>
                </div>
                <h3 className="font-headline text-4xl md:text-5xl tracking-tight text-gradient-subtle mb-4">
                  Run it anywhere.
                </h3>
                <p className="text-sm text-ink-secondary max-w-md leading-relaxed">
                  Docker Compose ships everything: FastAPI, Celery, Redis, ChromaDB, Postgres, and the Next.js client. One command, full stack.
                </p>
              </div>
              <div className="font-mono text-[11px] text-brand-cyan">
                $ docker compose up
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon: Icon,
  iconColor,
  iconBg,
  iconBorder,
  label,
  title,
  description,
  delay,
}: {
  icon: any
  iconColor: string
  iconBg: string
  iconBorder: string
  label: string
  title: string
  description: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass rounded-2xl p-7 hover:border-white/20 transition-colors group h-full flex flex-col"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-lg ${iconBg} border ${iconBorder} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span className={`text-[10px] font-mono uppercase tracking-[0.25em] ${iconColor}`}>
          {label}
        </span>
      </div>
      <h3 className="font-headline text-2xl md:text-3xl tracking-tight text-gradient-subtle mb-3">
        {title}
      </h3>
      <p className="text-sm text-ink-secondary leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}