"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Zap } from "lucide-react"
import { GradientBlob } from "@/components/shared/GradientBlob"
import { AnimatedGrid } from "@/components/shared/AnimatedGrid"
import { GlowButton } from "@/components/shared/GlowButton"
import { ChatMockup } from "@/components/marketing/ChatMockup"

const stats = [
  { label: "Chunk Size", value: "512", unit: "tokens" },
  { label: "Faithfulness", value: "0.91", unit: "RAGAS" },
  { label: "Processing", value: "Async", unit: "Celery" },
]

export function Hero() {
  return (
    <section className="relative min-h-screen pt-28 pb-20 overflow-hidden">
      <GradientBlob className="-top-40 -left-60" color="purple" size="xl" />
      <GradientBlob className="top-1/3 -right-40" color="cyan" size="lg" />
      <AnimatedGrid />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16 lg:gap-12 items-start">
          {/* LEFT: copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-10 bg-brand-cyan" />
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-brand-cyan">
                RAG Document Intelligence
              </span>
            </div>

            {/* 3-line headline */}
            <h1 className="font-headline leading-[0.88] tracking-tight">
              <span className="block text-6xl md:text-8xl lg:text-[8.5rem] text-gradient-subtle">
                UPLOAD ANY
              </span>
              <span className="block text-6xl md:text-8xl lg:text-[8.5rem] text-gradient-subtle">
                DOCUMENT.
              </span>
              <span className="block text-6xl md:text-8xl lg:text-[8.5rem] text-gradient">
                ASK ANYTHING.
              </span>
            </h1>

            <p className="mt-10 text-base md:text-lg text-ink-secondary max-w-xl leading-relaxed">
              DocMind is a RAG-based document Q&A platform. Upload PDFs, DOCX,
              or text files — DocMind chunks, embeds, and indexes your content
              into ChromaDB. Ask questions in natural language and get cited
              answers grounded in your source material. Zero hallucination
              tolerance, evaluated with RAGAS.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <Link href="/register">
                <GlowButton size="lg" className="w-full sm:w-auto">
                  Start for Free <ArrowRight className="w-4 h-4" />
                </GlowButton>
              </Link>
              <Link href="#demo">
                <GlowButton
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  See Live Demo <Zap className="w-4 h-4" />
                </GlowButton>
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-16 max-w-xl">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                  className="glass rounded-xl p-4"
                >
                  <div className="text-[10px] font-mono uppercase tracking-wider text-ink-muted mb-2">
                    {s.label}
                  </div>
                  <div className="font-headline text-2xl md:text-3xl">
                    {s.value}
                    <span className="text-xs font-mono text-ink-secondary ml-1">
                      {s.unit}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: chat mockup + floating HUD labels */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative lg:mt-8"
          >
            <ChatMockup />

            {/* Top-right floating label */}
            <div className="hidden lg:block absolute -top-4 -right-4 glass rounded-lg px-3 py-2 z-20">
              <div className="text-[10px] font-mono uppercase tracking-wider text-brand-cyan">
                Vector Store
              </div>
              <div className="text-sm font-headline tracking-wide">
                ChromaDB / live
              </div>
            </div>

            {/* Bottom-left floating label */}
            <div className="hidden lg:block absolute -bottom-4 -left-4 glass rounded-lg px-3 py-2 z-20">
              <div className="text-[10px] font-mono uppercase tracking-wider text-success">
                Processing
              </div>
              <div className="text-sm font-headline tracking-wide">
                Celery + Redis
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}